import { Engine } from '@babylonjs/core/Engines/engine';
import type { Scene } from '@babylonjs/core/scene';
import { createShell, type AppShell } from '../../ui/createShell';
import type { PlatformAdapter } from '../../platform/platformAdapter';
import { MockPlatformAdapter } from '../../platform/mock/mockPlatformAdapter';
import { applyMobileGuards, type Disposable } from '../../services/mobileGuards';
import { watchLifecycle } from '../../services/lifecycleService';
import { watchViewport } from '../../services/viewportService';
import { levels } from '../levels';
import { createGameScene, type PrototypeScene } from './createScene';
import { GameState } from './gameState';
import { createPointerInput } from '../gameplay/pointerInput';
import {
  createDefaultProfile,
  saveProfile,
  VerticalSliceController,
} from '../gameplay/verticalSlice';

export interface GameApp {
  state: GameState;
  shell: AppShell;
  engine: Engine;
  scene: Scene;
  dispose(): void;
}

type Timer = number;

export async function startGameApp(
  root: HTMLElement,
  platform: PlatformAdapter = new MockPlatformAdapter(),
): Promise<GameApp> {
  const state = new GameState();
  const shell = createShell(root);
  const disposables: Disposable[] = [];
  const timers = new Set<Timer>();
  const profile = createDefaultProfile(window.localStorage);
  const firstLevel = levels[0];
  if (!firstLevel) throw new Error('No levels are configured');
  const slice = new VerticalSliceController(firstLevel, profile);
  let audioContext: AudioContext | undefined;

  const save = (): void => saveProfile(window.localStorage, profile);
  const clearTimers = (): void => {
    timers.forEach((timer) => window.clearTimeout(timer));
    timers.clear();
  };
  const playSound = (kind?: 'tap' | 'pass' | 'kick' | 'goal' | 'fail'): void => {
    if (!kind) return;
    audioContext ??= new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const frequencies = { tap: 420, pass: 520, kick: 240, goal: 760, fail: 150 };
    oscillator.frequency.value = frequencies[kind];
    gain.gain.value = 0.035;
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.08);
  };

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
    const renderResult = (status: string, effect = 'idle'): void => {
      shell.setStatus(status);
      shell.setDebug(
        `phase=${slice.getPhase()}\ndecision=${slice.getDecisionIndex()}\neffect=${effect}\nwins=${profile.wins}\nlosses=${profile.losses}`,
      );
    };
    const showStart = (): void => {
      clearTimers();
      scene.resetPrototype();
      shell.showScreen('start', 'Первый пас', 'Обучение, пас партнёру и удар по воротам.');
      shell.setHint('Нажмите «Начать»');
      renderResult('Готов к первому уровню');
    };
    const scheduleAuto = (): void => {
      const timer = window.setTimeout(() => {
        const next = slice.completeAuto();
        playSound(next.sound);
        save();
        if (next.phase === 'SecondDecision') {
          shell.showScreen('hidden');
          shell.setHint('Теперь проведи к воротам');
          renderResult(next.status, next.effect);
        }
        if (next.phase === 'Victory') {
          shell.showScreen(
            'victory',
            'Гол!',
            'Уровень пройден. Можно повторить или перейти дальше.',
          );
          shell.setHint('Победа!');
          renderResult(next.status, next.effect);
        }
      }, 360);
      timers.add(timer);
    };
    const applyStep = (step: ReturnType<VerticalSliceController['start']>): void => {
      playSound(step.sound);
      save();
      if (step.plan?.valid) scene.setBallPath(step.plan.points3D);
      if (step.phase === 'Tutorial' || step.phase === 'FirstDecision') {
        shell.showScreen('hidden');
        shell.setHint(step.status);
        renderResult(step.status, step.effect);
      }
      if (step.phase === 'AutoPass' || step.phase === 'AutoShot') {
        shell.showScreen('hidden');
        shell.setHint('Смотрим розыгрыш');
        renderResult(step.status, step.effect);
        scheduleAuto();
      }
      if (step.phase === 'Defeat') {
        shell.showScreen('defeat', 'Не получилось', step.status);
        shell.setHint('Нажмите «Повтор»');
        renderResult(step.status, step.effect);
      }
      if (step.phase === 'StartScreen') showStart();
    };

    shell.startButton.addEventListener('click', () => applyStep(slice.start()));
    shell.retryButton.addEventListener('click', () => applyStep(slice.retry()));
    shell.resetButton.addEventListener('click', () => applyStep(slice.retry()));
    shell.nextButton.addEventListener('click', () => applyStep(slice.next()));
    shell.pauseButton.addEventListener('click', () => {
      clearTimers();
      const step = slice.pause();
      playSound(step.sound);
      shell.showScreen('pause', 'Пауза', 'Можно продолжить уровень.');
      renderResult(step.status);
    });
    shell.resumeButton.addEventListener('click', () => {
      const step = slice.resume();
      playSound(step.sound);
      shell.showScreen('hidden');
      renderResult(step.status);
    });

    const pointer = createPointerInput(shell.canvas, {
      onPreview(points) {
        if (!['Tutorial', 'FirstDecision', 'SecondDecision'].includes(slice.getPhase())) return;
        shell.setHint(points.length > 2 ? 'Отпустите палец для действия' : 'Проведите траекторию');
      },
      onComplete(gesture) {
        const step = slice.completeGesture(gesture.points, {
          width: shell.canvas.clientWidth || window.innerWidth,
          height: shell.canvas.clientHeight || window.innerHeight,
        });
        if (step.plan?.valid) scene.setBallPath(step.plan.points3D);
        applyStep(step);
      },
      onCancel() {
        const step = slice.cancelGesture();
        playSound(step.sound);
        renderResult(step.status);
      },
    });
    disposables.push(pointer);

    disposables.push(
      watchViewport((snapshot) => {
        const isLandscape = snapshot.orientation === 'landscape';
        shell.setLandscape(isLandscape);
        if (isLandscape) {
          state.pause('orientation');
          pointer.cancel();
          clearTimers();
          platform.gameplayStop();
        } else {
          state.resume('orientation');
          if (state.getPhase() === 'playing') platform.gameplayStart();
        }
        engine.resize();
      }),
    );
    disposables.push(watchLifecycle(state));
    const blur = (): void => {
      pointer.cancel();
      clearTimers();
      slice.pause();
      shell.showScreen('pause', 'Пауза', 'Игра остановлена из-за потери фокуса.');
    };
    window.addEventListener('blur', blur);
    disposables.push({ dispose: () => window.removeEventListener('blur', blur) });

    state.markReady();
    await platform.notifyReady();
    state.start();
    platform.gameplayStart();
    showStart();
    engine.runRenderLoop(() => {
      if (state.getPhase() === 'playing') scene.render();
    });
    return {
      state,
      shell,
      engine,
      scene,
      dispose(): void {
        clearTimers();
        platform.gameplayStop();
        engine.stopRenderLoop();
        scene.dispose();
        engine.dispose();
        audioContext?.close();
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
