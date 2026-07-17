import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

const render = vi.fn();
const disposeScene = vi.fn();
const setBallPath = vi.fn();
const copyFrom = vi.fn();
const resetPrototype = vi.fn();
const stopRenderLoop = vi.fn();
const disposeEngine = vi.fn();
const resize = vi.fn();

vi.mock('@babylonjs/core/Engines/engine', () => ({
  Engine: class {
    runRenderLoop(callback: () => void) {
      callback();
    }
    stopRenderLoop = stopRenderLoop;
    resize = resize;
    dispose = disposeEngine;
  },
}));

vi.mock('../src/game/core/createScene', () => ({
  createGameScene: () => ({
    setBallPath,
    resetPrototype,
    render,
    dispose: disposeScene,
    ball: { position: { copyFrom } },
  }),
}));

const simulateTrajectory = vi.fn(() => ({
  outcome: 'goal',
  finalPosition: { x: 0, y: 0.18, z: 3.45 },
  frames: 60,
  path: [
    { x: 0, y: 0.18, z: -3.2 },
    { x: 0, y: 0.18, z: 3.45 },
  ],
}));

vi.mock('../src/game/gameplay/trajectory', async (importOriginal) => {
  const original = await importOriginal<typeof import('../src/game/gameplay/trajectory')>();
  return { ...original, simulateTrajectory };
});

const dispatchPointer = (element: HTMLElement, type: string, x: number, y: number) => {
  element.dispatchEvent(
    new PointerEvent(type, {
      bubbles: true,
      cancelable: true,
      pointerId: 1,
      pointerType: 'touch',
      clientX: x,
      clientY: y,
    }),
  );
};

describe('gesture reason vertical slice', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 390 });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 844 });

    class TestPointerEvent extends Event {
      pointerId: number;
      pointerType: string;
      clientX: number;
      clientY: number;

      constructor(type: string, init: PointerEventInit = {}) {
        super(type, init);
        this.pointerId = init.pointerId ?? 0;
        this.pointerType = init.pointerType ?? '';
        this.clientX = init.clientX ?? 0;
        this.clientY = init.clientY ?? 0;
      }
    }
    vi.stubGlobal('PointerEvent', TestPointerEvent);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('keeps invalid gestures from simulation, shows reason, and clears it on the next valid gesture', async () => {
    const { startGameApp } = await import('../src/game/core/app');
    const root = document.createElement('div');
    const app = await startGameApp(root);
    const hint = app.shell.gestureHint;
    const canvas = app.shell.canvas;
    (canvas.setPointerCapture as Mock | undefined) = vi.fn();

    dispatchPointer(canvas, 'pointerdown', 20, 20);
    dispatchPointer(canvas, 'pointermove', 24, 18);
    dispatchPointer(canvas, 'pointerup', 24, 18);

    expect(simulateTrajectory).not.toHaveBeenCalled();
    expect(hint.hidden).toBe(false);
    expect(hint.textContent).toBe('Начни от мяча');

    dispatchPointer(canvas, 'pointerdown', 195, 608);
    dispatchPointer(canvas, 'pointermove', 195, 460);
    dispatchPointer(canvas, 'pointerup', 195, 300);

    expect(simulateTrajectory).toHaveBeenCalledTimes(1);
    expect(hint.hidden).toBe(true);
    expect(hint.textContent).toBe('');

    app.dispose();
  });
});
