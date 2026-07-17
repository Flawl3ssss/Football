import type { Disposable } from './mobileGuards';

export type OrientationMode = 'portrait' | 'landscape';

export interface ViewportSnapshot {
  width: number;
  height: number;
  orientation: OrientationMode;
}

export function getViewportSnapshot(win: Window = window): ViewportSnapshot {
  const width = win.visualViewport?.width ?? win.innerWidth;
  const height = win.visualViewport?.height ?? win.innerHeight;
  return { width, height, orientation: height >= width ? 'portrait' : 'landscape' };
}

export function watchViewport(
  onChange: (snapshot: ViewportSnapshot) => void,
  win: Window = window,
): Disposable {
  let frame = 0;
  const emit = (): void => {
    if (frame) win.cancelAnimationFrame(frame);
    frame = win.requestAnimationFrame(() => {
      const snapshot = getViewportSnapshot(win);
      win.document.documentElement.style.setProperty('--app-height', `${snapshot.height}px`);
      onChange(snapshot);
    });
  };

  emit();
  win.addEventListener('resize', emit);
  win.addEventListener('orientationchange', emit);
  win.visualViewport?.addEventListener('resize', emit);

  return {
    dispose(): void {
      if (frame) win.cancelAnimationFrame(frame);
      win.removeEventListener('resize', emit);
      win.removeEventListener('orientationchange', emit);
      win.visualViewport?.removeEventListener('resize', emit);
    },
  };
}
