import { ChangeDetectionStrategy, Component, EventEmitter, input, output } from '@angular/core';

@Component({
  selector: 'app-list-header',
  templateUrl: './list-header.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListHeaderComponent {
  title = input.required<string>();
  sharing = input(false);
  share = output<void>();

  onShareClick(): void {
    if (!this.sharing()) this.share.emit();
  }
}
