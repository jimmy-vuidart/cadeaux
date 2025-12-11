import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormControl, Validators, FormsModule } from '@angular/forms';
import { output } from '@angular/core';
import { ListService } from '@shared/services/list.service';

@Component({
  selector: 'app-create-list-modal',
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './create-list-modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateListModalComponent {
  private readonly lists = inject(ListService);

  // Outputs
  readonly cancel = output<void>();
  readonly created = output<string>();

  // Local state
  readonly creating = signal(false);
  readonly error = signal<string | null>(null);
  readonly titleCtrl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.maxLength(120)],
  });

  onCancel(): void {
    if (this.creating()) return;
    this.cancel.emit();
  }

  async submit(): Promise<void> {
    if (this.titleCtrl.invalid) return;
    this.creating.set(true);
    this.error.set(null);
    try {
      const id = await this.lists.createList(this.titleCtrl.value.trim());
      this.created.emit(id);
    } catch {
      this.error.set('La création a échoué. Réessaie.');
    } finally {
      this.creating.set(false);
    }
  }
}
