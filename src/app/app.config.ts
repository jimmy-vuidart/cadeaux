import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { connectAuthEmulator } from 'firebase/auth';
import { connectDatabaseEmulator } from 'firebase/database';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideFirebaseApp(() =>
      initializeApp({
        projectId: 'cadeaux-vuidart',
        appId: '1:145068551344:web:b1293cd98eae3c5fcb9f75',
        storageBucket: 'cadeaux-vuidart.firebasestorage.app',
        apiKey: 'AIzaSyBLs8Vx0j2Yx5bsctWyG2GSAAgzQnmrKaY',
        authDomain: 'cadeaux-vuidart.firebaseapp.com',
        messagingSenderId: '145068551344',
        databaseURL: 'https://cadeaux-vuidart-default-rtdb.europe-west1.firebasedatabase.app',
        // projectNumber: '145068551344',
        // version: '2',
      }),
    ),
    provideAuth(() => {
      const auth = getAuth();
      // Connect to Auth emulator when running locally
      if (typeof window !== 'undefined') {
        const host = window.location.hostname;
        if (host === 'localhost' || host === '127.0.0.1') {
          try {
            connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
          } catch {}
        }
      }
      return auth;
    }),
    provideDatabase(() => {
      const db = getDatabase();
      // Connect to RTDB emulator when running locally
      if (typeof window !== 'undefined') {
        const host = window.location.hostname;
        if (host === 'localhost' || host === '127.0.0.1') {
          try {
            connectDatabaseEmulator(db, '127.0.0.1', 9000);
          } catch {}
        }
      }
      return db;
    }),
  ],
};
