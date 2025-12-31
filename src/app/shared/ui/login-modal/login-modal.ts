import { ChangeDetectionStrategy, Component, inject, output, signal } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '@shared/services/auth.service';
import { ChristmasButtonComponent } from '../christmas-button/christmas-button';
import { UiInputDirective } from '../input/input';

@Component({
  selector: 'app-login-modal',
  imports: [ChristmasButtonComponent, ReactiveFormsModule, UiInputDirective],
  templateUrl: './login-modal.html',
  styleUrl: './login-modal.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginModalComponent {
  private readonly auth = inject(AuthService);

  readonly cancel = output<void>();
  readonly registered = output<void>();

  readonly error = signal<string | null>(null);
  readonly loading = signal(false);

  readonly form = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(6)] }),
  });

  async submitLogin(): Promise<void> {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(null);
    const { email, password } = this.form.getRawValue();
    try {
      await this.auth.loginWithEmail(email, password);
      this.cancel.emit();
    } catch (e: any) {
      console.error(e);
      this.error.set(this.mapError(e.code));
    } finally {
      this.loading.set(false);
    }
  }

  loginGoogle(): void {
    this.auth.loginWithGoogle().then(() => {
      this.cancel.emit();
    }).catch(() => {
      this.error.set('Erreur de connexion Google');
    });
  }

  openRegister(): void {
    this.registered.emit();
  }

  close(): void {
    this.cancel.emit();
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