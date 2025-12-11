import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormControl, FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import type { Gift } from '@shared/models/gift';

@Component({
  selector: 'app-gifts-list',
  templateUrl: './gifts-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, FormsModule],
})
export class GiftsListComponent {
  gifts = input.required<Gift[]>();
  fillMode = input(false);
  isUpdating = input<(id: string | undefined | null) => boolean>(() => false);
  // Inline edit inputs
  editingId = input<string | null>(null);
  editTitleControl = input<FormControl<string> | null>(null);
  editUrlControl = input<FormControl<string | null> | null>(null);
  editSubmitting = input(false);
  editTitleInvalid = input(false);
  editError = input<string | null>(null);
  toggleFillMode = output<void>();
  toggleBought = output<Gift>();
  // Start inline edit for a gift
  startEdit = output<Gift>();
  cancelEdit = output<void>();
  submitEdit = output<void>();

  // Drag & drop reorder
  reorderMove = output<{ fromIndex: number; toIndex: number }>();
  private dragIndex: number | null = null;
  private dragOverIndex: number | null = null;

  // Expose simple guards for template without leaking private fields
  isDragging(idx: number): boolean {
    return this.dragIndex === idx;
  }

  isDropTarget(idx: number): boolean {
    return this.dragOverIndex === idx && this.dragIndex !== idx;
  }

  onDragStart(index: number, evt?: DragEvent): void {
    if (this.fillMode() || this.editingId()) return;
    this.dragIndex = index;
    try {
      // Some browsers require setting data to start a drag
      evt?.dataTransfer?.setData('text/plain', String(index));
      if (evt?.dataTransfer) evt.dataTransfer.effectAllowed = 'move';
    } catch {}
  }

  onDragEnd(): void {
    this.dragIndex = null;
    this.dragOverIndex = null;
  }

  onDragOver(evt: DragEvent, targetIndex?: number): void {
    // Allow drop
    evt.preventDefault();
    if (typeof targetIndex === 'number') this.dragOverIndex = targetIndex;
  }

  onDrop(targetIndex: number): void {
    if (this.fillMode() || this.editingId()) return;
    if (this.dragIndex === null || targetIndex === this.dragIndex) return;
    this.reorderMove.emit({ fromIndex: this.dragIndex, toIndex: targetIndex });
    this.dragIndex = null;
    this.dragOverIndex = null;
  }
}
