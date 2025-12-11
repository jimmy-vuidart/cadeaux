import { ChangeDetectionStrategy, Component, EventEmitter, input, output } from '@angular/core';
import type { Gift } from '@shared/models/gift';

@Component({
  selector: 'app-gifts-list',
  templateUrl: './gifts-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GiftsListComponent {
  gifts = input.required<Gift[]>();
  fillMode = input(false);
  isUpdating = input<(id: string | undefined | null) => boolean>(() => false);
  toggleFillMode = output<void>();
  toggleBought = output<Gift>();
}
