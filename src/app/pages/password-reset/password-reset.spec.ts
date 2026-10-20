import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { AuthService } from '@shared/services/auth.service';
import { PasswordResetPage } from './password-reset';

/**
 * Tests unitaires de la page de réinitialisation du mot de passe.
 */
describe('PasswordResetPage', () => {
  let component: PasswordResetPage;
  let fixture: ComponentFixture<PasswordResetPage>;
  let mockAuth: any;

  beforeEach(async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    mockAuth = { confirmPasswordReset: vi.fn().mockResolvedValue(undefined) };

    await TestBed.configureTestingModule({
      imports: [PasswordResetPage],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuth },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ token: 'jeton-123' }) } } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PasswordResetPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should confirm the reset with the token from the URL', async () => {
    component.form.setValue({ password: 'nouveau123', confirmPassword: 'nouveau123' });

    await component.submit();

    expect(mockAuth.confirmPasswordReset).toHaveBeenCalledWith('jeton-123', 'nouveau123');
    expect(component.done()).toBe(true);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Ton mot de passe a été modifié');
  });

  it('should reject a password shorter than 8 characters', async () => {
    component.form.setValue({ password: 'court', confirmPassword: 'court' });

    await component.submit();

    expect(mockAuth.confirmPasswordReset).not.toHaveBeenCalled();
    expect(component.error()).toContain('au moins 8 caractères');
  });

  it('should reject mismatching passwords', async () => {
    component.form.setValue({ password: 'nouveau123', confirmPassword: 'nouveau456' });

    await component.submit();

    expect(mockAuth.confirmPasswordReset).not.toHaveBeenCalled();
    expect(component.error()).toContain('ne correspondent pas');
  });

  it('should explain when the link is invalid or expired', async () => {
    mockAuth.confirmPasswordReset.mockRejectedValueOnce({ status: 400 });
    component.form.setValue({ password: 'nouveau123', confirmPassword: 'nouveau123' });

    await component.submit();

    expect(component.done()).toBe(false);
    expect(component.error()).toContain('invalide ou a expiré');
    expect(component.loading()).toBe(false);
  });
});
