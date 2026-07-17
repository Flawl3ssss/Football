import { ArcRotateCamera, Color3, Engine, HemisphericLight, MeshBuilder, Scene, Vector3 } from '@babylonjs/core';
import type { PlatformAdapter } from '../platform/PlatformAdapter';
import { AppLifecycle } from '../services/AppLifecycle';
import { createGameShell } from '../ui/createGameShell';
import { applyMobileViewportGuards } from '../ui/mobileViewport';

export class GameApp {
  private engine: Engine | null = null;
  private scene: Scene | null = null;
  private cleanupGuards: (() => void) | null = null;
  private cleanupLifecycle: (() => void) | null = null;

  public constructor(
    private readonly mount: HTMLElement,
    private readonly platform: PlatformAdapter,
  ) {}

  public async start(): Promise<void> {
    await this.platform.init();
    const shell = createGameShell(this.mount);
    this.cleanupGuards = applyMobileViewportGuards();

    this.engine = new Engine(shell.canvas, true, {
      preserveDrawingBuffer: false,
      stencil: true,
      antialias: true,
    });
    this.scene = this.createScene(this.engine, shell.canvas);

    const lifecycle = new AppLifecycle(this.platform);
    this.cleanupLifecycle = lifecycle.start();
    lifecycle.subscribe((state) => {
      shell.setRotateOverlayVisible(!state.portrait);
      if (state.paused) {
        this.engine?.stopRenderLoop();
        return;
      }
      this.startRenderLoop();
    });

    window.addEventListener('resize', this.resize);
    window.addEventListener('orientationchange', this.resize);

    this.startRenderLoop();
    await this.platform.ready();
  }

  public dispose(): void {
    window.removeEventListener('resize', this.resize);
    window.removeEventListener('orientationchange', this.resize);
    this.cleanupLifecycle?.();
    this.cleanupGuards?.();
    this.scene?.dispose();
    this.engine?.dispose();
  }

  private readonly resize = (): void => {
    this.engine?.resize();
  };

  private startRenderLoop(): void {
    if (this.engine === null || this.scene === null) {
      return;
    }

    this.engine.runRenderLoop(() => {
      this.scene?.render();
    });
  }

  private createScene(engine: Engine, canvas: HTMLCanvasElement): Scene {
    const scene = new Scene(engine);
    scene.clearColor.set(0.05, 0.09, 0.16, 1);

    const camera = new ArcRotateCamera('career-camera', Math.PI / 2, Math.PI / 3, 8, Vector3.Zero(), scene);
    camera.attachControl(canvas, true);
    camera.inputs.clear();

    const light = new HemisphericLight('mobile-key-light', new Vector3(0, 1, 0), scene);
    light.intensity = 0.9;

    const ground = MeshBuilder.CreateGround('test-football-field', { width: 5, height: 8 }, scene);
    ground.material = null;

    const ball = MeshBuilder.CreateSphere('test-ball', { diameter: 0.6, segments: 16 }, scene);
    ball.position = new Vector3(0, 0.35, 0);
    ball.scaling.y = 0.95;

    scene.ambientColor = Color3.FromHexString('#86efac');
    return scene;
  }
}
