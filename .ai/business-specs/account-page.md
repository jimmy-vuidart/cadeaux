# Account Page

URL: /account

This page allows users to manage their personal information and preferences.

## Look & feel
- The account page welcomes the user with a friendly, gift-themed ambiance.
- Buttons feel lively and inviting, with a subtle festive shine on hover and clear focus highlights.
- Sections are presented inside friendly, rounded cards. Some areas may use a celebratory style (gradient edges, confetti background) when appropriate to mark special moments like "Update Profile".

## User Experience

### Personal Information Section
- Displays the user's current display name.
- Provides an option to edit the display name.
- Shows success or error messages for user actions.

### Edit Mode
- When the user clicks the "Modifier" button, the display name field becomes editable.
- The user can save the changes by clicking the "Sauvegarder" button or cancel by clicking the "Annuler" button.
- While saving, the "Sauvegarder" button shows a loading state.

### View Mode
- Displays the user's display name in a non-editable field.
- Shows a "Modifier" button to allow the user to edit the display name.
- If the display name is not set, it shows "Non défini".

### Success and Error Messages
- Success messages are displayed when the user successfully updates their display name.
- Error messages are displayed when there is an issue loading or saving the user's information.
- Success messages are automatically cleared after 3 seconds.

## Technical Details

### Data Loading
- The user's information is loaded when the component is initialized.
- The loading state is shown while the user's information is being fetched.

### Data Saving
- The user's display name is saved using Firebase's `updateProfile` function.
- The user's information is reloaded after a successful update to ensure the latest data is displayed.

### Form Validation
- The display name field is required and cannot be empty.
- The display name is trimmed before saving to remove any leading or trailing whitespace.
