import { Injectable, signal, computed } from '@angular/core';
import PocketBase from 'pocketbase';
import type { UserInfo } from '../models/user-info';

/**
 * Service centralisant l'accès et l'état d'authentification du client PocketBase.
 * Fournit l'instance PocketBase configurée sur le sous-domaine courant et maintient les signaux de session.
 */
@Injectable({ providedIn: 'root' })
export class PocketBaseService {
  readonly client: PocketBase;

  // Signal réactif représentant l'utilisateur connecté ou null
  readonly user = signal<UserInfo | null>(null);

  // Signal dérivé indiquant si un utilisateur est authentifié
  readonly isLoggedIn = computed(() => !!this.user());

  constructor() {
    // Initialisation du client PocketBase avec l'origine courante (relatif)
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    this.client = new PocketBase(baseUrl);
    // Désactivation de l'auto-cancellation globale pour autoriser les requêtes parallèles RxJS
    this.client.autoCancellation(false);

    // Initialisation du signal avec l'état actuel du authStore
    this.syncUser();

    // Abonnement aux changements d'état du authStore
    this.client.authStore.onChange(() => {
      this.syncUser();
    });
  }

  /**
   * Synchronise le signal utilisateur avec le modèle authStore de PocketBase.
   */
  private syncUser(): void {
    const model = this.client.authStore.record;
    if (this.client.authStore.isValid && model) {
      this.user.set({
        id: model.id,
        uid: model.id,
        displayName: model['displayName'] || model['name'] || null,
        email: model['email'] || null,
      });
    } else {
      this.user.set(null);
    }
  }
}
