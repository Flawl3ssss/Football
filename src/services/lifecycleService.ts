import type { GameState } from '../game/core/gameState';
import type { Disposable } from './mobileGuards';

export function watchLifecycle(gameState: GameState, win: Window = window): Disposable {
  const doc = win.document;
  const handleVisibility = (): void => {
    if (doc.hidden) gameState.pause('visibility');
    else gameState.resume('visibility');
  };
  const handleBlur = (): void => gameState.pause('blur');
  const handleFocus = (): void => gameState.resume('blur');

  doc.addEventListener('visibilitychange', handleVisibility);
  win.addEventListener('blur', handleBlur);
  win.addEventListener('focus', handleFocus);

  return {
    dispose(): void {
      doc.removeEventListener('visibilitychange', handleVisibility);
      win.removeEventListener('blur', handleBlur);
      win.removeEventListener('focus', handleFocus);
    },
  };
}
