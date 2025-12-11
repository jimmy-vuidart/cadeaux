import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-gift-form',
  templateUrl: './add-gift-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, FormsModule],
})
export class AddGiftFormComponent {
  titleControl = input.required<FormControl<string>>();
  urlControl = input.required<FormControl<string | null>>();
  readonly submitting = input(false);
  readonly titleInvalid = input(false);
  readonly error = input<string | null>(null);

  readonly addGift = output<void>();
  readonly cancel = output<void>();
}
