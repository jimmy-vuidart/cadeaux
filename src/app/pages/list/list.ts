import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { ListService } from '@shared/services/list.service';
import { ReactiveFormsModule, FormControl, Validators, FormsModule } from '@angular/forms';
import { map, switchMap } from 'rxjs';
import type { Gift } from '@shared/models/gift';

@Component({
  selector: 'app-list',
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './list.html',
  styleUrl: './list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListPage {
  private readonly route = inject(ActivatedRoute);
  private readonly lists = inject(ListService);

  // Param id as signal
  readonly id = toSignal(this.route.paramMap.pipe(map((pm) => pm.get('id') as string)), {
    initialValue: '',
  });

  readonly giftTitle = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.maxLength(200)],
  });
  // Derive a primitive signal for invalid state, avoids querying AbstractControl in template repeatedly
  readonly giftTitleInvalid = toSignal(
    this.giftTitle.statusChanges.pipe(map(() => this.giftTitle.invalid)),
    {
      initialValue: this.giftTitle.invalid,
    },
  );
  readonly submitting = signal(false);
  readonly addError = signal<string | null>(null);
  readonly fillMode = signal(false);
  readonly updating = signal(new Set<string>());

  // Data signals
  readonly listData = toSignal(
    this.route.paramMap.pipe(
      map((pm) => pm.get('id') as string),
      switchMap((id) => this.lists.getList(id)),
    ),
    { initialValue: null },
  );

  readonly gifts = toSignal(
    this.route.paramMap.pipe(
      map((pm) => pm.get('id') as string),
      switchMap((id) => this.lists.listGifts(id)),
    ),
    { initialValue: [] as Gift[] },
  );

  get title() {
    return this.listData()?.title ?? 'Liste';
  }

  async addGift(): Promise<void> {
    if (this.giftTitle.invalid) return;
    const id = this.id();
    if (!id) return;
    this.submitting.set(true);
    this.addError.set(null);
    try {
      await this.lists.addGift(id, this.giftTitle.value.trim());
      this.giftTitle.reset('');
    } catch (e) {
      console.error(e);
      this.addError.set('Impossible d’ajouter le cadeau. Réessaie.');
    } finally {
      this.submitting.set(false);
    }
  }

  toggleFillMode(): void {
    this.fillMode.update((v) => !v);
  }

  // Avoid Set.prototype.has in template to keep bindings primitive-only
  isUpdating(id: string | undefined | null): boolean {
    return !!id && this.updating().has(id);
  }

  async toggleBought(gift: Gift): Promise<void> {
    const listId = this.id();
    const giftId = gift.id;
    if (!listId || !giftId) return;
    const set = new Set(this.updating());
    set.add(giftId);
    this.updating.set(set);
    try {
      await this.lists.toggleBought(listId, giftId, !gift.bought);
    } finally {
      const after = new Set(this.updating());
      after.delete(giftId);
      this.updating.set(after);
    }
  }
}
