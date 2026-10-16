import { ChangeDetectionStrategy, Component, inject, signal, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../shared/services/auth.service';
import { UserService } from '../../../shared/services/user.service';
import { ChristmasButtonComponent } from '../../../shared/ui/christmas-button/christmas-button';

/**
 * Composant de formulaire permettant à l'utilisateur de modifier son nom d'affichage.
 */
@Component({
  selector: 'app-personal-info-form',
  standalone: true,
  imports: [FormsModule, ChristmasButtonComponent],
  templateUrl: './personal-info-form.html',
  styleUrl: './personal-info-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'personal-info-form',
  },
})
export class PersonalInfoFormComponent {
  readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);

  // État du formulaire
  displayName = signal('');
  isEditing = signal(false);
  isSaving = signal(false);
  isLoading = signal(true);
  errorMessage = signal('');
  successMessage = signal('');

  constructor() {
    // Réaction aux changements de session utilisateur
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
        const userInfo = await this.userService.getUserInfo(user.id || user.uid);
        this.displayName.set(userInfo?.displayName || '');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des informations utilisateur :', error);
      this.errorMessage.set('Erreur de chargement des informations utilisateur');
    } finally {
      this.isLoading.set(false);
    }
  }

  toggleEdit(): void {
    this.isEditing.update((prev) => !prev);
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  async saveDisplayName(): Promise<void> {
    const user = this.authService.user();
    if (!user) {
      this.errorMessage.set('Utilisateur non connecté');
      return;
    }

    const trimmed = (this.displayName() ?? '').trim();
    if (!trimmed) {
      this.errorMessage.set('Le nom d\'affichage ne peut pas être vide');
      return;
    }

    try {
      this.isSaving.set(true);
      this.errorMessage.set('');
      this.successMessage.set('');

      await this.authService.updateDisplayName(trimmed);

      // Rafraîchir les données locales
      await this.loadUserInfo();

      this.successMessage.set('Nom d\'affichage mis à jour avec succès !');
      this.isEditing.set(false);

      setTimeout(() => this.successMessage.set(''), 3000);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du nom d\'affichage :', error);
      this.errorMessage.set('Erreur lors de la mise à jour du nom d\'affichage');
    } finally {
      this.isSaving.set(false);
    }
  }

  cancelEdit(): void {
    this.isEditing.set(false);
    this.errorMessage.set('');
    this.loadUserInfo();
  }
}