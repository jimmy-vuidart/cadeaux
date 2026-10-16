/**
 * Hooks PocketBase pour la gestion de l'authentification OAuth2 (Google).
 * Synchronise dynamiquement les identifiants OAuth issus des variables d'environnement au démarrage
 * et assure l'initialisation du nom d'affichage lors de la connexion utilisateur.
 */

// Synchronisation des identifiants OAuth Google au démarrage du serveur
onBootstrap((e) => {
  e.next();

  const clientId = $os.getenv('GOOGLE_CLIENT_ID') || $os.getenv('PB_GOOGLE_CLIENT_ID');
  const clientSecret = $os.getenv('GOOGLE_CLIENT_SECRET') || $os.getenv('PB_GOOGLE_CLIENT_SECRET');

  // Si les identifiants sont fournis dans l'environnement, on synchronise la collection users
  if (clientId && clientSecret) {
    try {
      const users = $app.findCollectionByNameOrId('users');
      users.oauth2.enabled = true;

      const existingProviders = (users.oauth2.providers || []).filter((p) => p.name !== 'google');
      existingProviders.push({
        name: 'google',
        clientId: clientId,
        clientSecret: clientSecret,
      });

      users.oauth2.providers = existingProviders;
      $app.save(users);
      console.log('PocketBase: Fournisseur OAuth2 Google synchronisé depuis l’environnement.');
    } catch (err) {
      console.error('PocketBase: Erreur lors de la synchronisation de Google OAuth2 :', err);
    }
  }
});

// Enrichissement du champ displayName pour les utilisateurs s'authentifiant via OAuth2
onRecordAuthWithOAuth2Request((e) => {
  e.next();

  if (e.record && !e.record.get('displayName')) {
    const oAuthName = e.oAuth2User ? e.oAuth2User.name : null;
    const name = oAuthName || e.record.get('name');
    if (name) {
      try {
        e.record.set('displayName', name);
        $app.save(e.record);
      } catch (err) {
        console.error('PocketBase: Erreur lors de l’attribution du displayName OAuth :', err);
      }
    }
  }
}, 'users');
