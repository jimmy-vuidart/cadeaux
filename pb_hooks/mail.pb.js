/**
 * Hook PocketBase configurant l'envoi d'e-mails (réinitialisation de mot de passe) au démarrage du serveur.
 * Les réglages proviennent des variables d'environnement injectées dans K3S (SealedSecret pour les identifiants) :
 * - APP_URL : URL publique de l'application, utilisée pour construire les liens des e-mails ;
 * - SMTP_HOST, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD : relais SMTP (Gmail avec mot de passe d'application).
 * Sans ces variables (développement local), la configuration existante est conservée.
 */

onBootstrap((e) => {
  e.next();

  const appUrl = $os.getenv('APP_URL');
  const host = $os.getenv('SMTP_HOST');
  const port = parseInt($os.getenv('SMTP_PORT') || '465', 10);
  const username = $os.getenv('SMTP_USERNAME');
  const password = $os.getenv('SMTP_PASSWORD');
  const hasSmtp = Boolean(host && username && password);

  if (!appUrl && !hasSmtp) {
    return;
  }

  try {
    const settings = $app.settings();

    if (appUrl) {
      settings.meta.appURL = appUrl;
    }

    if (hasSmtp) {
      settings.smtp.enabled = true;
      settings.smtp.host = host;
      settings.smtp.port = port;
      settings.smtp.username = username;
      settings.smtp.password = password;
      // Port 465 : TLS implicite (SMTPS) ; tout autre port négocie STARTTLS
      settings.smtp.tls = port === 465;
      settings.meta.senderName = 'Cadeaux';
      // Gmail impose l'adresse du compte authentifié comme expéditeur
      settings.meta.senderAddress = username;
    }

    $app.save(settings);
    console.log(`PocketBase: Envoi d'e-mails ${hasSmtp ? `configuré via ${host}:${port}` : 'non configuré (SMTP absent)'}, URL publique ${settings.meta.appURL}.`);
  } catch (err) {
    console.error('PocketBase: Erreur lors de la configuration de l’envoi d’e-mails :', err);
  }
});
