# Test Report

## Шаблон этапа

- Этап:
- Дата:
- Сборка/commit:
- Проверяющий:

### Команды

| Команда             | Результат | Комментарий |
| ------------------- | --------: | ----------- |
| `npm run typecheck` |           |             |
| `npm run lint`      |           |             |
| `npm run test`      |           |             |
| `npm run e2e`       |           |             |
| `npm run build`     |           |             |
| `npm run preview`   |           |             |

### Mobile QA

| Проверка                     | Результат | Комментарий |
| ---------------------------- | --------: | ----------- |
| Несколько мобильных viewport |           |             |
| Portrait                     |           |             |
| Landscape заглушка           |           |             |
| Safe area                    |           |             |
| Resize/orientationchange     |           |             |
| visibilitychange/blur/focus  |           |             |
| Нет системного скролла       |           |             |
| Нет накопления обработчиков  |           |             |
| Консоль без ошибок           |           |             |

## Этап 1 — 2026-07-17

### Результат

Документация, аудит, технический каркас, unit/e2e тесты и production build подготовлены. Футбольная механика не реализована.

### Команды

| Команда             | Результат | Комментарий                                                                                                          |
| ------------------- | --------: | -------------------------------------------------------------------------------------------------------------------- |
| `npm run typecheck` |      pass | TypeScript strict без ошибок                                                                                         |
| `npm run lint`      |      pass | ESLint без ошибок                                                                                                    |
| `npm run test`      |      pass | Unit-тесты пройдены                                                                                                  |
| `npm run e2e`       |      pass | Playwright smoke пройден                                                                                             |
| `npm run build`     |      pass | Production build создан; Vite предупредил о крупном Babylon.js chunk, общий `dist` около 5.9 МБ и ниже лимита 100 МБ |
| `npm run preview`   |      pass | Preview проверен через Playwright smoke на portrait, landscape и отсутствие скролла                                  |

### Ограничения

Физические Android/iPhone устройства и реальное мобильное приложение Яндекса в контейнере недоступны. Они остаются обязательными для этапов перед публикацией.

## Этап 2 — Trajectory + automatic episode prototype

Дата: 2026-07-17.

### Проверено

- Мяч: короткий/длинный жест, сглаживание, ограничение длины, прямая/кривая траектория, deterministic result, goal/post/crossbar/miss.
- Ввод: touch-first PointerInput, mouse для локальной разработки, лишние касания, `pointercancel`, `touchcancel`, resize во время жеста, blur/focus cancellation.
- Эпизод: Setup → AwaitInput → Simulating → Success/Fail, пауза во время симуляции, рестарт, 10 последовательных рестартов, отсутствие дублирования обработчиков в unit-сценарии.
- FPS: deterministic outcomes проверены для 30, 60 и нестабильного 47 FPS в unit-тестах.
- Mobile smoke: Playwright проверяет портрет, landscape-заглушку, отсутствие console errors и системного скролла.

### Ограничения окружения

- Реальные Android/iPhone и мобильное приложение Яндекса в контейнере недоступны.
- Визуальная сетка ворот временная и будет заменена оригинальным ассетом на следующих этапах.
