# Football Career Mobile

Mobile-only browser 3D football career game prototype for Yandex Games.

## Scope

- Portrait-only mobile game, base aspect ratio 9:16.
- Primary controls: touch gestures with one hand.
- Release targets: Android smartphones, iPhone smartphones, mobile browsers, and the Yandex mobile app.
- Desktop is only a development/debug environment.
- Version 1 content target: 30 levels, 3 career chapters, coins, cosmetic balls/kits/goal effects, tasks, leaderboards, and Yandex Games SDK integration through an adapter.

## Commands

```bash
npm run dev
npm run typecheck
npm run lint
npm run test
npm run e2e
npm run build
```

## Architecture

Game code must never call global `ysdk` directly. Platform features are accessed through `PlatformAdapter`; local development uses `MockPlatformAdapter`.

Source folders:

- `src/game` — Babylon scene and game lifecycle.
- `src/ui` — mobile viewport, safe area, orientation UI.
- `src/services` — browser services and app lifecycle wiring.
- `src/economy` — coins and cosmetic economy configuration.
- `src/progression` — chapters, levels, tasks, and leaderboard contracts.
- `src/platform` — platform adapter interfaces and mock/Yandex boundaries.
- `src/localization` — Russian and English texts.

## Documentation

Project documentation lives in `docs/`:

- `docs/GAME_DESIGN.md`
- `docs/TECH_SPEC.md`
- `docs/ROADMAP.md`
- `docs/ECONOMY.md`
- `docs/YANDEX_CHECKLIST.md`
- `docs/TEST_MATRIX.md`
- `docs/TEST_REPORT.md`
- `docs/BUGS.md`
- `docs/DECISIONS.md`
