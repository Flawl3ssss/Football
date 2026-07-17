import { describe, expect, it } from 'vitest';
import {
  createPointerInput,
  createPrototypeFootballers,
  createTrajectoryPlan,
  defenderIntercepts,
  EpisodeStateMachine,
  keeperReaction,
  resolveEpisode,
} from '../src/game/gameplay';
const viewport = { width: 390, height: 844 };
const plan = createTrajectoryPlan({
  points: [
    { x: 195, y: 610 },
    { x: 195, y: 300 },
  ],
  viewport,
});

describe('episode automatic play prototype', () => {
  it('allows valid state machine transitions', () => {
    const sm = new EpisodeStateMachine();
    sm.transition('AwaitInput');
    sm.transition('Simulating');
    sm.transition('Success');
    expect(sm.getState()).toBe('Success');
  });
  it('rejects invalid transitions', () => {
    const sm = new EpisodeStateMachine();
    expect(() => sm.transition('Success')).toThrow();
  });
  it('selects defender interception zones', () =>
    expect(defenderIntercepts(plan, createPrototypeFootballers())).toBe(false));
  it('resolves successful pass receiver metadata', () =>
    expect(resolveEpisode(plan, 'goal').receiverId).toBe('home-wing'));
  it('chooses goalkeeper reaction', () =>
    expect(['hold', 'left-dive', 'right-dive', 'jump']).toContain(keeperReaction(plan)));
  it('resolves goal and miss outcomes', () => {
    expect(resolveEpisode(plan, 'goal').outcome).toBe('goal');
    expect(resolveEpisode(plan, 'miss').outcome).toBe('miss');
  });
  it('pauses and resumes during simulation', () => {
    const sm = new EpisodeStateMachine();
    sm.transition('AwaitInput');
    sm.transition('Simulating');
    sm.pause();
    expect(sm.getState()).toBe('Paused');
    sm.resume();
    expect(sm.getState()).toBe('Simulating');
  });
  it('restarts cleanly', () => {
    const sm = new EpisodeStateMachine();
    sm.transition('AwaitInput');
    sm.transition('Simulating');
    sm.transition('Fail');
    sm.transition('Setup');
    sm.transition('AwaitInput');
    expect(sm.getState()).toBe('AwaitInput');
  });
  it('survives ten sequential restarts', () => {
    const sm = new EpisodeStateMachine();
    for (let i = 0; i < 10; i += 1) {
      sm.reset();
      sm.transition('AwaitInput');
    }
    expect(sm.getState()).toBe('AwaitInput');
  });
});

describe('pointer input guards', () => {
  it('cancels active gestures on pointercancel/touchcancel', () => {
    const el = document.createElement('canvas');
    let cancelled = 0;
    createPointerInput(el, {
      onPreview: () => undefined,
      onComplete: () => undefined,
      onCancel: () => {
        cancelled += 1;
      },
    });
    el.dispatchEvent(
      new PointerEvent('pointerdown', {
        pointerId: 1,
        pointerType: 'touch',
        clientX: 1,
        clientY: 1,
      }),
    );
    el.dispatchEvent(new PointerEvent('pointercancel', { pointerId: 1, pointerType: 'touch' }));
    expect(cancelled).toBe(1);
  });
  it('ignores extra touches while a gesture is active', () => {
    const el = document.createElement('canvas');
    let completed = 0;
    createPointerInput(el, {
      onPreview: () => undefined,
      onComplete: () => {
        completed += 1;
      },
      onCancel: () => undefined,
    });
    el.dispatchEvent(
      new PointerEvent('pointerdown', {
        pointerId: 1,
        pointerType: 'touch',
        clientX: 1,
        clientY: 1,
      }),
    );
    el.dispatchEvent(
      new PointerEvent('pointerdown', {
        pointerId: 2,
        pointerType: 'touch',
        clientX: 2,
        clientY: 2,
      }),
    );
    el.dispatchEvent(
      new PointerEvent('pointerup', { pointerId: 2, pointerType: 'touch', clientX: 2, clientY: 2 }),
    );
    expect(completed).toBe(0);
  });
  it('keeps gesture data valid through resize and focus loss cancellation', () => {
    const el = document.createElement('canvas');
    let cancelled = 0;
    createPointerInput(el, {
      onPreview: () => undefined,
      onComplete: () => undefined,
      onCancel: () => {
        cancelled += 1;
      },
    });
    el.dispatchEvent(
      new PointerEvent('pointerdown', {
        pointerId: 1,
        pointerType: 'touch',
        clientX: 1,
        clientY: 1,
      }),
    );
    window.dispatchEvent(new Event('resize'));
    window.dispatchEvent(new Event('blur'));
    expect(cancelled).toBe(1);
  });
});
