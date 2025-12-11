# CadeauxVuidart

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.0.3.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## CI/CD: Deploy to Firebase Hosting

This repository includes a GitHub Actions workflow to build and deploy the application to Firebase Hosting on demand.

### Prerequisites

- Create a Firebase project if you don't have one yet.
- In your GitHub repository settings, add the following Secrets:
  - `FIREBASE_TOKEN`: A CI token from Firebase. Generate it locally with:
    ```bash
    npx firebase-tools login:ci
    ```
  - `FIREBASE_PROJECT_ID`: Your Firebase project ID (e.g., `my-project-id`).

The workflow expects the Angular build output at `dist/cadeaux-vuidart/browser` (configured in `firebase.json`).

### Triggering a Deployment

1. Go to GitHub → Actions → "Build and Deploy to Firebase Hosting".
2. Click "Run workflow".
3. Optionally set the `environment` input to a Firebase project ID if you want to override the `FIREBASE_PROJECT_ID` secret for this run (useful for staging vs production).

### Implementation Details

- Workflow file: `.github/workflows/firebase-hosting.yml`
- Build: `npm ci` then `npm run build`
- Deploy: `firebase deploy --only hosting --project <projectId>` using the provided token

### Firebase Hosting Config

`firebase.json` is set to:

```json
{
  "hosting": {
    "public": "dist/cadeaux-vuidart/browser",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      { "source": "**", "destination": "/index.html" }
    ]
  }
}
```

This serves the Angular single-page app and rewrites all routes to `index.html`.
