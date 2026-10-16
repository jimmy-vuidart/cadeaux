/**
 * Modèle de données représentant un cadeau dans PocketBase.
 * Supporte le champ canonique position ainsi que l'alias rétrocompatible order.
 */
export interface Gift {
  id: string;
  list: string;
  title: string;
  url?: string | null;
  position?: number;
  order?: number | null;
  bought: boolean;
  buyer?: string | null;
  buyerName?: string | null;
  boughtBy?: string | null;
  created?: string;
  updated?: string;
}
