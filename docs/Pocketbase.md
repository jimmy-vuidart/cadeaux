# Migration Firebase vers PocketBase

## Résumé

- Remplacer Firebase Auth et Realtime Database par PocketBase `0.40.5`, sans migration Angular 22 dans ce lot.
- Publier l'application sur `https://cadeaux.vuidart.com`, avec le frontend sur `/` et PocketBase sur `/api`.
- Préserver les slugs, listes, cadeaux et états achetés ; ne pas importer visites ni acheteurs historiques.
- Créer manuellement les nouveaux comptes PocketBase et rattacher chaque propriétaire via un fichier privé `UID Firebase → ID PocketBase`.
- Assumer explicitement l'absence de sauvegarde, malgré la recommandation K3S contraire.

## Application et données

- Ajouter le SDK `pocketbase`, supprimer AngularFire, Firebase, les émulateurs et tous les providers Firebase.
- Encapsuler l'instance PocketBase dans un service Angular (`PocketBaseService`) configuré sur le chemin relatif `/api` :
  - Synchroniser les signaux `user` et `isLoggedIn` avec `pb.authStore.onChange`.
  - Assurer la libération des abonnements temps réel SSE via `DestroyRef` (désabonnement systématique à la destruction du composant consommateur).
- Conserver les services métier Angular, mais les alimenter par PocketBase :
  - `AuthService` conserve ses signaux et méthodes de connexion, avec Google OAuth (`authWithOAuth2`), e-mail/mot de passe, inscription, déconnexion et mise à jour du nom.
  - `ListService` charge une liste par `slug`, expose les listes du propriétaire, les cadeaux ordonnés et les abonnements temps réel.
  - `UserService` devient dédié aux visites créées après bascule.
- Faire évoluer les modèles :
  - utilisateur : `id`, `displayName`, `email` ;
  - liste : ID PocketBase opaque, `slug`, titre et propriétaire ;
  - cadeau : `bought: boolean` et relation optionnelle `buyer`, avec `buyerName` fourni uniquement dans la réponse de lecture publique.
- Créer des migrations JavaScript PocketBase versionnées (`pb_migrations/`) pour :
  - `users` : collection d'authentification avec nom affiché, e-mail/mot de passe et Google OAuth ;
  - `lists` : titre, slug unique et relation propriétaire ;
  - `gifts` : relation liste, titre, URL, position, booléen acheté et acheteur optionnel ;
  - `visits` : relations utilisateur/liste, index unique utilisateur-liste et date de dernière visite.
- Ajouter des hooks et routes PocketBase (`pb_hooks/`) avec contrat strict :
  - `GET /api/custom/lists/:slug` : lecture publique d'une liste par son slug, retournant la liste et ses cadeaux ordonnés par `position`, avec `buyerName` renseigné uniquement si un acheteur connecté est rattaché (sans exposer la collection `users`) ;
  - `POST /api/custom/lists` : création authentifiée d'une liste avec slug kebab-case et suffixe numérique atomique ;
  - `POST /api/custom/gifts/:id/toggle` : modification publique limitée à l'état acheté d'un cadeau (coche anonyme `bought: true, buyer: null`, coche connectée `bought: true, buyer: auth.id`, décoche `bought: false, buyer: null`), avec rejet systématique de modification de tout autre champ ;
  - `POST /api/custom/lists/:id/reorder` : réordonnancement atomique sous transaction SQLite réservé au propriétaire de la liste.
- Interdire les mutations directes publiques des collections. Les propriétaires gardent les opérations de liste et cadeau, tandis que la route publique de coche est la seule exception.
- Pour une coche anonyme, enregistrer `bought = true` sans acheteur. Pour une coche connectée, enregistrer l'utilisateur courant. Toute décoche remet `bought = false` et efface l'acheteur.
- Rendre listes et cadeaux lisibles publiquement pour préserver les liens historiques et le SSE PocketBase. L'interface ne les indexera pas, mais cette option accepte explicitement qu'une URL ou l'API soit devinable. Les profils utilisateurs, e-mails et visites restent privés.
- Remplacer l'affichage actuel fondé sur `boughtBy` par l'état `bought` ; afficher « Acheté par … » uniquement lorsqu'un acheteur connecté est associé.

## Environnement de développement local (Dev DX)

- Remplacer le script `npm run emulators` par une commande de développement local PocketBase (`npm run dev:pb`), qui télécharge ou utilise le binaire PocketBase `0.40.5` en pointant sur `--migrationsDir=./pb_migrations --hooksDir=./pb_hooks --dir=./pb_data_dev` (répertoire ignoré par Git).
- Configurer un proxy de développement Angular (`proxy.conf.json`) routant les requêtes `/api` vers `http://127.0.0.1:8090`. Cela garantit que le code Angular utilise exclusivement le chemin relatif `/api` sans variation de configuration entre local et production.
- Fournir une migration ou fixture de développement idempotente créant un utilisateur de test et une liste d'exemple pour démarrer sans manipulation manuelle de l'interface admin.

## Images, GitOps et K3S

- Ajouter une image frontend Nginx et une image PocketBase, toutes deux construites pour `linux/amd64`, avec tags de version immuables dans GHCR :
  - `Dockerfile.frontend` : multi-stage build ou copie de `dist/cadeaux-vuidart/browser` dans une image Nginx Alpine, avec configuration de fallback SPA (`try_files $uri $uri/ /index.html;`) et headers de sécurité basiques.
  - `Dockerfile.pocketbase` : image Alpine minimale embarquant le binaire officiel PocketBase `0.40.5`, les dossiers `pb_migrations/` et `pb_hooks/`, exposant le port `8090` avec point de montage `/pb/pb_data`.
- Construire PocketBase depuis l'archive officielle vérifiée de la version `0.40.5`, en embarquant `pb_migrations` et `pb_hooks`. Monter uniquement `/pb/pb_data` sur le volume persistant.
- Initialiser le superutilisateur et les réglages OAuth dans les migrations, à partir des variables injectées par un SealedSecret ; ne jamais inscrire de secret dans une migration ou une image.
- Configuration OAuth2 Google :
  - Variables d'environnement : `GOOGLE_CLIENT_ID` (ou `PB_GOOGLE_CLIENT_ID`) et `GOOGLE_CLIENT_SECRET` (ou `PB_GOOGLE_CLIENT_SECRET`).
  - URLs de callback dans la console Google Cloud : `https://cadeaux.vuidart.com/api/oauth2-redirect` (production) et `http://localhost:4200/api/oauth2-redirect` (développement local).
  - Origines JavaScript autorisées : `https://cadeaux.vuidart.com` et `http://localhost:4200`.
  - Migration `pb_migrations/1729000002_enable_google_oauth.js` : activation du provider `google` sur la collection `users`.
  - Hook `pb_hooks/oauth.pb.js` : mise à jour dynamique au démarrage si les variables d'environnement changent, et enrichissement automatique de `displayName` à partir du profil Google.
  - Script dans `src/index.html` : détection et fermeture automatique de la fenêtre popup d'authentification après la redirection OAuth2.
- Réinitialisation du mot de passe par e-mail :
  - Relais SMTP Gmail (`smtp.gmail.com:465`, TLS implicite) authentifié par un mot de passe d'application du compte Google expéditeur ; aucun serveur mail n'est hébergé sur le cluster.
  - Variables d'environnement : `APP_URL` (URL publique utilisée dans les liens des e-mails), `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME` (adresse Gmail, également utilisée comme expéditeur) et `SMTP_PASSWORD`.
  - Hook `pb_hooks/mail.pb.js` : application de ces variables aux réglages PocketBase au démarrage ; sans variables SMTP, la configuration existante est conservée.
  - Migration `pb_migrations/1729000004_password_reset_email.js` : modèle d'e-mail en français dont le lien pointe vers la page Angular `/reset-password/:token` (le modèle par défaut vise `/_/`, non exposé) et limite de 5 demandes de réinitialisation par heure. PocketBase voyant toutes les requêtes depuis Traefik, cette limite est globale.
  - Frontend : lien « Mot de passe oublié ? » dans la fenêtre de connexion (message neutre, que le compte existe ou non) et page `/reset-password/:token` pour saisir le nouveau mot de passe (8 caractères minimum, jeton valable 30 minutes et à usage unique).
- Changement de mot de passe (page `/account`, section « Mot de passe ») : `AuthService.changePassword` envoie `oldPassword`/`password`/`passwordConfirm` à PocketBase, qui vérifie l'ancien mot de passe et invalide toutes les sessions ; l'utilisateur est aussitôt reconnecté avec son nouveau mot de passe. Les comptes créés avec Google peuvent recevoir un lien de réinitialisation à l'adresse du compte pour définir un mot de passe.
- Remplacer le workflow Firebase par un workflow GitHub Actions qui exécute `npm ci --legacy-peer-deps`, `npm test`, `npm run build`, publie les deux images sur GHCR, puis met à jour leurs tags dans `noctali.cd`.
- Créer `apps/cadeaux-vuidart/` dans `noctali.cd` :
  - namespace dédié et Kustomization ;
  - StatefulSet PocketBase à une réplique, PVC `local-path` de 1 Gi, probes `/api/health`, ressources et contexte de sécurité restreint ;
  - Deployment frontend, Service pour chaque composant et Ingress Traefik ;
  - Ingress TLS `letsencrypt-prod`, external-dns vers `51.38.32.27`, chemins `/api` vers PocketBase et `/` vers Nginx ;
  - SealedSecret pour superutilisateur et OAuth Google (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`).
- Ne pas exposer `/_/` : l'Ingress ne transmet que `/api` à PocketBase ; l'administration se fait uniquement par port-forward.
- Ne créer aucun CronJob, PVC secondaire ni copie distante de sauvegarde. Documenter cette exception et le risque de perte totale de données dans la documentation opérationnelle.

## Import et bascule

- Fournir une migration PocketBase versionnée embarquée dans l'image (`pb_migrations/1729000001_seed_prod_data.js`) générée automatiquement via `npm run generate:seed-migration` à partir de l'export Firebase officiel (`database_export/cadeaux-vuidart-default-rtdb.json`).
  - Lors du premier démarrage du conteneur PocketBase en production sur un volume vierge, cette migration s'applique automatiquement et injecte les 3 comptes utilisateurs (`jimmy@vuidart.com`, `deborah@vuidart.com`, `andy@vuidart.com`), les 5 listes avec leurs slugs et les 152 cadeaux avec leurs positions et statut d'achat.
- Fournir également un script d'import / seed direct (`scripts/seed-prod.js`, commande `npm run seed`) opérant via l'API REST pour rafraîchir ou réinjecter les données de façon strictement répétable et idempotente.
- Valider avant écriture que chaque `ownerId` Firebase est mappé vers un compte PocketBase ; refuser l'import si une liste reste sans propriétaire.
- Importer les listes avec leur slug, puis les cadeaux avec titre, URL, ordre et état acheté ; ignorer intégralement visites et anciens acheteurs.
- Rendre l'import répétable par slug de liste, avec modes `--dry-run` et exécution réelle, rapportant les nombres de listes, cadeaux, cadeaux cochés et erreurs de rattachement.
- Lors de la fenêtre de bascule, geler les écritures Firebase (règles RTDB `.write: false`), refaire l'export final, exécuter l'import contrôlé, tester le nouveau domaine, puis communiquer le nouveau lien.
- Procédure de rollback immédiat : si un blocage survient avant le basculement DNS/communication, restaurer immédiatement les règles d'écriture Firebase ; aucune modification destructrice n'étant apportée aux données Firebase, le service initial continue sans interruption.
- Retirer du dépôt les fichiers Firebase, règles, dépendances et workflow seulement après validation. Désactiver Firebase ensuite ; supprimer définitivement le projet Firebase reste hors périmètre et requiert une confirmation distincte.

## Vérifications

- Tests Angular des états de session PocketBase, OAuth/e-mail, mise à jour du profil, droits propriétaire, visites, abonnement et désabonnement temps réel.
- Tests des hooks PocketBase : règles de collections, création de slug concurrente, réordonnancement atomique, coche anonyme, coche connectée, décoche et impossibilité de modifier un autre champ publiquement.
- Test à deux navigateurs : l'état acheté et son éventuel acheteur connecté sont visibles immédiatement après une mise à jour.
- Test d'import sur une copie d'export : slugs, nombres de listes/cadeaux/coches et rattachements propriétaires exacts.
- Exécuter `npm run build`, rendre les manifestes Kustomize, vérifier la synchronisation Argo CD, HTTPS, callback Google et l'absence d'accès public à `/_/`.

## Hypothèses actées

- Les liens historiques restent `/lists/:slug`.
- L'inscription e-mail et Google est conservée. La réinitialisation de mot de passe par e-mail passe par un relais SMTP Gmail (voir « Réinitialisation du mot de passe par e-mail »).
- Les propriétaires recréent leur compte avant import et sont rattachés manuellement.
- Les cadeaux déjà cochés restent cochés, mais sans acheteur historique.
- Les listes sont publiques mais non indexées ; elles ne constituent pas des données confidentielles.
