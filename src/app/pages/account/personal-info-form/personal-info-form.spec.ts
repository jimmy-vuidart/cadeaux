import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PersonalInfoFormComponent } from './personal-info-form';
import { AuthService } from '../../../shared/services/auth.service';
import { UserService } from '../../../shared/services/user.service';
import { Auth } from '@angular/fire/auth';
import { ChristmasButtonComponent } from '../../../shared/ui/christmas-button/christmas-button';
import { of } from 'rxjs';

describe('PersonalInfoFormComponent', () => {
  let component: PersonalInfoFormComponent;
  let fixture: ComponentFixture<PersonalInfoFormComponent>;
  let mockAuthService: any;
  let mockUserService: any;

  beforeEach(async () => {
    // Mock AuthService
    mockAuthService = {
      user: () => ({
        uid: 'test-user-id',
        displayName: 'Test User'
      }),
      user$: of({
        uid: 'test-user-id',
        displayName: 'Test User'
      })
    };

    // Mock UserService
    mockUserService = {
      getUserInfo: (uid: string) => Promise.resolve({
        uid: 'test-user-id',
        displayName: 'Test User'
      })
    };

    await TestBed.configureTestingModule({
      imports: [PersonalInfoFormComponent, ChristmasButtonComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: UserService, useValue: mockUserService },
        { provide: Auth, useValue: {} }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PersonalInfoFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with correct display name', async () => {
    // Wait for async operations
    await fixture.whenStable();
    expect(component.displayName()).toBe('Test User');
    expect(component.isLoading()).toBe(false);
  });

  it('should toggle edit mode', () => {
    expect(component.isEditing()).toBe(false);
    component.toggleEdit();
    expect(component.isEditing()).toBe(true);
    component.toggleEdit();
    expect(component.isEditing()).toBe(false);
  });

  it('should cancel edit and reset display name', async () => {
    // Set a different display name
    component.displayName.set('New Name');
    component.cancelEdit();
    
    // Wait for the reset
    await fixture.whenStable();
    expect(component.isEditing()).toBe(false);
    expect(component.displayName()).toBe('Test User'); // Should be reset to original
  });
});