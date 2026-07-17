export interface Disposable {
  dispose(): void;
}

export function applyMobileGuards(target: Document = document): Disposable {
  const prevent = (event: Event): void => event.preventDefault();
  const preventMultiTouch = (event: TouchEvent): void => {
    if (event.touches.length > 1) event.preventDefault();
  };

  target.addEventListener('contextmenu', prevent);
  target.addEventListener('selectstart', prevent);
  target.addEventListener('gesturestart', prevent);
  target.addEventListener('touchmove', preventMultiTouch, { passive: false });

  return {
    dispose(): void {
      target.removeEventListener('contextmenu', prevent);
      target.removeEventListener('selectstart', prevent);
      target.removeEventListener('gesturestart', prevent);
      target.removeEventListener('touchmove', preventMultiTouch);
    },
  };
}
