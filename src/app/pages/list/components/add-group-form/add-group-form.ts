import { ChangeDetectionStrategy, Component, ElementRef, input, output, viewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';

/**
 * Formulaire permettant au propriétaire de créer une nouvelle catégorie de cadeaux dans sa liste.
 */
@Component({
  selector: 'app-add-group-form',
  templateUrl: './add-group-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, FormsModule],
})
export class AddGroupFormComponent {
  nameControl = input.required<FormControl<string>>();
  readonly submitting = input(false);
  readonly nameInvalid = input(false);
  readonly error = input<string | null>(null);

  readonly addGroup = output<void>();
  readonly cancel = output<void>();

  private readonly nameInput = viewChild<ElementRef<HTMLInputElement>>('nameInput');

  /**
   * Place le focus sur le champ nom de la catégorie.
   */
  focusName(): void {
    const el = this.nameInput()?.nativeElement;
    if (!el) return;
    el.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
    el.focus();
  }
}
