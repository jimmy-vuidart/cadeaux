import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap, of } from 'rxjs';
import { AuthService } from '@shared/services/auth.service';
import { ListService } from '@shared/services/list.service';
import { ChristmasButtonComponent } from '@shared/ui/christmas-button/christmas-button';
import { output } from '@angular/core';
import type { GiftList } from '@shared/models/gift-list';

@Component({
  selector: 'app-my-lists',
  imports: [RouterLink, ChristmasButtonComponent],
  templateUrl: './my-lists.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyListsComponent {
  private readonly auth = inject(AuthService);
  private readonly listService = inject(ListService);

  readonly create = output<void>();

  readonly lists = toSignal(
    this.auth.user$.pipe(
      switchMap(user => {
        if (!user) return of([]);
        return this.listService.listByOwner(user.uid);
      })
    ),
    { initialValue: [] as GiftList[] }
  );

  createList(): void {
    this.create.emit();
  }
}
