import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastService } from '@shared/services/toast.service';
import { CommonModule } from '@angular/common';
import { ToastContainerComponent } from '@shared/ui/toast-container/toast-container';
import { TopBarComponent } from '@shared/ui/top-bar/top-bar';
import { LoginModalComponent } from '@shared/ui/login-modal/login-modal';
import { RegisterModalComponent } from '@shared/ui/register-modal/register-modal';
import { SnowflakesComponent } from '@shared/ui/snowflakes/snowflakes';
import { Router } from '@angular/router';
import { AuthService } from '@shared/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, ToastContainerComponent, TopBarComponent, LoginModalComponent, RegisterModalComponent, SnowflakesComponent],
  templateUrl: './app.html',
})
export class App {
  readonly toastService = inject(ToastService);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  readonly showLoginModal = signal(false);
  readonly showRegisterModal = signal(false);

  navigateHome(): void {
    this.router.navigate(['/']);
  }

  openLoginModal(): void {
    this.showLoginModal.set(true);
  }

  closeLoginModal(): void {
    this.showLoginModal.set(false);
  }

  openRegisterModal(): void {
    this.showRegisterModal.set(true);
  }

  closeRegisterModal(): void {
    this.showRegisterModal.set(false);
  }
}
