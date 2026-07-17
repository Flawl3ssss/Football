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

function createFlatBox(
  scene: Scene,
  name: string,
  size: { width: number; height: number; depth: number },
  position: Vector3,
  mat: StandardMaterial,
): Mesh {
  const box = MeshBuilder.CreateBox(name, size, scene);
  box.position.copyFrom(position);
  box.material = mat;
  return box;
}

function createSkyGradient(scene: Scene): void {
  const skyBottom = material(scene, 'sky-gradient-horizon-material', new Color3(0.62, 0.82, 0.94));
  const skyTop = material(scene, 'sky-gradient-zenith-material', new Color3(0.26, 0.5, 0.86));

  createFlatBox(
    scene,
    'low-poly-sky-gradient-horizon',
    { width: 18, height: 3.2, depth: 0.04 },
    new Vector3(0, 2.25, 6.25),
    skyBottom,
  );
  createFlatBox(
    scene,
    'low-poly-sky-gradient-zenith',
    { width: 18, height: 3.2, depth: 0.04 },
    new Vector3(0, 5.25, 6.3),
    skyTop,
  );
}

function createLowPolyEnvironment(scene: Scene): void {
  createSkyGradient(scene);

  const standDark = material(scene, 'distant-stand-shadow-material', new Color3(0.14, 0.18, 0.28));
  const standMid = material(scene, 'distant-stand-seat-material', new Color3(0.22, 0.32, 0.48));
  const standAccent = material(scene, 'distant-stand-accent-material', new Color3(0.72, 0.76, 0.7));
  const adBlue = material(scene, 'fictional-ad-board-blue-material', new Color3(0.08, 0.31, 0.68));
  const adTeal = material(scene, 'fictional-ad-board-teal-material', new Color3(0.05, 0.54, 0.5));
  const adOrange = material(
    scene,
    'fictional-ad-board-orange-material',
    new Color3(0.85, 0.36, 0.13),
  );
  const metal = material(scene, 'floodlight-pole-material', new Color3(0.42, 0.45, 0.48));
  const lamp = material(scene, 'floodlight-lamp-material', new Color3(1, 0.9, 0.62));
  lamp.emissiveColor = new Color3(0.45, 0.34, 0.12);
  const treeCrown = material(scene, 'distant-tree-crown-material', new Color3(0.08, 0.28, 0.13));
  const treeTrunk = material(scene, 'distant-tree-trunk-material', new Color3(0.28, 0.18, 0.1));
  const skyline = material(scene, 'distant-city-silhouette-material', new Color3(0.18, 0.23, 0.33));

  createFlatBox(
    scene,
    'background-stands-back-row',
    { width: 7.6, height: 1.1, depth: 0.34 },
    new Vector3(0, 0.75, 4.65),
    standDark,
  );
  createFlatBox(
    scene,
    'background-stands-front-row',
    { width: 6.8, height: 0.58, depth: 0.4 },
    new Vector3(0, 0.38, 4.25),
    standMid,
  );
  for (let i = 0; i < 8; i += 1) {
    createFlatBox(
      scene,
      `background-stands-seat-stripe-${i}`,
      { width: 0.55, height: 0.08, depth: 0.42 },
      new Vector3(-3 + i * 0.86, 0.69 + (i % 2) * 0.16, 4.03),
      standAccent,
    );
  }

  const adMats = [adBlue, adTeal, adOrange];
  const pickAdMat = (index: number): StandardMaterial => adMats[index % adMats.length] ?? adBlue;
  for (let i = 0; i < 6; i += 1) {
    createFlatBox(
      scene,
      `left-fictional-ad-board-${i}`,
      { width: 0.08, height: 0.42, depth: 1.02 },
      new Vector3(-3.15, 0.25, -2.7 + i * 1.05),
      pickAdMat(i),
    );
    createFlatBox(
      scene,
      `right-fictional-ad-board-${i}`,
      { width: 0.08, height: 0.42, depth: 1.02 },
      new Vector3(3.15, 0.25, -2.7 + i * 1.05),
      pickAdMat(i + 1),
    );
  }

  for (const x of [-3.7, 3.7]) {
    createFlatBox(
      scene,
      `floodlight-pole-${x}`,
      { width: 0.08, height: 2.3, depth: 0.08 },
      new Vector3(x, 1.15, 3.75),
      metal,
    );
    createFlatBox(
      scene,
      `floodlight-cluster-${x}`,
      { width: 0.62, height: 0.28, depth: 0.12 },
      new Vector3(x, 2.42, 3.62),
      lamp,
    );
  }

  for (let i = 0; i < 7; i += 1) {
    const x = -4.2 + i * 1.4;
    createFlatBox(
      scene,
      `distant-tree-trunk-${i}`,
      { width: 0.12, height: 0.5, depth: 0.12 },
      new Vector3(x, 0.25, 5.3),
      treeTrunk,
    );
    const crown = MeshBuilder.CreatePolyhedron(
      `distant-tree-crown-${i}`,
      { type: 1, size: 0.42 },
      scene,
    );
    crown.position.set(x, 0.75, 5.22);
    crown.material = treeCrown;
  }

  for (let i = 0; i < 6; i += 1) {
    createFlatBox(
      scene,
      `distant-city-block-${i}`,
      { width: 0.45 + (i % 3) * 0.18, height: 0.55 + (i % 2) * 0.35, depth: 0.18 },
      new Vector3(-2.8 + i * 1.1, 0.28, 5.75),
      skyline,
    );
  }
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

  createLowPolyEnvironment(scene);

  const grass = material(scene, 'field-grass-material', new Color3(0.17, 0.55, 0.22));
  const grassAlt = material(scene, 'field-grass-alt-material', new Color3(0.13, 0.48, 0.19));
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

  for (let i = 0; i < 8; i += 1) {
    createFlatBox(
      scene,
      `grass-mowing-stripe-${i}`,
      { width: 6, height: 0.01, depth: 8.6 / 8 },
      new Vector3(0, 0.006, -3.7625 + i * (8.6 / 8)),
      i % 2 === 0 ? grassAlt : grass,
    );
  }

  for (const x of [-2.75, 2.75]) {
    createFlatBox(
      scene,
      `field-side-line-${x}`,
      { width: 0.04, height: 0.02, depth: 8.2 },
      new Vector3(x, 0.02, 0),
      line,
    );
  }
  for (const z of [-3.95, 3.45]) {
    createFlatBox(
      scene,
      `field-end-line-${z}`,
      { width: 5.5, height: 0.02, depth: 0.04 },
      new Vector3(0, 0.025, z),
      line,
    );
  }
  createFlatBox(
    scene,
    'center-line',
    { width: 5.5, height: 0.02, depth: 0.04 },
    new Vector3(0, 0.03, 0),
    line,
  );
  const centerCircle = MeshBuilder.CreateTorus(
    'center-circle-line',
    { diameter: 1.25, thickness: 0.025, tessellation: 48 },
    scene,
  );
  centerCircle.position.set(0, 0.045, 0);
  centerCircle.rotation.x = Math.PI / 2;
  centerCircle.material = line;
  createFlatBox(
    scene,
    'center-spot',
    { width: 0.1, height: 0.02, depth: 0.1 },
    new Vector3(0, 0.05, 0),
    line,
  );

  for (const z of [3.0, -3.5]) {
    const prefix = z > 0 ? 'attacking' : 'defending';
    createFlatBox(
      scene,
      `${prefix}-penalty-area-top-line`,
      { width: 3.5, height: 0.02, depth: 0.04 },
      new Vector3(0, 0.035, z),
      line,
    );
    createFlatBox(
      scene,
      `${prefix}-penalty-area-left-line`,
      { width: 0.04, height: 0.02, depth: 0.9 },
      new Vector3(-1.75, 0.035, z + (z > 0 ? 0.45 : -0.45)),
      line,
    );
    createFlatBox(
      scene,
      `${prefix}-penalty-area-right-line`,
      { width: 0.04, height: 0.02, depth: 0.9 },
      new Vector3(1.75, 0.035, z + (z > 0 ? 0.45 : -0.45)),
      line,
    );
    createFlatBox(
      scene,
      `${prefix}-goal-area-top-line`,
      { width: 1.9, height: 0.02, depth: 0.04 },
      new Vector3(0, 0.04, z + (z > 0 ? 0.25 : -0.25)),
      line,
    );
    createFlatBox(
      scene,
      `${prefix}-goal-area-left-line`,
      { width: 0.04, height: 0.02, depth: 0.5 },
      new Vector3(-0.95, 0.04, z + (z > 0 ? 0.25 : -0.25)),
      line,
    );
    createFlatBox(
      scene,
      `${prefix}-goal-area-right-line`,
      { width: 0.04, height: 0.02, depth: 0.5 },
      new Vector3(0.95, 0.04, z + (z > 0 ? 0.25 : -0.25)),
      line,
    );
  }

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
