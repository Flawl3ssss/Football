import { NullEngine } from '@babylonjs/core/Engines/nullEngine';
import { describe, expect, it } from 'vitest';
import { createGameScene } from '../src/game/core/createScene';

describe('createGameScene', () => {
  it('creates a Babylon scene with camera, light and test object', () => {
    const engine = new NullEngine();
    const scene = createGameScene(engine);

    expect(scene.getCameraByName('portrait-camera')).toBeTruthy();
    expect(scene.getLightByName('soft-mobile-light')).toBeTruthy();
    expect(scene.getMeshByName('stage-1-test-object')).toBeTruthy();

    expect(scene.getMeshByName('prototype-football-field')).toBeTruthy();
    expect(scene.getMeshByName('left-goal-post')).toBeTruthy();
    expect(scene.getMeshByName('right-goal-post')).toBeTruthy();
    expect(scene.getMeshByName('goal-crossbar')).toBeTruthy();
    expect(scene.getMeshByName('background-stands-back-row')).toBeTruthy();
    expect(scene.getMeshByName('left-fictional-ad-board-0')).toBeTruthy();
    expect(scene.getMeshByName('right-fictional-ad-board-0')).toBeTruthy();

    scene.dispose();
    engine.dispose();
  });
});
