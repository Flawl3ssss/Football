/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import type { ShotOutcome, TrajectoryPlan } from './trajectory';

export type EpisodeState =
  'Setup' | 'AwaitInput' | 'Simulating' | 'NextDecision' | 'Success' | 'Fail' | 'Paused';
export type FootballerState =
  | 'idle'
  | 'run'
  | 'pass'
  | 'kick'
  | 'header'
  | 'goalkeeper-ready'
  | 'goalkeeper-dive'
  | 'celebrate'
  | 'fail';
export interface Footballer {
  id: string;
  team: 'home' | 'away';
  role: 'field' | 'goalkeeper';
  position: Vector3;
  route: Vector3[];
  state: FootballerState;
}
export interface EpisodeResult {
  intercepted: boolean;
  receiverId?: string;
  keeperReaction: 'hold' | 'left-dive' | 'right-dive' | 'jump';
  outcome: ShotOutcome;
}

const transitions: Record<EpisodeState, EpisodeState[]> = {
  Setup: ['AwaitInput', 'Paused'],
  AwaitInput: ['Simulating', 'Paused'],
  Simulating: ['NextDecision', 'Success', 'Fail', 'Paused'],
  NextDecision: ['AwaitInput', 'Success', 'Fail', 'Paused'],
  Success: ['Setup'],
  Fail: ['Setup'],
  Paused: ['Setup', 'AwaitInput', 'Simulating'],
};

export class EpisodeStateMachine {
  private state: EpisodeState = 'Setup';
  private previous: EpisodeState = 'Setup';
  getState(): EpisodeState {
    return this.state;
  }
  transition(next: EpisodeState): void {
    if (!transitions[this.state].includes(next))
      throw new Error(`Invalid episode transition ${this.state} -> ${next}`);
    if (next === 'Paused') this.previous = this.state;
    this.state = next;
  }
  pause(): void {
    if (this.state !== 'Paused' && transitions[this.state].includes('Paused'))
      this.transition('Paused');
  }
  resume(): void {
    if (this.state === 'Paused') this.state = this.previous;
  }
  reset(): void {
    this.state = 'Setup';
    this.previous = 'Setup';
  }
}

export function createPrototypeFootballers(): Footballer[] {
  return [
    {
      id: 'home-striker',
      team: 'home',
      role: 'field',
      position: new Vector3(0, 0, -2.7),
      route: [new Vector3(0, 0, -2.7), new Vector3(0.2, 0, -1.5)],
      state: 'idle',
    },
    {
      id: 'home-wing',
      team: 'home',
      role: 'field',
      position: new Vector3(-1.2, 0, -1.5),
      route: [new Vector3(-1.2, 0, -1.5), new Vector3(-0.7, 0, 0.5)],
      state: 'idle',
    },
    {
      id: 'away-defender',
      team: 'away',
      role: 'field',
      position: new Vector3(0.7, 0, 0.4),
      route: [new Vector3(0.7, 0, 0.4), new Vector3(0.25, 0, 1.25)],
      state: 'idle',
    },
    {
      id: 'keeper',
      team: 'away',
      role: 'goalkeeper',
      position: new Vector3(0, 0, 3.2),
      route: [],
      state: 'goalkeeper-ready',
    },
  ];
}

export function choosePassReceiver(
  plan: TrajectoryPlan,
  players: Footballer[],
): Footballer | undefined {
  return players
    .filter((p) => p.team === 'home' && p.id !== 'home-striker')
    .sort(
      (a, b) =>
        Vector3.Distance(a.position, plan.points3D[2]!) -
        Vector3.Distance(b.position, plan.points3D[2]!),
    )[0];
}
export function defenderIntercepts(plan: TrajectoryPlan, players: Footballer[]): boolean {
  const defender = players.find((p) => p.team === 'away' && p.role === 'field');
  if (!defender || !plan.valid) return false;
  const target = plan.points3D[2]!;
  return Math.abs(target.x - defender.position.x) < 0.45 && target.z < 2.2 && target.z > -0.2;
}
export function keeperReaction(plan: TrajectoryPlan): EpisodeResult['keeperReaction'] {
  const target = plan.points3D[2]!;
  if (plan.height > 1.05) return 'jump';
  if (target.x < -0.35) return 'left-dive';
  if (target.x > 0.35) return 'right-dive';
  return 'hold';
}
export function resolveEpisode(
  plan: TrajectoryPlan,
  outcome: ShotOutcome,
  players = createPrototypeFootballers(),
): EpisodeResult {
  const intercepted = defenderIntercepts(plan, players);
  return {
    intercepted,
    receiverId: choosePassReceiver(plan, players)?.id,
    keeperReaction: keeperReaction(plan),
    outcome: intercepted ? 'miss' : outcome,
  };
}
