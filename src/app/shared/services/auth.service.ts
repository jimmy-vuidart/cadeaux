import { Injectable, inject, signal } from '@angular/core';
import { Auth, GoogleAuthProvider, User, authState, signInWithPopup, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from '@angular/fire/auth';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly auth = inject(Auth);

  readonly user$ = authState(this.auth);
  readonly user = toSignal(this.user$, { initialValue: null });
  readonly isLoggedIn = toSignal(this.user$.pipe(map(u => !!u)), { initialValue: false });

  async loginWithGoogle(): Promise<void> {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(this.auth, provider);
  }

  async loginWithEmail(email: string, pass: string): Promise<void> {
    await signInWithEmailAndPassword(this.auth, email, pass);
  }

  async registerWithEmail(email: string, pass: string, displayName: string): Promise<void> {
    const credential = await createUserWithEmailAndPassword(this.auth, email, pass);
    await updateProfile(credential.user, { displayName });
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
  }
}
