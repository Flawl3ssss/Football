# Bugs

## Known defects

No known Blocker or Critical product defects in the Stage 1 source files.

## Environment blockers

- Dependency installation is blocked in this container: `npm install` receives `403 Forbidden` from `https://registry.npmjs.org/@babylonjs%2fcore` through the configured proxy. Because of this, Vitest, Playwright, and Vite runtime checks cannot execute here.

## Open QA risks

- Real-device mobile FPS and heating are not yet measured because Stage 1 only provides a technical skeleton.
- Real Yandex Games SDK calls are not enabled yet; only adapter boundaries and mock behavior exist.
- Real Android/iOS browser testing remains required in later stages.
