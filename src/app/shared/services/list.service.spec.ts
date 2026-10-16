import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { ListService } from './list.service';
import { AuthService } from './auth.service';
import { UserService } from './user.service';
import { PocketBaseService } from './pocketbase.service';

/**
 * Tests unitaires du service ListService avec bouchonnage du client PocketBase.
 */
describe('ListService', () => {
  let service: ListService;
  let mockPbService: any;
  let mockAuthService: any;
  let mockUserService: any;

  beforeEach(() => {
    mockPbService = {
      client: {
        send: vi.fn(),
        collection: vi.fn().mockReturnValue({
          getFullList: vi.fn().mockResolvedValue([]),
          create: vi.fn().mockResolvedValue({ id: 'gift-1' }),
          update: vi.fn().mockResolvedValue({}),
          delete: vi.fn().mockResolvedValue({}),
          subscribe: vi.fn().mockResolvedValue(() => {}),
          unsubscribe: vi.fn().mockResolvedValue(true),
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
});
