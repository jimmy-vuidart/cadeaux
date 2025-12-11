import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getDatabase, provideDatabase } from '@angular/fire/database';

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
    provideAuth(() => getAuth()),
    provideDatabase(() => getDatabase()),
  ],
};
