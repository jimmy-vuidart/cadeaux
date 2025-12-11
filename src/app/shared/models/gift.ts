export interface Gift {
  id?: string;
  title: string;
  // When someone marks it as bought in "fill" mode
  bought?: boolean;
  // Optional link to the gift product/page
  url?: string;
  // Order index for drag & drop reordering (lower first)
  order?: number | null;
}
