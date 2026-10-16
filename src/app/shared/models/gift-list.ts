import type { Gift } from './gift';

/**
 * Modèle de données représentant une liste de cadeaux dans PocketBase.
 */
export interface GiftList {
  id: string;
  title: string;
  slug: string;
  owner?: string | null;
  // Hydratation optionnelle des cadeaux lors du chargement de la liste
  gifts?: Gift[];
  created?: string;
  updated?: string;
}
