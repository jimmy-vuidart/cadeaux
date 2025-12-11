# Project structure

- This app uses Firebase Realtime Database via AngularFire for data storage.
- This app use TailwindCSS for styling.

## Local development – Firebase Emulators

- The project uses Firebase Emulators locally for Auth and Realtime Database.
- Start them with: `npm run emulators`.
  - This runs the Firebase emulators (Auth on 9099, RTDB on 9000, Emulator UI on 4000) and seeds the RTDB with initial data from `tests/mock-data.json`.
  - Seeding is handled by `scripts/seed-rtdb.cjs`, which waits for the RTDB emulator to be ready and PUTs the mock JSON to the root.
- The Angular app automatically connects to emulators when running on `localhost`:
  - `connectAuthEmulator(getAuth(), 'http://127.0.0.1:9099')`
  - `connectDatabaseEmulator(getDatabase(), '127.0.0.1', 9000)`
- Emulator configuration:
  - Defined in `firebase.json` under `emulators` (auth, database, ui) and `database.rules.json` for permissive local rules.
  - Seed data location: `tests/mock-data.json`.

## File structure

- All main pages are stored in the `src/app/pages` folder.
  - Any component who is exclusive to a page should be stored in the same folder as the page. (ex: a 'Gift' component for the 'GiftPage' should be stored in the same folder as the 'GiftPage', inside a subfolder for the component)
- All shared features across all app (auth systems, data models, etc.) should be stored in the `src/app/shared` folder, with subfolders for each element type.

### Gift List page subcomponents

- Path: `src/app/pages/list/components/`
  - `list-header/` (`ListHeaderComponent`): Displays the page title and a Share button.
    - Inputs: `title: string`, `sharing: boolean`
    - Outputs: `share()`
  - `gifts-list/` (`GiftsListComponent`): Renders the list of gifts, the fill-mode UI, and inline editing for a selected gift.
    - Inputs: `gifts: Gift[]`, `fillMode: boolean`, `isUpdating: (id: string | null | undefined) => boolean`, `editingId: string | null`, `editTitleControl: FormControl<string>`, `editUrlControl: FormControl<string|null>`, `editSubmitting: boolean`, `editTitleInvalid: boolean`, `editError: string | null`
    - Outputs: `toggleFillMode()`, `toggleBought(gift: Gift)`, `startEdit(gift: Gift)`, `cancelEdit()`, `submitEdit()`, `reorderMove({ fromIndex: number; toIndex: number })`
    - Notes: includes a drag handle button at the start of each gift row to support HTML5 drag & drop reordering. Dragging is disabled while in fill mode or during inline editing. Visual feedback: the dragged row becomes semi-transparent and the hovered drop target row is highlighted with a blue ring and background tint; the handle shows a grabbing cursor while active and sets `aria-grabbed="true"`.
  - `add-gift-form/` (`AddGiftFormComponent`): Form to add a gift with validation and error message.
    - Inputs: `titleControl: FormControl<string>`, `urlControl: FormControl<string|null>`, `submitting: boolean`, `titleInvalid: boolean`, `error: string | null`
    - Outputs: `addGift()`
    - Implementation notes: imports both `ReactiveFormsModule` and `FormsModule` so that `(ngSubmit)` is handled by Angular and prevents the native form submission/reload.
  - `share-toast/` (`ShareToastComponent`): Non-blocking toast for share/copy feedback.
    - Inputs: `message: string | null`, `visible: boolean`

These components are consumed by `ListPage` (`src/app/pages/list/list.ts`) and wired in its `imports` array. They follow the rule: page-only components live alongside the page, under a `components` directory.

### Fill mode confirmation (anti-spoiler)

- When the user attempts to enable the fill mode from the gifts list, `ListPage.toggleFillMode()` opens a custom in-app confirmation modal (`ConfirmModalComponent`).
- The modal warns in French that enabling fill mode will reveal which gifts have already been bought and may spoil the recipient if the list is intended for them.
- If the user cancels/closes, the state remains unchanged (fill mode stays off). If confirmed, the page sets `fillMode = true`.
- Accessibility: the modal uses `role="dialog"`, `aria-modal="true"`, labelled title and description, focuses a button on open, supports Escape and backdrop click to close, and restores focus to the trigger on close.

#### Components

- `ConfirmModalComponent` (path: `src/app/pages/list/components/confirm-modal/`)
  - Inputs: `open: boolean`, `title: string`, `message: string`, `confirmLabel: string`, `cancelLabel: string`.
  - Outputs: `confirm()`, `cancel()`, `close()`.
  - Styling matches existing Tailwind look (rounded panel, slate colors, focus rings).

# TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

# Angular Best Practices

- Always use standalone components over NgModules.
- Do NOT set `standalone: true` inside Angular decorators (default in Angular v20+).
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.
- Make small subcomponents often in a page, like for every page features

## Accessibility Requirements

- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.

### Components

- Keep components small and focused on a single responsibility.
- Use `input()` and `output()` functions instead of decorators. The list subcomponents implement this.
- Use `computed()` for derived state when needed.
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component` decorator.
- Prefer inline templates for small components; for larger sections, use external templates co-located with the component TS file.
- Prefer Reactive forms instead of Template-driven ones. The add gift form uses `FormControl`s passed from the parent.
- Do NOT use `ngClass`; use `class` bindings instead.
- Do NOT use `ngStyle`; use `style` bindings instead.
- When using external templates/styles, use paths relative to the component TS file (done for list subcomponents).

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`.
- Use the async pipe to handle observables.
- Do not assume globals like (`new Date()`) are available.
- Do not write arrow functions in templates (they are not supported).

Note: When passing function inputs to child components (e.g., `isUpdating`), keep the reference stable by exposing a bound method or a readonly arrow function on the class, then call it inside the child template via `isUpdating()(id)` because `input()` returns a signal.

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Use the `inject()` function instead of constructor injection

### ListService API (data for lists and gifts)

- `getList(id: string): Observable<GiftList | null>`: stream a list by id.
- `listAll(): Observable<GiftList[]>`: stream all lists.
- `listGifts(listId: string): Observable<Gift[]>`: stream gifts of a list. Items include an optional `order` field used for sorting client-side.
- `createList(title?: string): Promise<string>`: create a list with a kebab-case id derived from title.
- `addGift(listId: string, title: string, url?: string): Promise<string>`: add a gift.
  - Implementation detail: new gifts receive a default `order` timestamp so they appear at the end until reordered.
- `toggleBought(listId: string, giftId: string, bought: boolean): Promise<void>`: toggle bought flag.
- `updateGift(listId: string, giftId: string, patch: { title?: string; url?: string | null }): Promise<void>`: update a gift title and/or URL. Passing `null` or empty string for URL removes it.
- `renameList(id: string, title: string): Promise<void>`: rename list title.
- `deleteGift(listId: string, giftId: string): Promise<void>`: delete a gift.
- `reorderGifts(listId: string, orderedIds: string[]): Promise<void>`: persist a new order by writing sequential `order` values (0..n-1) for the provided IDs.

### Ordering model

- `Gift` model now includes an optional `order?: number | null` used to store the list position.
- UI sorting: the `ListPage` sorts gifts by `order` ascending; items without `order` are placed last, then sorted by title and id for stability.
- Reordering flow: `GiftsListComponent` emits `reorderMove` with source and target indices; `ListPage` computes the new ordered IDs and calls `ListService.reorderGifts` to persist.

### DnD Visuals & Accessibility

- Template uses conditional classes to style the source and target items during drag (`opacity-60` for source, `ring-2 ring-blue-400 bg-slate-700` for drop target).
- The drag handle button toggles `cursor-grabbing` while dragging and sets `aria-grabbed="true"`.
- Motion respects user preferences using Tailwind’s `motion-safe:` utilities for subtle scale on active.

### List IDs generation

- New lists created via `ListService.createList(title)` no longer use Firebase auto-generated keys.
- The list ID is derived from the provided title transformed into kebab-case:
  - Lowercased
  - Diacritics removed (NFD normalization, combining marks stripped)
  - Any non-alphanumeric characters collapsed to single `-`
  - Leading/trailing dashes trimmed
- If an ID already exists, a numeric suffix is appended to ensure uniqueness: `id`, `id-2`, `id-3`, ...
- The list is stored at `lists/<computed-id>` with payload `{ title }`.
