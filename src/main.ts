import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { isDevMode } from '@angular/core';

// Improve development stack traces: enable long async stack traces and deeper limits
if (isDevMode()) {
  // Increase stack depth in dev for clearer traces.
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  Error.stackTraceLimit = 100;
}

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
