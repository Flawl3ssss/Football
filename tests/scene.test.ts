import { NullEngine } from '@babylonjs/core/Engines/nullEngine';
import { describe, expect, it } from 'vitest';
import { createGameScene, getBallScreenPosition } from '../src/game/core/createScene';

describe('createGameScene', () => {
  it('creates a Babylon scene with camera, light and test object', () => {
    const engine = new NullEngine();
    const scene = createGameScene(engine);

    expect(scene.getCameraByName('portrait-camera')).toBeTruthy();
    expect(scene.getLightByName('soft-mobile-light')).toBeTruthy();
    expect(scene.getMeshByName('stage-1-test-object')).toBeTruthy();
    expect(scene.getMeshByName('ball-start-zone-hint')).toBeTruthy();

    scene.dispose();
    engine.dispose();
  });

  it('reprojects the ball after resize', () => {
    const engine = new NullEngine();
    engine.setSize(390, 844);
    const scene = createGameScene(engine);
    scene.render();

    const portrait = getBallScreenPosition(scene, { width: 390, height: 844 });
    engine.setSize(430, 932);
    scene.render();
    const resized = getBallScreenPosition(scene, { width: 430, height: 932 });

    expect(resized.x).not.toBeCloseTo(portrait.x);
    expect(resized.y).not.toBeCloseTo(portrait.y);

    scene.dispose();
    engine.dispose();
  });

  it('reprojects the ball after orientation changes', () => {
    const engine = new NullEngine();
    engine.setSize(390, 844);
    const scene = createGameScene(engine);
    scene.render();

    const portrait = getBallScreenPosition(scene, { width: 390, height: 844 });
    engine.setSize(844, 390);
    scene.render();
    const landscape = getBallScreenPosition(scene, { width: 844, height: 390 });

    expect(landscape.x).not.toBeCloseTo(portrait.x);
    expect(landscape.y).not.toBeCloseTo(portrait.y);

    scene.dispose();
    engine.dispose();
  });
});
