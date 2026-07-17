export interface AppShell {
  root: HTMLElement;
  canvas: HTMLCanvasElement;
  orientationOverlay: HTMLElement;
  status: HTMLElement;
  error: HTMLElement;
  resetButton: HTMLButtonElement;
  debugPanel: HTMLElement;
  setLandscape(isLandscape: boolean): void;
  setStatus(text: string): void;
  showError(text: string): void;
  setDebug(text: string): void;
}

export function createShell(root: HTMLElement): AppShell {
  root.innerHTML = `
    <main class="app-shell" aria-label="Карьерный путь: футбольная дуга">
      <canvas id="game-canvas" aria-label="Игровая 3D-сцена"></canvas>
      <section class="hud" aria-live="polite">
        <p class="status">Загрузка каркаса...</p>
        <button class="reset-button" type="button">Сброс</button>
        <pre class="debug-panel" hidden></pre>
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
  const error = root.querySelector<HTMLElement>('.error-panel');
  const resetButton = root.querySelector<HTMLButtonElement>('.reset-button');
  const debugPanel = root.querySelector<HTMLElement>('.debug-panel');

  if (!canvas || !orientationOverlay || !status || !error || !resetButton || !debugPanel)
    throw new Error('App shell template is invalid');
  if (import.meta.env?.DEV === true) debugPanel.hidden = false;

  return {
    root,
    canvas,
    orientationOverlay,
    status,
    error,
    resetButton,
    debugPanel,
    setLandscape(isLandscape: boolean): void {
      orientationOverlay.hidden = !isLandscape;
      root.dataset.orientation = isLandscape ? 'landscape' : 'portrait';
    },
    setStatus(text: string): void {
      status.textContent = text;
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
