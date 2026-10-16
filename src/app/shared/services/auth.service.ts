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
