export interface AppShell {
  root: HTMLElement;
  canvas: HTMLCanvasElement;
  orientationOverlay: HTMLElement;
  status: HTMLElement;
  error: HTMLElement;
  resetButton: HTMLButtonElement;
  startButton: HTMLButtonElement;
  retryButton: HTMLButtonElement;
  nextButton: HTMLButtonElement;
  pauseButton: HTMLButtonElement;
  resumeButton: HTMLButtonElement;
  screenPanel: HTMLElement;
  hint: HTMLElement;
  debugPanel: HTMLElement;
  setLandscape(isLandscape: boolean): void;
  setStatus(text: string): void;
  setHint(text: string): void;
  showScreen(
    kind: 'start' | 'victory' | 'defeat' | 'pause' | 'hidden',
    title?: string,
    text?: string,
  ): void;
  showError(text: string): void;
  setDebug(text: string): void;
}

export function createShell(root: HTMLElement): AppShell {
  root.innerHTML = `
    <main class="app-shell" aria-label="Карьерный путь: футбольная дуга">
      <canvas id="game-canvas" aria-label="Игровая 3D-сцена"></canvas>
      <section class="hud" aria-live="polite">
        <p class="status">Загрузка уровня...</p>
        <p class="hint">Проведи пальцем по экрану</p>
        <div class="hud-actions">
          <button class="pause-button" type="button">Пауза</button>
          <button class="reset-button" type="button">Сброс</button>
        </div>
        <pre class="debug-panel" hidden></pre>
      </section>
      <section class="screen-panel" data-screen="start">
        <div class="screen-card">
          <strong class="screen-title">Первый пас</strong>
          <span class="screen-text">Короткое обучение, пас и удар по воротам.</span>
          <div class="screen-actions">
            <button class="start-button" type="button">Начать</button>
            <button class="resume-button" type="button" hidden>Продолжить</button>
            <button class="retry-button" type="button" hidden>Повтор</button>
            <button class="next-button" type="button" hidden>Дальше</button>
          </div>
        </div>
      </section>
      <section class="orientation-overlay" hidden>
        <div class="orientation-card">
          <strong>Поверните устройство</strong>
          <span>Игра работает в портретной ориентации 9:16.</span>
        </div>
      </section>
      <section class="error-panel" hidden role="alert"></section>
    </main>
  `;

  const canvas = root.querySelector<HTMLCanvasElement>('#game-canvas');
  const orientationOverlay = root.querySelector<HTMLElement>('.orientation-overlay');
  const status = root.querySelector<HTMLElement>('.status');
  const hint = root.querySelector<HTMLElement>('.hint');
  const error = root.querySelector<HTMLElement>('.error-panel');
  const resetButton = root.querySelector<HTMLButtonElement>('.reset-button');
  const startButton = root.querySelector<HTMLButtonElement>('.start-button');
  const retryButton = root.querySelector<HTMLButtonElement>('.retry-button');
  const nextButton = root.querySelector<HTMLButtonElement>('.next-button');
  const pauseButton = root.querySelector<HTMLButtonElement>('.pause-button');
  const resumeButton = root.querySelector<HTMLButtonElement>('.resume-button');
  const screenPanel = root.querySelector<HTMLElement>('.screen-panel');
  const debugPanel = root.querySelector<HTMLElement>('.debug-panel');
  const screenTitle = root.querySelector<HTMLElement>('.screen-title');
  const screenText = root.querySelector<HTMLElement>('.screen-text');

  if (
    !canvas ||
    !orientationOverlay ||
    !status ||
    !hint ||
    !error ||
    !resetButton ||
    !startButton ||
    !retryButton ||
    !nextButton ||
    !pauseButton ||
    !resumeButton ||
    !screenPanel ||
    !debugPanel ||
    !screenTitle ||
    !screenText
  )
    throw new Error('App shell template is invalid');
  if (import.meta.env?.DEV === true) debugPanel.hidden = false;

  const buttons = { startButton, retryButton, nextButton, resumeButton };
  return {
    root,
    canvas,
    orientationOverlay,
    status,
    error,
    resetButton,
    startButton,
    retryButton,
    nextButton,
    pauseButton,
    resumeButton,
    screenPanel,
    hint,
    debugPanel,
    setLandscape(isLandscape: boolean): void {
      orientationOverlay.hidden = !isLandscape;
      root.dataset.orientation = isLandscape ? 'landscape' : 'portrait';
    },
    setStatus(text: string): void {
      status.textContent = text;
    },
    setHint(text: string): void {
      hint.textContent = text;
    },
    showScreen(kind, title = '', text = ''): void {
      screenPanel.hidden = kind === 'hidden';
      screenPanel.dataset.screen = kind;
      if (title) screenTitle.textContent = title;
      if (text) screenText.textContent = text;
      buttons.startButton.hidden = kind !== 'start';
      buttons.retryButton.hidden = kind !== 'victory' && kind !== 'defeat';
      buttons.nextButton.hidden = kind !== 'victory';
      buttons.resumeButton.hidden = kind !== 'pause';
    },
    showError(text: string): void {
      error.hidden = false;
      error.textContent = text;
    },
    setDebug(text: string): void {
      debugPanel.textContent = text;
    },
  };
}
