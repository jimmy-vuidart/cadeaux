# Password Reset

A user who forgot their password can choose a new one by email, without help from an administrator.

## User Experience

- The login modal shows a discreet "Mot de passe oublié ?" link under the password field.
- Clicking it sends a reset email to the address typed in the email field. If the field is empty or invalid, the user is asked to type their email first.
- The confirmation message is the same whether an account exists or not, so the app never reveals who is registered.
- If too many reset requests were made recently, the user is asked to try again later.
- The email (in French) contains a button leading to the "Nouveau mot de passe" page. The link is valid for 30 minutes and can only be used once.
- On that page, the user types the new password twice (8 characters minimum). On success, they are invited to go back home and log in with the new password. An expired or already used link shows a clear message asking to request a new one.
