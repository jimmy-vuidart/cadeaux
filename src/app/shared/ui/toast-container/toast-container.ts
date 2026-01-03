import { Component, inject } from '@angular/core';
import { ToastService } from '@shared/services/toast.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast-container.html',
})
export class ToastContainerComponent {
  readonly toastService = inject(ToastService);
  readonly toasts = this.toastService.currentToasts;

  getToastClasses(type: string): string {
    const baseClasses = 'p-4 rounded-lg shadow-lg text-white flex items-center gap-2';
    
    switch (type) {
      case 'success':
        return `${baseClasses} bg-green-500`;
      case 'error':
        return `${baseClasses} bg-red-500`;
      case 'warning':
        return `${baseClasses} bg-yellow-500`;
      case 'info':
      default:
        return `${baseClasses} bg-blue-500`;
    }
  }

  getToastIcon(type: string): string {
    switch (type) {
      case 'success':
        return 'check_circle';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'share':
        return 'share';
      case 'info':
      default:
        return 'info';
    }
  }
}