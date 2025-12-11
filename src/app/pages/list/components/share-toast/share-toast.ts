import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-share-toast',
  templateUrl: './share-toast.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShareToastComponent {
  message = input<string | null>(null);
  visible = input(false);
}
