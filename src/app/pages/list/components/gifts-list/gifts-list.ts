import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import type { Gift } from '@shared/models/gift';
import type { GiftGroup } from '@shared/models/gift-group';
import type { UserInfo } from '@shared/models/user-info';
import { ChristmasButtonComponent } from '@shared/ui/christmas-button/christmas-button';

export const UNCATEGORIZED_SECTION_ID = '__uncategorized__';

/**
 * Représentation d'une section affichée lorsque la liste comporte des catégories.
 */
export interface GiftSection {
  id: string;
  group: GiftGroup | null;
  name: string;
  isUncategorized: boolean;
  gifts: Gift[];
  boughtCount: number;
  groupIndex: number;
}

/**
 * Composant d'affichage et d'interaction avec la liste des cadeaux et leurs catégories pliables.
 * Gère le mode plat (sans catégorie) ou accordéon par catégorie, l'édition en ligne,
 * la suppression, la réorganisation réservée au propriétaire et le mode remplissage pour les visiteurs.
 */
@Component({
  selector: 'app-gifts-list',
  templateUrl: './gifts-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet, ReactiveFormsModule, FormsModule, ChristmasButtonComponent],
})
export class GiftsListComponent {
  gifts = input.required<Gift[]>();
  groups = input<GiftGroup[]>([]);
  isOwner = input(false);
  fillMode = input(false);
  showFillMode = input(true);
  isUpdating = input<(id: string | undefined | null) => boolean>(() => false);

  // État d'édition et de suppression d'un cadeau (géré par le parent)
  editingId = input<string | null>(null);
  deletingId = input<string | null>(null);
  editTitleControl = input<FormControl<string> | null>(null);
  editUrlControl = input<FormControl<string | null> | null>(null);
  editGroupControl = input<FormControl<string | null> | null>(null);
  editSubmitting = input(false);
  editTitleInvalid = input(false);
  editError = input<string | null>(null);

  // État d'édition et de suppression d'une catégorie (géré par le parent)
  editingGroupId = input<string | null>(null);
  deletingGroupId = input<string | null>(null);
  editGroupNameControl = input<FormControl<string> | null>(null);
  editGroupSubmitting = input(false);
  editGroupNameInvalid = input(false);
  editGroupError = input<string | null>(null);
  isUpdatingGroup = input<(id: string | undefined | null) => boolean>(() => false);

  users = input<Record<string, UserInfo>>({});

  // Événements cadeaux
  toggleFillMode = output<void>();
  toggleBought = output<Gift>();
  startEdit = output<Gift>();
  cancelEdit = output<void>();
  submitEdit = output<void>();
  startDelete = output<Gift>();
  cancelDelete = output<void>();
  confirmDelete = output<void>();
  reorderMove = output<{ groupId: string | null; fromIndex: number; toIndex: number }>();

  // Événements catégories
  quickAddInGroup = output<string>();
  startEditGroup = output<GiftGroup>();
  cancelEditGroup = output<void>();
  submitEditGroup = output<void>();
  startDeleteGroup = output<GiftGroup>();
  cancelDeleteGroup = output<void>();
  confirmDeleteGroup = output<void>();
  reorderGroupMove = output<{ fromIndex: number; toIndex: number }>();

  // État de pliage purement en mémoire (non persisté)
  readonly collapsedIds = signal<ReadonlySet<string>>(new Set());

  readonly hasGroups = computed(() => this.groups().length > 0);

  /**
   * Découpe les cadeaux en sections de catégories lorsqu'au moins une catégorie existe.
   * Les catégories vides restent visibles pour le propriétaire et sont masquées aux visiteurs.
   */
  readonly sections = computed<GiftSection[]>(() => {
    const groups = this.groups();
    if (groups.length === 0) return [];

    const validGroupIds = new Set(groups.map((grp) => grp.id));
    const byGroup = new Map<string, Gift[]>();
    const uncategorized: Gift[] = [];

    for (const gift of this.gifts()) {
      if (gift.group && validGroupIds.has(gift.group)) {
        const bucket = byGroup.get(gift.group);
        if (bucket) {
          bucket.push(gift);
        } else {
          byGroup.set(gift.group, [gift]);
        }
      } else {
        uncategorized.push(gift);
      }
    }

    const result: GiftSection[] = [];
    const owner = this.isOwner();

    groups.forEach((grp, idx) => {
      const grpGifts = byGroup.get(grp.id) ?? [];
      if (!owner && grpGifts.length === 0) {
        return;
      }
      result.push({
        id: grp.id,
        group: grp,
        name: grp.name,
        isUncategorized: false,
        gifts: grpGifts,
        boughtCount: grpGifts.filter((g) => g.bought).length,
        groupIndex: idx,
      });
    });

    if (uncategorized.length > 0) {
      result.push({
        id: UNCATEGORIZED_SECTION_ID,
        group: null,
        name: 'Sans catégorie',
        isUncategorized: true,
        gifts: uncategorized,
        boughtCount: uncategorized.filter((g) => g.bought).length,
        groupIndex: -1,
      });
    }

    return result;
  });

  readonly allCollapsed = computed(() => {
    const secs = this.sections();
    if (secs.length === 0) return false;
    const collapsed = this.collapsedIds();
    return secs.every((s) => collapsed.has(s.id));
  });

  isCollapsed(sectionId: string): boolean {
    return this.collapsedIds().has(sectionId);
  }

  toggleSection(sectionId: string): void {
    const next = new Set(this.collapsedIds());
    if (next.has(sectionId)) {
      next.delete(sectionId);
    } else {
      next.add(sectionId);
    }
    this.collapsedIds.set(next);
  }

  toggleAllSections(): void {
    if (this.allCollapsed()) {
      this.collapsedIds.set(new Set());
    } else {
      this.collapsedIds.set(new Set(this.sections().map((s) => s.id)));
    }
  }

  expandGroup(groupId: string | null): void {
    const targetId = groupId ?? UNCATEGORIZED_SECTION_ID;
    if (!this.collapsedIds().has(targetId)) return;
    const next = new Set(this.collapsedIds());
    next.delete(targetId);
    this.collapsedIds.set(next);
  }

  resetCollapsed(): void {
    this.collapsedIds.set(new Set());
  }

  getUserDisplayName(userId: string | undefined | null): string {
    if (!userId) return "quelqu'un";
    const user = this.users()[userId];
    return user?.displayName || user?.email || userId || "quelqu'un";
  }

  moveUp(groupId: string | null, index: number): void {
    if (!this.isOwner() || this.fillMode() || this.editingId() || index <= 0) return;
    this.reorderMove.emit({ groupId, fromIndex: index, toIndex: index - 1 });
  }

  moveDown(groupId: string | null, index: number, total: number): void {
    if (!this.isOwner() || this.fillMode() || this.editingId() || index >= total - 1) return;
    this.reorderMove.emit({ groupId, fromIndex: index, toIndex: index + 1 });
  }

  moveGroupUp(index: number): void {
    if (!this.isOwner() || this.fillMode() || this.editingGroupId() || index <= 0) return;
    this.reorderGroupMove.emit({ fromIndex: index, toIndex: index - 1 });
  }

  moveGroupDown(index: number): void {
    if (!this.isOwner() || this.fillMode() || this.editingGroupId()) return;
    if (index >= this.groups().length - 1) return;
    this.reorderGroupMove.emit({ fromIndex: index, toIndex: index + 1 });
  }
}
