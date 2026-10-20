import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '@shared/services/auth.service';
import { ChristmasButtonComponent } from '@shared/ui/christmas-button/christmas-button';
import { UiInputDirective } from '@shared/ui/input/input';
import { passwordMatchValidator } from '@shared/validators/password-match';

/**
 * Page de réinitialisation du mot de passe, atteinte depuis le lien reçu par e-mail.
 * Définit un nouveau mot de passe à partir du jeton présent dans l'URL (`/reset-password/:token`).
 */
@Component({
  selector: 'app-password-reset',
  imports: [ReactiveFormsModule, RouterLink, ChristmasButtonComponent, UiInputDirective],
  templateUrl: './password-reset.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PasswordResetPage {
  private readonly route = inject(ActivatedRoute);
  private readonly auth = inject(AuthService);

  readonly error = signal<string | null>(null);
  readonly loading = signal(false);
  readonly done = signal(false);

  // Longueur minimale imposée par la collection users de PocketBase
  readonly form = new FormGroup({
    password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(8)] }),
    confirmPassword: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  }, { validators: passwordMatchValidator });

  async submit(): Promise<void> {
    this.form.markAllAsTouched();
    this.error.set(null);
    if (this.form.controls.password.invalid) {
      this.error.set('Le mot de passe doit faire au moins 8 caractères.');
      return;
    }
    if (this.form.invalid) {
      this.error.set('Les mots de passe ne correspondent pas.');
      return;
    }
    this.loading.set(true);
    try {
      const token = this.route.snapshot.paramMap.get('token') ?? '';
      await this.auth.confirmPasswordReset(token, this.form.controls.password.value);
      this.done.set(true);
    } catch (e: any) {
      console.error(e);
      this.error.set(e?.status === 400
        ? 'Ce lien est invalide ou a expiré. Refais une demande depuis la fenêtre de connexion.'
        : 'Une erreur est survenue.');
    } finally {
      this.loading.set(false);
    }
  }
}
