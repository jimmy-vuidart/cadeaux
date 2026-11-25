import { inject, Injectable } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { PocketBaseService } from './pocketbase.service';
import { AuthService } from './auth.service';
import { UserService } from './user.service';
import type { GiftList } from '../models/gift-list';
import type { GiftGroup } from '../models/gift-group';
import type { Gift } from '../models/gift';

/**
 * État complet d'une liste de cadeaux synchronisée en temps réel.
 */
export interface ListSnapshot {
  list: GiftList | null;
  groups: GiftGroup[];
  gifts: Gift[];
}

interface ListDetailResponse {
  list: GiftList;
  groups?: GiftGroup[];
  gifts?: Gift[];
}

/**
 * Service métier gérant les listes de cadeaux, leurs catégories et leurs cadeaux via PocketBase.
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
   * Observe une liste, ses catégories et ses cadeaux en temps réel à partir d'un unique chargement initial.
   */
  watchList(slugOrId: string): Observable<ListSnapshot> {
    if (!slugOrId) {
      return of({ list: null, groups: [], gifts: [] });
    }

    return new Observable<ListSnapshot>((subscriber) => {
      let isUnsubscribed = false;
      let currentList: GiftList | null = null;
      let currentGroups: GiftGroup[] = [];
      let currentGifts: Gift[] = [];
      let currentListId = '';
      let unsubGifts: (() => Promise<void> | void) | null = null;
      let unsubGroups: (() => Promise<void> | void) | null = null;

      const emit = () => {
        if (isUnsubscribed) return;
        subscriber.next({
          list: currentList,
          groups: [...currentGroups],
          gifts: [...currentGifts],
        });
      };

      this.pb
        .send<ListDetailResponse>(`/api/custom/lists/${encodeURIComponent(slugOrId)}`, {
          method: 'GET',
          requestKey: null,
        })
        .then(async (res) => {
          if (isUnsubscribed) return;
          currentList = res.list ?? null;
          currentListId = res.list?.id ?? '';
          currentGroups = (res.groups || []).map((grp) => this.mapGroupRecord(grp));
          currentGifts = (res.gifts || []).map((g) => ({ ...g, group: g.group || null }));

          if (currentList) {
            this.recordListVisitIfNeeded(currentList);
          }
          emit();

          if (!currentListId) return;

          const [giftsUnsub, groupsUnsub] = await Promise.all([
            this.pb.collection('gifts').subscribe('*', async (e) => {
              if (isUnsubscribed) return;
              const record = e.record as any;
              if (record['list'] !== currentListId && e.action !== 'delete') {
                return;
              }
              currentGifts = await this.applyGiftEvent(currentGifts, e.action, record);
              emit();
            }),
            this.pb.collection('gift_groups').subscribe('*', (e) => {
              if (isUnsubscribed) return;
              const record = e.record as any;
              if (record['list'] !== currentListId && e.action !== 'delete') {
                return;
              }
              if (e.action === 'create') {
                if (!currentGroups.some((grp) => grp.id === record.id)) {
                  currentGroups = [...currentGroups, this.mapGroupRecord(record)];
                }
              } else if (e.action === 'update') {
                const idx = currentGroups.findIndex((grp) => grp.id === record.id);
                if (idx !== -1) {
                  currentGroups = currentGroups.map((grp, i) =>
                    i === idx ? this.mapGroupRecord(record) : grp,
                  );
                }
              } else if (e.action === 'delete') {
                currentGroups = currentGroups.filter((grp) => grp.id !== record.id);
                // Détache immédiatement les cadeaux rattachés à la catégorie supprimée
                currentGifts = currentGifts.map((g) =>
                  g.group === record.id ? { ...g, group: null } : g,
                );
              }
              emit();
            }),
          ]);

          if (isUnsubscribed) {
            Promise.resolve(typeof giftsUnsub === 'function' ? giftsUnsub() : undefined).catch(() => {});
            Promise.resolve(typeof groupsUnsub === 'function' ? groupsUnsub() : undefined).catch(() => {});
            return;
          }

          unsubGifts = typeof giftsUnsub === 'function' ? giftsUnsub : null;
          unsubGroups = typeof groupsUnsub === 'function' ? groupsUnsub : null;
        })
        .catch((err) => {
          if (!isUnsubscribed) {
            if (!err?.isAbort) {
              console.error('Erreur lors du chargement de la liste :', err);
            }
            subscriber.next({ list: null, groups: [], gifts: [] });
          }
        });

      return () => {
        isUnsubscribed = true;
        if (unsubGifts) {
          Promise.resolve(unsubGifts()).catch(() => {});
        } else {
          this.pb.collection('gifts').unsubscribe('*').catch(() => {});
        }
        if (unsubGroups) {
          Promise.resolve(unsubGroups()).catch(() => {});
        } else {
          this.pb.collection('gift_groups').unsubscribe('*').catch(() => {});
        }
      };
    });
  }

  /**
   * Récupère une liste par son slug (ou son identifiant) et enregistre la visite si nécessaire.
   */
  getList(slugOrId: string): Observable<GiftList | null> {
    if (!slugOrId) return of(null);

    return from(
      this.pb.send<ListDetailResponse>(`/api/custom/lists/${encodeURIComponent(slugOrId)}`, {
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
    return this.watchList(slugOrId).pipe(map((snapshot) => snapshot.gifts));
  }

  /**
   * Crée une catégorie (groupe de cadeaux) rattachée à une liste.
   */
  async createGroup(listId: string, name: string): Promise<GiftGroup> {
    const record = await this.pb.collection('gift_groups').create<GiftGroup>({
      list: listId,
      name: name.trim(),
      position: Date.now(),
    });
    return this.mapGroupRecord(record);
  }

  /**
   * Renomme une catégorie existante.
   */
  async renameGroup(groupId: string, name: string): Promise<void> {
    await this.pb.collection('gift_groups').update(groupId, {
      name: name.trim(),
    });
  }

  /**
   * Supprime une catégorie (les cadeaux associés passent automatiquement sans catégorie).
   */
  async deleteGroup(groupId: string): Promise<void> {
    await this.pb.collection('gift_groups').delete(groupId);
  }

  /**
   * Réordonne atomiquement les catégories d'une liste.
   */
  async reorderGroups(listId: string, orderedIds: string[]): Promise<void> {
    await this.pb.send(`/api/custom/lists/${listId}/reorder-groups`, {
      method: 'POST',
      body: { orderedIds },
    });
  }

  /**
   * Ajoute un cadeau à une liste, éventuellement rattaché à une catégorie.
   */
  async addGift(listId: string, title: string, url?: string, groupId?: string | null): Promise<string> {
    const normalizedUrl = (url ?? '').trim() ? this.normalizeUrl((url ?? '').trim()) : undefined;
    const record = await this.pb.collection('gifts').create<Gift>({
      list: listId,
      group: groupId || null,
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
   * Met à jour le titre, l'URL ou la catégorie d'un cadeau.
   */
  async updateGift(
    _listId: string,
    giftId: string,
    patch: { title?: string; url?: string | null; group?: string | null },
  ): Promise<void> {
    const payload: Record<string, any> = {};
    if (typeof patch.title === 'string') payload['title'] = patch.title.trim();
    if (patch.url !== undefined) {
      const trimmed = (patch.url ?? '').trim();
      payload['url'] = trimmed ? this.normalizeUrl(trimmed) : null;
    }
    if (patch.group !== undefined) {
      payload['group'] = patch.group || null;
    }
    await this.pb.collection('gifts').update(giftId, payload);
  }

  /**
   * Réordonne atomiquement les cadeaux d'une liste ou d'une catégorie.
   */
  async reorderGifts(listId: string, orderedIds: string[]): Promise<void> {
    await this.pb.send(`/api/custom/lists/${listId}/reorder`, {
      method: 'POST',
      body: { orderedIds },
    });
  }

  private mapGroupRecord(record: any): GiftGroup {
    return {
      id: record.id,
      list: record.list,
      name: record.name,
      position: record.position ?? 0,
      created: record.created,
      updated: record.updated,
    };
  }

  private async applyGiftEvent(currentGifts: Gift[], action: string, record: any): Promise<Gift[]> {
    if (action === 'create') {
      if (currentGifts.some((g) => g.id === record.id)) {
        return currentGifts;
      }
      const newGift: Gift = {
        id: record.id,
        list: record.list,
        group: record.group || null,
        title: record.title,
        url: record.url || null,
        position: record.position ?? 0,
        bought: !!record.bought,
        buyer: record.buyer || null,
        buyerName: null,
        created: record.created,
        updated: record.updated,
      };
      return [...currentGifts, newGift];
    }

    if (action === 'update') {
      const index = currentGifts.findIndex((g) => g.id === record.id);
      if (index === -1) return currentGifts;

      let resolvedBuyerName = currentGifts[index].buyerName;
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

      const updated: Gift = {
        ...currentGifts[index],
        group: record.group || null,
        title: record.title,
        url: record.url || null,
        position: record.position ?? 0,
        bought: !!record.bought,
        buyer: record.buyer || null,
        buyerName: resolvedBuyerName,
        updated: record.updated,
      };
      return currentGifts.map((g, i) => (i === index ? updated : g));
    }

    if (action === 'delete') {
      return currentGifts.filter((g) => g.id !== record.id);
    }

    return currentGifts;
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
