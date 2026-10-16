import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideUx } from './ux/ux.config';

/**
 * Configuration principale de l'application Angular.
 * Déclare la détection de changement zoneless, le routage, le système UX et les gestionnaires d'erreurs globaux.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideUx({ theme: 'auto', density: 'comfortable', motion: 'auto' }),
  ],
};
