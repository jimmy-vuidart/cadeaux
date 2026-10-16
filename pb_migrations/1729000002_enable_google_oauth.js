/**
 * Migration activant le fournisseur d'authentification OAuth2 Google sur la collection users.
 * Initialise le fournisseur avec les variables d'environnement si disponibles, ou des identifiants
 * fictifs de développement pour permettre l'instanciation locale du schéma.
 */

migrate((app) => {
  const users = app.findCollectionByNameOrId('users');
  users.oauth2.enabled = true;

  const clientId =
    $os.getenv('GOOGLE_CLIENT_ID') ||
    $os.getenv('PB_GOOGLE_CLIENT_ID') ||
    'dev-google-client-id.apps.googleusercontent.com';

  const clientSecret =
    $os.getenv('GOOGLE_CLIENT_SECRET') ||
    $os.getenv('PB_GOOGLE_CLIENT_SECRET') ||
    'dev-google-client-secret';

  const providers = (users.oauth2.providers || []).filter((p) => p.name !== 'google');
  providers.push({
    name: 'google',
    clientId: clientId,
    clientSecret: clientSecret,
  });

  users.oauth2.providers = providers;
  app.save(users);
}, (app) => {
  try {
    const users = app.findCollectionByNameOrId('users');
    users.oauth2.providers = (users.oauth2.providers || []).filter((p) => p.name !== 'google');
    if (users.oauth2.providers.length === 0) {
      users.oauth2.enabled = false;
    }
    app.save(users);
  } catch {}
});
