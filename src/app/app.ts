import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastService } from '@shared/services/toast.service';
import { CommonModule } from '@angular/common';
import { ToastContainerComponent } from '@shared/ui/toast-container/toast-container';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, ToastContainerComponent],
  template: `
    <router-outlet/>
    <app-toast-container/>
  `,
})
export class App {
  readonly toastService = inject(ToastService);
}
