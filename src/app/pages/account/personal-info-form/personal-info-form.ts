import { ChangeDetectionStrategy, Component, inject, signal, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../shared/services/auth.service';
import { UserService } from '../../../shared/services/user.service';
import { Auth, updateProfile } from '@angular/fire/auth';
import { ChristmasButtonComponent } from '../../../shared/ui/christmas-button/christmas-button';

@Component({
  selector: 'app-personal-info-form',
  standalone: true,
  imports: [FormsModule, ChristmasButtonComponent],
  templateUrl: './personal-info-form.html',
  styleUrl: './personal-info-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'personal-info-form'
  }
})
export class PersonalInfoFormComponent {
  readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly auth = inject(Auth);

  // Form state
  displayName = signal('');
  isEditing = signal(false);
  isSaving = signal(false);
  isLoading = signal(true);
  errorMessage = signal('');
  successMessage = signal('');

  constructor() {
    // Set up effect to react to user changes
    effect(() => {
      const user = this.authService.user();
      if (user) {
        this.loadUserInfo();
      } else {
        this.isLoading.set(false);
        this.displayName.set('');
      }
    });
  }

  async loadUserInfo(): Promise<void> {
    try {
      this.isLoading.set(true);
      const user = this.authService.user();
      if (user) {
        const userInfo = await this.userService.getUserInfo(user.uid);
        this.displayName.set(userInfo?.displayName || '');
      }
    } catch (error) {
      console.error('Error loading user info:', error);
      this.errorMessage.set('Erreur de chargement des informations utilisateur');
    } finally {
      this.isLoading.set(false);
    }
  }

  toggleEdit(): void {
    this.isEditing.update(prev => !prev);
    // Clear messages when starting to edit
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  async saveDisplayName(): Promise<void> {
    const user = this.authService.user();
    if (!user) {
      this.errorMessage.set('Utilisateur non connecté');
      return;
    }

    if (!this.displayName()?.trim()) {
      this.errorMessage.set('Le nom d\'affichage ne peut pas être vide');
      return;
    }

    try {
      this.isSaving.set(true);
      this.errorMessage.set('');
      this.successMessage.set('');
      
      await updateProfile(user, {
        displayName: this.displayName()
      });
      
      // Refresh the user info
      await this.loadUserInfo();
      
      this.successMessage.set('Nom d\'affichage mis à jour avec succès !');
      this.isEditing.set(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => this.successMessage.set(''), 3000);
    } catch (error) {
      console.error('Error updating display name:', error);
      this.errorMessage.set('Erreur lors de la mise à jour du nom d\'affichage');
    } finally {
      this.isSaving.set(false);
    }
  }

  cancelEdit(): void {
    this.isEditing.set(false);
    this.errorMessage.set('');
    // Reset to original value
    this.loadUserInfo();
  }
}