/**
 * Migration configurant la réinitialisation de mot de passe par e-mail :
 * - modèle d'e-mail en français dont le lien pointe vers la page Angular `/reset-password/:token`,
 *   le panneau d'administration `/_/` de PocketBase (cible du modèle par défaut) n'étant pas exposé publiquement ;
 * - limitation du nombre de demandes de réinitialisation pour protéger les boîtes mail et le quota du relais SMTP.
 */

const RESET_PASSWORD_SUBJECT = 'Réinitialisation de ton mot de passe Cadeaux';

const RESET_PASSWORD_BODY = `<p>Bonjour,</p>
<p>Une réinitialisation du mot de passe de ton compte Cadeaux a été demandée.</p>
<p>Clique sur le bouton ci-dessous pour choisir un nouveau mot de passe :</p>
<p>
  <a class="btn" href="{APP_URL}/reset-password/{TOKEN}" target="_blank" rel="noopener">Choisir un nouveau mot de passe</a>
</p>
<p><i>Ce lien expire dans 30 minutes. Si tu n'es pas à l'origine de cette demande, ignore simplement cet e-mail.</i></p>
<p>
  À bientôt,<br/>
  Cadeaux
</p>`;

// Valeurs par défaut de PocketBase, restaurées en cas de retour arrière
const DEFAULT_RESET_PASSWORD_SUBJECT = 'Reset your {APP_NAME} password';

const DEFAULT_RESET_PASSWORD_BODY = `<p>Hello,</p>
<p>Click on the button below to reset your password.</p>
<p>
  <a class="btn" href="{APP_URL}/_/#/auth/confirm-password-reset/{TOKEN}" target="_blank" rel="noopener">Reset password</a>
</p>
<p><i>If you didn't ask to reset your password, please ignore this email.</i></p>
<p>
  Thanks,<br/>
  {APP_NAME} team
</p>`;

const DEFAULT_RATE_LIMIT_RULES = [
  { label: '*:auth', audience: '', duration: 3, maxRequests: 2 },
  { label: '*:create', audience: '', duration: 5, maxRequests: 20 },
  { label: '/api/batch', audience: '', duration: 1, maxRequests: 3 },
  { label: '/api/', audience: '', duration: 10, maxRequests: 300 },
];

migrate((app) => {
  const users = app.findCollectionByNameOrId('users');
  users.resetPasswordTemplate.subject = RESET_PASSWORD_SUBJECT;
  users.resetPasswordTemplate.body = RESET_PASSWORD_BODY;
  app.save(users);

  // Derrière Traefik, PocketBase voit toutes les requêtes depuis la même IP : la limite est donc globale.
  // 5 demandes par heure suffisent pour une application familiale et restent loin du quota d'envoi Gmail.
  const settings = app.settings();
  settings.rateLimits.enabled = true;
  settings.rateLimits.rules = [
    { label: 'users:requestPasswordReset', audience: '', duration: 3600, maxRequests: 5 },
  ];
  app.save(settings);
}, (app) => {
  const users = app.findCollectionByNameOrId('users');
  users.resetPasswordTemplate.subject = DEFAULT_RESET_PASSWORD_SUBJECT;
  users.resetPasswordTemplate.body = DEFAULT_RESET_PASSWORD_BODY;
  app.save(users);

  const settings = app.settings();
  settings.rateLimits.enabled = false;
  settings.rateLimits.rules = DEFAULT_RATE_LIMIT_RULES;
  app.save(settings);
});
