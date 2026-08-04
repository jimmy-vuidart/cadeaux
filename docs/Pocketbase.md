# Migration Firebase vers PocketBase

## Résumé

- Remplacer Firebase Auth et Realtime Database par PocketBase `0.39.10`, sans migration Angular 22 dans ce lot.
- Publier l'application sur `https://cadeaux.vuidart.com`, avec le frontend sur `/` et PocketBase sur `/api`.
- Préserver les slugs, listes, cadeaux et états achetés ; ne pas importer visites ni acheteurs historiques.
- Créer manuellement les nouveaux comptes PocketBase et rattacher chaque propriétaire via un fichier privé `UID Firebase → ID PocketBase`.
- Assumer explicitement l'absence de sauvegarde, malgré la recommandation K3S contraire.

## Application et données

- Ajouter le SDK `pocketbase`, supprimer AngularFire, Firebase, les émulateurs et tous les providers Firebase.
- Conserver les services métier Angular, mais les alimenter par PocketBase :
  - `AuthService` conserve ses signaux et méthodes de connexion, avec Google OAuth, e-mail/mot de passe, inscription, déconnexion et mise à jour du nom.
  - `ListService` charge une liste par `slug`, expose les listes du propriétaire, les cadeaux ordonnés et les abonnements temps réel.
  - `UserService` devient dédié aux visites créées après bascule.
- Faire évoluer les modèles :
  - utilisateur : `id`, `displayName`, `email` ;
  - liste : ID PocketBase opaque, `slug`, titre et propriétaire ;
  - cadeau : `bought: boolean` et relation optionnelle `buyer`, avec `buyerName` fourni uniquement dans la réponse de lecture publique.
- Créer des migrations JavaScript PocketBase versionnées pour :
  - `users` : collection d'authentification avec nom affiché, e-mail/mot de passe et Google OAuth ;
  - `lists` : titre, slug unique et relation propriétaire ;
  - `gifts` : relation liste, titre, URL, position, booléen acheté et acheteur optionnel ;
  - `visits` : relations utilisateur/liste, index unique utilisateur-liste et date de dernière visite.
- Ajouter des hooks et routes PocketBase :
  - lecture publique d'une liste par slug, avec ses cadeaux et le seul nom de l'acheteur quand il existe ;
  - création authentifiée d'une liste avec slug kebab-case et suffixe numérique atomique ;
  - modification publique limitée à l'état acheté d'un cadeau ;
  - réordonnancement atomique réservé au propriétaire.
- Interdire les mutations directes publiques des collections. Les propriétaires gardent les opérations de liste et cadeau, tandis que la route publique de coche est la seule exception.
- Pour une coche anonyme, enregistrer `bought = true` sans acheteur. Pour une coche connectée, enregistrer l'utilisateur courant. Toute décoche remet `bought = false` et efface l'acheteur.
- Rendre listes et cadeaux lisibles publiquement pour préserver les liens historiques et le SSE PocketBase. L'interface ne les indexera pas, mais cette option accepte explicitement qu'une URL ou l'API soit devinable. Les profils utilisateurs, e-mails et visites restent privés.
- Remplacer l'affichage actuel fondé sur `boughtBy` par l'état `bought` ; afficher « Acheté par … » uniquement lorsqu'un acheteur connecté est associé.

## Images, GitOps et K3S

- Ajouter une image frontend Nginx et une image PocketBase, toutes deux construites pour `linux/amd64`, avec tags de version immuables dans GHCR.
- Construire PocketBase depuis l'archive officielle vérifiée de la version `0.39.10`, en embarquant `pb_migrations` et `pb_hooks`. Monter uniquement `/pb/pb_data` sur le volume persistant.
- Initialiser le superutilisateur et les réglages OAuth dans les migrations, à partir des variables injectées par un SealedSecret ; ne jamais inscrire de secret dans une migration ou une image.
- Remplacer le workflow Firebase par un workflow GitHub Actions qui exécute `npm ci` et `npm run build`, publie les deux images, puis met à jour leurs tags dans `noctali.cd`.
- Créer `apps/cadeaux-vuidart/` dans `noctali.cd` :
  - namespace dédié et Kustomization ;
  - StatefulSet PocketBase à une réplique, PVC `local-path` de 1 Gi, probes `/api/health`, ressources et contexte de sécurité restreint ;
  - Deployment frontend, Service pour chaque composant et Ingress Traefik ;
  - Ingress TLS `letsencrypt-prod`, external-dns vers `51.38.32.27`, chemins `/api` vers PocketBase et `/` vers Nginx ;
  - SealedSecret pour superutilisateur et OAuth Google.
- Ne pas exposer `/_/` : l'Ingress ne transmet que `/api` à PocketBase ; l'administration se fait uniquement par port-forward.
- Ne créer aucun CronJob, PVC secondaire ni copie distante de sauvegarde. Documenter cette exception et le risque de perte totale de données dans la documentation opérationnelle.

## Import et bascule

- Fournir un script d'import hors ligne qui lit les exports Firebase RTDB/Auth et un fichier privé de correspondance des propriétaires.
- Valider avant écriture que chaque `ownerId` Firebase est mappé vers un compte PocketBase ; refuser l'import si une liste reste sans propriétaire.
- Importer les listes avec leur slug, puis les cadeaux avec titre, URL, ordre et état acheté ; ignorer intégralement visites et anciens acheteurs.
- Rendre l'import répétable par slug de liste et identifiant source de cadeau, avec modes `--dry-run` et `--apply`, rapportant les nombres de listes, cadeaux, cadeaux cochés et erreurs de rattachement.
- Lors de la fenêtre de bascule, geler les écritures Firebase, refaire l'export final, exécuter l'import contrôlé, tester le nouveau domaine, puis communiquer le nouveau lien.
- Retirer du dépôt les fichiers Firebase, règles, dépendances et workflow seulement après validation. Désactiver Firebase ensuite ; supprimer définitivement le projet Firebase reste hors périmètre et requiert une confirmation distincte.

## Vérifications

- Tests Angular des états de session PocketBase, OAuth/e-mail, mise à jour du profil, droits propriétaire, visites, abonnement et désabonnement temps réel.
- Tests des hooks PocketBase : règles de collections, création de slug concurrente, réordonnancement atomique, coche anonyme, coche connectée, décoche et impossibilité de modifier un autre champ publiquement.
- Test à deux navigateurs : l'état acheté et son éventuel acheteur connecté sont visibles immédiatement après une mise à jour.
- Test d'import sur une copie d'export : slugs, nombres de listes/cadeaux/coches et rattachements propriétaires exacts.
- Exécuter `npm run build`, rendre les manifestes Kustomize, vérifier la synchronisation Argo CD, HTTPS, callback Google et l'absence d'accès public à `/_/`.

## Hypothèses actées

- Les liens historiques restent `/lists/:slug`.
- L'inscription e-mail et Google est conservée ; aucun flux de réinitialisation de mot de passe ou SMTP n'est ajouté.
- Les propriétaires recréent leur compte avant import et sont rattachés manuellement.
- Les cadeaux déjà cochés restent cochés, mais sans acheteur historique.
- Les listes sont publiques mais non indexées ; elles ne constituent pas des données confidentielles.
