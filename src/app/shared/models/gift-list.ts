import type { Gift } from './gift';

export interface GiftList {
  id?: string;
  title: string;
  // Gifts are stored in a subcollection; this is only for runtime hydration when needed
  gifts?: Gift[];
}
