/**
 * Modèle de données représentant une catégorie (groupe de cadeaux) rattachée à une liste.
 */
export interface GiftGroup {
  id: string;
  list: string;
  name: string;
  position?: number;
  created?: string;
  updated?: string;
}
