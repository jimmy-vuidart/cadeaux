import { provideZonelessChangeDetection } from '@angular/core';

/**
 * Configuration globale des providers pour les tests unitaires Angular.
 * Active le mode zoneless par défaut pour l'ensemble des suites de tests.
 */
export default [provideZonelessChangeDetection()];
