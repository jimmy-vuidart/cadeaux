import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ChristmasButtonComponent } from '@shared/ui/christmas-button/christmas-button';

/**
 * Page présentant les règles de confidentialité et la politique de protection des données de l'application.
 */
@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [RouterLink, ChristmasButtonComponent],
  templateUrl: './privacy.html',
  styleUrl: './privacy.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrivacyPage {}
