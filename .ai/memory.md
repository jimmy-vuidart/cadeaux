# Mémoire

- 2026-06-24 : migration Firebase validée vers PocketBase sur le cluster K3S existant. Frontend Angular et API sous un même nouveau sous-domaine, avec Traefik et cert-manager/`letsencrypt-prod` déjà présents.
- Accès produit : toute personne disposant du lien peut consulter une liste en temps réel et cocher ou décocher un cadeau sans compte ; seul le propriétaire authentifié gère le contenu.
- Migration : données Firebase en ligne comme source, comptes recréés manuellement puis rattachement explicite des UID Firebase aux comptes PocketBase. Les mots de passe Firebase ne sont pas migrés. Les slugs de liste sont conservés.
- Risque explicitement accepté : K3S utilise `local-path`, sans snapshot ni sauvegarde hors cluster. Une perte du nœud, du volume ou du cluster peut détruire les données.
- Le plan de migration est documenté dans `docs/UPGRADE.md`.
