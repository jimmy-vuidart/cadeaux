import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, Validators } from '@angular/forms';
import { AddGiftFormComponent } from './add-gift-form';
import type { GiftGroup } from '@shared/models/gift-group';

/**
 * Tests unitaires du composant AddGiftFormComponent.
 * Vérifie l'affichage conditionnel du sélecteur de catégorie selon la présence de groupes.
 */
describe('AddGiftFormComponent', () => {
  let fixture: ComponentFixture<AddGiftFormComponent>;
  let titleControl: FormControl<string>;
  let urlControl: FormControl<string | null>;
  let groupControl: FormControl<string | null>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddGiftFormComponent],
    }).compileComponents();

    titleControl = new FormControl('', { nonNullable: true, validators: [Validators.required] });
    urlControl = new FormControl<string | null>('');
    groupControl = new FormControl<string | null>(null);

    fixture = TestBed.createComponent(AddGiftFormComponent);
    fixture.componentRef.setInput('titleControl', titleControl);
    fixture.componentRef.setInput('urlControl', urlControl);
    fixture.componentRef.setInput('groupControl', groupControl);
    fixture.detectChanges();
  });

  it('should hide the category select when list has no groups', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('#gift-group')).toBeNull();
  });

  it('should show the category select and list all groups when groups exist', () => {
    const groups: GiftGroup[] = [
      { id: 'grp-1', list: 'l-1', name: 'Jeux de société', position: 0 },
      { id: 'grp-2', list: 'l-1', name: 'Lecture', position: 1 },
    ];
    fixture.componentRef.setInput('groups', groups);
    fixture.detectChanges();

    const select = fixture.nativeElement.querySelector('#gift-group') as HTMLSelectElement;
    expect(select).toBeTruthy();
    const labels = Array.from(select.options).map((o) => o.textContent?.trim());
    expect(labels).toEqual(['Aucune catégorie', 'Jeux de société', 'Lecture']);
  });
});
