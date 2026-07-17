# Architecture Decisions

## ADR-001: Mobile-only release target

The game is designed for smartphone portrait play only. Desktop support is limited to local development and debugging.

## ADR-002: Adapter boundary for Yandex Games SDK

Game systems use `PlatformAdapter` instead of global `ysdk`. This keeps local development independent from the Yandex runtime and prevents SDK calls from leaking into game logic.

## ADR-003: Touch-first input policy

Touch is the acceptance input method. Mouse is only a non-release fallback for local development.

## ADR-004: Data-driven progression and economy

Levels, chapters, tasks, economy, cosmetics, and leaderboards are represented as configuration/contracts first so later stages can add content without hardcoding each level.
