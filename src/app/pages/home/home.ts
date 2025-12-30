import { ChangeDetectionStrategy, Component, inject, isDevMode, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CreateListModalComponent } from './create-list-modal/create-list-modal';
import { LoginBlockComponent } from './login-block/login-block';
import { ChristmasButtonComponent } from '@shared/ui/christmas-button/christmas-button';
import { AuthService } from '@shared/services/auth.service';

@Component({
  selector: 'app-home',
  imports: [CreateListModalComponent, LoginBlockComponent, ChristmasButtonComponent],
  templateUrl: './home.html',
  styleUrl: './home.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  // Auth state
  readonly isLoggedIn = this.auth.isLoggedIn;

  // Modal state
  readonly showModal = signal(false);
  readonly dev = isDevMode();

  onCreateList(): void {
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  async handleCreated(id: string): Promise<void> {
    this.showModal.set(false);
    await this.router.navigate(['/lists', id]);
  }
}
