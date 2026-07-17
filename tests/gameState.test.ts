import { describe, expect, it } from 'vitest';
import { GameState } from '../src/game/core/gameState';

describe('GameState', () => {
  it('pauses and resumes deterministically by reason', () => {
    const state = new GameState();
    state.markReady();
    state.start();
    expect(state.getPhase()).toBe('playing');

    state.pause('visibility');
    state.pause('orientation');
    expect(state.getPhase()).toBe('paused');
    expect(state.getPauseReasons()).toEqual(['visibility', 'orientation']);

    state.resume('visibility');
    expect(state.getPhase()).toBe('paused');
    state.resume('orientation');
    expect(state.getPhase()).toBe('playing');
  });
});
