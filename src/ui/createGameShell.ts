export interface GameShell {
  readonly root: HTMLDivElement;
  readonly canvas: HTMLCanvasElement;
  readonly rotateOverlay: HTMLDivElement;
  setRotateOverlayVisible(visible: boolean): void;
}

export const createGameShell = (mount: HTMLElement): GameShell => {
  const root = document.createElement('div');
  root.className = 'game-shell';

  const canvas = document.createElement('canvas');
  canvas.className = 'game-canvas';
  canvas.setAttribute('aria-label', 'Football 3D gameplay canvas');

  const hud = document.createElement('div');
  hud.className = 'safe-hud';
  hud.innerHTML = `
    <div class="hud-card">Football Career<br />Stage 1 prototype</div>
    <div class="thumb-zone">Проведите пальцем для паса или удара</div>
  `;

  const rotateOverlay = document.createElement('div');
  rotateOverlay.className = 'rotate-overlay';
  rotateOverlay.innerHTML = `
    <div class="rotate-card">
      <h1>Поверните устройство</h1>
      <p>Игра работает только в портретной ориентации.</p>
    </div>
  `;

  root.append(canvas, hud, rotateOverlay);
  mount.replaceChildren(root);

  return {
    root,
    canvas,
    rotateOverlay,
    setRotateOverlayVisible(visible: boolean): void {
      rotateOverlay.classList.toggle('is-visible', visible);
      rotateOverlay.setAttribute('aria-hidden', String(!visible));
    },
  };
};
