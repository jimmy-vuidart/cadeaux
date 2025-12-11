import { Injectable, inject } from '@angular/core';
import { Database, ref, set, update, remove, objectVal, listVal, push } from '@angular/fire/database';
import { Observable, firstValueFrom } from 'rxjs';
import type { GiftList } from '../models/gift-list';
import type { Gift } from '../models/gift';

@Injectable({ providedIn: 'root' })
export class ListService {
  private readonly db = inject(Database);

  private listsRef() {
    return ref(this.db, 'lists');
  }

  private listRef(id: string) {
    return ref(this.db, `lists/${id}`);
  }

  private giftsRef(listId: string) {
    return ref(this.db, `lists/${listId}/gifts`);
  }

  async createList(title = 'Nouvelle liste'): Promise<string> {
    const base = this.toKebab(title);
    const fallback = 'liste';
    const stem = base || fallback;

    // Ensure uniqueness by appending an incrementing suffix if needed
    let candidate = stem;
    let i = 2;
    // small safety to avoid infinite loop in extreme cases
    const MAX_TRIES = 1000;
    while (!(await this.isIdAvailable(candidate)) && i <= MAX_TRIES) {
      candidate = `${stem}-${i++}`;
    }

    await set(this.listRef(candidate), {
      title,
    } satisfies Omit<GiftList, 'id' | 'gifts'>);
    return candidate;
  }

  private async isIdAvailable(id: string): Promise<boolean> {
    const val = await firstValueFrom(objectVal<GiftList | null>(this.listRef(id)));
    return val === null;
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

  listGifts(listId: string): Observable<Gift[]> {
    return listVal<Gift>(this.giftsRef(listId), { keyField: 'id' });
  }

  async addGift(listId: string, title: string, url?: string): Promise<string> {
    const newRef = push(this.giftsRef(listId));
    await set(newRef, {
      title,
      bought: false,
      // Only persist url when provided
      ...(url ? { url } : {}),
    } satisfies Omit<Gift, 'id'>);
    return newRef.key as string;
  }

  async toggleBought(listId: string, giftId: string, bought: boolean): Promise<void> {
    await update(ref(this.db, `lists/${listId}/gifts/${giftId}`), { bought });
  }

  async renameList(id: string, title: string): Promise<void> {
    await update(this.listRef(id), { title: title.trim() });
  }

  async deleteGift(listId: string, giftId: string): Promise<void> {
    await remove(ref(this.db, `lists/${listId}/gifts/${giftId}`));
  }
}
