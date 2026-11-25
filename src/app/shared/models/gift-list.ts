import type { Gift } from './gift';
import type { GiftGroup } from './gift-group';

/**
 * Modèle de données représentant une liste de cadeaux dans PocketBase.
 */
export interface GiftList {
  id: string;
  title: string;
  slug: string;
  owner?: string | null;
  // Hydratation optionnelle des catégories et cadeaux lors du chargement de la liste
  groups?: GiftGroup[];
  gifts?: Gift[];
  created?: string;
  updated?: string;
}
