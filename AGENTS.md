# Repository Guidelines

## Project Structure & Module Organization
This repository contains a single Angular 17 application. Main source lives in `src/`. Route screens are under `src/app/pages`, reusable UI under `src/app/components`, HTTP/socket/auth logic under `src/app/services`, and shared contracts under `src/app/models` and `src/app/types`. Environment settings live in `src/environment/environment*.ts`; static files live in `src/assets`. Build output is generated in `dist/whoiswho-app/`.

## Build, Test, and Development Commands
- `npm install`: installs dependencies, including the headless Chrome used by tests.
- `npm start`: runs `ng serve --host 0.0.0.0` for local development.
- `npm run build`: creates a production build in `dist/whoiswho-app`.
- `npm run watch`: rebuilds continuously with the development configuration.
- `npm test`: runs the Jasmine/Karma suite once in headless Chrome.
- `npm run test:watch`: runs tests in watch mode while developing.
- `npm run test:coverage`: prints per-file coverage in the terminal and writes HTML coverage reports to `coverage/whoiswho-app/`.

The repository also includes a `Dockerfile` for containerized builds.

## Coding Style & Naming Conventions
Follow `.editorconfig`: 2-space indentation, UTF-8, final newline, and no trailing whitespace. Prefer single quotes in TypeScript. Keep Angular file names conventional: `*.component.ts`, `*.service.ts`, `*.guard.ts`, `*.spec.ts`. Classes use `PascalCase`; properties, methods, and observables use `camelCase`.

This codebase uses standalone Angular components and Angular's `inject(...)` pattern in several places. Match the surrounding style instead of introducing alternate patterns. Keep strict TypeScript settings intact.

## Testing Guidelines
Tests use Jasmine + Karma with Puppeteer-backed headless Chrome. Add specs near the feature area they cover; current examples include `src/app/services/auth.service.spec.ts` and `src/app/pages/auth-pages.spec.ts`. Prefer grouped specs for closely related components/pages when it keeps setup simple. Keep coverage at 100% for statements, branches, functions, and lines, and cover failure paths and storage/socket edge cases explicitly.

## Commit & Pull Request Guidelines
Recent history uses short commit messages such as `wake up server`, `change ws backend`, and `FIX`. Keep commits brief and imperative, but more specific than that baseline, for example `room: handle missing local player state`.

PRs should include a short description, linked issue if applicable, test notes, and screenshots for visible UI changes. Flag any environment or backend dependency changes clearly, especially updates to API or WebSocket endpoints.

## Configuration Notes
Do not commit secrets. When editing `src/environment/environment.ts` or `src/environment/environment.prod.ts`, verify API and socket URLs together so local and production behavior remain aligned. If test tooling changes, keep `karma.conf.cjs`, `angular.json`, and `package.json` in sync.
