import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

type BtnVariant = 'primary' | 'secondary';
type BtnSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'ui-button',
  standalone: true,
  template: `
    <button
      [attr.type]="type"
      [disabled]="disabled"
      class="btn-base focus-visible:focus-ring active:scale-95"
      [class.btn-primary]="variant === 'primary'"
      [class.btn-secondary]="variant === 'secondary'"
      [class.btn-sm]="size === 'sm'"
      [class.btn-md]="size === 'md'"
      [class.btn-lg]="size === 'lg'"
      (click)="clicked.emit($event)"
    >
      <ng-content />
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  @Input() variant: BtnVariant = 'primary';
  @Input() size: BtnSize = 'md';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled = false;
  @Output() clicked = new EventEmitter<Event>();
}
