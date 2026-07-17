export interface AppShell {
  root: HTMLElement;
  canvas: HTMLCanvasElement;
  orientationOverlay: HTMLElement;
  status: HTMLElement;
  error: HTMLElement;
  resetButton: HTMLButtonElement;
  debugPanel: HTMLElement;
  gestureHint: HTMLElement;
  setLandscape(isLandscape: boolean): void;
  setStatus(text: string): void;
  showGestureError(reason?: string): void;
  clearGestureError(): void;
  showError(text: string): void;
  setDebug(text: string): void;
}

export function createShell(root: HTMLElement): AppShell {
  root.innerHTML = `
    <main class="app-shell" aria-label="Карьерный путь: футбольная дуга">
      <div class="game-zone">
        <canvas id="game-canvas" aria-label="Игровая 3D-сцена"></canvas>
        <p class="gesture-hint" aria-live="polite" hidden></p>
      </div>
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
  const gestureHint = root.querySelector<HTMLElement>('.gesture-hint');
  const debugPanel = root.querySelector<HTMLElement>('.debug-panel');

  if (
    !canvas ||
    !orientationOverlay ||
    !status ||
    !error ||
    !resetButton ||
    !gestureHint ||
    !debugPanel
  )
    throw new Error('App shell template is invalid');
  if (import.meta.env?.DEV === true) debugPanel.hidden = false;

  let gestureHintTimer: number | undefined;
  const hintByReason = (reason?: string): string => {
    if (!reason) return 'Проведи длиннее';
    if (reason.includes('мяч')) return 'Начни от мяча';
    if (reason.includes('длиннее') || reason.includes('корот')) return 'Проведи длиннее';
    if (reason.includes('партн')) return 'Пасуй в сторону партнёра';
    if (reason.includes('ворот') || reason.includes('траекторию')) return 'Веди палец к воротам';
    return reason;
  };
  const clearGestureHintTimer = (): void => {
    if (gestureHintTimer !== undefined) window.clearTimeout(gestureHintTimer);
    gestureHintTimer = undefined;
  };

  return {
    root,
    canvas,
    orientationOverlay,
    status,
    error,
    resetButton,
    debugPanel,
    gestureHint,
    setLandscape(isLandscape: boolean): void {
      orientationOverlay.hidden = !isLandscape;
      root.dataset.orientation = isLandscape ? 'landscape' : 'portrait';
    },
    setStatus(text: string): void {
      status.textContent = text;
    },
    showGestureError(reason?: string): void {
      clearGestureHintTimer();
      gestureHint.hidden = false;
      gestureHint.textContent = hintByReason(reason);
      root.classList.remove('gesture-error-flash');
      void root.offsetWidth;
      root.classList.add('gesture-error-flash');
      gestureHintTimer = window.setTimeout(() => {
        gestureHint.hidden = true;
        root.classList.remove('gesture-error-flash');
      }, 1600);
    },
    clearGestureError(): void {
      clearGestureHintTimer();
      gestureHint.hidden = true;
      gestureHint.textContent = '';
      root.classList.remove('gesture-error-flash');
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
