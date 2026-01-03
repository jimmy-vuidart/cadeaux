import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { ListService } from '@shared/services/list.service';
import { UserService } from '@shared/services/user.service';
import { AuthService } from '@shared/services/auth.service';
import { ToastService } from '@shared/services/toast.service';
import { ReactiveFormsModule, FormControl, Validators, FormsModule } from '@angular/forms';
import { map, switchMap, combineLatest, Observable, of } from 'rxjs';
import type { Gift } from '@shared/models/gift';
import type { UserInfo } from '@shared/models/user-info';
import { ListHeaderComponent } from './components/list-header/list-header';
import { GiftsListComponent } from './components/gifts-list/gifts-list';
import { AddGiftFormComponent } from './components/add-gift-form/add-gift-form';
import { ConfirmModalComponent } from './components/confirm-modal/confirm-modal';
import { ChristmasButtonComponent } from '@shared/ui/christmas-button/christmas-button';

@Component({
  selector: 'app-list',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    ListHeaderComponent,
    GiftsListComponent,
    AddGiftFormComponent,
    ConfirmModalComponent,
    ChristmasButtonComponent
  ],
  templateUrl: './list.html',
  styleUrl: './list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListPage {
  private readonly route = inject(ActivatedRoute);
  private readonly lists = inject(ListService);
  private readonly userService = inject(UserService);
  private readonly auth = inject(AuthService);
  private readonly toastService = inject(ToastService);
  private shareTimeout: any;
  private shareClearTimeout: any;

  // Param id as signal
  readonly id = toSignal(this.route.paramMap.pipe(map((pm) => pm.get('id') as string)), {
    initialValue: '',
  });

  readonly giftTitle = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.maxLength(200)],
  });
  readonly giftUrl = new FormControl<string | null>('', {
    validators: [Validators.maxLength(500)],
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
  // Inline edit state
  readonly editingGiftId = signal<string | null>(null);
  // Deleting confirmation state
  readonly deletingGiftId = signal<string | null>(null);
  readonly editTitle = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.maxLength(200)],
  });
  readonly editUrl = new FormControl<string | null>('', {
    validators: [Validators.maxLength(500)],
  });
  readonly editSubmitting = signal(false);
  readonly editError = signal<string | null>(null);
  readonly editTitleInvalid = toSignal(
    this.editTitle.statusChanges.pipe(map(() => this.editTitle.invalid)),
    { initialValue: this.editTitle.invalid },
  );
  readonly sharing = signal(false);
  readonly confirmFillOpen = signal(false);
  readonly showAddForm = signal(false);
  private lastFocusedEl: HTMLElement | null = null;

  toggleAddForm(): void {
    this.showAddForm.update((v) => !v);
  }

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
      // stable sort: first by defined order ascending, then by title, then by id
      map((arr) =>
        [...arr].sort((a, b) => {
          const ao = a.order ?? Number.POSITIVE_INFINITY;
          const bo = b.order ?? Number.POSITIVE_INFINITY;
          if (ao !== bo) return ao - bo;
          const at = (a.title || '').toLowerCase();
          const bt = (b.title || '').toLowerCase();
          if (at !== bt) return at < bt ? -1 : 1;
          const ai = a.id || '';
          const bi = b.id || '';
          return ai < bi ? -1 : ai > bi ? 1 : 0;
        }),
      ),
    ),
    { initialValue: [] as Gift[] },
  );

  // User information for display names - simplified approach
  // We'll use a signal that combines current user info with a simple mapping
  readonly users = signal<Record<string, UserInfo>>({});

  constructor() {
    // Load current user info when available
    this.loadCurrentUserInfo();
  }

  private loadCurrentUserInfo(): void {
    this.auth.user$.subscribe(user => {
      if (user) {
        const userInfo: UserInfo = {
          uid: user.uid,
          displayName: user.displayName,
          email: user.email
        };
        this.users.update(current => ({ ...current, [user.uid]: userInfo }));
      }
    });
  }

  get title() {
    return this.listData()?.title ?? 'Liste';
  }

  // Check if current user is the owner of the list
  isCurrentUserOwner(): boolean {
    const list = this.listData();
    const currentUser = this.auth.user();
    
    if (!list || !currentUser) {
      return false;
    }
    
    return list.ownerId === currentUser.uid;
  }

  async addGift(): Promise<void> {
    if (this.giftTitle.invalid) return;
    const id = this.id();
    if (!id) return;
    this.submitting.set(true);
    this.addError.set(null);
    try {
      const rawUrl = (this.giftUrl.value ?? '').trim();
      const url = rawUrl.length > 0 ? rawUrl : undefined;
      await this.lists.addGift(id, this.giftTitle.value.trim(), url);
      this.giftTitle.reset('');
      this.giftUrl.reset('');
    } catch (e) {
      console.error(e);
      this.addError.set('Impossible d’ajouter le cadeau. Réessaie.');
    } finally {
      this.submitting.set(false);
    }
  }

  toggleFillMode(): void {
    const currentlyOn = this.fillMode();
    if (currentlyOn) {
      // Turning off does not require confirmation
      this.fillMode.set(false);
      return;
    }
    // Enabling: open custom confirmation modal
    this.lastFocusedEl = (document.activeElement as HTMLElement) ?? null;
    this.confirmFillOpen.set(true);
  }

  confirmEnableFillMode(): void {
    this.fillMode.set(true);
    this.confirmFillOpen.set(false);
    this.restoreFocus();
  }

  cancelEnableFillMode(): void {
    this.confirmFillOpen.set(false);
    this.restoreFocus();
  }

  private restoreFocus(): void {
    try {
      this.lastFocusedEl?.focus();
    } catch { }
    this.lastFocusedEl = null;
  }

  // Avoid Set.prototype.has in template to keep bindings primitive-only
  isUpdating(id: string | undefined | null): boolean {
    return !!id && this.updating().has(id);
  }

  // Provide a stable function reference for child input binding
  readonly isUpdatingFn = (id: string | undefined | null) => this.isUpdating(id);

  async toggleBought(gift: Gift): Promise<void> {
    const listId = this.id();
    const giftId = gift.id;
    if (!listId || !giftId) return;
    const set = new Set(this.updating());
    set.add(giftId);
    this.updating.set(set);
    try {
      // Use boughtBy to determine if gift is bought (boughtBy exists and is not null)
      const isBought = !!gift.boughtBy;
      await this.lists.toggleBought(listId, giftId, !isBought);
    } finally {
      const after = new Set(this.updating());
      after.delete(giftId);
      this.updating.set(after);
    }
  }

  startEditGift(gift: Gift): void {
    const id = gift.id || null;
    if (!id) return;
    this.editingGiftId.set(id);
    this.editError.set(null);
    this.editSubmitting.set(false);
    this.editTitle.reset(gift.title ?? '');
    this.editUrl.reset(gift.url ?? '');
  }

  cancelEdit(): void {
    this.editingGiftId.set(null);
    this.editSubmitting.set(false);
    this.editError.set(null);
    this.editTitle.reset('');
    this.editUrl.reset('');
  }

  async submitEdit(): Promise<void> {
    const listId = this.id();
    const giftId = this.editingGiftId();
    if (!listId || !giftId) return;
    if (this.editTitle.invalid) return;
    this.editSubmitting.set(true);
    this.editError.set(null);
    const set = new Set(this.updating());
    set.add(giftId);
    this.updating.set(set);
    try {
      const title = this.editTitle.value.trim();
      const rawUrl = (this.editUrl.value ?? '').trim();
      await this.lists.updateGift(listId, giftId, { title, url: rawUrl || null });
      this.cancelEdit();
    } catch (e) {
      console.error(e);
      this.editError.set('Impossible de modifier le cadeau. Réessaie.');
    } finally {
      this.editSubmitting.set(false);
      const after = new Set(this.updating());
      after.delete(giftId);
      this.updating.set(after);
    }
  }

  // Delete flow
  startDeleteGift(gift: Gift): void {
    const id = gift.id || null;
    if (!id) return;
    this.deletingGiftId.set(id);
  }

  cancelDeleteGift(): void {
    this.deletingGiftId.set(null);
  }

  async confirmDeleteGift(): Promise<void> {
    const listId = this.id();
    const giftId = this.deletingGiftId();
    if (!listId || !giftId) return;
    const set = new Set(this.updating());
    set.add(giftId);
    this.updating.set(set);
    try {
      await this.lists.deleteGift(listId, giftId);
    } catch (e) {
      console.error('Failed to delete gift', e);
    } finally {
      this.deletingGiftId.set(null);
      const after = new Set(this.updating());
      after.delete(giftId);
      this.updating.set(after);
    }
  }

  async onReorderMove(ev: { fromIndex: number; toIndex: number }): Promise<void> {
    const listId = this.id();
    if (!listId) return;
    const current = this.gifts();
    if (!current?.length) return;
    const arr = [...current];
    const [moved] = arr.splice(ev.fromIndex, 1);
    arr.splice(ev.toIndex, 0, moved);
    const ids = arr.map((g) => g.id!).filter(Boolean);
    try {
      await this.lists.reorderGifts(listId, ids);
    } catch (e) {
      console.error('Failed to reorder gifts', e);
    }
  }



  async share(): Promise<void> {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (!url) return;
    this.sharing.set(true);
    try {
      const nav = (typeof navigator !== 'undefined' ? navigator : undefined) as any;
      if (nav && typeof nav.share === 'function') {
        // Try native share on supported devices
        await nav.share({ title: this.title, url });
        // Some platforms don't provide a success signal; we still display a small hint
        this.toastService.success('Options de partage ouvertes.');
      } else {
        await this.copyToClipboard(url);
        this.toastService.success('Lien copié dans le presse-papiers.');
      }
    } catch (err) {
      // Fallback to clipboard on share failure
      try {
        await this.copyToClipboard(url);
        this.toastService.success('Lien copié dans le presse-papiers.');
      } catch {
        this.toastService.success("Impossible de partager. Copie le lien depuis la barre d'adresse.");
      }
    } finally {
      this.sharing.set(false);
    }
  }

  private async copyToClipboard(text: string): Promise<void> {
    const nav: any = typeof navigator !== 'undefined' ? navigator : undefined;
    if (nav?.clipboard?.writeText) {
      await nav.clipboard.writeText(text);
      return;
    }
    // Fallback using a temporary textarea (works in most desktop browsers)
    if (typeof document !== 'undefined') {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      // Avoid scrolling to bottom
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const ok = document.execCommand ? document.execCommand('copy') : false;
      document.body.removeChild(textarea);
      if (!ok) {
        throw new Error('Copy failed');
      }
      return;
    }
    throw new Error('Clipboard unavailable');
  }
}
