import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GiftsListComponent, UNCATEGORIZED_SECTION_ID } from './gifts-list';
import type { Gift } from '@shared/models/gift';
import type { GiftGroup } from '@shared/models/gift-group';

/**
 * Tests unitaires du composant GiftsListComponent.
 * Vérifie le mode plat, les cartes accordéon par catégorie, le pliage en mémoire,
 * l'anti-spoiler et le masquage des contrôles d'édition pour les visiteurs non propriétaires.
 */
describe('GiftsListComponent', () => {
  let component: GiftsListComponent;
  let fixture: ComponentFixture<GiftsListComponent>;

  const mockGroups: GiftGroup[] = [
    { id: 'grp-1', list: 'l-1', name: 'Jeux de société', position: 0 },
    { id: 'grp-2', list: 'l-1', name: 'Lecture', position: 1 },
    { id: 'grp-empty', list: 'l-1', name: 'Vide', position: 2 },
  ];

  const mockGifts: Gift[] = [
    { id: 'g-1', list: 'l-1', group: 'grp-1', title: 'Sky Team', bought: true, buyerName: 'Maman' },
    { id: 'g-2', list: 'l-1', group: 'grp-1', title: 'Wingspan', bought: false },
    { id: 'g-3', list: 'l-1', group: 'grp-2', title: 'Blacksad', bought: true },
    { id: 'g-4', list: 'l-1', group: null, title: 'Chaussettes', bought: false },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GiftsListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GiftsListComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('gifts', [mockGifts[0], mockGifts[1]]);
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

  it('should hide reorder arrows, sort hint and edit/delete buttons for non-owners', () => {
    fixture.componentRef.setInput('isOwner', false);
    fixture.componentRef.setInput('fillMode', false);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).not.toContain('utilise les flèches');
    expect(el.querySelector('button[aria-label^="Monter "]')).toBeNull();
    expect(el.querySelector('button[aria-label^="Descendre "]')).toBeNull();
    expect(el.querySelector('button[aria-label^="Modifier "]')).toBeNull();
    expect(el.querySelector('button[aria-label^="Supprimer "]')).toBeNull();
  });

  it('should render flat list with no category header when groups is empty', () => {
    fixture.componentRef.setInput('isOwner', true);
    fixture.componentRef.setInput('groups', []);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).not.toContain('Sans catégorie');
    expect(el.textContent).not.toContain('Tout replier');
    expect(el.querySelector('button[aria-label^="Monter "]')).toBeTruthy();
  });

  it('should render separate accordion cards with uncategorized section and hide empty categories from visitors', () => {
    fixture.componentRef.setInput('groups', mockGroups);
    fixture.componentRef.setInput('gifts', mockGifts);
    fixture.componentRef.setInput('isOwner', false);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Jeux de société');
    expect(el.textContent).toContain('Lecture');
    expect(el.textContent).toContain('Sans catégorie');
    expect(el.textContent).not.toContain('Vide');

    // En vue propriétaire, la catégorie vide est affichée
    fixture.componentRef.setInput('isOwner', true);
    fixture.detectChanges();
    expect(el.textContent).toContain('Vide');
    expect(el.textContent).toContain('Aucun cadeau dans cette catégorie.');
  });

  it('should collapse and expand categories in memory without touching localStorage', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
    fixture.componentRef.setInput('groups', mockGroups);
    fixture.componentRef.setInput('gifts', mockGifts);
    fixture.componentRef.setInput('isOwner', false);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Sky Team');

    // Pliage d'une catégorie
    component.toggleSection('grp-1');
    fixture.detectChanges();
    expect(el.textContent).not.toContain('Sky Team');
    expect(el.textContent).toContain('Blacksad');

    // Tout replier puis tout déplier
    component.toggleAllSections();
    fixture.detectChanges();
    expect(component.allCollapsed()).toBe(true);
    expect(el.textContent).not.toContain('Blacksad');
    expect(el.textContent).not.toContain('Chaussettes');

    component.toggleAllSections();
    fixture.detectChanges();
    expect(component.allCollapsed()).toBe(false);
    expect(el.textContent).toContain('Sky Team');
    expect(component.isCollapsed(UNCATEGORIZED_SECTION_ID)).toBe(false);
    expect(setItemSpy).not.toHaveBeenCalled();
    setItemSpy.mockRestore();
  });

  it('should display bought counter on category headers only in fillMode for non-owners', () => {
    fixture.componentRef.setInput('groups', mockGroups);
    fixture.componentRef.setInput('gifts', mockGifts);
    fixture.componentRef.setInput('isOwner', false);
    fixture.componentRef.setInput('fillMode', false);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).not.toContain('1/2 achetés');
    expect(el.textContent).not.toContain('1/1 achetés');

    fixture.componentRef.setInput('fillMode', true);
    fixture.detectChanges();
    expect(el.textContent).toContain('1/2 achetés');
    expect(el.textContent).toContain('1/1 achetés');

    // Sécurité anti-spoiler : même si fillMode était forcé à true pour un propriétaire, aucun compteur d'achat n'apparaît
    fixture.componentRef.setInput('isOwner', true);
    fixture.detectChanges();
    expect(el.textContent).not.toContain('1/2 achetés');
    expect(el.textContent).not.toContain('1/1 achetés');
  });

  it('should emit quickAddInGroup when owner clicks the + shortcut on a category header', () => {
    fixture.componentRef.setInput('groups', mockGroups);
    fixture.componentRef.setInput('gifts', mockGifts);
    fixture.componentRef.setInput('isOwner', true);
    fixture.detectChanges();

    let emittedGroupId: string | null = null;
    component.quickAddInGroup.subscribe((id) => {
      emittedGroupId = id;
    });

    const el = fixture.nativeElement as HTMLElement;
    const addBtn = el.querySelector('button[aria-label="Ajouter un cadeau dans Jeux de société"]') as HTMLButtonElement;
    expect(addBtn).toBeTruthy();
    addBtn.click();

    expect(emittedGroupId).toBe('grp-1');
  });

  it('should exclude icon ligatures from browser translation in both flat and grouped modes', () => {
    // Une traduction automatique remplacerait le nom de ligature (ex. « edit ») et casserait l'icône.
    fixture.componentRef.setInput('groups', mockGroups);
    fixture.componentRef.setInput('gifts', mockGifts);
    fixture.componentRef.setInput('isOwner', true);
    fixture.detectChanges();

    const icons = (fixture.nativeElement as HTMLElement).querySelectorAll('.material-symbols-outlined');
    expect(icons.length).toBeGreaterThan(0);
    icons.forEach((icon) => expect(icon.getAttribute('translate')).toBe('no'));
  });
});
