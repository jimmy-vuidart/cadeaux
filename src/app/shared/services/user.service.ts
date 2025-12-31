import { inject, Injectable } from '@angular/core';
import { Auth, getAuth, User } from '@angular/fire/auth';
import { Observable, from, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import type { UserInfo } from '../models/user-info';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly auth = inject(Auth);

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
}