import type { LevelDefinition } from '../levels';
import type { Point2D, ShotOutcome, TrajectoryPlan } from './trajectory';
import { createTrajectoryPlan, simulateTrajectory } from './trajectory';

export type VerticalSlicePhase =
  | 'StartScreen'
  | 'Tutorial'
  | 'FirstDecision'
  | 'AutoPass'
  | 'SecondDecision'
  | 'AutoShot'
  | 'Victory'
  | 'Defeat'
  | 'Paused';
export type VerticalSliceEvent =
  'start' | 'gesture' | 'auto-complete' | 'retry' | 'next' | 'pause' | 'resume';
export interface VerticalSliceProfile {
  tutorialCompleted: boolean;
  wins: number;
  losses: number;
}
export interface VerticalSliceStepResult {
  phase: VerticalSlicePhase;
  status: string;
  outcome?: ShotOutcome;
  plan?: TrajectoryPlan;
  effect?: string;
  sound?: 'tap' | 'pass' | 'kick' | 'goal' | 'fail';
}

export class VerticalSliceController {
  private phase: VerticalSlicePhase = 'StartScreen';
  private previous: VerticalSlicePhase = 'StartScreen';
  private decisionIndex = 0;
  constructor(
    private readonly level: LevelDefinition,
    private readonly profile: VerticalSliceProfile,
  ) {}
  getPhase(): VerticalSlicePhase {
    return this.phase;
  }
  getDecisionIndex(): number {
    return this.decisionIndex;
  }
  getPrompt(): string {
    return this.level.decisions[this.decisionIndex]?.prompt.ru ?? 'Эпизод завершён';
  }
  start(): VerticalSliceStepResult {
    this.decisionIndex = 0;
    this.phase = this.profile.tutorialCompleted ? 'FirstDecision' : 'Tutorial';
    return {
      phase: this.phase,
      status: this.phase === 'Tutorial' ? 'Проведи от мяча к подсказке' : this.getPrompt(),
      sound: 'tap',
    };
  }
  retry(): VerticalSliceStepResult {
    this.phase = 'StartScreen';
    this.decisionIndex = 0;
    return { phase: this.phase, status: 'Готовы повторить?', sound: 'tap' };
  }
  next(): VerticalSliceStepResult {
    this.phase = 'StartScreen';
    this.decisionIndex = 0;
    return { phase: this.phase, status: 'Следующий уровень скоро будет подключён', sound: 'tap' };
  }
  pause(): VerticalSliceStepResult {
    if (this.phase !== 'Paused') {
      this.previous = this.phase;
      this.phase = 'Paused';
    }
    return { phase: this.phase, status: 'Пауза', sound: 'tap' };
  }
  resume(): VerticalSliceStepResult {
    if (this.phase === 'Paused') this.phase = this.previous;
    return { phase: this.phase, status: this.getPrompt(), sound: 'tap' };
  }
  cancelGesture(): VerticalSliceStepResult {
    return { phase: this.phase, status: 'Жест отменён — попробуйте ещё раз', sound: 'fail' };
  }
  completeGesture(
    points: Point2D[],
    viewport: { width: number; height: number },
  ): VerticalSliceStepResult {
    if (!['Tutorial', 'FirstDecision', 'SecondDecision'].includes(this.phase))
      return { phase: this.phase, status: 'Дождитесь завершения эпизода' };
    const plan = createTrajectoryPlan({ points, viewport });
    if (!plan.valid)
      return { phase: this.phase, status: plan.reason ?? 'Недопустимый жест', plan, sound: 'fail' };
    if (this.phase === 'Tutorial') {
      this.profile.tutorialCompleted = true;
      this.phase = 'FirstDecision';
      return {
        phase: this.phase,
        status: 'Отлично! Теперь пас партнёру',
        plan,
        effect: 'tutorial-complete',
        sound: 'pass',
      };
    }
    const decision = this.level.decisions[this.decisionIndex];
    if (!decision) return this.defeat('Нет точки решения', plan);
    const result = simulateTrajectory(plan, 60);
    if (this.phase === 'FirstDecision') {
      const passOk =
        decision.allowedShotKinds.includes(plan.kind) &&
        plan.kind === 'pass' &&
        result.outcome === 'goal';
      if (!passOk) return this.defeat('Перехват! Пас был неточным', plan, 'miss');
      this.phase = 'AutoPass';
      return {
        phase: this.phase,
        status: 'Пас прошёл! Эпизод продолжается',
        outcome: result.outcome,
        plan,
        effect: 'pass-trail',
        sound: 'pass',
      };
    }
    const shotOk = result.outcome === 'goal';
    if (!shotOk)
      return this.defeat(
        result.outcome === 'post' || result.outcome === 'crossbar'
          ? 'Попадание в каркас ворот'
          : 'Промах',
        plan,
        result.outcome,
      );
    this.phase = 'AutoShot';
    return {
      phase: this.phase,
      status: 'Удар летит в ворота!',
      outcome: result.outcome,
      plan,
      effect: 'shot-trail',
      sound: 'kick',
    };
  }
  completeAuto(): VerticalSliceStepResult {
    if (this.phase === 'AutoPass') {
      this.phase = 'SecondDecision';
      this.decisionIndex = 1;
      return { phase: this.phase, status: this.getPrompt(), effect: 'camera-cut', sound: 'tap' };
    }
    if (this.phase === 'AutoShot') {
      this.phase = 'Victory';
      this.profile.wins += 1;
      return {
        phase: this.phase,
        status: 'Гол! Уровень пройден',
        effect: 'goal-confetti',
        sound: 'goal',
      };
    }
    return { phase: this.phase, status: 'Нет автопродолжения' };
  }
  private defeat(
    status: string,
    plan?: TrajectoryPlan,
    outcome: ShotOutcome = 'miss',
  ): VerticalSliceStepResult {
    this.phase = 'Defeat';
    this.profile.losses += 1;
    return { phase: this.phase, status, outcome, plan, effect: 'fail-flash', sound: 'fail' };
  }
}

export function createDefaultProfile(
  storage: Pick<Storage, 'getItem' | 'setItem'> | undefined,
): VerticalSliceProfile {
  const raw = storage?.getItem('football.stage3.profile');
  if (raw) return JSON.parse(raw) as VerticalSliceProfile;
  return { tutorialCompleted: false, wins: 0, losses: 0 };
}
export function saveProfile(
  storage: Pick<Storage, 'setItem'> | undefined,
  profile: VerticalSliceProfile,
): void {
  storage?.setItem('football.stage3.profile', JSON.stringify(profile));
}
