# Yandex Games Checklist

## Current project direction

The game is prepared for mobile-only publication on Yandex Games.

Draft settings must use portrait orientation. Desktop is not a supported publication target for this project.

## Official requirements verification

Before SDK integration and before release, check the current official Yandex Games requirements:

https://yandex.ru/dev/games/doc/ru/concepts/requirements

## SDK lifecycle

- SDK initializes correctly through the isolated Yandex adapter.
- Game code does not access global `ysdk` directly.
- `LoadingAPI.ready()` is called only after all launch-critical resources are ready.
- `GameplayAPI.start()` is called only when real gameplay starts.
- `GameplayAPI.stop()` is called when gameplay pauses or stops.
- Gameplay and sound pause during ads.
- Gameplay and sound pause on focus loss, app backgrounding, blocking system dialogs, and landscape orientation.
- Gameplay restores safely after focus returns and portrait orientation is restored.

## Authorization and saves

- The game works without mandatory authorization.
- Authorization is requested only after a clear user action.
- Progress is saved after significant actions.
- Save data has a schema version and migrations.
- Save recovery is tested after reload and app backgrounding.

## Ads and rewards

- Ads are called only through Yandex Games SDK.
- Ads are shown only in logical pauses.
- Rewarded ads are optional.
- Rewarded rewards are issued only after confirmed viewing.
- Reward handling is idempotent.
- Repeated callbacks do not duplicate rewards.
- Ad return resumes the game only when the lifecycle state allows it.

## Mobile-only requirements

- The project targets Android smartphones, iPhones, mobile browsers, and the Yandex mobile app.
- Portrait orientation is required.
- Landscape orientation pauses gameplay and shows a rotate-device message.
- The game recovers correctly after returning to portrait.
- Touch is the primary control method.
- All gameplay is possible with one hand.
- Hover, keyboard, right-click, and desktop layout are not required for release.
- Mouse input is only a local development fallback.

## Mobile UI and browser behavior

- Safe area insets are respected.
- The game uses the full available mobile viewport height.
- UI handles mobile browser chrome height changes.
- Gameplay does not require scrolling.
- System scroll is disabled inside gameplay.
- Swipe-to-refresh is prevented inside the game where possible.
- Text selection is disabled on gameplay UI.
- Long-press context menu is prevented where it can interrupt gameplay.
- Accidental zoom gestures are reduced as much as possible.
- Buttons are large enough for touch.

## Input and lifecycle checks

- `touchstart` is handled.
- Pointer movement is handled.
- Pointer release is handled.
- `touchcancel` is handled.
- Extra fingers are ignored during active trajectory drawing.
- Duplicate taps and repeated events do not process an action twice.
- `orientationchange` and `resize` are handled.
- App minimization, screen lock, incoming dialogs, network loss, and ad return are tested.

## Build package

- `index.html` is at the root of the archive.
- File names contain no spaces.
- File names contain no Cyrillic characters.
- Unpacked build size is below 100 MB.
- Internal project target is below 50 MB.
- Production assets do not use protected third-party materials.
- The game is not a complete or partial copy of another game.
