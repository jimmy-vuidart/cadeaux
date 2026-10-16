/**
 * Modèle de données représentant le profil ou la session d'un utilisateur.
 * Contient l'identifiant standard PocketBase (id) et des alias rétrocompatibles (uid, photoURL).
 */
export interface UserInfo {
  id: string;
  uid: string;
  displayName: string | null;
  email: string | null;
  avatar?: string | null;
  photoURL?: string | null;
}