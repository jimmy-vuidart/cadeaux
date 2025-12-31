import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormControl, FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import type { Gift } from '@shared/models/gift';
import type { UserInfo } from '@shared/models/user-info';
import { ChristmasButtonComponent } from '@shared/ui/christmas-button/christmas-button';

@Component({
  selector: 'app-gifts-list',
  templateUrl: './gifts-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, FormsModule, ChristmasButtonComponent],
})
export class GiftsListComponent {
  gifts = input.required<Gift[]>();
  fillMode = input(false);
  isUpdating = input<(id: string | undefined | null) => boolean>(() => false);
  // Inline edit inputs
  editingId = input<string | null>(null);
  // Deleting confirmation state (managed by parent)
  deletingId = input<string | null>(null);
  editTitleControl = input<FormControl<string> | null>(null);
  editUrlControl = input<FormControl<string | null> | null>(null);
  editSubmitting = input(false);
  editTitleInvalid = input(false);
  editError = input<string | null>(null);
  // User information mapping
  users = input<Record<string, UserInfo>>({});
  toggleFillMode = output<void>();
  toggleBought = output<Gift>();
  // Start inline edit for a gift
  startEdit = output<Gift>();
  cancelEdit = output<void>();
  submitEdit = output<void>();
  // Delete flow outputs
  startDelete = output<Gift>();
  cancelDelete = output<void>();
  confirmDelete = output<void>();

  // Reorder with buttons
  reorderMove = output<{ fromIndex: number; toIndex: number }>();

  getUserDisplayName(userId: string | undefined | null): string {
    if (!userId) return 'quelqu\'un';
    const user = this.users()[userId];
    return user?.displayName || user?.email || userId || 'quelqu\'un';
  }

  moveUp(index: number): void {
    if (this.fillMode() || this.editingId() || index <= 0) return;
    this.reorderMove.emit({ fromIndex: index, toIndex: index - 1 });
  }

  moveDown(index: number): void {
    if (this.fillMode() || this.editingId()) return;
    const giftsLength = this.gifts().length;
    if (index >= giftsLength - 1) return;
    this.reorderMove.emit({ fromIndex: index, toIndex: index + 1 });
  }
}
