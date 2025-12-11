import { ChangeDetectionStrategy, Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

type ButtonVariant = 'primary' | 'secondary' | 'glass';
type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
    selector: 'app-christmas-button',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './christmas-button.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChristmasButtonComponent {
    variant = input<ButtonVariant>('primary');
    size = input<ButtonSize>('md');
    disabled = input(false);
    busy = input(false);
    pressed = input(false); // For aria-pressed
    icon = input<string | null>(null);
    customClass = input<string>(''); // Allow appending custom classes

    readonly computedClass = computed(() => {
        const v = this.variant();
        const s = this.size();

        let base = 'rounded-md transition-all duration-300 font-bold flex items-center justify-center gap-2 relative overflow-hidden';

        // Variant styles
        if (v === 'primary') {
            base += ' btn-primary text-white';
        } else if (v === 'secondary') {
            base += ' btn-secondary';
        } else if (v === 'glass') {
            base += ' bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10 shadow-lg';
        }

        // Size styles
        if (s === 'sm') {
            base += ' px-3 py-1.5 text-sm';
        } else if (s === 'md') {
            base += ' px-4 py-2 text-base';
        } else if (s === 'lg') {
            base += ' px-6 py-3 text-lg';
        }

        // Append custom classes
        if (this.customClass()) {
            base += ` ${this.customClass()}`;
        }

        return base;
    });
}
