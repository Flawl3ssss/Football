declare module '*.css';

declare const process: { readonly env: Record<string, string | undefined> };

declare module 'vite' {
  export const defineConfig: <T extends Record<string, unknown>>(config: T) => T;
}

declare module 'vitest' {
  export const describe: (name: string, fn: () => void) => void;
  export const it: (name: string, fn: () => void | Promise<void>) => void;
  export const expect: (value: unknown) => {
    toBe(expected: unknown): void;
    toEqual(expected: unknown): void;
    resolves: { toEqual(expected: unknown): Promise<void> };
  };
}

declare module '@playwright/test' {
  export interface LocatorExpectation {
    toBeVisible(): Promise<void>;
    not: LocatorExpectation;
    toContainText(text: string): Promise<void>;
  }

  export interface Page {
    goto(url: string): Promise<void>;
    locator(selector: string): unknown;
    setViewportSize(size: { width: number; height: number }): Promise<void>;
  }

  export const expect: (locator: unknown) => LocatorExpectation;
  export const test: (name: string, fn: (args: { page: Page }) => Promise<void>) => void;
  export const devices: Record<string, Record<string, unknown>>;
  export const defineConfig: <T extends Record<string, unknown>>(config: T) => T;
}

declare module '@babylonjs/core' {
  export class Vector3 {
    public constructor(x: number, y: number, z: number);
    public static Zero(): Vector3;
  }

  export class Color3 {
    public static FromHexString(value: string): Color3;
  }

  export class Engine {
    public constructor(canvas: HTMLCanvasElement, antialias: boolean, options: Record<string, unknown>);
    public runRenderLoop(callback: () => void): void;
    public stopRenderLoop(): void;
    public resize(): void;
    public dispose(): void;
  }

  export class Scene {
    public clearColor: { set(r: number, g: number, b: number, a: number): void };
    public ambientColor: Color3;
    public constructor(engine: Engine);
    public render(): void;
    public dispose(): void;
  }

  export class ArcRotateCamera {
    public inputs: { clear(): void };
    public constructor(
      name: string,
      alpha: number,
      beta: number,
      radius: number,
      target: Vector3,
      scene: Scene,
    );
    public attachControl(canvas: HTMLCanvasElement, noPreventDefault: boolean): void;
  }

  export class HemisphericLight {
    public intensity: number;
    public constructor(name: string, direction: Vector3, scene: Scene);
  }

  export interface Mesh {
    position: Vector3;
    scaling: { y: number };
    material: unknown;
  }

  export class MeshBuilder {
    public static CreateGround(name: string, options: Record<string, unknown>, scene: Scene): Mesh;
    public static CreateSphere(name: string, options: Record<string, unknown>, scene: Scene): Mesh;
  }
}
