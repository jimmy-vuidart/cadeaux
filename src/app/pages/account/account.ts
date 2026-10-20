import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PersonalInfoFormComponent } from './personal-info-form/personal-info-form';
import { PasswordFormComponent } from './password-form/password-form';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [RouterModule, PersonalInfoFormComponent, PasswordFormComponent],
  templateUrl: './account.html',
  styleUrl: './account.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'account-page'
  }
})
export class AccountPage {
  // Account page with personal info and password management
}