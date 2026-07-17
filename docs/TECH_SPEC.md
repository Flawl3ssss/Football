# Technical Specification

## Архитектура

Проект строится на TypeScript strict, Vite и Babylon.js. Игровая логика не обращается к Yandex Games SDK напрямую: весь доступ к платформе идёт через `PlatformAdapter`. Реальная интеграция SDK будет изолирована в `src/platform/yandex`, локальная разработка использует `MockPlatformAdapter`.

## Модули

- `src/game/core` — запуск, Babylon engine/scene, GameState, lifecycle.
- `src/game/gameplay` — будущая футбольная механика, на этапе 1 пустой слой.
- `src/game/levels` — data-driven уровни.
- `src/game/entities` — будущие сущности: мяч, игроки, ворота, препятствия.
- `src/game/animation` — будущие анимации.
- `src/game/camera` — портретная 9:16 композиция камеры.
- `src/ui` — DOM-оболочка, экран поворота, ошибки запуска.
- `src/economy` — баланс монет, цены, косметика.
- `src/progression` — сохранения, задания, достижения, миграции.
- `src/services` — viewport, lifecycle, системные блокировки.
- `src/platform` — интерфейс PlatformAdapter.
- `src/platform/mock` — mock без реального SDK.
- `src/platform/yandex` — будущий SDK-адаптер.
- `src/localization` — русский и английский языки.

## GameState

Минимальные состояния этапа 1:

- `booting` — приложение запускается.
- `ready` — сцена готова.
- `playing` — главный цикл активен.
- `paused` — пауза из-за visibility/blur/orientation/ad.
- `error` — безопасно показана ошибка запуска.

## Формат данных уровней

Будущий уровень описывается данными, без кода внутри уровня:

```ts
interface LevelDefinition {
  id: string;
  chapter: 1 | 2 | 3;
  order: number;
  durationSeconds: number;
  decisions: number;
  objective: 'pass' | 'shot' | 'combo' | 'curve';
  starThresholds: [number, number, number];
}
```

В первой версии должно быть 30 уровней в 3 главах. На этапе 1 уровни не реализуются.

## PlatformAdapter

Адаптер должен покрывать:

- инициализацию платформы;
- язык;
- `LoadingAPI.ready()` после полной загрузки;
- `GameplayAPI.start()` и `GameplayAPI.stop()` только в реальные моменты геймплея;
- паузу и восстановление;
- рекламу в логических паузах;
- rewarded-награды как дополнительные;
- локальные и облачные сохранения;
- лидерборды;
- авторизацию только по осознанной кнопке.

## Производительность и мобильность

- Mobile-only: Android, iPhone, мобильные браузеры и мобильное приложение Яндекса.
- Портретная ориентация и 9:16 композиция.
- Dynamic viewport, safe area, отсутствие системного скролла и swipe-to-refresh.
- Целевой размер сборки до 50 МБ, обязательный максимум Яндекс Игр — 100 МБ.
- Никаких необработанных ошибок консоли.
- Не накапливать обработчики при resize/orientationchange/visibilitychange.

## Stage 2 technical additions

- `src/game/gameplay/trajectory.ts` содержит чистую deterministic-логику: обработка 2D-жеста, сглаживание, упрощение, clamp длины, преобразование в 3D, fixed timestep simulation и исходы `goal`, `miss`, `post`, `crossbar`, `out`.
- `src/game/gameplay/pointerInput.ts` — единый PointerInput поверх pointer events с active pointer lock, игнорированием лишних пальцев, `pointercancel`/`touchcancel` и blur/visibility cancellation.
- `src/game/gameplay/episode.ts` — state machine подготовленного интерактивного эпизода и временная логика футболистов: маршруты, получатель паса, зона перехвата, реакция вратаря.
- `src/game/core/createScene.ts` создаёт поле, ворота, временную сетку, мяч, preview-точки траектории и low-poly футболистов из Babylon primitives.
