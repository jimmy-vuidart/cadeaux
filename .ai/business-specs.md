# Cadeaux VUIDART

This app is a very small app, dedicated for my family, to handle the gift lists

## Home page

This page will simply display a page describing quickly the app, and allow with a button to create a new gift list

### Look & feel
- The home page welcomes the family with a joyful, gift‑themed ambiance.
- Buttons feel lively and inviting, with a subtle festive shine on hover and clear focus highlights.
- Sections are presented inside friendly, rounded cards. Some areas may use a celebratory style (gradient edges, confetti background) when appropriate to mark special moments like “Create a list”.

## Gift list page

URL : /lists/<id>

On this page, the user will be able to view all gifts added to the list, and add new gift. By default, the user only sees the gifts with no additional informations.

On the list, a button will allow to pass the list in "fill" mode. This mode is a "spoiler", allowing everyone else to pick a gift as "bought already" using a check list.

When enabling the "fill" mode, the app MUST ask for confirmation to avoid spoilers using a custom in-app modal (not the browser native confirm). The modal warns that enabling this mode will reveal which gifts are already bought. If the list is intended for the current user (recipient), they risk being spoiled. The user must confirm to proceed; otherwise the mode stays disabled.

### Mobile experience
- The app is fully usable on smartphones. Content adapts to small screens without horizontal scrolling.
- Primary actions become full‑width buttons on mobile to make them easy to tap.
- Dialogs fit the screen height and scroll internally when content is long, so confirmations are readable and accessible on phones.

### UI structure (subcomponents)

The gift list page is organized into clear sections, each managed by a focused subcomponent (no change in features, only structure):

- Header: shows the list title and the Share button.
- Gifts list: shows all gifts, with a toggle for the fill mode and a checkbox per gift in fill mode. A drag handle at the start of each gift allows reordering the list by drag & drop (disabled while in fill mode or when editing a gift).
  - Reordering provides clear visual feedback: the dragged row becomes semi‑transparent and the potential drop target row is highlighted.
- Each gift has an Edit action (when not in fill mode) to change the title and optional URL. The edition form opens inline just under the concerned gift item.
- Each gift has Edit and Delete actions (when not in fill mode). Deleting asks for confirmation: the usual actions are temporarily replaced with two clear buttons — a green check to confirm deletion and a red cross to cancel — to avoid accidental removals.
  - The Edit action is displayed as a small pen icon button to keep the interface clean and familiar.
  - All action buttons for a gift (edit, delete, confirm, cancel) share the same compact form factor for visual consistency: a small round button of equal size with a clear, familiar icon inside. Icons remain legible in both light and dark themes and each button has an accessible label for screen readers.
- Add gift form: inputs to add a new gift (title and optional URL) with validation and error message.
- Share toast: transient confirmation message for share/copy actions.

### Visual identity and tone
- Friendly and celebratory: soft candy pinks, teal accents, and a touch of gold to evoke ribbons and wrapping paper.
- Light and Dark themes are both supported; the design keeps its playful personality in either mode.
- Motion is kept delightful but subtle; when a device prefers reduced motion, animations calm down automatically.

### Partage d’une liste

- Un bouton « Partager » est disponible sur la page d’une liste.
- Sur smartphone/navigateur compatible, l’application utilise l’API Web Share pour ouvrir les options de partage du système.
- Sur desktop/PC, si le partage natif n’est pas disponible, l’URL de la liste est copiée dans le presse‑papiers.
- Un message bref confirme l’action (ou propose de copier manuellement en cas d’échec).
- Ce message est présenté dans un toast en bas de l’écran, qui apparaît/disparaît avec une légère animation et se ferme automatiquement après quelques secondes (respect du « reduced motion » quand activé).


### Gifts URL (optional)

- When adding a gift, the user can optionally provide a URL to the product/page.
- When a gift has a URL, its title is displayed as a clickable link that opens in a new tab.
- When no URL is provided, the title is shown as plain text.
 - Convenience: if the user types a URL without a protocol (e.g., `amazon.com/item`), the app automatically saves it with `https://` so the link works correctly.

### Edit a gift

- From the gifts list, an Edit button appears on each item when the list is not in fill mode.
- Clicking Edit opens a small edition form inline below the selected gift. The form mirrors the add form fields and validation.
- Editing lets the user change:
  - Title (required, max 200 chars)
  - URL (optional). Leaving the URL empty removes it from the gift.
- Actions: Save and Cancel. Save applies changes immediately; Cancel closes the form without changes.

### List creation and IDs

- When creating a new list, the list ID used in the URL is derived from the provided title.
- The ID is the title transformed into kebab-case (lowercase, spaces and non-alphanumeric characters replaced by dashes, diacritics removed).
- If the resulting ID already exists, a numeric suffix is appended (e.g., `ma-liste`, `ma-liste-2`, `ma-liste-3`, ...).
- This guarantees stable, human-readable URLs like `/lists/anniversaire-julie`.

## App UX customization and consistency

Overview
- The app’s user experience (UX) is centrally configurable. Product owners can tune the visual theme, component density, and motion preferences without touching page code.

What can be customized
- Theme mode: Choose between automatic (follows device), light, or dark.
- Brand colors: Adjust the brand palette to match identity.
- Density: Choose comfortable or compact layout to fit more items on screen if needed.
- Motion: Respect device preferences and optionally reduce or prefer motion.
- Shape: Adjust the global roundness of UI elements.

Shared UI building blocks
- Buttons: Primary and secondary buttons with consistent states and accessibility.
- Cards: Standard container for sections and panels. Cards can optionally be presented in a more festive style to highlight important actions or sections (e.g., gradient border, ribbon underline for titles, or a subtle confetti background).
- Inputs: Text inputs and textareas styled consistently across the app.

Principles
- Consistency: All pages share the same look‑and‑feel through shared components and tokens.
- Accessibility: Focus states are clearly visible; motion respects user preferences.
- Brandability: Key visual aspects (colors, density, shape) can be changed from a central place.

How teams use it
- Configure the global UX in one place (no page‑by‑page tweaking).
- Compose pages using shared UI components (Button, Card, Inputs) for consistent behavior and appearance.

## A more fancy and fun experience
- The interface embraces a gift‑giving spirit with cheerful colors, playful highlights, and light celebratory details that can be enabled where they add joy (e.g., confetti for success messages or a ribbon underline on headings).
- The experience remains practical and family‑friendly: readable, fast, and inclusive, with strong contrast and clear interactions.
