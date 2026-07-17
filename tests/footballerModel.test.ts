import { NullEngine } from '@babylonjs/core/Engines/nullEngine';
import { describe, expect, it } from 'vitest';
import { createGameScene } from '../src/game/core/createScene';

function meshMaterialName(
  scene: ReturnType<typeof createGameScene>,
  meshName: string,
): string | undefined {
  return scene.getMeshByName(meshName)?.material?.name;
}

describe('footballer low-poly models', () => {
  it('builds visible body parts for each footballer', () => {
    const engine = new NullEngine();
    const scene = createGameScene(engine);

    for (const player of scene.footballers) {
      expect(scene.getTransformNodeByName(`${player.id}-model`)).toBeTruthy();
      expect(scene.getMeshByName(`${player.id}-body`)).toBeTruthy();
      expect(scene.getMeshByName(`${player.id}-head`)).toBeTruthy();
      expect(scene.getMeshByName(`${player.id}-left-leg`)).toBeTruthy();
      expect(scene.getMeshByName(`${player.id}-right-leg`)).toBeTruthy();
      expect(scene.getMeshByName(`${player.id}-left-arm`)).toBeTruthy();
      expect(scene.getMeshByName(`${player.id}-right-arm`)).toBeTruthy();
    }

    scene.dispose();
    engine.dispose();
  });

  it('uses separate team, goalkeeper and glove materials', () => {
    const engine = new NullEngine();
    const scene = createGameScene(engine);

    expect(meshMaterialName(scene, 'home-striker-body')).toBe('home-kit-shirt-blue');
    expect(meshMaterialName(scene, 'away-defender-body')).toBe('away-kit-shirt-red');
    expect(meshMaterialName(scene, 'keeper-body')).toBe('goalkeeper-kit-shirt-yellow');
    expect(meshMaterialName(scene, 'keeper-left-glove')).toBe('goalkeeper-kit-gloves-white');
    expect(meshMaterialName(scene, 'keeper-right-glove')).toBe('goalkeeper-kit-gloves-white');

    expect(meshMaterialName(scene, 'home-striker-body')).not.toBe(
      meshMaterialName(scene, 'away-defender-body'),
    );
    expect(meshMaterialName(scene, 'keeper-body')).not.toBe(
      meshMaterialName(scene, 'away-defender-body'),
    );

    scene.dispose();
    engine.dispose();
  });
});
