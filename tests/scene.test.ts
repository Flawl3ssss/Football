import { ArcRotateCamera } from '@babylonjs/core';
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

  it('configures the gameplay camera with fixed mobile controls', () => {
    const engine = new NullEngine();
    const scene = createGameScene(engine);
    const camera = scene.getCameraByName('portrait-camera');

    expect(camera).toBeInstanceOf(ArcRotateCamera);
    const gameplayCamera = camera as ArcRotateCamera;

    expect(gameplayCamera.lowerAlphaLimit).toBeCloseTo(gameplayCamera.alpha - 0.3);
    expect(gameplayCamera.upperAlphaLimit).toBeCloseTo(gameplayCamera.alpha + 0.3);
    expect(gameplayCamera.lowerBetaLimit).toBe(gameplayCamera.upperBetaLimit);
    expect(gameplayCamera.lowerBetaLimit).toBeCloseTo(gameplayCamera.beta);
    expect(gameplayCamera.lowerRadiusLimit).toBe(gameplayCamera.upperRadiusLimit);
    expect(gameplayCamera.lowerRadiusLimit).toBeCloseTo(gameplayCamera.radius);
    expect(gameplayCamera.inputs.attachedToElement).toBe(false);

    scene.dispose();
    engine.dispose();
  });
});
