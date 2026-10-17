import { inject, Injectable } from '@angular/core';
import { Observable, from, of, Subject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { PocketBaseService } from './pocketbase.service';
import { AuthService } from './auth.service';
import { UserService } from './user.service';
import type { GiftList } from '../models/gift-list';
import type { Gift } from '../models/gift';

/**
 * Service métier gérant les listes de cadeaux et les cadeaux associés via PocketBase.
 * Prend en charge la consultation publique par slug, la synchronisation temps réel (SSE),
 * les opérations CRUD et le réordonnancement atomique.
 */
@Injectable({ providedIn: 'root' })
export class ListService {
  private readonly pbService = inject(PocketBaseService);
  private readonly auth = inject(AuthService);
  private readonly userService = inject(UserService);

  private get pb() {
    return this.pbService.client;
  }

  /**
   * Crée une nouvelle liste avec génération de slug unique et associe l'utilisateur connecté.
   * Retourne le slug de la liste créée.
   */
  async createList(title = 'Nouvelle liste', _ownerId?: string): Promise<string> {
    const res = await this.pb.send<{ id: string; slug: string; title: string }>('/api/custom/lists', {
      method: 'POST',
      body: { title: title.trim() },
    });
    return res.slug || res.id;
  }

  /**
   * Récupère une liste par son slug (ou son identifiant) et enregistre la visite si nécessaire.
   */
  getList(slugOrId: string): Observable<GiftList | null> {
    if (!slugOrId) return of(null);

    return from(
      this.pb.send<{ list: GiftList; gifts: Gift[] }>(`/api/custom/lists/${encodeURIComponent(slugOrId)}`, {
        method: 'GET',
        requestKey: null,
      }),
    ).pipe(
      map((res) => {
        const list = res.list;
        if (list) {
          this.recordListVisitIfNeeded(list);
        }
        return list;
      }),
      catchError((err) => {
        if (err?.isAbort) return of(null);
        console.error('Erreur lors du chargement de la liste :', err);
        return of(null);
      }),
    );
  }

  /**
   * Enregistre la visite d'une liste par l'utilisateur connecté s'il n'en est pas le propriétaire.
   */
  private async recordListVisitIfNeeded(list: GiftList): Promise<void> {
    const currentUser = this.auth.user();
    if (!currentUser) return;
    if (list.owner === currentUser.id || list.owner === currentUser.uid) return;

    try {
      await this.userService.recordListVisit(currentUser.id, list.id);
    } catch (error) {
      console.error('Échec de l’enregistrement de la visite :', error);
    }
  }

  /**
   * Retourne la liste des listes appartenant à un propriétaire donné.
   */
  listByOwner(ownerId: string): Observable<GiftList[]> {
    if (!ownerId) return of([]);

    return from(
      this.pb.collection('lists').getFullList<GiftList>({
        filter: `owner = "${ownerId}"`,
        sort: '-created',
        requestKey: null,
      }),
    ).pipe(
      map((records) =>
        records.map((r) => ({
          id: r.id,
          title: r.title,
          slug: r.slug,
          owner: r.owner,
          created: r.created,
          updated: r.updated,
        })),
      ),
      catchError((err) => {
        if (err?.isAbort) return of([]);
        console.error('Erreur lors de la récupération des listes du propriétaire :', err);
        return of([]);
      }),
    );
  }

  /**
   * Fournit un flux réactif des cadeaux d'une liste avec synchronisation SSE en temps réel.
   */
  listGifts(slugOrId: string): Observable<Gift[]> {
    if (!slugOrId) return of([]);

    return new Observable<Gift[]>((subscriber) => {
      let isUnsubscribed = false;
      let currentGifts: Gift[] = [];
      let currentListId = '';

      // 1. Chargement initial des cadeaux via la route de lecture publique
      this.pb
        .send<{ list: GiftList; gifts: Gift[] }>(`/api/custom/lists/${encodeURIComponent(slugOrId)}`, {
          method: 'GET',
          requestKey: null,
        })
        .then((res) => {
          if (isUnsubscribed) return;
          currentListId = res.list.id;
          currentGifts = res.gifts || [];
          subscriber.next([...currentGifts]);

          // 2. Abonnement en temps réel aux mutations des cadeaux de cette liste
          return this.pb.collection('gifts').subscribe('*', async (e) => {
            if (isUnsubscribed) return;
            const record = e.record as any;

            // Ne traiter que les cadeaux rattachés à la liste courante
            if (record['list'] !== currentListId && e.action !== 'delete') {
              return;
            }

            if (e.action === 'create') {
              const newGift: Gift = {
                id: record.id,
                list: record.list,
                title: record.title,
                url: record.url || null,
                position: record.position ?? 0,
                bought: !!record.bought,
                buyer: record.buyer || null,
                buyerName: null,
                created: record.created,
                updated: record.updated,
              };
              currentGifts.push(newGift);
            } else if (e.action === 'update') {
              const index = currentGifts.findIndex((g) => g.id === record.id);
              if (index !== -1) {
                let resolvedBuyerName = currentGifts[index].buyerName;
                // Si l'acheteur a changé
                if (record.bought && record.buyer && record.buyer !== currentGifts[index].buyer) {
                  try {
                    const u = await this.pb.collection('users').getOne(record.buyer, { requestKey: null });
                    resolvedBuyerName = u['displayName'] || u['name'] || null;
                  } catch {
                    resolvedBuyerName = null;
                  }
                } else if (!record.bought) {
                  resolvedBuyerName = null;
                }

                currentGifts[index] = {
                  ...currentGifts[index],
                  title: record.title,
                  url: record.url || null,
                  position: record.position ?? 0,
                  bought: !!record.bought,
                  buyer: record.buyer || null,
                  buyerName: resolvedBuyerName,
                  updated: record.updated,
                };
              }
            } else if (e.action === 'delete') {
              currentGifts = currentGifts.filter((g) => g.id !== record.id);
            }

            subscriber.next([...currentGifts]);
          });
        })
        .catch((err) => {
          if (!isUnsubscribed) {
            if (!err?.isAbort) {
              console.error('Erreur lors du chargement des cadeaux :', err);
            }
            subscriber.next([]);
          }
        });

      // Teardown : désabonnement systématique lors de la destruction du flux
      return () => {
        isUnsubscribed = true;
        this.pb.collection('gifts').unsubscribe('*').catch(() => {});
      };
    });
  }

  /**
   * Ajoute un cadeau à une liste.
   */
  async addGift(listId: string, title: string, url?: string): Promise<string> {
    const normalizedUrl = (url ?? '').trim() ? this.normalizeUrl((url ?? '').trim()) : undefined;
    const record = await this.pb.collection('gifts').create<Gift>({
      list: listId,
      title: title.trim(),
      url: normalizedUrl || null,
      position: Date.now(),
      bought: false,
    });
    return record.id;
  }

  /**
   * Coche ou décoche un cadeau via le point d'entrée public personnalisé.
   */
  async toggleBought(_listId: string, giftId: string, bought: boolean): Promise<void> {
    await this.pb.send(`/api/custom/gifts/${giftId}/toggle`, {
      method: 'POST',
      body: { bought },
    });
  }

  /**
   * Renomme une liste.
   */
  async renameList(id: string, title: string): Promise<void> {
    await this.pb.collection('lists').update(id, { title: title.trim() });
  }

  /**
   * Supprime un cadeau.
   */
  async deleteGift(_listId: string, giftId: string): Promise<void> {
    await this.pb.collection('gifts').delete(giftId);
  }

  /**
   * Met à jour le titre ou l'URL d'un cadeau.
   */
  async updateGift(
    _listId: string,
    giftId: string,
    patch: { title?: string; url?: string | null },
  ): Promise<void> {
    const payload: Record<string, any> = {};
    if (typeof patch.title === 'string') payload['title'] = patch.title.trim();
    if (patch.url !== undefined) {
      const trimmed = (patch.url ?? '').trim();
      payload['url'] = trimmed ? this.normalizeUrl(trimmed) : null;
    }
    await this.pb.collection('gifts').update(giftId, payload);
  }

  /**
   * Réordonne atomiquement les cadeaux d'une liste.
   */
  async reorderGifts(listId: string, orderedIds: string[]): Promise<void> {
    await this.pb.send(`/api/custom/lists/${listId}/reorder`, {
      method: 'POST',
      body: { orderedIds },
    });
  }

  /**
   * Normalise une URL en s'assurant qu'un protocole HTTPS est présent.
   */
  private normalizeUrl(input: string): string {
    const s = (input ?? '').trim();
    if (!s) return s;
    if (s.startsWith('//')) return 'https:' + s;
    if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(s)) return s;
    return `https://${s}`;
  }
}
