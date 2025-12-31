export interface Gift {
  id?: string;
  title: string;
  // ID of the user who bought the gift (if boughtBy exists, the gift is considered bought)
  boughtBy?: string | null;
  // Optional link to the gift product/page
  url?: string;
  // Order index for drag & drop reordering (lower first)
  order?: number | null;
}
