# Game Design: mobile-only football career

## Product direction

This project is a standalone stylized low-poly 3D football career game for mobile Yandex Games publishing.

The game is inspired by the broad genre of interactive football episodes, but it must not copy names, interface, assets, characters, levels, texts, uniforms, clubs, or visual identity of existing games.

## Target platform

The game is developed and accepted as a mobile-only product.

Supported publishing targets:

- Android smartphones;
- iPhone smartphones;
- mobile browsers;
- Yandex Browser on Android;
- Safari on iOS;
- Chrome on Android;
- Yandex mobile app.

Tablet portrait screens are supported adaptively, but the primary design target is a smartphone held in one hand.

Desktop is not a supported publishing platform. Mouse input may exist only as a local development fallback.

## Orientation and screen composition

- Orientation: portrait only.
- Base composition: 9:16.
- The football field and gameplay canvas use the full available viewport.
- 9:19.5 and 9:20 smartphone screens are supported without stretching the scene.
- Safe area insets are respected on devices with notches, rounded corners, and system bars.
- If the device switches to landscape, gameplay stops and the player sees a clear request to rotate the device back to portrait.
- After returning to portrait orientation, the game resumes safely from the paused state.

## Core loop

1. The player opens a short football episode.
2. The player draws a pass or shot trajectory with a finger.
3. After the gesture ends, the episode resolves automatically.
4. The player receives coins, task progress, and career progress.
5. Between levels, the player spends coins on cosmetic items and checks chapter goals.

A level should last approximately 20-60 seconds and include 1-4 meaningful decisions.

## Core mechanics

The first version supports data-driven football episodes with:

- passes;
- crosses;
- shots;
- free kicks;
- penalties;
- headers.

The game is not a full football simulator. It is a sequence of readable, deterministic football situations designed for quick mobile sessions.

## Career scope

Version 1 contains 30 levels across 3 career chapters. Chapters contain tasks such as completing levels, scoring from specific situations, collecting coins, or finishing a streak of decisions.

Leaderboards are optional Yandex Games records for non-pay-to-win achievements such as completed levels, total goals, and best chapter score.

## Gesture controls

Primary input is touch.

Rules:

- all core actions must be possible with one hand;
- pass and shot are performed by swiping a finger across the screen;
- gestures handle `touchstart`, `pointermove`, `pointerup`, and `touchcancel`;
- extra fingers are ignored while the active trajectory is being drawn;
- accidental multi-touch must not duplicate actions;
- repeated taps must not process the same decision twice;
- hover, right-click, and keyboard input are not required gameplay controls;
- mouse input is only a development aid for local testing.

## Mobile UI rules

- Gameplay UI must not require scrolling.
- System page scroll must be disabled inside the game.
- Swipe-to-refresh must be prevented during gameplay.
- Text selection must be disabled for interactive UI.
- Long-press context menus must be prevented where they can interrupt play.
- Accidental browser zoom gestures should be prevented as much as web platform rules allow.
- Buttons must be large enough for touch input.
- Important controls are placed in the lower thumb-friendly area when possible.
- UI must react correctly to mobile browser viewport height changes.

## Economy and content scope for version 1

Version 1 content target:

- 30 levels;
- 3 career chapters;
- chapter tasks;
- Yandex Games leaderboards;
- about 15 balls;
- about 6 kits;
- about 6 goal effects;
- one soft currency: coins.

Cosmetics do not improve power, accuracy, or level outcomes.

## Economy principles

- Coins are earned through normal play and tasks.
- Cosmetics are optional.
- No loot boxes.
- No mandatory ads.
- Rewarded ads are optional and only grant an additional reward after confirmed completion through the platform adapter.
- Rewards, purchases, and ad callbacks must be idempotent.

## Determinism and fairness

- The same gesture in the same gameplay state must produce the same outcome.
- Physics-sensitive decisions use a fixed timestep where needed.
- A gameplay event cannot be processed twice.
- Progress must not be lost after significant actions.

## Performance target

The main optimization target is mobile hardware.

- Target: stable 60 FPS on a typical smartphone.
- Minimum acceptable result: stable 30 FPS on a weak supported smartphone.
- Graphics quality is selected automatically.
- Resolution scale is limited on weak devices.
- Shadow and effect quality can be reduced when FPS is low.
- Heavy post-processing is avoided.
- Asset loading is staged by chapter; future chapters are not preloaded unnecessarily.
- Pooling is used for repeated gameplay objects and effects.
