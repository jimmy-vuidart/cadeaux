import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'ui-card',
  standalone: true,
  template: `
    <section
      role="region"
      [attr.aria-label]="ariaLabel || null"
      class="card p-4"
      [class.card-fancy]="fancy"
      [class.card-fancy-hover]="fancy && hoverLift"
      [class.confetti]="fancy && confetti"
    >
      @if (title) {
        <header
          class="mb-3 text-sm font-semibold text-[--color-text-muted]"
          [class.ribbon-underline]="fancy && ribbon"
        >
          {{ title }}
        </header>
      }
      <ng-content />
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent {
  @Input() title?: string;
  @Input() ariaLabel?: string;
  /** Opt-in fancy styling (gradient border, subtle lift, optional confetti/ribbon) */
  @Input() fancy = false;
  /** Enables hover lift on fancy cards (no effect when !fancy) */
  @Input() hoverLift = true;
  /** Adds a playful confetti background inside the card (opt-in) */
  @Input() confetti = false;
  /** Adds a small ribbon underline to the header (when title is set) */
  @Input() ribbon = true;
}
