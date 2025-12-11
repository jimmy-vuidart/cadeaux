import { ChangeDetectionStrategy, Directive, HostBinding, Input } from '@angular/core';

type InputSize = 'sm' | 'md' | 'lg';

@Directive({
  selector: 'input[uiInput], textarea[uiInput]'
})
export class UiInputDirective {
  @Input() size: InputSize = 'md';
  @Input() invalid = false;

  @HostBinding('class') get klass() {
    const base = ['input-base', 'focus-visible:focus-ring'];
    base.push(this.size === 'sm' ? 'text-sm' : this.size === 'lg' ? 'text-base' : 'text-[0.95rem]');
    if (this.invalid) base.push('input-invalid');
    return base.join(' ');
  }
}
