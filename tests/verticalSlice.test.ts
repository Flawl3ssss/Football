/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { describe, expect, it } from 'vitest';
import { levels } from '../src/game/levels';
import { VerticalSliceController, type VerticalSliceProfile } from '../src/game/gameplay';

const viewport = { width: 390, height: 844 };
const pass = [
  { x: 195, y: 610 },
  { x: 195, y: 520 },
];
const goal = [
  { x: 195, y: 610 },
  { x: 195, y: 300 },
];
const miss = [
  { x: 195, y: 610 },
  { x: 335, y: 300 },
];
const newSlice = (
  profile: VerticalSliceProfile = { tutorialCompleted: false, wins: 0, losses: 0 },
) => new VerticalSliceController(levels[0]!, profile);

describe('first vertical slice', () => {
  it('shows tutorial once and then remembers it', () => {
    const profile = { tutorialCompleted: false, wins: 0, losses: 0 };
    const slice = newSlice(profile);
    expect(slice.start().phase).toBe('Tutorial');
    expect(slice.completeGesture(pass, viewport).phase).toBe('FirstDecision');
    expect(profile.tutorialCompleted).toBe(true);
    expect(newSlice(profile).start().phase).toBe('FirstDecision');
  });
  it('plays pass then shot to victory', () => {
    const slice = newSlice({ tutorialCompleted: true, wins: 0, losses: 0 });
    expect(slice.start().phase).toBe('FirstDecision');
    expect(slice.completeGesture(pass, viewport).phase).toBe('AutoPass');
    expect(slice.completeAuto().phase).toBe('SecondDecision');
    expect(slice.completeGesture(goal, viewport).phase).toBe('AutoShot');
    expect(slice.completeAuto().phase).toBe('Victory');
  });
  it('supports interception/defeat on bad first decision', () => {
    const profile = { tutorialCompleted: true, wins: 0, losses: 0 };
    const slice = newSlice(profile);
    slice.start();
    expect(slice.completeGesture(goal, viewport).phase).toBe('Defeat');
    expect(profile.losses).toBe(1);
  });
  it('supports miss defeat on second decision', () => {
    const slice = newSlice({ tutorialCompleted: true, wins: 0, losses: 0 });
    slice.start();
    slice.completeGesture(pass, viewport);
    slice.completeAuto();
    expect(slice.completeGesture(miss, viewport).phase).toBe('Defeat');
  });
  it('handles ten sequential restarts', () => {
    const slice = newSlice({ tutorialCompleted: true, wins: 0, losses: 0 });
    for (let i = 0; i < 10; i += 1) {
      expect(slice.retry().phase).toBe('StartScreen');
      expect(slice.start().phase).toBe('FirstDecision');
    }
  });
  it('handles multiple wins and losses', () => {
    const profile = { tutorialCompleted: true, wins: 0, losses: 0 };
    for (let i = 0; i < 3; i += 1) {
      const slice = newSlice(profile);
      slice.start();
      slice.completeGesture(pass, viewport);
      slice.completeAuto();
      slice.completeGesture(goal, viewport);
      slice.completeAuto();
    }
    for (let i = 0; i < 2; i += 1) {
      const slice = newSlice(profile);
      slice.start();
      slice.completeGesture(miss, viewport);
    }
    expect(profile.wins).toBe(3);
    expect(profile.losses).toBe(2);
  });
  it('pauses and resumes from waiting and simulated flight', () => {
    const slice = newSlice({ tutorialCompleted: true, wins: 0, losses: 0 });
    slice.start();
    expect(slice.pause().phase).toBe('Paused');
    expect(slice.resume().phase).toBe('FirstDecision');
    slice.completeGesture(pass, viewport);
    expect(slice.pause().phase).toBe('Paused');
    expect(slice.resume().phase).toBe('AutoPass');
  });
  it('handles touchcancel style cancellation without changing phase', () => {
    const slice = newSlice({ tutorialCompleted: true, wins: 0, losses: 0 });
    slice.start();
    expect(slice.cancelGesture().phase).toBe('FirstDecision');
  });
  it('ignores rapid next/retry button style calls safely', () => {
    const slice = newSlice({ tutorialCompleted: true, wins: 0, losses: 0 });
    expect(slice.next().phase).toBe('StartScreen');
    expect(slice.retry().phase).toBe('StartScreen');
    expect(slice.retry().phase).toBe('StartScreen');
  });
});
