import { Engine } from '@babylonjs/core/Engines/engine';
import type { Scene } from '@babylonjs/core/scene';
import { createShell, type AppShell } from '../../ui/createShell';
import type { PlatformAdapter } from '../../platform/platformAdapter';
import { MockPlatformAdapter } from '../../platform/mock/mockPlatformAdapter';
import { applyMobileGuards, type Disposable } from '../../services/mobileGuards';
import { watchLifecycle } from '../../services/lifecycleService';
import { watchViewport } from '../../services/viewportService';
import { createGameScene, getBallScreenPosition, type PrototypeScene } from './createScene';
import { GameState } from './gameState';
import { createPointerInput } from '../gameplay/pointerInput';
import {
  createTrajectoryPlan,
  getGestureStartRadius,
  simulateTrajectory,
} from '../gameplay/trajectory';
import { EpisodeStateMachine, resolveEpisode } from '../gameplay/episode';

export interface GameApp {
  state: GameState;
  shell: AppShell;
  engine: Engine;
  scene: Scene;
  dispose(): void;
}

export async function startGameApp(
  root: HTMLElement,
  platform: PlatformAdapter = new MockPlatformAdapter(),
): Promise<GameApp> {
  const state = new GameState();
  const shell = createShell(root);
  const disposables: Disposable[] = [];
  const episode = new EpisodeStateMachine();
  let simulating = false;

  try {
    disposables.push(applyMobileGuards(document));
    await platform.init();
    const engine = new Engine(shell.canvas, true, {
      preserveDrawingBuffer: false,
      stencil: true,
      antialias: true,
      adaptToDeviceRatio: true,
    });
    const scene = createGameScene(engine) as PrototypeScene;
    const trajectoryGestureContext = () => {
      const bounds = shell.canvas.getBoundingClientRect();
      const viewport = {
        width: bounds.width || shell.canvas.clientWidth || window.innerWidth,
        height: bounds.height || shell.canvas.clientHeight || window.innerHeight,
      };
      return {
        viewport,
        ballScreenPosition: getBallScreenPosition(scene, viewport),
        startRadius: getGestureStartRadius(viewport),
      };
    };
    const resetPrototype = (): void => {
      simulating = false;
      episode.reset();
      episode.transition('AwaitInput');
      scene.resetPrototype();
      shell.setStatus('Нарисуйте траекторию от мяча к воротам.');
      shell.setDebug('state=AwaitInput');
    };
    shell.resetButton.addEventListener('click', resetPrototype);
    disposables.push({
      dispose: () => shell.resetButton.removeEventListener('click', resetPrototype),
    });

    const pointer = createPointerInput(shell.canvas, {
      onPreview(points) {
        if (simulating || episode.getState() !== 'AwaitInput') return;
        const plan = createTrajectoryPlan({
          points,
          ...trajectoryGestureContext(),
        });
        if (plan.valid) scene.setBallPath(plan.points3D);
        shell.setStatus(
          plan.valid ? `Предпросмотр: ${plan.kind}` : (plan.reason ?? 'Недопустимый жест'),
        );
      },
      onComplete(gesture) {
        if (simulating || episode.getState() !== 'AwaitInput') return;
        const plan = createTrajectoryPlan({
          points: gesture.points,
          ...trajectoryGestureContext(),
        });
        if (!plan.valid) {
          shell.setStatus(plan.reason ?? 'Недопустимый жест');
          return;
        }
        episode.transition('Simulating');
        simulating = true;
        const result = simulateTrajectory(plan, 60);
        const episodeResult = resolveEpisode(plan, result.outcome);
        scene.setBallPath(result.path.filter((_, index) => index % 4 === 0));
        scene.ball.position.copyFrom(result.finalPosition);
        const finalOutcome = episodeResult.outcome;
        episode.transition(finalOutcome === 'goal' ? 'Success' : 'Fail');
        shell.setStatus(
          finalOutcome === 'goal'
            ? 'Гол! Эпизод разыгран автоматически.'
            : `Эпизод завершён: ${finalOutcome}. Нажмите сброс.`,
        );
        shell.setDebug(
          `state=${episode.getState()}\nshot=${plan.kind}\noutcome=${finalOutcome}\nkeeper=${episodeResult.keeperReaction}\nreceiver=${episodeResult.receiverId ?? '-'}\nframes=${result.frames}`,
        );
      },
      onCancel() {
        shell.setStatus('Жест отменён. Начните снова от мяча.');
      },
    });
    disposables.push(pointer);

    disposables.push(
      watchViewport((snapshot) => {
        const isLandscape = snapshot.orientation === 'landscape';
        shell.setLandscape(isLandscape);
        if (isLandscape) {
          state.pause('orientation');
          episode.pause();
          pointer.cancel();
          platform.gameplayStop();
        } else {
          state.resume('orientation');
          episode.resume();
          if (state.getPhase() === 'playing') platform.gameplayStart();
        }
        engine.resize();
      }),
    );
    disposables.push(watchLifecycle(state));
    window.addEventListener('blur', () => pointer.cancel());

    state.markReady();
    await platform.notifyReady();
    state.start();
    platform.gameplayStart();
    episode.transition('AwaitInput');
    shell.setStatus('Нарисуйте траекторию от мяча к воротам.');
    engine.runRenderLoop(() => {
      if (state.getPhase() === 'playing') scene.render();
    });
    return {
      state,
      shell,
      engine,
      scene,
      dispose(): void {
        platform.gameplayStop();
        engine.stopRenderLoop();
        scene.dispose();
        engine.dispose();
        disposables.splice(0).forEach((d) => d.dispose());
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Неизвестная ошибка запуска';
    state.fail(message);
    shell.showError(`Не удалось запустить игру: ${message}`);
    disposables.splice(0).forEach((d) => d.dispose());
    throw error;
  }
}
