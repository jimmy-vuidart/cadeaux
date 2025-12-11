import { Injectable, inject } from '@angular/core';
import {
  Database,
  ref,
  push,
  set,
  update,
  remove,
  objectVal,
  listVal,
} from '@angular/fire/database';
import { Observable } from 'rxjs';
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
    const newRef = push(this.listsRef());
    await set(newRef, {
      title,
    } satisfies Omit<GiftList, 'id' | 'gifts'>);
    return newRef.key as string;
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
