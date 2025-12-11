import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { ListService } from '@shared/services/list.service';
import { ReactiveFormsModule, FormControl, Validators, FormsModule } from '@angular/forms';
import { map, switchMap } from 'rxjs';
import type { Gift } from '@shared/models/gift';
import { ListHeaderComponent } from './components/list-header/list-header';
import { GiftsListComponent } from './components/gifts-list/gifts-list';
import { AddGiftFormComponent } from './components/add-gift-form/add-gift-form';
import { ShareToastComponent } from './components/share-toast/share-toast';
import { ConfirmModalComponent } from './components/confirm-modal/confirm-modal';

@Component({
  selector: 'app-list',
  imports: [ReactiveFormsModule, FormsModule, ListHeaderComponent, GiftsListComponent, AddGiftFormComponent, ShareToastComponent, ConfirmModalComponent],
  templateUrl: './list.html',
  styleUrl: './list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListPage {
  private readonly route = inject(ActivatedRoute);
  private readonly lists = inject(ListService);
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
  readonly sharing = signal(false);
  readonly shareInfo = signal<string | null>(null);
  readonly toastVisible = signal(false);
  readonly confirmFillOpen = signal(false);
  private lastFocusedEl: HTMLElement | null = null;

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
    } catch {}
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
      await this.lists.toggleBought(listId, giftId, !gift.bought);
    } finally {
      const after = new Set(this.updating());
      after.delete(giftId);
      this.updating.set(after);
    }
  }

  private clearShareInfoSoon(): void {
    if (this.shareTimeout) clearTimeout(this.shareTimeout);
    if (this.shareClearTimeout) clearTimeout(this.shareClearTimeout);

    // After a few seconds, start fade-out, then remove the message once the
    // CSS transition is expected to be finished.
    this.shareTimeout = setTimeout(() => {
      this.toastVisible.set(false);
      // Allow transition to complete before clearing the content to avoid jumps
      this.shareClearTimeout = setTimeout(() => this.shareInfo.set(null), 250);
    }, 3500);
  }

  async share(): Promise<void> {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (!url) return;
    this.sharing.set(true);
    this.shareInfo.set(null);
    try {
      const nav = (typeof navigator !== 'undefined' ? navigator : undefined) as any;
      if (nav && typeof nav.share === 'function') {
        // Try native share on supported devices
        await nav.share({ title: this.title, url });
        // Some platforms don't provide a success signal; we still display a small hint
        this.shareInfo.set('Options de partage ouvertes.');
        this.showToastAnimated();
      } else {
        await this.copyToClipboard(url);
        this.shareInfo.set('Lien copié dans le presse-papiers.');
        this.showToastAnimated();
      }
    } catch (err) {
      // Fallback to clipboard on share failure
      try {
        await this.copyToClipboard(url);
        this.shareInfo.set('Lien copié dans le presse-papiers.');
        this.showToastAnimated();
      } catch {
        this.shareInfo.set("Impossible de partager. Copie le lien depuis la barre d'adresse.");
        this.showToastAnimated();
      }
    } finally {
      this.sharing.set(false);
      this.clearShareInfoSoon();
    }
  }

  private showToastAnimated(): void {
    // Start hidden so that on first render the transition can animate to visible
    this.toastVisible.set(false);
    // Flip to visible on the next macrotask to trigger CSS transition
    setTimeout(() => this.toastVisible.set(true), 0);
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
