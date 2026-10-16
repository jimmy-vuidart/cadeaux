import { inject, Injectable } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { PocketBaseService } from './pocketbase.service';
import type { UserInfo } from '../models/user-info';
import type { VisitedListId } from '../models/visited-list';

/**
 * Service gérant les informations utilisateurs et l'historique des listes visitées dans PocketBase.
 */
@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly pbService = inject(PocketBaseService);

  private get pb() {
    return this.pbService.client;
  }

  /**
   * Récupère le profil d'un utilisateur par son identifiant.
   */
  async getUserInfo(uid: string): Promise<UserInfo | null> {
    if (!uid) return null;
    try {
      const record = await this.pb.collection('users').getOne(uid);
      return {
        id: record.id,
        uid: record.id,
        displayName: record['displayName'] || record['name'] || null,
        email: record['email'] || null,
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des informations utilisateur :', error);
      return null;
    }
  }

  /**
   * Enregistre ou actualise la date de dernière visite d'une liste par un utilisateur.
   */
  async recordListVisit(userId: string, listId: string): Promise<void> {
    if (!userId || !listId) return;

    try {
      const existing = await this.pb
        .collection('visits')
        .getFirstListItem(`user = "${userId}" && list = "${listId}"`)
        .catch(() => null);

      const now = new Date().toISOString();
      if (existing) {
        await this.pb.collection('visits').update(existing.id, { lastVisited: now });
      } else {
        await this.pb.collection('visits').create({
          user: userId,
          list: listId,
          lastVisited: now,
        });
      }
    } catch (error) {
      console.error('Erreur lors de l’enregistrement de la visite :', error);
    }
  }

  /**
   * Récupère les identifiants de listes visitées par un utilisateur sous forme de promesse.
   */
  async getVisitedListIds(userId: string): Promise<VisitedListId[]> {
    if (!userId) return [];
    try {
      const records = await this.pb.collection('visits').getFullList({
        filter: `user = "${userId}"`,
        sort: '-lastVisited',
      });
      return records.map((r) => r['list'] as string);
    } catch (error) {
      console.error('Erreur lors de la récupération des listes visitées :', error);
      return [];
    }
  }

  /**
   * Fournit un flux Observable des identifiants des listes visitées par l'utilisateur.
   */
  getVisitedListIdsObservable(userId: string): Observable<VisitedListId[]> {
    if (!userId) return of([]);

    return from(this.getVisitedListIds(userId)).pipe(
      catchError((err) => {
        console.error('Erreur dans getVisitedListIdsObservable :', err);
        return of([]);
      }),
    );
  }

  /**
   * Récupère les N listes visitées les plus récentes.
   */
  getRecentVisitedListIds(userId: string, limit: number = 5): Observable<VisitedListId[]> {
    return this.getVisitedListIdsObservable(userId).pipe(
      map((ids) => ids.slice(0, limit)),
    );
  }

  /**
   * Supprime une liste visitée de l'historique d'un utilisateur.
   */
  async removeVisitedList(userId: string, listId: string): Promise<void> {
    if (!userId || !listId) return;
    try {
      const existing = await this.pb
        .collection('visits')
        .getFirstListItem(`user = "${userId}" && list = "${listId}"`);
      if (existing) {
        await this.pb.collection('visits').delete(existing.id);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la visite :', error);
    }
  }
}