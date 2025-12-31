import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { AuthService } from '@shared/services/auth.service';
import { ChristmasButtonComponent } from '../christmas-button/christmas-button';

@Component({
  selector: 'app-top-bar',
  imports: [ChristmasButtonComponent],
  templateUrl: './top-bar.html',
  styleUrl: './top-bar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopBarComponent {
  private readonly auth = inject(AuthService);

  readonly user = this.auth.user;

  readonly homeClick = output<void>();
  readonly loginClick = output<void>();
  readonly registerClick = output<void>();

  logout(): void {
    this.auth.logout();
  }

  login(): void {
    this.loginClick.emit();
  }

  register(): void {
    this.registerClick.emit();
  }

  navigateHome(): void {
    this.homeClick.emit();
  }
}