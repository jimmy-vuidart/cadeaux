import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '@shared/services/auth.service';
import { ChristmasButtonComponent } from '@shared/ui/christmas-button/christmas-button';
import { UiInputDirective } from '@shared/ui/input/input';
import { passwordMatchValidator } from '@shared/validators/password-match';

/**
 * Section de la page compte permettant à l'utilisateur connecté de changer son mot de passe.
 * Un compte créé avec Google n'a pas de mot de passe connu : il peut recevoir par e-mail
 * un lien de réinitialisation pour en définir un.
 */
@Component({
  selector: 'app-password-form',
  imports: [ReactiveFormsModule, ChristmasButtonComponent, UiInputDirective],
  templateUrl: './password-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PasswordFormComponent {
  private readonly auth = inject(AuthService);

  readonly user = this.auth.user;
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);
  readonly loading = signal(false);

  // Longueur minimale imposée par la collection users de PocketBase
  readonly form = new FormGroup({
    currentPassword: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(8)] }),
    confirmPassword: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  }, { validators: passwordMatchValidator });

  async submit(): Promise<void> {
    this.form.markAllAsTouched();
    this.resetMessages();
    const { currentPassword, password } = this.form.controls;
    if (currentPassword.invalid) {
      this.error.set('Saisis ton mot de passe actuel.');
      return;
    }
    if (password.invalid) {
      this.error.set('Le nouveau mot de passe doit faire au moins 8 caractères.');
      return;
    }
    if (this.form.invalid) {
      this.error.set('Les mots de passe ne correspondent pas.');
      return;
    }
    this.loading.set(true);
    try {
      await this.auth.changePassword(currentPassword.value, password.value);
      this.form.reset();
      this.success.set('Mot de passe modifié avec succès !');
    } catch (e: any) {
      console.error(e);
      this.error.set(e?.response?.data?.oldPassword
        ? 'Mot de passe actuel incorrect.'
        : 'Une erreur est survenue.');
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Envoie un lien de réinitialisation à l'adresse du compte (utile pour les comptes créés avec Google).
   */
  async sendResetLink(): Promise<void> {
    const email = this.user()?.email;
    if (!email) return;
    this.resetMessages();
    this.loading.set(true);
    try {
      await this.auth.requestPasswordReset(email);
      this.success.set(`Un email pour définir ton mot de passe vient d'être envoyé à ${email}.`);
    } catch (e: any) {
      console.error(e);
      this.error.set(e?.status === 429
        ? 'Trop de demandes de réinitialisation, réessaie plus tard.'
        : 'Une erreur est survenue.');
    } finally {
      this.loading.set(false);
    }
  }

  private resetMessages(): void {
    this.error.set(null);
    this.success.set(null);
  }
}
