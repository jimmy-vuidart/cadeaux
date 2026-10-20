import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthService } from '@shared/services/auth.service';
import { LoginModalComponent } from './login-modal';

/**
 * Tests unitaires de la fenêtre modale de connexion.
 */
describe('LoginModalComponent', () => {
  let component: LoginModalComponent;
  let fixture: ComponentFixture<LoginModalComponent>;
  let mockAuth: any;

  beforeEach(async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    mockAuth = {
      loginWithEmail: vi.fn().mockResolvedValue(undefined),
      loginWithGoogle: vi.fn().mockResolvedValue(undefined),
      requestPasswordReset: vi.fn().mockResolvedValue(undefined),
    };

    await TestBed.configureTestingModule({
      imports: [LoginModalComponent],
      providers: [{ provide: AuthService, useValue: mockAuth }],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should login with email and close the modal', async () => {
    const cancelSpy = vi.fn();
    component.cancel.subscribe(cancelSpy);
    component.form.setValue({ email: 'test@test.fr', password: 'secret123' });

    await component.submitLogin();

    expect(mockAuth.loginWithEmail).toHaveBeenCalledWith('test@test.fr', 'secret123');
    expect(cancelSpy).toHaveBeenCalled();
  });

  it('should ask for an email before requesting a password reset', async () => {
    await component.forgotPassword();

    expect(mockAuth.requestPasswordReset).not.toHaveBeenCalled();
    expect(component.error()).toContain('Saisis ton adresse email');
  });

  it('should request a password reset and show a neutral confirmation', async () => {
    component.form.controls.email.setValue('test@test.fr');

    await component.forgotPassword();

    expect(mockAuth.requestPasswordReset).toHaveBeenCalledWith('test@test.fr');
    expect(component.info()).toContain('Si un compte existe');
    expect(component.error()).toBeNull();
    expect(component.loading()).toBe(false);
  });

  it('should explain when too many password resets were requested', async () => {
    mockAuth.requestPasswordReset.mockRejectedValueOnce({ status: 429 });
    component.form.controls.email.setValue('test@test.fr');

    await component.forgotPassword();

    expect(component.error()).toContain('Trop de demandes');
    expect(component.info()).toBeNull();
  });

  it('should render the forgotten password link', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Mot de passe oublié ?');
  });
});
