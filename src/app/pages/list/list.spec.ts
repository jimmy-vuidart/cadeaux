import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { ListPage, sortGifts, sortGroups } from './list';
import { ListService, type ListSnapshot } from '@shared/services/list.service';
import { AuthService } from '@shared/services/auth.service';
import { ToastService } from '@shared/services/toast.service';
import type { Gift } from '@shared/models/gift';
import type { GiftGroup } from '@shared/models/gift-group';

/**
 * Tests unitaires de la page ListPage et de ses fonctions de tri.
 * Vérifie notamment le tri par position PocketBase, l'usage de l'identifiant canonique lors des mutations
 * (même lorsque l'URL contient un slug) et la réorganisation par catégorie.
 */
describe('ListPage', () => {
  let fixture: ComponentFixture<ListPage>;
  let component: ListPage;
  let snapshot$: BehaviorSubject<ListSnapshot>;
  let mockListService: any;
  let mockAuthService: any;
  let mockToastService: any;

  const ownerUser = { id: 'user-owner', uid: 'user-owner', displayName: 'Andy', email: 'andy@exemple.fr' };

  beforeEach(async () => {
    snapshot$ = new BehaviorSubject<ListSnapshot>({
      list: { id: 'pb-list-id-15', title: 'Noël 2025 Andy', slug: 'noel-2025-andy', owner: 'user-owner' },
      groups: [
        { id: 'grp-2', list: 'pb-list-id-15', name: 'Lecture', position: 1 },
        { id: 'grp-1', list: 'pb-list-id-15', name: 'Jeux', position: 0 },
      ],
      gifts: [
        { id: 'g-2', list: 'pb-list-id-15', group: 'grp-1', title: 'Album', position: 1, bought: false },
        { id: 'g-1', list: 'pb-list-id-15', group: 'grp-1', title: 'Zelda', position: 0, bought: false },
        { id: 'g-3', list: 'pb-list-id-15', group: 'grp-2', title: 'BD', position: 0, bought: false },
      ],
    });

    mockListService = {
      watchList: vi.fn().mockReturnValue(snapshot$.asObservable()),
      addGift: vi.fn().mockResolvedValue('g-new'),
      createGroup: vi.fn().mockResolvedValue({ id: 'grp-new', list: 'pb-list-id-15', name: 'Sport', position: 2 }),
      renameGroup: vi.fn().mockResolvedValue(undefined),
      deleteGroup: vi.fn().mockResolvedValue(undefined),
      reorderGifts: vi.fn().mockResolvedValue(undefined),
      reorderGroups: vi.fn().mockResolvedValue(undefined),
      updateGift: vi.fn().mockResolvedValue(undefined),
      deleteGift: vi.fn().mockResolvedValue(undefined),
      toggleBought: vi.fn().mockResolvedValue(undefined),
    };

    mockAuthService = {
      user: signal<any>(ownerUser),
      user$: of(ownerUser),
    };

    mockToastService = {
      success: vi.fn(),
      error: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ListPage],
      providers: [
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ id: 'noel-2025-andy' })) } },
        { provide: ListService, useValue: mockListService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: ToastService, useValue: mockToastService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should sort gifts by position rather than alphabetically', () => {
    const sorted = sortGifts([
      { id: 'a', list: 'l', title: 'Alpha', position: 2, bought: false },
      { id: 'z', list: 'l', title: 'Zeta', position: 0, bought: false },
      { id: 'm', list: 'l', title: 'Mid', position: 1, bought: false },
    ]);
    expect(sorted.map((g) => g.id)).toEqual(['z', 'm', 'a']);
  });

  it('should sort groups by position ascending', () => {
    const sorted = sortGroups([
      { id: 'g2', list: 'l', name: 'B', position: 10 },
      { id: 'g1', list: 'l', name: 'Z', position: 2 },
    ] as GiftGroup[]);
    expect(sorted.map((g) => g.id)).toEqual(['g1', 'g2']);
  });

  it('should expose sorted groups and gifts from watchList', () => {
    expect(component.groups().map((g) => g.id)).toEqual(['grp-1', 'grp-2']);
    expect(component.gifts().map((g) => g.id)).toEqual(['g-3', 'g-1', 'g-2']);
  });

  it('should use canonical PocketBase list id (not URL slug) when adding a gift or group', async () => {
    component.giftTitle.setValue('Sky Team');
    component.giftGroup.setValue('grp-1');
    await component.addGift();
    expect(mockListService.addGift).toHaveBeenCalledWith('pb-list-id-15', 'Sky Team', undefined, 'grp-1');

    component.groupName.setValue('Cuisine');
    await component.addGroup();
    expect(mockListService.createGroup).toHaveBeenCalledWith('pb-list-id-15', 'Cuisine');
  });

  it('should pre-select category and open add gift form on quickAddInGroup', () => {
    component.onQuickAddInGroup('grp-2');
    expect(component.giftGroup.value).toBe('grp-2');
    expect(component.showAddForm()).toBe(true);
    expect(component.showAddGroupForm()).toBe(false);
  });

  it('should reorder only gifts belonging to the target group and show error toast on failure', async () => {
    await component.onReorderMove({ groupId: 'grp-1', fromIndex: 1, toIndex: 0 });
    expect(mockListService.reorderGifts).toHaveBeenCalledWith('pb-list-id-15', ['g-2', 'g-1']);

    mockListService.reorderGifts.mockRejectedValueOnce(new Error('403'));
    await component.onReorderMove({ groupId: 'grp-1', fromIndex: 0, toIndex: 1 });
    expect(mockToastService.error).toHaveBeenCalled();
  });

  it('should ignore reorder requests when current user is not the owner', async () => {
    mockAuthService.user.set(null);
    await component.onReorderMove({ groupId: 'grp-1', fromIndex: 1, toIndex: 0 });
    await component.onReorderGroupMove({ fromIndex: 1, toIndex: 0 });
    expect(mockListService.reorderGifts).not.toHaveBeenCalled();
    expect(mockListService.reorderGroups).not.toHaveBeenCalled();
  });
});
