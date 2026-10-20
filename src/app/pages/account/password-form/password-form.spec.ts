import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { AuthService } from '@shared/services/auth.service';
import { PasswordFormComponent } from './password-form';

/**
 * Tests unitaires de la section de changement de mot de passe de la page compte.
 */
describe('PasswordFormComponent', () => {
  let component: PasswordFormComponent;
  let fixture: ComponentFixture<PasswordFormComponent>;
  let mockAuth: any;

  const fillForm = (currentPassword: string, password: string, confirmPassword: string) =>
    component.form.setValue({ currentPassword, password, confirmPassword });

  beforeEach(async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    mockAuth = {
      user: signal({ id: 'usr-1', uid: 'usr-1', displayName: 'Moi', email: 'moi@test.fr' }),
      changePassword: vi.fn().mockResolvedValue(undefined),
      requestPasswordReset: vi.fn().mockResolvedValue(undefined),
    };

    await TestBed.configureTestingModule({
      imports: [PasswordFormComponent],
      providers: [{ provide: AuthService, useValue: mockAuth }],
    }).compileComponents();

    fixture = TestBed.createComponent(PasswordFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should change the password and clear the form', async () => {
    fillForm('ancien123', 'nouveau123', 'nouveau123');

    await component.submit();

    expect(mockAuth.changePassword).toHaveBeenCalledWith('ancien123', 'nouveau123');
    expect(component.success()).toContain('Mot de passe modifié');
    expect(component.form.controls.password.value).toBe('');
    expect(component.loading()).toBe(false);
  });

  it('should require the current password', async () => {
    fillForm('', 'nouveau123', 'nouveau123');

    await component.submit();

    expect(mockAuth.changePassword).not.toHaveBeenCalled();
    expect(component.error()).toContain('mot de passe actuel');
  });

  it('should reject a new password shorter than 8 characters', async () => {
    fillForm('ancien123', 'court', 'court');

    await component.submit();

    expect(mockAuth.changePassword).not.toHaveBeenCalled();
    expect(component.error()).toContain('au moins 8 caractères');
  });

  it('should reject mismatching passwords', async () => {
    fillForm('ancien123', 'nouveau123', 'nouveau456');

    await component.submit();

    expect(mockAuth.changePassword).not.toHaveBeenCalled();
    expect(component.error()).toContain('ne correspondent pas');
  });

  it('should explain when the current password is wrong', async () => {
    mockAuth.changePassword.mockRejectedValueOnce({
      status: 400,
      response: { data: { oldPassword: { code: 'validation_invalid_old_password' } } },
    });
    fillForm('faux12345', 'nouveau123', 'nouveau123');

    await component.submit();

    expect(component.error()).toBe('Mot de passe actuel incorrect.');
    expect(component.success()).toBeNull();
  });

  it('should send a reset link to the account email', async () => {
    await component.sendResetLink();

    expect(mockAuth.requestPasswordReset).toHaveBeenCalledWith('moi@test.fr');
    expect(component.success()).toContain('moi@test.fr');
  });

  it('should render nothing when no user is logged in', () => {
    mockAuth.user.set(null);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).querySelector('form')).toBeNull();
  });
});
