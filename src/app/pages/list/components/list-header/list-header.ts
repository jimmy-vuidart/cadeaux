import { ChangeDetectionStrategy, Component, EventEmitter, input, output } from '@angular/core';
import { ChristmasButtonComponent } from '@shared/ui/christmas-button/christmas-button';

@Component({
  selector: 'app-list-header',
  templateUrl: './list-header.html',
  styleUrls: [], // Optional if unused
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ChristmasButtonComponent],
})
export class ListHeaderComponent {
  title = input.required<string>();
  sharing = input(false);
  share = output<void>();

  onShareClick(): void {
    if (!this.sharing()) this.share.emit();
  }
}
