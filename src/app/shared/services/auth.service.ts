import { Injectable, inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { PocketBaseService } from './pocketbase.service';

/**
 * Service gérant l'authentification des utilisateurs auprès de PocketBase.
 * Fournit les flux réactifs d'état de session et les opérations de connexion / déconnexion.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly pbService = inject(PocketBaseService);
  private get pb() {
    return this.pbService.client;
  }

  // Signaux exposant l'utilisateur connecté et son statut d'authentification
  readonly user = this.pbService.user;
  readonly isLoggedIn = this.pbService.isLoggedIn;

  // Observable réactif dérivé du signal pour compatibilité RxJS
  readonly user$ = toObservable(this.user);

  /**
   * Connexion via le fournisseur OAuth Google.
   */
  async loginWithGoogle(): Promise<void> {
    await this.pb.collection('users').authWithOAuth2({ provider: 'google' });
  }

  /**
   * Connexion standard via e-mail et mot de passe.
   */
  async loginWithEmail(email: string, pass: string): Promise<void> {
    await this.pb.collection('users').authWithPassword(email, pass);
  }

  /**
   * Inscription d'un nouvel utilisateur avec e-mail, mot de passe et nom d'affichage.
   */
  async registerWithEmail(email: string, pass: string, displayName: string): Promise<void> {
    await this.pb.collection('users').create({
      email,
      password: pass,
      passwordConfirm: pass,
      displayName,
    });
    await this.pb.collection('users').authWithPassword(email, pass);
  }

  /**
   * Demande l'envoi d'un e-mail contenant le lien de réinitialisation du mot de passe.
   * PocketBase répond de la même façon que l'adresse corresponde à un compte ou non.
   */
  async requestPasswordReset(email: string): Promise<void> {
    await this.pb.collection('users').requestPasswordReset(email);
  }

  /**
   * Définit un nouveau mot de passe à partir du jeton reçu dans l'e-mail de réinitialisation.
   */
  async confirmPasswordReset(token: string, pass: string): Promise<void> {
    await this.pb.collection('users').confirmPasswordReset(token, pass, pass);
  }

  /**
   * Change le mot de passe de l'utilisateur connecté, après vérification du mot de passe actuel par PocketBase.
   * PocketBase invalide toutes les sessions lors d'un changement de mot de passe : l'utilisateur est donc
   * reconnecté immédiatement avec son nouveau mot de passe pour conserver sa session.
   */
  async changePassword(currentPass: string, newPass: string): Promise<void> {
    const record = this.pb.authStore.record;
    if (!record) {
      throw new Error('Utilisateur non connecté');
    }
    const email = record['email'];
    await this.pb.collection('users').update(record.id, {
      oldPassword: currentPass,
      password: newPass,
      passwordConfirm: newPass,
    });
    await this.pb.collection('users').authWithPassword(email, newPass);
  }

  /**
   * Déconnexion de l'utilisateur courant.
   */
  async logout(): Promise<void> {
    this.pb.authStore.clear();
  }

  /**
   * Met à jour le nom affiché de l'utilisateur connecté.
   */
  async updateDisplayName(displayName: string): Promise<void> {
    const record = this.pb.authStore.record;
    if (record) {
      await this.pb.collection('users').update(record.id, { displayName });
    }
  }
}
