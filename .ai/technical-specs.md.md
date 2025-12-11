# Project structure

- This app uses Firebase Realtime Database via AngularFire for data storage.
- This app use TailwindCSS for styling.

## File structure

- All main pages are stored in the `src/app/pages` folder.
  - Any component who is exclusive to a page should be stored in the same folder as the page. (ex: a 'Gift' component for the 'GiftPage' should be stored in the same folder as the 'GiftPage', inside a subfolder for the component)
- All shared features across all app (auth systems, data models, etc.) should be stored in the `src/app/shared` folder, with subfolders for each element type.

### Gift List page subcomponents

- Path: `src/app/pages/list/components/`
  - `list-header/` (`ListHeaderComponent`): Displays the page title and a Share button.
    - Inputs: `title: string`, `sharing: boolean`
    - Outputs: `share()`
  - `gifts-list/` (`GiftsListComponent`): Renders the list of gifts and the fill-mode UI.
    - Inputs: `gifts: Gift[]`, `fillMode: boolean`, `isUpdating: (id: string | null | undefined) => boolean`
    - Outputs: `toggleFillMode()`, `toggleBought(gift: Gift)`
  - `add-gift-form/` (`AddGiftFormComponent`): Form to add a gift with validation and error message.
    - Inputs: `titleControl: FormControl<string>`, `urlControl: FormControl<string|null>`, `submitting: boolean`, `titleInvalid: boolean`, `error: string | null`
    - Outputs: `submit()`
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
