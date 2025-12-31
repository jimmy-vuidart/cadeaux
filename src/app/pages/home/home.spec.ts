import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { of } from 'rxjs';

import { Home } from './home';
import { AuthService } from '@shared/services/auth.service';
import { ListService } from '@shared/services/list.service';

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            isLoggedIn: signal(false),
            user$: of(null),
            user: signal(null),
            loginWithGoogle: async () => {},
            loginWithEmail: async () => {},
            registerWithEmail: async () => {},
            logout: async () => {},
          },
        },
        {
          provide: ListService,
          useValue: {
            listByOwner: () => of([]),
            createList: async () => 'new-list-id',
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
