import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CreateListModalComponent } from './create-list-modal/create-list-modal';

@Component({
  selector: 'app-home',
  imports: [CreateListModalComponent],
  templateUrl: './home.html',
  styleUrl: './home.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  private readonly router = inject(Router);

  // Modal state
  readonly showModal = signal(false);

  ngOnInit() {
    throw new Error('Method not implemented.');
  }

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
