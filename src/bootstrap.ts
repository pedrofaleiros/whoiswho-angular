import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

export const bootstrapDeps = {
  bootstrapApplication,
};

export function bootstrapApp(
  bootstrap = bootstrapDeps.bootstrapApplication,
) {
  return bootstrap(AppComponent, appConfig)
    .catch((err) => console.error(err));
}

export function runBootstrapIfEnabled(
  win: Window & typeof globalThis = window,
  bootstrap = bootstrapDeps.bootstrapApplication,
) {
  if (!(win as any).__skipBootstrap) {
    return bootstrapApp(bootstrap);
  }

  return Promise.resolve();
}
