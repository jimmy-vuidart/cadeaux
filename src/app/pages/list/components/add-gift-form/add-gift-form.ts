import { ChangeDetectionStrategy, Component, ElementRef, input, output, viewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import type { GiftGroup } from '@shared/models/gift-group';

/**
 * Formulaire permettant au propriétaire d'ajouter un cadeau à une liste,
 * avec sélection optionnelle d'une catégorie lorsque la liste en comporte.
 */
@Component({
  selector: 'app-add-gift-form',
  templateUrl: './add-gift-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, FormsModule],
})
export class AddGiftFormComponent {
  titleControl = input.required<FormControl<string>>();
  urlControl = input.required<FormControl<string | null>>();
  groupControl = input<FormControl<string | null> | null>(null);
  groups = input<GiftGroup[]>([]);
  readonly submitting = input(false);
  readonly titleInvalid = input(false);
  readonly error = input<string | null>(null);

  readonly addGift = output<void>();
  readonly cancel = output<void>();

  private readonly titleInput = viewChild<ElementRef<HTMLInputElement>>('titleInput');

  /**
   * Place le focus sur le champ titre et fait défiler le formulaire dans la fenêtre visible.
   */
  focusTitle(): void {
    const el = this.titleInput()?.nativeElement;
    if (!el) return;
    el.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
    el.focus();
  }
}
