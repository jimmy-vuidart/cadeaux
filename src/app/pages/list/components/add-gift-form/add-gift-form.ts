import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-gift-form',
  templateUrl: './add-gift-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, FormsModule],
})
export class AddGiftFormComponent {
  titleControl = input.required<FormControl<string>>();
  urlControl = input.required<FormControl<string | null>>();
  submitting = input(false);
  titleInvalid = input(false);
  error = input<string | null>(null);

  addGift = output<void>();
}
