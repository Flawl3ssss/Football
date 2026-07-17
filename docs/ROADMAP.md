# Roadmap

## Project direction

The project is a mobile-only portrait football career game for Yandex Games. All future stages must prioritize smartphones, touch controls, safe area handling, portrait orientation, and mobile performance.

Desktop release support is cancelled. Desktop may be used only as a development/debug environment.

## Stage 0: project foundation

- Confirm mobile-only product requirements.
- Set up strict TypeScript, Vite, Babylon.js, Vitest, Playwright, ESLint, and Prettier.
- Create base app shell with portrait-only mobile viewport handling.
- Add `PlatformAdapter`, `MockPlatformAdapter`, and Yandex adapter boundary.
- Add documentation and QA checklist files.

## Stage 1: mobile shell and platform lifecycle

- Implement full-height portrait canvas.
- Add safe area aware UI layout.
- Disable gameplay in landscape and show rotate-device overlay.
- Handle `resize`, `orientationchange`, focus loss, pause, and resume.
- Add initial Yandex lifecycle adapter calls behind interfaces.
- Add tests for mobile viewport and orientation behavior.

## Stage 2: touch gesture prototype

- Implement one-finger trajectory drawing.
- Support `touchstart`, pointer movement, pointer release, and `touchcancel`.
- Ignore additional fingers during active gestures.
- Prevent duplicate action resolution.
- Keep mouse only as local development fallback.
- Add deterministic gesture unit tests and Playwright mobile-touch checks.

## Stage 3: first playable episode

- Create a simple low-poly scene in Babylon.js.
- Add one data-driven football situation.
- Resolve a pass or shot automatically after gesture completion.
- Use fixed timestep where outcome depends on simulation.
- Add mobile performance guardrails.

## Stage 4: progression, saves, and economy

- Add versioned save schema and migrations.
- Add coins as the only soft currency.
- Add idempotent reward and purchase handling.
- Save progress after significant actions.
- Add regression tests for duplicate rewards and save recovery.

## Stage 5: content expansion

- Expand to 30 levels across 3 career chapters.
- Add cosmetic balls, kits, and goal effects.
- Keep cosmetics non-pay-to-win.
- Load assets by chapter and avoid unnecessary preloading.

## Stage 6: Yandex readiness and mobile QA

- Verify the latest official Yandex Games requirements before integration sign-off.
- Check mobile app, mobile browsers, Android, and iOS.
- Confirm portrait orientation setting for the Yandex Games draft.
- Run build size checks and performance audits.
