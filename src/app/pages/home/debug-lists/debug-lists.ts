import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { DOCUMENT, NgIf } from '@angular/common';
import { ListService } from '@shared/services/list.service';
import type { GiftList } from '@shared/models/gift-list';

@Component({
  selector: 'app-debug-lists',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './debug-lists.html',
  styleUrl: './debug-lists.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DebugListsComponent {
  private readonly listsSvc = inject(ListService);
  private readonly doc = inject(DOCUMENT);

  readonly baseUrl = this.doc?.location?.origin ?? '';
  readonly lists = toSignal(this.listsSvc.listAll(), { initialValue: [] as GiftList[] });
}
