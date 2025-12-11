import { ChangeDetectionStrategy, Component, inject, isDevMode, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CreateListModalComponent } from './create-list-modal/create-list-modal';
import { ListOfLists } from './debug-lists/debug-lists';
import { ChristmasButtonComponent } from '@shared/ui/christmas-button/christmas-button';

@Component({
  selector: 'app-home',
  imports: [CreateListModalComponent, ListOfLists, ChristmasButtonComponent],
  templateUrl: './home.html',
  styleUrl: './home.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  private readonly router = inject(Router);

  // Modal state
  readonly showModal = signal(false);
  readonly dev = isDevMode();

  onCreateList(): void {
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  async handleCreated(id: string): Promise<void> {
    this.showModal.set(false);
    await this.router.navigate(['/lists', id]);
  }
}
