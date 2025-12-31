import { ChangeDetectionStrategy, Component, inject, signal, output } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '@shared/services/auth.service';
import { ChristmasButtonComponent } from '@shared/ui/christmas-button/christmas-button';
import { UiInputDirective } from '@shared/ui/input/input';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-register-modal',
  imports: [ChristmasButtonComponent, ReactiveFormsModule, UiInputDirective, JsonPipe],
  templateUrl: './register-modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterModalComponent {
  private readonly auth = inject(AuthService);

  readonly cancel = output<void>();
  readonly registered = output<void>();

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = new FormGroup({
    displayName: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(2), Validators.maxLength(50)] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(6)] }),
    confirmPassword: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  }, { validators: this.passwordMatchValidator });

  onCancel(): void {
    if (this.loading()) return;
    this.cancel.emit();
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const { email, password, displayName } = this.form.getRawValue();

    try {
      await this.auth.registerWithEmail(email.trim(), password, displayName.trim());
      this.registered.emit();
    } catch (e: any) {
      console.error(e);
      this.error.set(this.mapError(e.code));
    } finally {
      this.loading.set(false);
    }
  }

  private passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const pass = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return pass === confirm ? null : { passwordMismatch: true };
  }

  private mapError(code: string): string {
    switch (code) {
      case 'auth/email-already-in-use':
        return 'Cet email est déjà utilisé.';
      case 'auth/invalid-email':
        return 'L’adresse email n’est pas valide.';
      case 'auth/weak-password':
        return 'Le mot de passe est trop court.';
      default:
        return 'Une erreur est survenue lors de l’inscription.';
    }
  }
}
