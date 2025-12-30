import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '@shared/services/auth.service';
import { ChristmasButtonComponent } from '@shared/ui/christmas-button/christmas-button';
import { UiInputDirective } from '@shared/ui/input/input';

@Component({
  selector: 'app-login-block',
  imports: [ChristmasButtonComponent, ReactiveFormsModule, UiInputDirective],
  templateUrl: './login-block.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginBlockComponent {
  private readonly auth = inject(AuthService);

  readonly user = this.auth.user;
  readonly error = signal<string | null>(null);
  readonly loading = signal(false);

  readonly form = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(6)] }),
  });

  loginGoogle(): void {
    this.auth.loginWithGoogle().catch(() => this.error.set('Erreur de connexion Google'));
  }

  logout(): void {
    this.auth.logout();
    this.form.reset();
  }

  async submitLogin(): Promise<void> {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(null);
    const { email, password } = this.form.getRawValue();
    try {
      await this.auth.loginWithEmail(email, password);
    } catch (e: any) {
      console.error(e);
      this.error.set(this.mapError(e.code));
    } finally {
      this.loading.set(false);
    }
  }

  async submitRegister(): Promise<void> {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(null);
    const { email, password } = this.form.getRawValue();
    try {
      await this.auth.registerWithEmail(email, password);
    } catch (e: any) {
      console.error(e);
      this.error.set(this.mapError(e.code));
    } finally {
      this.loading.set(false);
    }
  }

  private mapError(code: string): string {
    switch (code) {
      case 'auth/invalid-credential':
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return 'Email ou mot de passe incorrect.';
      case 'auth/email-already-in-use':
        return 'Cet email est déjà utilisé.';
      case 'auth/weak-password':
        return 'Le mot de passe doit faire au moins 6 caractères.';
      default:
        return 'Une erreur est survenue.';
    }
  }
}
