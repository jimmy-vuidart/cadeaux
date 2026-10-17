import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GiftsListComponent } from './gifts-list';
import type { Gift } from '@shared/models/gift';

/**
 * Tests unitaires du composant GiftsListComponent.
 * Vérifie notamment l'affichage conditionnel du bouton de mode remplissage pour éviter l'auto-spoiler.
 */
describe('GiftsListComponent', () => {
  let component: GiftsListComponent;
  let fixture: ComponentFixture<GiftsListComponent>;

  const mockGifts: Gift[] = [
    {
      id: 'g-1',
      list: 'l-1',
      title: 'Livre de cuisine',
      bought: false,
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GiftsListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GiftsListComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('gifts', mockGifts);
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should display the fill mode button when showFillMode is true', () => {
    fixture.componentRef.setInput('showFillMode', true);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector('app-christmas-button');
    expect(button).toBeTruthy();
    expect(button?.textContent).toContain('Passer en mode « cadeaux achetés »');
  });

  it('should hide the fill mode button when showFillMode is false', () => {
    fixture.componentRef.setInput('showFillMode', false);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector('app-christmas-button');
    expect(button).toBeNull();
  });

  it('should emit toggleFillMode when button is clicked', () => {
    fixture.componentRef.setInput('showFillMode', true);
    fixture.detectChanges();

    let emitted = false;
    component.toggleFillMode.subscribe(() => {
      emitted = true;
    });

    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector('app-christmas-button button') as HTMLButtonElement;
    button?.click();

    expect(emitted).toBe(true);
  });
});
