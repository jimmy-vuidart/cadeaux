# Migration Firebase vers PocketBase

## Résumé

Firebase sera remplacé par PocketBase, déployé sur le cluster K3S existant. Ce choix couvre l'authentification e-mail/Google, les données et la synchronisation temps réel avec un seul service adapté à une application familiale.

L'application Angular et l'API partageront un nouveau sous-domaine HTTPS : Traefik route `/api` vers PocketBase et le reste vers l'application statique. Firebase sera entièrement retiré après validation du basculement.

## Changements d'implémentation

- Ajouter PocketBase avec les collections `users` (authentification et nom affiché), `lists` (slug unique, titre, propriétaire), `gifts` (liste, titre, URL, position, état acheté, acheteur facultatif) et `visits` (utilisateur/liste).
- Implémenter des routes PocketBase pour lire publiquement une liste par slug, créer atomiquement une liste avec des suffixes numériques, réordonner les cadeaux pour le propriétaire et modifier publiquement le seul état « acheté ».
- Autoriser sans compte la consultation, l'abonnement temps réel et le cochage/décochage d'un cadeau à partir du lien. Réserver la création, l'édition, la suppression et le réordonnancement au propriétaire authentifié.
- Remplacer `@angular/fire`, `firebase`, les providers Firebase et les services actuels par le SDK PocketBase, encapsulé dans les services métier existants. Les abonnements temps réel PocketBase alimenteront les listes et cadeaux.
- Adapter les écrans de connexion, inscription et profil aux erreurs et au modèle PocketBase ; configurer un nouveau client OAuth Google avec le callback du nouveau domaine.
- Retirer `firebase.json`, `.firebaserc`, le dossier `firebase/`, les émulateurs, les dépendances Firebase et le workflow de déploiement Firebase. Remplacer les fixtures privées par des données de test anonymisées.
- Mettre à jour la documentation `.ai` pour refléter PocketBase et l'accès public aux listes.

## Migration et déploiement

- Exporter Firebase RTDB et Auth depuis le projet en ligne pendant une fenêtre de maintenance, hors dépôt Git ; produire les comptes, totaux et empreintes de contrôle.
- Importer les listes en conservant leurs slugs afin que les chemins `/lists/:id` restent valides sur le nouveau domaine. Transformer `bought` en état acheté ; conserver un acheteur uniquement lorsqu'il existe réellement dans l'export.
- Importer les identités Firebase dans une table de transition, sans tenter de réutiliser les mots de passe. Chaque utilisateur recrée son compte PocketBase ; un script idempotent applique ensuite le fichier de correspondance manuel `UID Firebase → utilisateur PocketBase` aux propriétaires, achats et visites. Le basculement n'a lieu qu'après résolution de tous les rattachements attendus.
- Construire deux images versionnées : frontend Angular servi par Nginx et PocketBase avec migrations et hooks inclus. Le workflow GitHub remplacera le déploiement Firebase par le build, `npm run build`, la publication GHCR, puis la mise à jour du tag dans le dépôt GitOps `noctali.cd`.
- Ajouter l'application Argo CD dans `noctali.cd` : namespace dédié, StatefulSet PocketBase à une réplique avec PVC `local-path`, frontend, services, Ingress Traefik et certificat `letsencrypt-prod`. Conserver l'administration PocketBase hors exposition publique, via port-forward.
- Créer hors Git les secrets Kubernetes : superutilisateur PocketBase, clé OAuth Google et secrets applicatifs. Renseigner le nouveau sous-domaine avant le déploiement et pointer son DNS vers le cluster.
- Après validation fonctionnelle et communication du nouveau lien, désactiver Firebase. La suppression définitive du projet Firebase reste une opération séparée à confirmer après basculement.

## Plan de test

- Tests unitaires des services Angular : session, erreurs d'authentification, chargement par slug, droits propriétaire et adaptation des événements temps réel.
- Tests d'intégration PocketBase : accès public à une liste, interdiction des modifications de contenu anonymes, cochage/décochage public, création et édition par le seul propriétaire, collisions de slug et réordonnancement atomique.
- Vérification temps réel avec deux navigateurs anonymes : modification de l'état d'un cadeau visible immédiatement dans l'autre session.
- Exécution de l'import sur une copie de l'export Firebase, avec comparaison des nombres de listes, cadeaux, achats et visites, puis contrôle du rapport de rattachements manuels.
- Exécuter `npm run build`, vérifier le déploiement Argo CD, le certificat HTTPS et le callback OAuth Google avant le basculement.

## Hypothèses et risques actés

- Le nouveau sous-domaine est fourni avant le déploiement ; le domaine Firebase `web.app` ne peut pas être conservé hors Firebase.
- Les comptes sont recréés manuellement ; les mots de passe Firebase ne sont pas migrés.
- Le stockage K3S actuel est `local-path`, sans snapshot ni sauvegarde hors cluster. La perte de données en cas de perte du nœud, du volume ou du cluster est explicitement acceptée.
- Le déploiement reste mono-réplique : PocketBase et SQLite conviennent à la charge attendue, mais ne fournissent ni haute disponibilité ni reprise après sinistre.
