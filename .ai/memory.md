# Mémoire

- 2026-06-24 : migration Firebase validée vers PocketBase sur le cluster K3S existant. Frontend Angular et API sous un même nouveau sous-domaine, avec Traefik et cert-manager/`letsencrypt-prod` déjà présents.
- Accès produit : toute personne disposant du lien peut consulter une liste en temps réel et cocher ou décocher un cadeau sans compte ; seul le propriétaire authentifié gère le contenu.
- Migration : données Firebase en ligne comme source, comptes recréés manuellement puis rattachement explicite des UID Firebase aux comptes PocketBase. Les mots de passe Firebase ne sont pas migrés. Les slugs de liste sont conservés.
- Risque explicitement accepté : K3S utilise `local-path`, sans snapshot ni sauvegarde hors cluster. Une perte du nœud, du volume ou du cluster peut détruire les données.
- Le plan de migration est documenté dans `docs/UPGRADE.md`.
- 2026-08-05 : l’installation npm est alignée sur Angular 20 : `@angular/fire@20.0.1` est la version stable et n’accepte que Angular 20. Une préversion `21.0.0-rc.0` existe sous le tag npm `next` et accepte Angular 21 ; aucune version Angular 22 n’existe. Angular 20 exige aussi Vitest 3 ; Firebase Tools est maintenu en ligne 14 pour respecter le peer dependency d’AngularFire.
- 2026-08-05 : recherche web : `@angular/fire` n’est pas officiellement déprécié. Dans l’issue #3699, un collaborateur indique le 9 juillet 2026 avoir été chargé de le réaligner : Angular 21 d’abord, puis Angular 22, sans date annoncée. Le maintenir pour un projet qui doit suivre Angular implique un risque de décalage de maintenance.
- 2026-08-05 : plan PocketBase validé dans `docs/Pocketbase.md` : domaine `cadeaux.vuidart.com`, import Firebase limité aux listes/cadeaux et états achetés, propriétaires rattachés manuellement, pas de visites ni acheteurs historiques. Les coches restent anonymes ou attribuées à l’utilisateur connecté. Liens publics non indexés ; aucune sauvegarde est un risque explicitement accepté.
