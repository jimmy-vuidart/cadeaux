import { inject, Injectable } from '@angular/core';
import { Auth, getAuth, User } from '@angular/fire/auth';
import { Database, objectVal, push, ref, set, update, query, orderByChild, equalTo, listVal, get, remove } from '@angular/fire/database';
import { Observable, from, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import type { UserInfo } from '../models/user-info';
import type { VisitedListId } from '../models/visited-list';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly auth = inject(Auth);
  private readonly db = inject(Database);

  async getUserInfo(uid: string): Promise<UserInfo | null> {
    try {
      const auth = getAuth();
      // For the current user, we can get info directly
      if (uid === auth.currentUser?.uid) {
        const user = auth.currentUser;
        return user ? this.userToUserInfo(user) : null;
      }
      
      // For other users, we need to use the Firebase Admin SDK or
      // fetch from the database. Since we're not using the database anymore,
      // we'll return null for other users in this simplified version.
      // In a real app, you might want to cache user info or use a different approach.
      return null;
    } catch (error) {
      console.error('Error getting user info:', error);
      return null;
    }
  }

  async getUsersInfo(uids: string[]): Promise<Record<string, UserInfo>> {
    if (uids.length === 0) {
      return {};
    }
    
    const results: Record<string, UserInfo> = {};
    
    // Get info for each user
    for (const uid of uids) {
      const userInfo = await this.getUserInfo(uid);
      if (userInfo) {
        results[uid] = userInfo;
      }
    }
    
    return results;
  }

  private userToUserInfo(user: User): UserInfo {
    return {
      uid: user.uid,
      displayName: user.displayName,
      email: user.email
    };
  }

  private visitedListsRef(userId: string) {
    return ref(this.db, `users/${userId}/visitedLists`);
  }

  async recordListVisit(userId: string, listId: string): Promise<void> {
    if (!userId || !listId) {
      console.error('User ID and List ID are required to record a visit');
      return;
    }

    console.log('Recording visit in UserService - User:', userId, 'List:', listId);
    // Store just the list ID as a string value
    await set(ref(this.db, `users/${userId}/visitedLists/${listId}`), true);
    console.log('Visit recorded in database');
  }

  async getVisitedListIds(userId: string): Promise<VisitedListId[]> {
    if (!userId) {
      return [];
    }
    
    console.log('Fetching visited list IDs for user:', userId);
    
    try {
      const snapshot = await get(this.visitedListsRef(userId));
      if (!snapshot.exists()) {
        console.log('No visited lists found for user');
        return [];
      }
      
      const visitedLists = snapshot.val();
      console.log('Raw visited lists data:', visitedLists);
      
      // Ensure visitedLists is an object and extract keys
      if (typeof visitedLists === 'object' && visitedLists !== null) {
        const listIds = Object.keys(visitedLists);
        console.log('Extracted list IDs:', listIds);
        return listIds;
      } else {
        console.log('Visited lists data is not in expected format:', typeof visitedLists);
        return [];
      }
    } catch (error) {
      console.error('Error fetching visited list IDs:', error);
      return [];
    }
  }

  getVisitedListIdsObservable(userId: string): Observable<VisitedListId[]> {
    if (!userId) {
      return of([]);
    }
    
    // Convert the promise to an observable
    return from(this.getVisitedListIds(userId));
  }

  getRecentVisitedListIds(userId: string, limit: number = 5): Observable<VisitedListId[]> {
    return this.getVisitedListIdsObservable(userId).pipe(
      map(ids => ids.slice(0, limit)) // Simple approach: take first N IDs
    );
  }

  async removeVisitedList(userId: string, listId: string): Promise<void> {
    if (!userId || !listId) {
      console.error('User ID and List ID are required to remove a visit');
      return;
    }

    console.log('Removing visited list - User:', userId, 'List:', listId);
    
    try {
      await remove(ref(this.db, `users/${userId}/visitedLists/${listId}`));
      console.log('Visited list removed successfully');
    } catch (error) {
      console.error('Error removing visited list:', error);
      throw error;
    }
  }
}