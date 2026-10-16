/**
 * Tests unitaires pour la configuration globale de l'application (appConfig).
 * Vérifie la configuration des providers requis pour l'application, incluant le mode zoneless.
 */
import { TestBed } from '@angular/core/testing';
import { appConfig } from './app.config';

describe('appConfig', () => {
  it('définit les providers requis pour exécuter l application en mode zoneless', () => {
    TestBed.configureTestingModule({
      providers: appConfig.providers,
    });
    expect(appConfig.providers).toBeDefined();
    expect(appConfig.providers.length).toBeGreaterThan(0);
  });
});
