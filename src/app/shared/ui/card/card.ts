import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'ui-card',
  standalone: true,
  template: `
    <section role="region" [attr.aria-label]="ariaLabel || null" class="card p-4">
      @if (title) {
        <header class="mb-2 text-sm font-semibold text-[--color-text-muted]">{{ title }}</header>
      }
      <ng-content />
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent {
  @Input() title?: string;
  @Input() ariaLabel?: string;
}
