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

    scene.dispose();
    engine.dispose();
  });
});
