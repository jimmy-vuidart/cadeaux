/**
 * Migration activant les sauvegardes automatiques natives de PocketBase (Settings > Backups) :
 * chaque nuit, PocketBase zippe tout pb_data (base + fichiers déposés, écritures bloquées le temps
 * du zip, donc une image cohérente) dans pb_data/backups et garde les 7 derniers zips.
 *
 * En production, la sauvegarde hors cluster du dépôt noctali.cd (infra/backup : restic → Google
 * Drive, 04:00 Europe/Paris) n'envoie que ces zips. Le cron de PocketBase est en UTC : 01:30 UTC =
 * 02:30 (hiver) / 03:30 (été) à Paris, toujours avant l'envoi.
 *
 * Restauration : depuis le tableau de bord (/_/#/settings/backups) ou infra/backup/restore.sh.
 */

const BACKUPS_CRON = '30 1 * * *';
const BACKUPS_MAX_KEEP = 7;

migrate((app) => {
  const settings = app.settings();
  settings.backups.cron = BACKUPS_CRON;
  settings.backups.cronMaxKeep = BACKUPS_MAX_KEEP;
  app.save(settings);
}, (app) => {
  // Valeurs par défaut de PocketBase : sauvegardes automatiques désactivées.
  const settings = app.settings();
  settings.backups.cron = '';
  settings.backups.cronMaxKeep = 3;
  app.save(settings);
});
