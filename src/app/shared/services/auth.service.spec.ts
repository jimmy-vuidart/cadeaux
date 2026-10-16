import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { AuthService } from './auth.service';
import { PocketBaseService } from './pocketbase.service';

/**
 * Tests unitaires du service AuthService.
 */
describe('AuthService', () => {
  let service: AuthService;
  let mockPbService: any;
  let mockUsersCollection: any;

  beforeEach(() => {
    mockUsersCollection = {
      authWithOAuth2: vi.fn().mockResolvedValue({}),
      authWithPassword: vi.fn().mockResolvedValue({}),
      create: vi.fn().mockResolvedValue({ id: 'new-user' }),
      update: vi.fn().mockResolvedValue({}),
    };

    mockPbService = {
      client: {
        collection: vi.fn().mockReturnValue(mockUsersCollection),
        authStore: {
          clear: vi.fn(),
          record: { id: 'usr-1' },
        },
      },
      user: signal(null),
      isLoggedIn: signal(false),
    };

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: PocketBaseService, useValue: mockPbService },
      ],
    });
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should delegate loginWithGoogle to pb.collection("users").authWithOAuth2', async () => {
    await service.loginWithGoogle();
    expect(mockUsersCollection.authWithOAuth2).toHaveBeenCalledWith({ provider: 'google' });
  });

  it('should propagate rejection when loginWithGoogle fails', async () => {
    mockUsersCollection.authWithOAuth2.mockRejectedValueOnce(new Error('OAuth error'));
    await expect(service.loginWithGoogle()).rejects.toThrow('OAuth error');
  });

  it('should delegate loginWithEmail to pb.collection("users").authWithPassword', async () => {
    await service.loginWithEmail('test@test.fr', 'secret123');
    expect(mockUsersCollection.authWithPassword).toHaveBeenCalledWith('test@test.fr', 'secret123');
  });

  it('should register and then login on registerWithEmail', async () => {
    await service.registerWithEmail('test@test.fr', 'secret123', 'Mon Nom');
    expect(mockUsersCollection.create).toHaveBeenCalledWith({
      email: 'test@test.fr',
      password: 'secret123',
      passwordConfirm: 'secret123',
      displayName: 'Mon Nom',
    });
    expect(mockUsersCollection.authWithPassword).toHaveBeenCalledWith('test@test.fr', 'secret123');
  });

  it('should clear authStore on logout', async () => {
    await service.logout();
    expect(mockPbService.client.authStore.clear).toHaveBeenCalled();
  });

  it('should update display name via pb.collection("users").update', async () => {
    await service.updateDisplayName('Nouveau Nom');
    expect(mockUsersCollection.update).toHaveBeenCalledWith('usr-1', { displayName: 'Nouveau Nom' });
  });
});
