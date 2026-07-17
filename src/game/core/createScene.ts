import {
  ArcRotateCamera,
  Color3,
  HemisphericLight,
  Mesh,
  MeshBuilder,
  Scene,
  StandardMaterial,
  TransformNode,
  Vector3,
} from '@babylonjs/core';
import type { Engine } from '@babylonjs/core/Engines/engine';
import { createPrototypeFootballers, type Footballer } from '../gameplay/episode';

export interface PrototypeScene extends Scene {
  ball: Mesh;
  trajectoryRoot: TransformNode;
  footballers: Footballer[];
  resetPrototype(): void;
  setBallPath(points: Vector3[]): void;
}

function material(scene: Scene, name: string, color: Color3): StandardMaterial {
  const mat = new StandardMaterial(name, scene);
  mat.diffuseColor = color;
  return mat;
}

export function createGameScene(engine: Engine): PrototypeScene {
  const scene = new Scene(engine) as PrototypeScene;
  scene.clearColor.set(0.53, 0.78, 0.92, 1);

  const camera = new ArcRotateCamera(
    'portrait-camera',
    Math.PI / 2,
    Math.PI / 3.3,
    8.2,
    new Vector3(0, 0.35, 0.35),
    scene,
  );
  camera.attachControl(false);
  camera.fov = 0.72;
  camera.lowerRadiusLimit = 6;
  camera.upperRadiusLimit = 9;

  const light = new HemisphericLight('soft-mobile-light', new Vector3(0, 1, -0.4), scene);
  light.intensity = 0.92;

  const grass = material(scene, 'field-grass-material', new Color3(0.17, 0.55, 0.22));
  const line = material(scene, 'field-line-material', new Color3(0.93, 0.95, 0.88));
  const goalMat = material(scene, 'goal-post-material', new Color3(0.96, 0.96, 0.9));
  const netMat = material(scene, 'temporary-net-material', new Color3(0.65, 0.85, 1));
  netMat.alpha = 0.35;
  const ballMat = material(scene, 'prototype-ball-material', new Color3(1, 1, 1));

  const ground = MeshBuilder.CreateGround(
    'prototype-football-field',
    { width: 6, height: 8.6 },
    scene,
  );
  ground.material = grass;
  for (const x of [-2.75, 2.75]) {
    const side = MeshBuilder.CreateBox(
      `field-side-line-${x}`,
      { width: 0.04, height: 0.02, depth: 8.2 },
      scene,
    );
    side.position.set(x, 0.02, 0);
    side.material = line;
  }
  const goalLine = MeshBuilder.CreateBox(
    'goal-line',
    { width: 2.2, height: 0.02, depth: 0.04 },
    scene,
  );
  goalLine.position.set(0, 0.025, 3.45);
  goalLine.material = line;

  const postL = MeshBuilder.CreateCylinder(
    'left-goal-post',
    { height: 1.35, diameter: 0.08 },
    scene,
  );
  postL.position.set(-1.05, 0.68, 3.5);
  postL.material = goalMat;
  const postR = postL.clone('right-goal-post');
  postR.position.x = 1.05;
  const crossbar = MeshBuilder.CreateBox(
    'goal-crossbar',
    { width: 2.18, height: 0.08, depth: 0.08 },
    scene,
  );
  crossbar.position.set(0, 1.35, 3.5);
  crossbar.material = goalMat;
  const net = MeshBuilder.CreateBox(
    'temporary-goal-net',
    { width: 2.25, height: 1.2, depth: 0.04 },
    scene,
  );
  net.position.set(0, 0.72, 3.72);
  net.material = netMat;

  const marker = MeshBuilder.CreatePolyhedron(
    'stage-1-test-object',
    { type: 1, size: 0.18 },
    scene,
  );
  marker.position.set(-2.4, 0.35, -3.4);
  marker.material = material(scene, 'stage-1-marker-material', new Color3(1, 0.82, 0.18));

  const ball = MeshBuilder.CreateSphere('prototype-ball', { diameter: 0.32, segments: 12 }, scene);
  ball.position.set(0, 0.18, -3.2);
  ball.material = ballMat;
  scene.ball = ball;
  scene.trajectoryRoot = new TransformNode('trajectory-preview-root', scene);
  scene.footballers = createPrototypeFootballers();
  const homeMat = material(scene, 'home-team-temp-kit', new Color3(0.1, 0.35, 1));
  const awayMat = material(scene, 'away-team-temp-kit', new Color3(1, 0.22, 0.12));
  const keeperMat = material(scene, 'keeper-temp-kit', new Color3(0.95, 0.8, 0.1));
  scene.footballers.forEach((player) => {
    const body = MeshBuilder.CreateCylinder(
      `${player.id}-body`,
      { height: 0.62, diameterTop: 0.24, diameterBottom: 0.32 },
      scene,
    );
    body.position.copyFrom(player.position).addInPlaceFromFloats(0, 0.45, 0);
    body.material =
      player.role === 'goalkeeper' ? keeperMat : player.team === 'home' ? homeMat : awayMat;
    const head = MeshBuilder.CreateSphere(
      `${player.id}-head`,
      { diameter: 0.22, segments: 8 },
      scene,
    );
    head.position.copyFrom(player.position).addInPlaceFromFloats(0, 0.88, 0);
    head.material = material(scene, `${player.id}-skin`, new Color3(0.8, 0.56, 0.38));
  });

  scene.setBallPath = (points: Vector3[]): void => {
    scene.trajectoryRoot.getChildMeshes().forEach((mesh) => mesh.dispose());
    points.forEach((point, index) => {
      const dot = MeshBuilder.CreateSphere(
        `trajectory-preview-${index}`,
        { diameter: 0.08, segments: 6 },
        scene,
      );
      dot.position.copyFrom(point);
      dot.material = material(scene, `trajectory-preview-mat-${index}`, new Color3(0.2, 0.85, 1));
      dot.parent = scene.trajectoryRoot;
    });
  };
  scene.resetPrototype = (): void => {
    ball.position.set(0, 0.18, -3.2);
    scene.setBallPath([]);
    camera.setTarget(new Vector3(0, 0.35, 0.35));
  };
  scene.onBeforeRenderObservable.add(() => {
    ball.rotation.y += engine.getDeltaTime() * 0.002;
  });
  return scene;
}
