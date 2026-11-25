import { ChangeDetectionStrategy, Component, computed, inject, signal, viewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { ListService, type ListSnapshot } from '@shared/services/list.service';
import { AuthService } from '@shared/services/auth.service';
import { ToastService } from '@shared/services/toast.service';
import { ReactiveFormsModule, FormControl, Validators, FormsModule } from '@angular/forms';
import { map, switchMap, tap } from 'rxjs';
import type { Gift } from '@shared/models/gift';
import type { GiftGroup } from '@shared/models/gift-group';
import type { UserInfo } from '@shared/models/user-info';
import { ListHeaderComponent } from './components/list-header/list-header';
import { GiftsListComponent } from './components/gifts-list/gifts-list';
import { AddGiftFormComponent } from './components/add-gift-form/add-gift-form';
import { AddGroupFormComponent } from './components/add-group-form/add-group-form';
import { ConfirmModalComponent } from './components/confirm-modal/confirm-modal';
import { ChristmasButtonComponent } from '@shared/ui/christmas-button/christmas-button';

/**
 * Trie de façon stable les cadeaux par position croissante (avec repli sur order, titre puis identifiant).
 */
export function sortGifts(gifts: Gift[]): Gift[] {
  return [...gifts].sort((a, b) => {
    const ao = a.position ?? a.order ?? Number.POSITIVE_INFINITY;
    const bo = b.position ?? b.order ?? Number.POSITIVE_INFINITY;
    if (ao !== bo) return ao - bo;
    const at = (a.title || '').toLowerCase();
    const bt = (b.title || '').toLowerCase();
    if (at !== bt) return at < bt ? -1 : 1;
    const ai = a.id || '';
    const bi = b.id || '';
    return ai < bi ? -1 : ai > bi ? 1 : 0;
  });
}

/**
 * Trie de façon stable les catégories par position croissante (avec repli sur nom puis identifiant).
 */
export function sortGroups(groups: GiftGroup[]): GiftGroup[] {
  return [...groups].sort((a, b) => {
    const ao = a.position ?? Number.POSITIVE_INFINITY;
    const bo = b.position ?? Number.POSITIVE_INFINITY;
    if (ao !== bo) return ao - bo;
    const an = (a.name || '').toLowerCase();
    const bn = (b.name || '').toLowerCase();
    if (an !== bn) return an < bn ? -1 : 1;
    const ai = a.id || '';
    const bi = b.id || '';
    return ai < bi ? -1 : ai > bi ? 1 : 0;
  });
}

/**
 * Composant de page affichant le détail d'une liste de cadeaux et ses catégories pliables.
 * Permet la consultation publique, le partage du lien, la gestion des cadeaux et catégories par le propriétaire,
 * et la coche en mode remplissage pour les visiteurs non propriétaires.
 */
@Component({
  selector: 'app-list',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    ListHeaderComponent,
    GiftsListComponent,
    AddGiftFormComponent,
    AddGroupFormComponent,
    ConfirmModalComponent,
    ChristmasButtonComponent,
  ],
  templateUrl: './list.html',
  styleUrl: './list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListPage {
  private readonly route = inject(ActivatedRoute);
  private readonly lists = inject(ListService);
  private readonly auth = inject(AuthService);
  private readonly toastService = inject(ToastService);

  private readonly giftsListRef = viewChild(GiftsListComponent);
  private readonly addGiftFormRef = viewChild(AddGiftFormComponent);
  private readonly addGroupFormRef = viewChild(AddGroupFormComponent);

  // Paramètre d'URL (slug ou identifiant)
  readonly id = toSignal(this.route.paramMap.pipe(map((pm) => pm.get('id') as string)), {
    initialValue: '',
  });

  // Formulaire d'ajout de cadeau
  readonly giftTitle = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.maxLength(200)],
  });
  readonly giftUrl = new FormControl<string | null>('', {
    validators: [Validators.maxLength(500)],
  });
  readonly giftGroup = new FormControl<string | null>(null);
  readonly giftTitleInvalid = toSignal(
    this.giftTitle.statusChanges.pipe(map(() => this.giftTitle.invalid)),
    { initialValue: this.giftTitle.invalid },
  );
  readonly submitting = signal(false);
  readonly addError = signal<string | null>(null);

  // Formulaire de création de catégorie
  readonly groupName = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.maxLength(120)],
  });
  readonly groupNameInvalid = toSignal(
    this.groupName.statusChanges.pipe(map(() => this.groupName.invalid)),
    { initialValue: this.groupName.invalid },
  );
  readonly groupSubmitting = signal(false);
  readonly addGroupError = signal<string | null>(null);

  // Mode remplissage et état de chargement par cadeau
  readonly fillMode = signal(false);
  readonly updating = signal(new Set<string>());

  // Édition et suppression en ligne d'un cadeau
  readonly editingGiftId = signal<string | null>(null);
  readonly deletingGiftId = signal<string | null>(null);
  readonly editTitle = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.maxLength(200)],
  });
  readonly editUrl = new FormControl<string | null>('', {
    validators: [Validators.maxLength(500)],
  });
  readonly editGroup = new FormControl<string | null>(null);
  readonly editSubmitting = signal(false);
  readonly editError = signal<string | null>(null);
  readonly editTitleInvalid = toSignal(
    this.editTitle.statusChanges.pipe(map(() => this.editTitle.invalid)),
    { initialValue: this.editTitle.invalid },
  );

  // Édition et suppression en ligne d'une catégorie
  readonly updatingGroups = signal(new Set<string>());
  readonly editingGroupId = signal<string | null>(null);
  readonly deletingGroupId = signal<string | null>(null);
  readonly editGroupName = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.maxLength(120)],
  });
  readonly editGroupSubmitting = signal(false);
  readonly editGroupError = signal<string | null>(null);
  readonly editGroupNameInvalid = toSignal(
    this.editGroupName.statusChanges.pipe(map(() => this.editGroupName.invalid)),
    { initialValue: this.editGroupName.invalid },
  );

  readonly sharing = signal(false);
  readonly confirmFillOpen = signal(false);
  readonly showAddForm = signal(false);
  readonly showAddGroupForm = signal(false);
  private lastFocusedEl: HTMLElement | null = null;

  // Données synchronisées en temps réel depuis un unique chargement initial
  private readonly snapshot = toSignal(
    this.route.paramMap.pipe(
      map((pm) => pm.get('id') as string),
      tap(() => this.giftsListRef()?.resetCollapsed()),
      switchMap((slugOrId) => this.lists.watchList(slugOrId)),
    ),
    { initialValue: { list: null, groups: [], gifts: [] } as ListSnapshot },
  );

  readonly listData = computed(() => this.snapshot().list);
  readonly groups = computed(() => sortGroups(this.snapshot().groups));
  readonly gifts = computed(() => sortGifts(this.snapshot().gifts));

  readonly users = signal<Record<string, UserInfo>>({});

  constructor() {
    this.loadCurrentUserInfo();
  }

  private loadCurrentUserInfo(): void {
    this.auth.user$.subscribe((user) => {
      if (user) {
        const userInfo: UserInfo = {
          id: user.id || user.uid,
          uid: user.uid || user.id,
          displayName: user.displayName,
          email: user.email,
        };
        this.users.update((current) => ({ ...current, [user.uid]: userInfo }));
      }
    });
  }

  get title(): string {
    return this.listData()?.title ?? 'Liste';
  }

  /**
   * Identifiant PocketBase canonique de la liste (indépendant du slug présent dans l'URL).
   */
  private get canonicalListId(): string | null {
    return this.listData()?.id ?? null;
  }

  isCurrentUserOwner(): boolean {
    const list = this.listData();
    const currentUser = this.auth.user();

    if (!list || !currentUser) {
      return false;
    }

    return list.owner === currentUser.id || list.owner === currentUser.uid;
  }

  toggleAddForm(): void {
    const opening = !this.showAddForm();
    this.showAddForm.set(opening);
    if (opening) {
      this.showAddGroupForm.set(false);
      setTimeout(() => this.addGiftFormRef()?.focusTitle(), 0);
    } else {
      this.giftGroup.reset(null);
      this.addError.set(null);
    }
  }

  toggleAddGroupForm(): void {
    const opening = !this.showAddGroupForm();
    this.showAddGroupForm.set(opening);
    if (opening) {
      this.showAddForm.set(false);
      setTimeout(() => this.addGroupFormRef()?.focusName(), 0);
    } else {
      this.groupName.reset('');
      this.addGroupError.set(null);
    }
  }

  /**
   * Ouvre le formulaire d'ajout de cadeau avec la catégorie cible pré-sélectionnée.
   */
  onQuickAddInGroup(groupId: string): void {
    if (!this.isCurrentUserOwner()) return;
    this.giftGroup.setValue(groupId);
    this.showAddGroupForm.set(false);
    this.showAddForm.set(true);
    this.giftsListRef()?.expandGroup(groupId);
    setTimeout(() => this.addGiftFormRef()?.focusTitle(), 0);
  }

  async addGift(): Promise<void> {
    if (!this.isCurrentUserOwner() || this.giftTitle.invalid) return;
    const listId = this.canonicalListId;
    if (!listId) return;
    this.submitting.set(true);
    this.addError.set(null);
    try {
      const rawUrl = (this.giftUrl.value ?? '').trim();
      const url = rawUrl.length > 0 ? rawUrl : undefined;
      const selectedGroupId = this.giftGroup.value || null;
      await this.lists.addGift(listId, this.giftTitle.value.trim(), url, selectedGroupId);
      this.giftsListRef()?.expandGroup(selectedGroupId);
      this.giftTitle.reset('');
      this.giftUrl.reset('');
    } catch (e) {
      console.error(e);
      this.addError.set('Impossible d’ajouter le cadeau. Réessaie.');
    } finally {
      this.submitting.set(false);
    }
  }

  async addGroup(): Promise<void> {
    if (!this.isCurrentUserOwner() || this.groupName.invalid) return;
    const listId = this.canonicalListId;
    if (!listId) return;
    const trimmed = this.groupName.value.trim();
    if (!trimmed) return;
    this.groupSubmitting.set(true);
    this.addGroupError.set(null);
    try {
      await this.lists.createGroup(listId, trimmed);
      this.groupName.reset('');
      this.showAddGroupForm.set(false);
    } catch (e) {
      console.error(e);
      this.addGroupError.set('Impossible de créer la catégorie. Réessaie.');
    } finally {
      this.groupSubmitting.set(false);
    }
  }

  toggleFillMode(): void {
    // Les propriétaires ne peuvent pas activer le mode remplissage pour éviter l'auto-spoiler
    if (this.isCurrentUserOwner()) {
      return;
    }
    const currentlyOn = this.fillMode();
    if (currentlyOn) {
      this.fillMode.set(false);
      return;
    }
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

  isUpdating(id: string | undefined | null): boolean {
    return !!id && this.updating().has(id);
  }

  readonly isUpdatingFn = (id: string | undefined | null) => this.isUpdating(id);

  isUpdatingGroup(id: string | undefined | null): boolean {
    return !!id && this.updatingGroups().has(id);
  }

  readonly isUpdatingGroupFn = (id: string | undefined | null) => this.isUpdatingGroup(id);

  async toggleBought(gift: Gift): Promise<void> {
    const listId = this.canonicalListId ?? this.id();
    const giftId = gift.id;
    if (!listId || !giftId) return;
    const set = new Set(this.updating());
    set.add(giftId);
    this.updating.set(set);
    try {
      await this.lists.toggleBought(listId, giftId, !gift.bought);
    } catch (e) {
      console.error('Échec de la mise à jour du cadeau', e);
      this.toastService.error('Impossible de mettre à jour ce cadeau.');
    } finally {
      const after = new Set(this.updating());
      after.delete(giftId);
      this.updating.set(after);
    }
  }

  startEditGift(gift: Gift): void {
    if (!this.isCurrentUserOwner()) return;
    const id = gift.id || null;
    if (!id) return;
    this.editingGiftId.set(id);
    this.editError.set(null);
    this.editSubmitting.set(false);
    this.editTitle.reset(gift.title ?? '');
    this.editUrl.reset(gift.url ?? '');
    this.editGroup.reset(gift.group ?? null);
  }

  cancelEdit(): void {
    this.editingGiftId.set(null);
    this.editSubmitting.set(false);
    this.editError.set(null);
    this.editTitle.reset('');
    this.editUrl.reset('');
    this.editGroup.reset(null);
  }

  async submitEdit(): Promise<void> {
    if (!this.isCurrentUserOwner()) return;
    const listId = this.canonicalListId;
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
      const group = this.editGroup.value || null;
      await this.lists.updateGift(listId, giftId, { title, url: rawUrl || null, group });
      if (group) {
        this.giftsListRef()?.expandGroup(group);
      }
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

  startDeleteGift(gift: Gift): void {
    if (!this.isCurrentUserOwner()) return;
    const id = gift.id || null;
    if (!id) return;
    this.deletingGiftId.set(id);
  }

  cancelDeleteGift(): void {
    this.deletingGiftId.set(null);
  }

  async confirmDeleteGift(): Promise<void> {
    if (!this.isCurrentUserOwner()) return;
    const listId = this.canonicalListId;
    const giftId = this.deletingGiftId();
    if (!listId || !giftId) return;
    const set = new Set(this.updating());
    set.add(giftId);
    this.updating.set(set);
    try {
      await this.lists.deleteGift(listId, giftId);
    } catch (e) {
      console.error('Échec de la suppression du cadeau', e);
      this.toastService.error('Impossible de supprimer le cadeau.');
    } finally {
      this.deletingGiftId.set(null);
      const after = new Set(this.updating());
      after.delete(giftId);
      this.updating.set(after);
    }
  }

  // Gestion inline des catégories
  startEditGroup(group: GiftGroup): void {
    if (!this.isCurrentUserOwner()) return;
    this.editingGroupId.set(group.id);
    this.deletingGroupId.set(null);
    this.editGroupError.set(null);
    this.editGroupSubmitting.set(false);
    this.editGroupName.reset(group.name ?? '');
  }

  cancelEditGroup(): void {
    this.editingGroupId.set(null);
    this.editGroupSubmitting.set(false);
    this.editGroupError.set(null);
    this.editGroupName.reset('');
  }

  async submitEditGroup(): Promise<void> {
    if (!this.isCurrentUserOwner()) return;
    const groupId = this.editingGroupId();
    if (!groupId || this.editGroupName.invalid) return;
    const trimmed = this.editGroupName.value.trim();
    if (!trimmed) return;

    this.editGroupSubmitting.set(true);
    this.editGroupError.set(null);
    const set = new Set(this.updatingGroups());
    set.add(groupId);
    this.updatingGroups.set(set);
    try {
      await this.lists.renameGroup(groupId, trimmed);
      this.cancelEditGroup();
    } catch (e) {
      console.error(e);
      this.editGroupError.set('Impossible de renommer la catégorie. Réessaie.');
    } finally {
      this.editGroupSubmitting.set(false);
      const after = new Set(this.updatingGroups());
      after.delete(groupId);
      this.updatingGroups.set(after);
    }
  }

  startDeleteGroup(group: GiftGroup): void {
    if (!this.isCurrentUserOwner()) return;
    this.deletingGroupId.set(group.id);
    this.editingGroupId.set(null);
  }

  cancelDeleteGroup(): void {
    this.deletingGroupId.set(null);
  }

  async confirmDeleteGroup(): Promise<void> {
    if (!this.isCurrentUserOwner()) return;
    const groupId = this.deletingGroupId();
    if (!groupId) return;
    const set = new Set(this.updatingGroups());
    set.add(groupId);
    this.updatingGroups.set(set);
    try {
      await this.lists.deleteGroup(groupId);
      if (this.giftGroup.value === groupId) {
        this.giftGroup.reset(null);
      }
    } catch (e) {
      console.error('Échec de la suppression de la catégorie', e);
      this.toastService.error('Impossible de supprimer la catégorie.');
    } finally {
      this.deletingGroupId.set(null);
      const after = new Set(this.updatingGroups());
      after.delete(groupId);
      this.updatingGroups.set(after);
    }
  }

  async onReorderMove(ev: { groupId: string | null; fromIndex: number; toIndex: number }): Promise<void> {
    if (!this.isCurrentUserOwner()) return;
    const listId = this.canonicalListId;
    if (!listId) return;

    const current = this.gifts();
    if (!current.length) return;

    const groups = this.groups();
    const validGroupIds = new Set(groups.map((grp) => grp.id));

    // Extrait uniquement la tranche concernée (liste plate, catégorie donnée ou sans catégorie)
    const slice =
      groups.length === 0
        ? [...current]
        : current.filter((g) => {
            const effectiveGroupId = g.group && validGroupIds.has(g.group) ? g.group : null;
            return effectiveGroupId === ev.groupId;
          });

    if (ev.fromIndex < 0 || ev.fromIndex >= slice.length || ev.toIndex < 0 || ev.toIndex >= slice.length) {
      return;
    }

    const [moved] = slice.splice(ev.fromIndex, 1);
    slice.splice(ev.toIndex, 0, moved);
    const ids = slice.map((g) => g.id).filter(Boolean);

    try {
      await this.lists.reorderGifts(listId, ids);
    } catch (e) {
      console.error('Échec de la réorganisation des cadeaux', e);
      this.toastService.error('Impossible de réorganiser les cadeaux.');
    }
  }

  async onReorderGroupMove(ev: { fromIndex: number; toIndex: number }): Promise<void> {
    if (!this.isCurrentUserOwner()) return;
    const listId = this.canonicalListId;
    if (!listId) return;

    const arr = [...this.groups()];
    if (ev.fromIndex < 0 || ev.fromIndex >= arr.length || ev.toIndex < 0 || ev.toIndex >= arr.length) {
      return;
    }

    const [moved] = arr.splice(ev.fromIndex, 1);
    arr.splice(ev.toIndex, 0, moved);
    const ids = arr.map((grp) => grp.id).filter(Boolean);

    try {
      await this.lists.reorderGroups(listId, ids);
    } catch (e) {
      console.error('Échec de la réorganisation des catégories', e);
      this.toastService.error('Impossible de réorganiser les catégories.');
    }
  }

  async share(): Promise<void> {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (!url) return;
    this.sharing.set(true);
    try {
      const nav = (typeof navigator !== 'undefined' ? navigator : undefined) as any;
      if (nav && typeof nav.share === 'function') {
        await nav.share({ title: this.title, url });
        this.toastService.success('Options de partage ouvertes.');
      } else {
        await this.copyToClipboard(url);
        this.toastService.success('Lien copié dans le presse-papiers.');
      }
    } catch {
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
    if (typeof document !== 'undefined') {
      const textarea = document.createElement('textarea');
      textarea.value = text;
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
