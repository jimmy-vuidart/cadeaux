import { ChangeDetectionStrategy, Component, inject, signal, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap, of, combineLatest, map, startWith } from 'rxjs';
import { AuthService } from '@shared/services/auth.service';
import { UserService } from '@shared/services/user.service';
import { ListService } from '@shared/services/list.service';
import { ToastService } from '@shared/services/toast.service';
import type { VisitedListId } from '@shared/models/visited-list';
import type { GiftList } from '@shared/models/gift-list';

@Component({
  selector: 'app-visited-lists',
  imports: [RouterLink],
  templateUrl: './visited-lists.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VisitedListsComponent implements OnDestroy {
  private readonly auth = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly listService = inject(ListService);
  private readonly toastService = inject(ToastService);

  // Real-time reactive signal
  readonly visitedListsWithDetails = signal<Array<GiftList & { giftCount: number }>>( [] );

  private visitedListsSubscription = this.auth.user$.pipe(
    switchMap(user => {
      if (!user) return of([]);
      
      console.log('Setting up real-time listener for visited lists for user:', user.uid);
      
      // Use the observable that watches for changes in real-time
      return this.userService.getVisitedListIdsObservable(user.uid).pipe(
        switchMap(listIds => {
          console.log('Visited list IDs updated:', listIds);
          if (listIds.length === 0) {
            console.log('No visited lists found');
            return of([]);
          }
          
          // Fetch details for each visited list
          const listDetailsObservables = listIds.map(listId => {
            console.log('Fetching details for list ID:', listId);
            return this.listService.getList(listId).pipe(
              switchMap(list => {
                if (!list) {
                  console.log('List not found for ID:', listId);
                  return of(null);
                }
                
                console.log('List found:', list.title);
                // Fetch gift count for this list
                return this.listService.listGifts(listId).pipe(
                  map(gifts => ({
                    ...list,
                    giftCount: gifts.length
                  }))
                );
              })
            );
          });
          
          return combineLatest(listDetailsObservables).pipe(
            map(lists => {
              const filteredLists = lists.filter(list => list !== null) as Array<GiftList & { giftCount: number }>;
              console.log('Final filtered lists:', filteredLists);
              return filteredLists;
            })
          );
        })
      );
    })
  ).subscribe(lists => {
    console.log('Updating visited lists signal with new data:', lists);
    this.visitedListsWithDetails.set(lists);
  });

  async removeList(event: MouseEvent, listId: string): Promise<void> {
    event.preventDefault();
    event.stopPropagation();
    
    console.log('Removing list from visited lists:', listId);
    
    try {
      const currentUser = this.auth.user();
      if (!currentUser) {
        console.error('User not logged in');
        this.toastService.error('Vous devez être connecté pour supprimer une liste');
        return;
      }
      
      await this.userService.removeVisitedList(currentUser.uid, listId);
      this.toastService.success('Liste supprimée de vos visites récentes');
      
      // No need to manually refresh - real-time updates will handle this
      console.log('List removed - waiting for real-time update');
    } catch (error) {
      console.error('Failed to remove visited list:', error);
      this.toastService.error('Échec de la suppression de la liste');
    }
  }

  ngOnDestroy(): void {
    // Clean up the subscription to prevent memory leaks
    if (this.visitedListsSubscription) {
      this.visitedListsSubscription.unsubscribe();
      console.log('Cleaned up visited lists subscription');
    }
  }
}