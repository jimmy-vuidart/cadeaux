# Project structure

- This app uses Firebase Realtime Database via AngularFire for data storage.
- This app use TailwindCSS for styling.
- Tailwind v4 is configured via `@import 'tailwindcss'` and uses `@theme` and `@utility` blocks inside `src/styles.css` to define design tokens and app-specific utilities.

## General guidelines

- Ensure modifications still build successfuly using `npm run build`.

## Responsiveness and mobile rendering

- Tailwind v4 responsive utilities (`sm:`, `md:`, etc.) are used to scale typography, spacings, and layout for small screens.
- Primary actions can expand to full width on small screens via `[customClass]="'w-full sm:w-auto'"` on `app-christmas-button` usages.
- Buttons allow label wrapping to avoid overflow on narrow devices. Implementation:
  - `ChristmasButtonComponent` base classes include `inline-flex`, `min-w-0`, `max-w-full`, `whitespace-normal`, `break-words`, and `text-center`.
- Modals and dialogs are constrained to the viewport and scroll internally when content is long:
  - Containers use `w-full`, `mx-4`, `max-h-[80vh]`, `overflow-auto`, and responsive paddings `p-6 sm:p-8`.
  - Titles and body text scale down on mobile (`text-2xl sm:text-3xl`, `text-base sm:text-lg`).
- Header rows that combine a title and an action button use `flex-wrap` so the action can wrap below on phones.
- Avoid horizontal scrolling site‑wide: `body` already sets `overflow-x: hidden` in `src/styles.css`.

### Components updated for mobile

- `src/app/shared/ui/christmas-button/christmas-button.ts`: base classes updated to allow text wrapping and full‑width usage.
- `src/app/pages/list/components/confirm-modal/confirm-modal.html`: responsive width/paddings and internal scrolling.
- `src/app/pages/home/create-list-modal/create-list-modal.html`: responsive paddings and internal scrolling; buttons can become full width on mobile.
- `src/app/pages/home/home.html`: hero title scales on mobile; primary CTA becomes full‑width on small screens.
- `src/app/pages/list/components/gifts-list/gifts-list.html`: header row wraps on small screens; toggle button can be full width on mobile.

#### Gift cards width and title wrapping (phones)

- Ensure gift list cards fully fit the viewport on small devices:
  - The list container uses `w-full` on the `<ul>` and each `<li>`.
  - The row wrapper inside each `<li>` uses `w-full flex-nowrap` so action buttons stay aligned at the right and never wrap to a new line.
  - Left info block uses `flex-1 min-w-0` so text can wrap/truncate within the available space instead of expanding the row.
  - Right action clusters keep `shrink-0` so they don’t compress or stretch layout.
- Title rendering strategy:
  - On phones, allow wrapping and breaking long words/URLs: `whitespace-normal break-words`.
  - From `sm` breakpoint and up, revert to a single-line `truncate` for a tidy table‑like look.

#### Additional fixes for iPhone horizontal scrolling

- Global overflow prevention: add `html { overflow-x: hidden; }` in `src/styles.css` alongside the existing `body { overflow-x: hidden; }` to avoid iOS Safari edge overflows.
- Decorative snowflakes: on small screens, disable the horizontal shake animation to prevent any off‑viewport translations from creating scrollbars:
  - In `src/styles.css` add a media query `@media (max-width: 640px) { .snowflake { animation-name: snowflakes-fall, none; } }`.
- Gifts list row layout: ensure rows don’t expand horizontally on narrow viewports:
  - Wrap the row container on small screens with `flex-wrap sm:flex-nowrap`.
  - Keep the left content container clamped with `min-w-0` so the title can truncate.
  - Prevent the right action clusters (checkbox or icon buttons) from shrinking the title area with `shrink-0`.

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
    - Inputs: `gifts: Gift[]`, `fillMode: boolean`, `isUpdating: (id: string | null | undefined) => boolean`, `editingId: string | null`, `deletingId: string | null`, `editTitleControl: FormControl<string>`, `editUrlControl: FormControl<string|null>`, `editSubmitting: boolean`, `editTitleInvalid: boolean`, `editError: string | null`
    - Outputs: `toggleFillMode()`, `toggleBought(gift: Gift)`, `startEdit(gift: Gift)`, `cancelEdit()`, `submitEdit()`, `startDelete(gift: Gift)`, `cancelDelete()`, `confirmDelete()`, `reorderMove({ fromIndex: number; toIndex: number })`
    - Notes:
      - Includes a drag handle button at the start of each gift row to support HTML5 drag & drop reordering. Dragging is disabled while in fill mode or during inline editing. Visual feedback: the dragged row becomes semi-transparent and the hovered drop target row is highlighted with a blue ring and background tint; the handle shows a grabbing cursor while active and sets `aria-grabbed="true"`.
      - Action buttons (Edit, Delete, Confirm, Cancel) use a consistent compact icon‑button style: each control is a `32x32` round button (`size-8`) containing a `24px` icon. Hover/focus/disabled states mirror the app theme.
      - Icons use the Material Symbols Outlined web font to keep bundle size small and ensure consistent visuals. Implementation:
        - `src/index.html` includes the Google Fonts stylesheet for Material Symbols Outlined.
        - `src/styles.css` defines the `.material-symbols-outlined` class with appropriate font‑variation settings (`FILL 0, wght 400, GRAD 0, opsz 24`).
        - In templates, use: `<span class="material-symbols-outlined text-2xl" aria-hidden="true">edit</span>` and keep the visible button size with `size-8` and proper color classes (e.g., `text-white`, `text-red-300`).
        - Accessibility: keep `aria-label` on the button and an optional visually hidden text (`sr-only`) for clarity.
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

### Delete a gift with inline confirmation

- From the gifts list (when not in fill mode), each item exposes a Delete action next to Edit.
- Clicking Delete triggers a per-item confirmation state managed by `ListPage` via the signal `deletingGiftId`.
  - While confirming, the usual Edit/Delete controls are replaced with two clear buttons: a green check (Confirm) and a red cross (Cancel).
  - Accessibility: buttons have explicit `aria-label`s like “Confirmer la suppression de …” and “Annuler …”; disabled states reflect ongoing updates.
- Data flow:
  - `GiftsListComponent` emits `startDelete(gift)`, `cancelDelete()`, `confirmDelete()`.
  - `ListPage` handles these:
    - `startDeleteGift(gift)` sets `deletingGiftId`.
    - `cancelDeleteGift()` clears it.
    - `confirmDeleteGift()` calls `ListService.deleteGift(listId, giftId)`, wraps it in the `updating` Set for UI disabling, and clears state afterwards.
- Service:
  - `ListService.deleteGift(listId, giftId)` removes the gift from RTDB at `lists/{listId}/gifts/{giftId}`.

## UX Theme, Tokens, and Utilities

- Location: `src/styles.css` centralizes theme variables and utilities.
- Tokens
  - Brand palette uses a playful gift-inspired scheme (candy pink primary, teal accent, gold highlight) exposed as CSS variables and mapped into Tailwind tokens via `@theme`:
    - `--color-brand-50..900`, `--color-accent-500/600`, `--color-gold-400`.
  - Surfaces and text are accessible in both light and dark modes (`--surface`, `--surface-muted`, `--text`, `--text-muted`).
  - Shape tokens: `--radius-sm|md|lg` are scaled at runtime by `UxService` through `radiusScale`.
  - Focus ring color is aligned with the brand: `--ring`.
- Dark theme
  - The `<html>` element gets class `theme-dark` when the resolved theme is dark; variables swap accordingly. This is controlled by `UxService` (`src/app/ux/ux.config.ts`) which reads `UxConfig.theme` and user media query.
- Density
  - `UxService` writes `data-density` on `:root`. CSS adjusts radii and component paddings for `compact`.
- Motion
  - `UxService` resolves `motion` (`auto | reduce | prefer`) and sets `data-motion` on `:root`. Animations and transforms use motion-safe fallbacks under `:root[data-motion='reduce']`.
- Utilities
  - `@utility card`: base card container (surface, rounded, soft shadow).
  - `@utility card-fancy`, `card-fancy-hover`: gradient border, elevated hover with motion-safe transform.
  - `@utility btn-base`, `btn-primary`, `btn-secondary`, `btn-sm|md|lg` and `btn-shine` (subtle shimmer animation; disabled when `reduce` motion).
  - `@utility input-base`, `input-invalid` for consistent form fields.
  - Decorative helpers opt-in: `confetti` background, `ribbon-underline` for headings.
  - Note: Pseudo-classes/elements like `:hover`, `:active`, and `::after` are applied via plain CSS selectors (e.g., `.btn-primary:hover`) rather than inside `@utility` names to comply with Tailwind v4 utility naming rules (utilities must be alphanumeric and not include `:`).

## Shared UI Components

- Card (`src/app/shared/ui/card/card.ts`)
  - Inputs: `title?: string`, `ariaLabel?: string`, `fancy = false`, `hoverLift = true`, `confetti = false`, `ribbon = true`.
  - Behavior: when `fancy` is true, applies `card-fancy` styling. Optional `hoverLift` adds hover elevation, `confetti` adds a subtle celebratory background, and `ribbon` underlines the header.
  - Accessibility: the root section keeps `role="region"` and forwards `aria-label` when provided.

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
 - Motion respects OS preferences; any decorative animation has a reduce-motion guard.

### Components

- Keep components small and focused on a single responsibility.
- Use `input()` and `output()` functions instead of decorators. The list subcomponents implement this.
- Use `computed()` for derived state when needed.
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component` decorator.
- Always use external templates files co-located with the component TS file.
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
  - URL normalization: when `patch.url` is a non-empty string without a protocol, the service prefixes `https://` before saving. Existing protocols are preserved.
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

## Centralized UX architecture (Tailwind + Angular)

Overview
- TailwindCSS v4 is used for styling. UX tokens (colors, surfaces, text colors, radii) are centralized in `src/styles.css` using CSS variables and Tailwind `@theme` tokens.
- A configurable Angular service (`UxService`) exposes a single source of truth for theme mode, density, motion preference, and radius scaling. It is provided app-wide via `provideUx()` in `app.config.ts`.
- Shared UI components and utilities ensure consistent styling and accessibility across the app.

Files
- `src/styles.css`
  - Imports Tailwind: `@import 'tailwindcss';`
  - Defines CSS variables on `:root` for brand palette (`--brand-50..900`), surfaces (`--surface`, `--surface-muted`), text colors, and radii (`--radius-sm|md|lg`).
  - Defines a `.theme-dark` class to switch tokens for dark mode.
  - Exposes Tailwind v4 tokens via `@theme` mapping, e.g. `--color-brand-600: var(--brand-600);` and `--color-surface: rgb(var(--surface));`.
  - Provides reusable utilities via Tailwind `@utility` for: focus ring (`focus-ring`), cards (`card`), buttons (`btn-base`, `btn-primary`, `btn-secondary`, size variants), inputs (`input-base`, `input-invalid`).
  - Supports density via `:root[data-density='compact']` to adjust radii and paddings.

- `src/app/ux/ux.config.ts`
  - `UxConfig` interface with: `theme: 'auto'|'light'|'dark'`, `density: 'comfortable'|'compact'`, `motion: 'auto'|'reduce'|'prefer'`, `radiusScale`, and optional `brand` overrides.
  - `UX_CONFIG` injection token with `DEFAULT_UX_CONFIG`.
  - `UxService` (provided in root):
    - `init()` applies config to `document.documentElement`: theme class (`.theme-dark`), `data-density`, `data-motion`, scales radii tokens, and applies brand overrides to CSS variables.
    - `update(partial)` merges and reapplies.
  - `provideUx(config?)` returns providers for `UX_CONFIG` and an `APP_INITIALIZER` that runs `UxService.init()` at startup.

- `src/app/app.config.ts`
  - Spreads `...provideUx({ theme: 'auto', density: 'comfortable', motion: 'auto' })` into providers list.

- Shared UI components (standalone)
  - `src/app/shared/ui/button/button.ts` — `<ui-button>`
    - Inputs: `variant: 'primary'|'secondary'`, `size: 'sm'|'md'|'lg'`, `type`, `disabled`.
    - Uses utilities: `btn-base`, `btn-primary`/`btn-secondary`, `btn-sm|md|lg`, and `focus-visible:focus-ring`.
  - `src/app/shared/ui/card/card.ts` — `<ui-card>`
    - Inputs: `title?`, `ariaLabel?`.
    - Uses `card` utility and standard padding.
  - `src/app/shared/ui/input/input.ts` — `uiInput` directive for `<input>`/`<textarea>`
    - Inputs: `size`, `invalid`.
    - Applies `input-base`, size text classes, `focus-visible:focus-ring`, and `input-invalid` when needed.

Usage guidelines
- Theming
  - To force dark mode globally: `ux.update({ theme: 'dark' })` or set initial provideUx config.
  - To follow system preference: use `theme: 'auto'` (default). `UxService` toggles `.theme-dark` automatically.
  - To customize brand color family at runtime:
    ```ts
    ux.update({ brand: { 600: '#0ea5e9' /* cyan-600 */ } });
    ```

- Density
  - Switch to compact: `ux.update({ density: 'compact' })`.
  - Components that rely on `btn-*` or `input-base` automatically adapt.

- Motion
  - Default `auto` respects `prefers-reduced-motion`. Force: `ux.update({ motion: 'reduce' })`.

- Components
  - Buttons:
    ```html
    <ui-button variant="primary" size="md" (clicked)="save()">Save</ui-button>
    <ui-button variant="secondary" size="sm">Cancel</ui-button>
    ```
  - Card:
    ```html
    <ui-card title="Gifts">
      <!-- content -->
    </ui-card>
    ```
  - Inputs:
    ```html
    <input uiInput placeholder="Title" [invalid]="titleCtrl.invalid" />
    <textarea uiInput size="lg"></textarea>
    ```
