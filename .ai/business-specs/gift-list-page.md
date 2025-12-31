# Gift List Page

URL : /lists/<id>

On this page, the user will be able to view all gifts added to the list, and add new gift. By default, the user only sees the gifts with no additional informations.

On the list, a button will allow to pass the list in "fill" mode. This mode is a "spoiler", allowing everyone else to pick a gift as "bought already" using a check list.

When enabling the "fill" mode, the app MUST ask for confirmation to avoid spoilers using a custom in-app modal (not the browser native confirm). The modal warns that enabling this mode will reveal which gifts are already bought. If the list is intended for the current user (recipient), they risk being spoiled. The user must confirm to proceed; otherwise the mode stays disabled.

## Mobile experience
- The app is fully usable on smartphones. Content adapts to small screens without horizontal scrolling.
- Primary actions become full‑width buttons on mobile to make them easy to tap.
- Dialogs fit the screen height and scroll internally when content is long, so confirmations are readable and accessible on phones.
- Decorative animations are tuned for stability on phones to avoid accidental horizontal scrolling.
- Cards on the gift list fit the screen width on phones; long titles wrap neatly without breaking the layout.
- In the gifts list, action buttons (edit/delete or the checkbox in fill mode) remain aligned on the right; the gift title wraps on multiple lines before the actions when needed.

## UI structure (subcomponents)

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

## Visual identity and tone
- Friendly and celebratory: soft candy pinks, teal accents, and a touch of gold to evoke ribbons and wrapping paper.
- Light and Dark themes are both supported; the design keeps its playful personality in either mode.
- Motion is kept delightful but subtle; when a device prefers reduced motion, animations calm down automatically.

## Partage d’une liste

- Un bouton « Partager » est disponible sur la page d’une liste.
- Sur smartphone/navigateur compatible, l’application utilise l’API Web Share pour ouvrir les options de partage du système.
- Sur desktop/PC, si le partage natif n’est pas disponible, l’URL de la liste est copiée dans le presse‑papiers.
- Un message bref confirme l’action (ou propose de copier manuellement en cas d’échec).
- Ce message est présenté dans un toast en bas de l’écran, qui apparaît/disparaît avec une légère animation et se ferme automatiquement après quelques secondes (respect du « reduced motion » quand activé).

## Gifts URL (optional)

- When adding a gift, the user can optionally provide a URL to the product/page.
- When a gift has a URL, its title is displayed as a clickable link that opens in a new tab.
- When no URL is provided, the title is shown as plain text.
 - Convenience: if the user types a URL without a protocol (e.g., `amazon.com/item`), the app automatically saves it with `https://` so the link works correctly.

## Edit a gift

- From the gifts list, an Edit button appears on each item when the list is not in fill mode.
- Clicking Edit opens a small edition form inline below the selected gift. The form mirrors the add form fields and validation.
- Editing lets the user change:
  - Title (required, max 200 chars)
  - URL (optional). Leaving the URL empty removes it from the gift.
- Actions: Save and Cancel. Save applies changes immediately; Cancel closes the form without changes.

## List creation and IDs

- When creating a new list, the list ID used in the URL is derived from the provided title.
- The ID is the title transformed into kebab-case (lowercase, spaces and non-alphanumeric characters replaced by dashes, diacritics removed).
- If the resulting ID already exists, a numeric suffix is appended (e.g., `ma-liste`, `ma-liste-2`, `ma-liste-3`, ...).
- This guarantees stable, human-readable URLs like `/lists/anniversaire-julie`.

## User Experience

### For List Owners
- Displays a toggle button to show/hide the add gift form.
- When the add gift form is visible, users can add a new gift with a title and optional URL.
- Users can edit and delete gifts from the list.
- Users can reorder gifts using drag and drop.
- Users can toggle the fill mode to mark gifts as bought.

### For Non-Owners
- Displays the list of gifts without the ability to add, edit, or delete gifts.
- Users can toggle the fill mode to mark gifts as bought if the list owner has enabled it.
- Users cannot reorder gifts.

### Fill Mode
- When fill mode is enabled, users can mark gifts as bought by checking a checkbox.
- A confirmation modal is shown when enabling fill mode to prevent spoilers.
- The modal warns that enabling fill mode will reveal which gifts are already bought.

### Sharing
- Users can share the list using the share button in the header.
- On mobile devices, the native share API is used if available.
- On desktop devices, the list URL is copied to the clipboard.
- A toast message confirms the share action.
