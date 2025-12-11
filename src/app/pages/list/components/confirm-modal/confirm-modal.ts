import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnChanges,
  SimpleChanges,
  ViewChild,
  input,
  output,
} from '@angular/core';

@Component({
  selector: 'app-confirm-modal',
  templateUrl: './confirm-modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmModalComponent implements OnChanges {
  open = input(false);
  title = input<string>('Confirmation');
  message = input<string>('');
  confirmLabel = input<string>('Confirmer');
  cancelLabel = input<string>('Annuler');

  confirm = output<void>();
  cancel = output<void>();
  close = output<void>();

  @ViewChild('dialogEl') dialogEl?: ElementRef<HTMLDivElement>;
  @ViewChild('confirmBtn') confirmBtn?: ElementRef<HTMLButtonElement>;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open'] && this.open()) {
      // Move focus inside the dialog when it opens
      queueMicrotask(() => {
        this.dialogEl?.nativeElement.focus();
        this.confirmBtn?.nativeElement.focus();
      });
    }
  }

  onBackdropClick(): void {
    this.close.emit();
  }

  onDialogClick(event: MouseEvent): void {
    // Prevent backdrop click when clicking inside the dialog
    event.stopPropagation();
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.close.emit();
    }
  }
}
