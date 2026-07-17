# Technical Specification

## Stack

Required stack:

- TypeScript in strict mode;
- Babylon.js;
- Vite;
- Vitest;
- Playwright;
- ESLint;
- Prettier;
- glTF/GLB for 3D assets;
- isolated Yandex Games SDK adapter;
- local `MockPlatformAdapter` for development.

## Platform policy

The project is mobile-only for release.

Primary runtime targets:

- Android smartphones;
- iPhone smartphones;
- mobile browsers;
- Yandex mobile app.

Desktop layout is not a release requirement. Desktop can be used only for development convenience and automated debugging. Mouse input is a fallback for Codex/local development, not an acceptance target.

## Orientation handling

The game supports portrait orientation only.

Implementation requirements:

- base layout is 9:16;
- support tall smartphone ratios such as 9:19.5 and 9:20;
- use full viewport height without deforming the 3D scene;
- handle `resize` and `orientationchange`;
- pause gameplay in landscape orientation;
- show a clear rotate-device overlay in landscape;
- resume safely after returning to portrait;
- update safe area layout after viewport changes.

## Input system

Primary input is touch.

Requirements:

- support one-handed swipe gestures for pass and shot trajectories;
- handle `touchstart`, pointer movement, pointer release, and `touchcancel`;
- track one active pointer during a trajectory;
- ignore additional fingers until the active gesture is finished or cancelled;
- prevent duplicate processing from repeated taps or repeated end events;
- do not require keyboard controls;
- do not require hover states;
- do not use right-click interactions;
- keep mouse support only as a development fallback.

## Mobile browser behavior

The app shell must:

- respect safe area insets;
- use dynamic viewport sizing suitable for mobile browsers;
- prevent unwanted system scroll during gameplay;
- prevent swipe-to-refresh inside the game area where possible;
- prevent text selection on game UI;
- prevent disruptive long-press context menus;
- reduce accidental zoom risk;
- keep buttons large enough for touch.

## Architecture

Game logic must not access global `ysdk` directly.

Platform integration is isolated behind a shared `PlatformAdapter` interface:

- local development uses `MockPlatformAdapter`;
- Yandex integration lives only in `src/platform/yandex`;
- ads, rewarded ads, saves, language, focus, and pause signals are routed through the adapter.

Additional rules:

- levels are data-driven;
- economy and balance live in configuration;
- saves include a schema version and migrations;
- rewards, purchases, and ad callbacks are idempotent;
- one event cannot be applied twice;
- gameplay outcomes are deterministic for the same state and gesture;
- fixed timestep is used where physics affects outcomes.

## Yandex Games SDK requirements

Before integration, implementation must be checked against current official Yandex Games requirements.

Required behavior:

- SDK initializes correctly;
- `LoadingAPI.ready()` is called only after the game is fully ready;
- `GameplayAPI.start()` and `GameplayAPI.stop()` match the real gameplay state;
- sound and gameplay stop during ads, pause, focus loss, app backgrounding, and blocking dialogs;
- the game works without mandatory authorization;
- authorization is requested only after an explicit user action;
- progress is saved after significant actions;
- ads are called only through Yandex Games SDK;
- ads appear only in logical pauses;
- rewarded rewards are optional and issued only after confirmed completion;
- `index.html` is at the archive root;
- file names contain no spaces or Cyrillic characters;
- unpacked build size stays below 100 MB, with an internal target below 50 MB.

## Mobile performance requirements

Optimization is focused on mobile devices:

- target 60 FPS on a typical smartphone;
- minimum stable 30 FPS on a weak supported smartphone;
- automatic quality selection;
- capped resolution scale on weak devices;
- reduced shadows and effects under low FPS;
- no heavy post-effects in the first version;
- compressed textures for production assets;
- pooling for repeated objects;
- no unnecessary preloading of future chapters;
- monitor memory and long-session stability during QA.
