import { Color3, Mesh, MeshBuilder, Scene, StandardMaterial, TransformNode } from '@babylonjs/core';
import type { Footballer, FootballerState } from '../gameplay/episode';

export interface FootballerMaterials {
  shirt: StandardMaterial;
  shorts: StandardMaterial;
  socks: StandardMaterial;
  boots: StandardMaterial;
  gloves?: StandardMaterial;
}

export interface FootballerMaterialSet {
  home: FootballerMaterials;
  away: FootballerMaterials;
  goalkeeper: FootballerMaterials & { gloves: StandardMaterial };
  skin: StandardMaterial;
  hair: StandardMaterial;
}

interface LimbPose {
  leftArm: number;
  rightArm: number;
  leftLeg: number;
  rightLeg: number;
  lean: number;
  lift: number;
  dive?: { roll: number; yaw: number };
}

const poseByState: Record<FootballerState, LimbPose> = {
  idle: { leftArm: 0.15, rightArm: -0.15, leftLeg: -0.05, rightLeg: 0.05, lean: 0, lift: 0 },
  run: { leftArm: -0.75, rightArm: 0.75, leftLeg: 0.7, rightLeg: -0.7, lean: 0.18, lift: 0.03 },
  pass: { leftArm: 0.45, rightArm: -0.35, leftLeg: -0.25, rightLeg: 0.95, lean: 0.12, lift: 0 },
  kick: { leftArm: 0.65, rightArm: -0.65, leftLeg: -0.35, rightLeg: 1.25, lean: 0.22, lift: 0.02 },
  header: { leftArm: 0.9, rightArm: -0.9, leftLeg: 0.18, rightLeg: -0.18, lean: -0.18, lift: 0.08 },
  'goalkeeper-ready': {
    leftArm: 0.95,
    rightArm: -0.95,
    leftLeg: 0.25,
    rightLeg: -0.25,
    lean: 0.14,
    lift: 0,
  },
  'goalkeeper-dive': {
    leftArm: 1.35,
    rightArm: 1.35,
    leftLeg: 0.45,
    rightLeg: 0.45,
    lean: 0.25,
    lift: 0.25,
    dive: { roll: Math.PI / 2.8, yaw: -0.4 },
  },
  celebrate: {
    leftArm: 1.9,
    rightArm: -1.9,
    leftLeg: -0.1,
    rightLeg: 0.1,
    lean: -0.05,
    lift: 0.05,
  },
  fail: { leftArm: -0.2, rightArm: 0.2, leftLeg: 0.05, rightLeg: -0.05, lean: -0.42, lift: -0.03 },
};

function material(scene: Scene, name: string, color: Color3): StandardMaterial {
  const mat = new StandardMaterial(name, scene);
  mat.diffuseColor = color;
  return mat;
}

export function createFootballerMaterials(scene: Scene): FootballerMaterialSet {
  return {
    home: {
      shirt: material(scene, 'home-kit-shirt-blue', new Color3(0.05, 0.24, 0.86)),
      shorts: material(scene, 'home-kit-shorts-white', new Color3(0.94, 0.96, 1)),
      socks: material(scene, 'home-kit-socks-blue', new Color3(0.05, 0.24, 0.86)),
      boots: material(scene, 'home-kit-boots-dark', new Color3(0.03, 0.03, 0.04)),
    },
    away: {
      shirt: material(scene, 'away-kit-shirt-red', new Color3(0.88, 0.05, 0.04)),
      shorts: material(scene, 'away-kit-shorts-black', new Color3(0.02, 0.02, 0.025)),
      socks: material(scene, 'away-kit-socks-red', new Color3(0.88, 0.05, 0.04)),
      boots: material(scene, 'away-kit-boots-black', new Color3(0, 0, 0)),
    },
    goalkeeper: {
      shirt: material(scene, 'goalkeeper-kit-shirt-yellow', new Color3(1, 0.86, 0.05)),
      shorts: material(scene, 'goalkeeper-kit-shorts-green', new Color3(0.05, 0.52, 0.18)),
      socks: material(scene, 'goalkeeper-kit-socks-green', new Color3(0.05, 0.52, 0.18)),
      boots: material(scene, 'goalkeeper-kit-boots-dark', new Color3(0.02, 0.02, 0.02)),
      gloves: material(scene, 'goalkeeper-kit-gloves-white', new Color3(0.96, 1, 0.9)),
    },
    skin: material(scene, 'footballer-skin-material', new Color3(0.8, 0.56, 0.38)),
    hair: material(scene, 'footballer-hair-material', new Color3(0.09, 0.055, 0.035)),
  };
}

function addBox(
  scene: Scene,
  root: TransformNode,
  name: string,
  size: Parameters<typeof MeshBuilder.CreateBox>[1],
  mat: StandardMaterial,
  y: number,
  x = 0,
  z = 0,
): Mesh {
  const mesh = MeshBuilder.CreateBox(name, size, scene);
  mesh.parent = root;
  mesh.position.set(x, y, z);
  mesh.material = mat;
  return mesh;
}

function addLimb(
  scene: Scene,
  root: TransformNode,
  name: string,
  mat: StandardMaterial,
  x: number,
  y: number,
  z: number,
  angle: number,
  length = 0.42,
): Mesh {
  const mesh = MeshBuilder.CreateBox(name, { width: 0.09, height: length, depth: 0.09 }, scene);
  mesh.parent = root;
  mesh.position.set(x, y, z);
  mesh.rotation.x = angle;
  mesh.material = mat;
  return mesh;
}

export function createFootballerModel(
  scene: Scene,
  player: Footballer,
  materials: FootballerMaterialSet,
): TransformNode {
  const root = new TransformNode(`${player.id}-model`, scene);
  root.position.copyFrom(player.position);

  const kit =
    player.role === 'goalkeeper'
      ? materials.goalkeeper
      : player.team === 'home'
        ? materials.home
        : materials.away;
  const pose = poseByState[player.state];
  root.rotation.x = pose.lean;
  root.position.y += pose.lift;
  if (pose.dive) {
    root.rotation.z = pose.dive.roll;
    root.rotation.y = pose.dive.yaw;
  }

  addBox(
    scene,
    root,
    `${player.id}-body`,
    { width: 0.34, height: 0.46, depth: 0.18 },
    kit.shirt,
    0.58,
  );
  addBox(
    scene,
    root,
    `${player.id}-shorts`,
    { width: 0.36, height: 0.2, depth: 0.2 },
    kit.shorts,
    0.28,
  );

  const head = MeshBuilder.CreateSphere(
    `${player.id}-head`,
    { diameter: 0.24, segments: 8 },
    scene,
  );
  head.parent = root;
  head.position.set(0, 0.96, 0);
  head.material = materials.skin;

  addBox(
    scene,
    root,
    `${player.id}-hair`,
    { width: 0.22, height: 0.08, depth: 0.2 },
    materials.hair,
    1.08,
    0,
    -0.015,
  );
  addBox(
    scene,
    root,
    `${player.id}-nose`,
    { width: 0.045, height: 0.045, depth: 0.09 },
    materials.skin,
    0.96,
    0,
    -0.145,
  );
  addBox(
    scene,
    root,
    `${player.id}-shoulder-line`,
    { width: 0.52, height: 0.035, depth: 0.04 },
    kit.shirt,
    0.78,
  );

  addLimb(scene, root, `${player.id}-left-arm`, materials.skin, -0.28, 0.53, 0, pose.leftArm);
  addLimb(scene, root, `${player.id}-right-arm`, materials.skin, 0.28, 0.53, 0, pose.rightArm);
  addLimb(scene, root, `${player.id}-left-leg`, kit.socks, -0.1, 0.03, 0, pose.leftLeg);
  addLimb(scene, root, `${player.id}-right-leg`, kit.socks, 0.1, 0.03, 0, pose.rightLeg);
  addBox(
    scene,
    root,
    `${player.id}-left-boot`,
    { width: 0.13, height: 0.06, depth: 0.2 },
    kit.boots,
    -0.22,
    -0.1,
    -0.035,
  );
  addBox(
    scene,
    root,
    `${player.id}-right-boot`,
    { width: 0.13, height: 0.06, depth: 0.2 },
    kit.boots,
    -0.22,
    0.1,
    -0.035,
  );

  if (player.role === 'goalkeeper') {
    addBox(
      scene,
      root,
      `${player.id}-left-glove`,
      { width: 0.12, height: 0.1, depth: 0.1 },
      materials.goalkeeper.gloves,
      0.27,
      -0.34,
    );
    addBox(
      scene,
      root,
      `${player.id}-right-glove`,
      { width: 0.12, height: 0.1, depth: 0.1 },
      materials.goalkeeper.gloves,
      0.27,
      0.34,
    );
  }

  return root;
}
