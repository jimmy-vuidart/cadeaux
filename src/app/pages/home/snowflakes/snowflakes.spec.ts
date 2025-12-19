import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Snowflakes } from './snowflakes';

describe('Snowflakes', () => {
  let component: Snowflakes;
  let fixture: ComponentFixture<Snowflakes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Snowflakes],
    }).compileComponents();

    fixture = TestBed.createComponent(Snowflakes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
