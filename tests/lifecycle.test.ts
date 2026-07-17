import { describe, expect, it } from 'vitest';
import { GameState } from '../src/game/core/gameState';
import { watchLifecycle } from '../src/services/lifecycleService';

describe('lifecycle service', () => {
  it('pauses and resumes on blur/focus', () => {
    const state = new GameState();
    state.markReady();
    state.start();
    const watcher = watchLifecycle(state, window);

    window.dispatchEvent(new Event('blur'));
    expect(state.getPhase()).toBe('paused');

    window.dispatchEvent(new Event('focus'));
    expect(state.getPhase()).toBe('playing');

    watcher.dispose();
  });

  it('pauses and resumes on visibilitychange', () => {
    const state = new GameState();
    state.markReady();
    state.start();
    const watcher = watchLifecycle(state, window);

    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    document.dispatchEvent(new Event('visibilitychange'));
    expect(state.getPhase()).toBe('paused');

    Object.defineProperty(document, 'hidden', { configurable: true, value: false });
    document.dispatchEvent(new Event('visibilitychange'));
    expect(state.getPhase()).toBe('playing');

    watcher.dispose();
  });
});
