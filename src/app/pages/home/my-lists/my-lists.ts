import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap, of } from 'rxjs';
import { AuthService } from '@shared/services/auth.service';
import { ListService } from '@shared/services/list.service';
import { ChristmasButtonComponent } from '@shared/ui/christmas-button/christmas-button';
import { output } from '@angular/core';
import type { GiftList } from '@shared/models/gift-list';
import { Location } from '@angular/common';
import { ToastService } from '@shared/services/toast.service';

@Component({
  selector: 'app-my-lists',
  imports: [RouterLink, ChristmasButtonComponent],
  templateUrl: './my-lists.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyListsComponent {
  private readonly auth = inject(AuthService);
  private readonly listService = inject(ListService);
  private readonly location = inject(Location);
  private readonly toastService = inject(ToastService);

  readonly create = output<void>();

  readonly lists = toSignal(
    this.auth.user$.pipe(
      switchMap(user => {
        if (!user) return of([]);
        return this.listService.listByOwner(user.uid);
      })
    ),
    { initialValue: [] as GiftList[] }
  );

  createList(): void {
    this.create.emit();
  }

  shareList(event: MouseEvent, listId: string | undefined): void {
    event.preventDefault();
    event.stopPropagation();
    
    if (!listId) {
      console.error('ID de liste non défini');
      return;
    }
    
    // Construire l'URL complète de la liste
    const baseUrl = window.location.origin;
    const listUrl = `${baseUrl}/lists/${listId}`;
    
    // Copier dans le presse-papier
    navigator.clipboard.writeText(listUrl).then(() => {
      this.toastService.success('Lien copié dans le presse-papier !');
      console.log('URL copiée dans le presse-papier:', listUrl);
    }).catch(err => {
      this.toastService.error('Échec de la copie dans le presse-papier');
      console.error('Échec de la copie dans le presse-papier:', err);
    });
  }
}
