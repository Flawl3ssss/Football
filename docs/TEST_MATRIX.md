# Test Matrix

## Supported release platforms

The release target is mobile-only.

Required platform coverage:

- Android smartphone;
- iPhone smartphone;
- Yandex Browser on Android;
- Chrome on Android;
- Safari on iOS;
- Yandex mobile app;
- mobile browser embedded in Yandex Games;
- portrait tablet as adaptive secondary support.

Desktop layout testing is not required for release acceptance. Desktop may be used only for local development and debugging.

## Screen and orientation coverage

Test these screen classes:

- base 9:16 smartphone portrait;
- 9:19.5 smartphone portrait;
- 9:20 smartphone portrait;
- narrow smartphone portrait;
- small smartphone portrait;
- smartphone with notch or safe area insets;
- portrait tablet.

Orientation scenarios:

- initial launch in portrait;
- switch from portrait to landscape;
- verify gameplay pauses in landscape;
- verify rotate-device message is visible in landscape;
- return from landscape to portrait;
- verify gameplay and UI recover correctly.

## Input coverage

Primary acceptance uses touch or touch emulation.

Required input checks:

- `touchstart` begins a trajectory;
- pointer movement updates the trajectory;
- pointer release resolves the decision once;
- `touchcancel` cancels safely;
- repeated taps do not duplicate actions;
- extra fingers are ignored while a trajectory is active;
- multi-touch does not zoom or break gameplay where preventable;
- long press does not open a disruptive context menu in gameplay;
- no gameplay action depends on hover;
- right-click is not required;
- mouse works only as a development fallback when enabled locally.

## Mobile browser UI coverage

Check that:

- safe area is respected;
- the game uses full available viewport height;
- UI adapts when mobile browser chrome changes height;
- gameplay does not require page scrolling;
- system scroll is disabled inside gameplay;
- swipe-to-refresh is prevented where possible;
- text selection is disabled on gameplay UI;
- important buttons are large enough for touch;
- important actions are reachable one-handed.

## Lifecycle coverage

Required scenarios:

- app minimization;
- screen lock;
- incoming system dialog;
- focus loss;
- focus restore;
- network loss;
- network restore;
- ad start;
- ad close;
- rewarded ad confirmed;
- rewarded ad not completed;
- return from advertisement;
- pause and resume from orientation change.

## Performance coverage

Mobile performance checks:

- typical smartphone targets stable 60 FPS;
- weak supported smartphone targets stable 30 FPS minimum;
- automatic quality selection works;
- resolution scale is reduced on weak devices;
- shadow/effect quality can be reduced under low FPS;
- no heavy post-processing is enabled by default;
- memory remains stable during a long session;
- repeated effects use pooling;
- future chapters are not preloaded unnecessarily;
- build size stays below Yandex limit and internal target.

## Regression coverage

Every stage must re-check completed critical behavior:

- progress is not lost;
- duplicate rewards are not issued;
- duplicate gameplay events are ignored;
- pause and resume do not corrupt gameplay state;
- resize and orientation changes do not break UI;
- console has no unhandled errors in normal scenarios.
