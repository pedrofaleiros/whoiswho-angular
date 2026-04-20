import { runBootstrapIfEnabled } from './bootstrap';

export function startMain(
  run = runBootstrapIfEnabled,
  win: Window & typeof globalThis = window,
) {
  return run(win);
}

startMain();
