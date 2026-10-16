import { TestBed } from '@angular/core/testing';
import { PocketBaseService } from './pocketbase.service';

/**
 * Tests unitaires du service PocketBaseService.
 */
describe('PocketBaseService', () => {
  let service: PocketBaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PocketBaseService],
    });
    service = TestBed.inject(PocketBaseService);
  });

  it('should be created and have client initialized', () => {
    expect(service).toBeTruthy();
    expect(service.client).toBeTruthy();
  });

  it('should start with logged out state when authStore is invalid', () => {
    expect(service.isLoggedIn()).toBe(false);
    expect(service.user()).toBeNull();
  });

  it('should update user signal when authStore changes', () => {
    // Simuler un token JWT valide avec expiration future
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }));
    const validJwt = `${header}.${payload}.signature`;

    (service.client.authStore as any).save(validJwt, {
      id: 'usr-123',
      name: 'Testeur',
      displayName: 'Testeur Pro',
      email: 'test@example.com',
    });

    expect(service.isLoggedIn()).toBe(true);
    expect(service.user()).toEqual({
      id: 'usr-123',
      uid: 'usr-123',
      displayName: 'Testeur Pro',
      email: 'test@example.com',
    });

    // Simuler déconnexion
    service.client.authStore.clear();
    expect(service.isLoggedIn()).toBe(false);
    expect(service.user()).toBeNull();
  });
});
