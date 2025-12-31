import { inject, Injectable } from '@angular/core';
import {
  Database,
  equalTo,
  get,
  listVal,
  objectVal,
  orderByChild,
  push,
  query,
  ref,
  remove,
  set,
  update,
} from '@angular/fire/database';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import type { GiftList } from '../models/gift-list';
import type { Gift } from '../models/gift';

@Injectable({ providedIn: 'root' })
export class ListService {
  private readonly db = inject(Database);
  private readonly auth = inject(AuthService);

  private listsRef() {
    return ref(this.db, 'lists');
  }

  private listRef(id: string) {
    return ref(this.db, `lists/${id}`);
  }

  private giftsRef(listId: string) {
    return ref(this.db, `lists/${listId}/gifts`);
  }

  async createList(title = 'Nouvelle liste', ownerId?: string): Promise<string> {
    const base = this.toKebab(title);
    const fallback = 'liste';
    const stem = base || fallback;

    // Ensure stem is not empty
    if (!stem || stem.trim() === '') {
      throw new Error('Could not generate a valid list ID from the title');
    }

    let candidate = stem;

    // Check availability: stem, then stem-random, then stem-timestamp
    if (!(await this.isIdAvailable(candidate))) {
      let random = Math.random().toString(36).substring(2, 6);
      // Ensure random string is at least 4 characters long
      while (random.length < 4) {
        random = Math.random().toString(36).substring(2, 6);
      }
      candidate = `${stem}-${random}`;

      if (!(await this.isIdAvailable(candidate))) {
        candidate = `${stem}-${Date.now()}`;
      }
    }

    const payload: Omit<GiftList, 'id' | 'gifts'> = { title };
    if (ownerId) {
      payload.ownerId = ownerId;
    }

    await set(this.listRef(candidate), payload);
    return candidate;
  }

  private async isIdAvailable(id: string): Promise<boolean> {
    if (!id || id.trim() === '') {
      return false; // Empty IDs are not available
    }
    const snapshot = await get(this.listRef(id));
    return !snapshot.exists();
  }

  // Transforms a title to a Firebase-safe kebab-case id
  private toKebab(input: string): string {
    return (input ?? '')
      .normalize('NFD') // split accents
      .replace(/[\u0300-\u036f]+/g, '') // remove diacritics
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-') // non-alphanumerics to dashes
      .replace(/-{2,}/g, '-') // collapse
      .replace(/^-+|-+$/g, ''); // trim dashes
  }

  getList(id: string): Observable<GiftList | null> {
    return objectVal<GiftList>(this.listRef(id), { keyField: 'id' });
  }

  listAll(): Observable<GiftList[]> {
    return listVal<GiftList>(this.listsRef(), { keyField: 'id' });
  }

  listByOwner(ownerId: string): Observable<GiftList[]> {
    const q = query(this.listsRef(), orderByChild('ownerId'), equalTo(ownerId));
    return listVal<GiftList>(q, { keyField: 'id' });
  }

  listGifts(listId: string): Observable<Gift[]> {
    return listVal<Gift>(this.giftsRef(listId), { keyField: 'id' });
  }

  async addGift(listId: string, title: string, url?: string): Promise<string> {
    const newRef = push(this.giftsRef(listId));
    const normalizedUrl = (url ?? '').trim() ? this.normalizeUrl((url ?? '').trim()) : undefined;
    const giftData: Omit<Gift, 'id'> = {
      title,
      // boughtBy is null by default (gift is not bought)
      boughtBy: null,
      // Only persist url when provided
      ...(normalizedUrl ? { url: normalizedUrl } : {}),
      // Use timestamp for append ordering by default
      order: Date.now(),
    };
    await set(newRef, giftData);
    return newRef.key as string;
  }

  async toggleBought(listId: string, giftId: string, bought: boolean): Promise<void> {
    const updateData: any = {};
    
    // When marking as bought, record who bought it
    if (bought && this.auth.user()) {
      updateData.boughtBy = this.auth.user()?.uid;
    } else if (!bought) {
      // When unmarking, clear the boughtBy field
      updateData.boughtBy = null;
    }
    
    await update(ref(this.db, `lists/${listId}/gifts/${giftId}`), updateData);
  }

  async renameList(id: string, title: string): Promise<void> {
    await update(this.listRef(id), { title: title.trim() });
  }

  async deleteGift(listId: string, giftId: string): Promise<void> {
    await remove(ref(this.db, `lists/${listId}/gifts/${giftId}`));
  }

  async updateGift(
    listId: string,
    giftId: string,
    patch: { title?: string; url?: string | null },
  ): Promise<void> {
    const payload: any = {};
    if (typeof patch.title === 'string') payload.title = patch.title.trim();
    if (patch.url !== undefined) {
      const trimmed = (patch.url ?? '').trim();
      if (trimmed) payload.url = this.normalizeUrl(trimmed);
      else payload.url = null; // remove url key by setting null (RTDB will keep null but UI treats as absent)
    }
    await update(ref(this.db, `lists/${listId}/gifts/${giftId}`), payload);
  }

  async reorderGifts(listId: string, orderedIds: string[]): Promise<void> {
    // Batch update order indexes to 0..n-1
    const updates: Record<string, any> = {};
    orderedIds.forEach((id, index) => {
      updates[`lists/${listId}/gifts/${id}/order`] = index;
    });
    await update(ref(this.db), updates);
  }

  // Ensure URLs have a protocol; default to https:// when missing.
  private normalizeUrl(input: string): string {
    const s = (input ?? '').trim();
    if (!s) return s;
    if (s.startsWith('//')) return 'https:' + s;
    // Has a scheme like http:, https:, mailto:, etc.
    if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(s)) return s;
    return `https://${s}`;
  }
}
