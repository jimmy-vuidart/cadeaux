import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { ListService, type ListSnapshot } from './list.service';
import { AuthService } from './auth.service';
import { UserService } from './user.service';
import { PocketBaseService } from './pocketbase.service';

/**
 * Tests unitaires du service ListService avec bouchonnage du client PocketBase.
 * Couvre les listes, les catégories (groupes de cadeaux), les cadeaux et la synchronisation temps réel.
 */
describe('ListService', () => {
  let service: ListService;
  let mockPbService: any;
  let mockAuthService: any;
  let mockUserService: any;
  let collectionsMap: Record<string, any>;

  const createMockCollection = () => ({
    getFullList: vi.fn().mockResolvedValue([]),
    getOne: vi.fn().mockResolvedValue({}),
    create: vi.fn().mockResolvedValue({ id: 'rec-1' }),
    update: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockResolvedValue({}),
    subscribe: vi.fn().mockResolvedValue(vi.fn()),
    unsubscribe: vi.fn().mockResolvedValue(true),
  });

  beforeEach(() => {
    collectionsMap = {
      lists: createMockCollection(),
      gifts: createMockCollection(),
      gift_groups: createMockCollection(),
      users: createMockCollection(),
    };

    mockPbService = {
      client: {
        send: vi.fn(),
        collection: vi.fn((name: string) => {
          if (!collectionsMap[name]) {
            collectionsMap[name] = createMockCollection();
          }
          return collectionsMap[name];
        }),
      },
      user: signal(null),
      isLoggedIn: signal(false),
    };

    mockAuthService = {
      user: signal(null),
      isLoggedIn: signal(false),
    };

    mockUserService = {
      recordListVisit: vi.fn().mockResolvedValue(undefined),
    };

    TestBed.configureTestingModule({
      providers: [
        ListService,
        { provide: PocketBaseService, useValue: mockPbService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: UserService, useValue: mockUserService },
      ],
    });
    service = TestBed.inject(ListService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create list via POST /api/custom/lists', async () => {
    mockPbService.client.send.mockResolvedValueOnce({
      id: 'list-123',
      slug: 'ma-liste',
      title: 'Ma liste',
    });

    const slug = await service.createList('Ma liste');
    expect(slug).toBe('ma-liste');
    expect(mockPbService.client.send).toHaveBeenCalledWith('/api/custom/lists', {
      method: 'POST',
      body: { title: 'Ma liste' },
    });
  });

  it('should toggle gift bought status via POST /api/custom/gifts/:id/toggle', async () => {
    mockPbService.client.send.mockResolvedValueOnce({
      id: 'gift-123',
      bought: true,
      buyer: null,
    });

    await service.toggleBought('list-1', 'gift-123', true);
    expect(mockPbService.client.send).toHaveBeenCalledWith('/api/custom/gifts/gift-123/toggle', {
      method: 'POST',
      body: { bought: true },
    });
  });

  it('should reorder gifts via POST /api/custom/lists/:id/reorder', async () => {
    mockPbService.client.send.mockResolvedValueOnce({ success: true });

    await service.reorderGifts('list-1', ['gift-2', 'gift-1']);
    expect(mockPbService.client.send).toHaveBeenCalledWith('/api/custom/lists/list-1/reorder', {
      method: 'POST',
      body: { orderedIds: ['gift-2', 'gift-1'] },
    });
  });

  it('should create, rename, delete and reorder gift groups', async () => {
    collectionsMap['gift_groups'].create.mockResolvedValueOnce({
      id: 'grp-1',
      list: 'list-1',
      name: 'Jeux de société',
      position: 100,
    });
    mockPbService.client.send.mockResolvedValueOnce({ success: true });

    const created = await service.createGroup('list-1', '  Jeux de société  ');
    expect(created).toEqual({
      id: 'grp-1',
      list: 'list-1',
      name: 'Jeux de société',
      position: 100,
      created: undefined,
      updated: undefined,
    });
    expect(collectionsMap['gift_groups'].create).toHaveBeenCalledWith(
      expect.objectContaining({ list: 'list-1', name: 'Jeux de société' }),
    );

    await service.renameGroup('grp-1', '  Jeux  ');
    expect(collectionsMap['gift_groups'].update).toHaveBeenCalledWith('grp-1', { name: 'Jeux' });

    await service.reorderGroups('list-1', ['grp-2', 'grp-1']);
    expect(mockPbService.client.send).toHaveBeenCalledWith('/api/custom/lists/list-1/reorder-groups', {
      method: 'POST',
      body: { orderedIds: ['grp-2', 'grp-1'] },
    });

    await service.deleteGroup('grp-1');
    expect(collectionsMap['gift_groups'].delete).toHaveBeenCalledWith('grp-1');
  });

  it('should persist group when adding or updating a gift', async () => {
    collectionsMap['gifts'].create.mockResolvedValueOnce({ id: 'gift-10' });

    await service.addGift('list-1', 'Sky Team', 'exemple.fr/sky', 'grp-1');
    expect(collectionsMap['gifts'].create).toHaveBeenCalledWith(
      expect.objectContaining({
        list: 'list-1',
        group: 'grp-1',
        title: 'Sky Team',
        url: 'https://exemple.fr/sky',
      }),
    );

    await service.updateGift('list-1', 'gift-10', { group: null });
    expect(collectionsMap['gifts'].update).toHaveBeenCalledWith('gift-10', { group: null });
  });

  it('should watch list with groups and detach gifts when a group is deleted over SSE', async () => {
    const capture: { handler?: (e: any) => void } = {};
    collectionsMap['gift_groups'].subscribe.mockImplementationOnce(async (_topic: string, cb: any) => {
      capture.handler = cb;
      return vi.fn();
    });

    mockPbService.client.send.mockResolvedValueOnce({
      list: { id: 'list-1', title: 'Noël', slug: 'noel', owner: 'u1' },
      groups: [{ id: 'grp-1', list: 'list-1', name: 'Jeux', position: 0 }],
      gifts: [{ id: 'g-1', list: 'list-1', group: 'grp-1', title: 'Catan', position: 0, bought: false }],
    });

    const snapshots: ListSnapshot[] = [];
    const sub = service.watchList('noel').subscribe((snap) => snapshots.push(snap));

    await Promise.resolve();
    await Promise.resolve();

    expect(snapshots.length).toBeGreaterThanOrEqual(1);
    expect(snapshots[0].groups).toHaveLength(1);
    expect(snapshots[0].gifts[0].group).toBe('grp-1');

    // Simule la suppression de la catégorie via SSE
    capture.handler?.({ action: 'delete', record: { id: 'grp-1', list: 'list-1' } });

    const latest = snapshots[snapshots.length - 1];
    expect(latest.groups).toHaveLength(0);
    expect(latest.gifts[0].group).toBeNull();

    sub.unsubscribe();
  });

  it('should fetch lists by owner with filter and sort by -created', async () => {
    const mockLists = [
      { id: 'l1', title: 'Liste 1', slug: 'l1', owner: 'u1', created: '2026-10-17', updated: '2026-10-17' },
    ];
    collectionsMap['lists'].getFullList.mockResolvedValueOnce(mockLists);

    const result = await new Promise((resolve) => {
      service.listByOwner('u1').subscribe(resolve);
    });

    expect(collectionsMap['lists'].getFullList).toHaveBeenCalledWith({
      filter: 'owner = "u1"',
      sort: '-created',
      requestKey: null,
    });
    expect(result).toEqual(mockLists);
  });

  it('should catch error and return empty array when getFullList fails', async () => {
    collectionsMap['lists'].getFullList.mockRejectedValueOnce(new Error('PocketBase 400'));

    const result = await new Promise((resolve) => {
      service.listByOwner('u1').subscribe(resolve);
    });

    expect(result).toEqual([]);
  });
});
