# Economy

## Version 1 scope

The game uses one soft currency: coins.

Content targets:

- 30 levels;
- 3 career chapters;
- about 15 cosmetic balls;
- about 6 cosmetic kits;
- about 6 cosmetic goal effects;
- chapter tasks and optional leaderboard records.

## Principles

- Cosmetics never increase power, accuracy, stamina, or level outcomes.
- Coins are earned through play, chapter tasks, and optional rewarded ads.
- Rewarded ads are never mandatory and rewards are granted only after confirmed completion.
- Purchases and rewards are idempotent: the same event id cannot be consumed twice.
- No loot boxes, no dark patterns, and no external purchases.

## Initial balance rules

- A completed level grants a small guaranteed coin reward.
- Optional tasks grant additional coins once.
- Cosmetic prices grow by chapter but remain reachable through normal play.
- Leaderboards store skill/progression records only and do not grant competitive power.
