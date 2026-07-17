import type { ShotKind, ShotOutcome } from '../gameplay/trajectory';

export type LocaleKey = 'ru' | 'en';
export type EpisodeType = 'pass' | 'cross' | 'header' | 'free-kick' | 'one-on-one';
export type PlayerRole = 'striker' | 'winger' | 'midfielder' | 'defender' | 'goalkeeper';
export type TeamId = 'home' | 'away';
export type CameraKind = 'overview' | 'pass-follow' | 'shot-follow' | 'celebration';
export type DecisionKind = 'pass' | 'shot' | 'header';

export interface LocalizedText {
  ru: string;
  en: string;
}
export interface Vec3Data {
  x: number;
  y: number;
  z: number;
}
export interface TeamDefinition {
  id: TeamId;
  kit: string;
}
export interface RoutePointDefinition extends Vec3Data {
  id: string;
}
export interface PlayerDefinition {
  id: string;
  team: TeamId;
  role: PlayerRole;
  position: Vec3Data;
  route: string[];
  speed: number;
}
export interface TargetZone {
  id: string;
  type: 'pass-zone' | 'goal-zone' | 'header-zone';
  center: Vec3Data;
  radius: number;
  allowedOutcomes: ShotOutcome[];
}
export interface InterceptionZone {
  id: string;
  defenderId: string;
  center: Vec3Data;
  radius: number;
  difficulty: number;
}
export interface DecisionPointDefinition {
  id: string;
  kind: DecisionKind;
  actorId: string;
  prompt: LocalizedText;
  allowedShotKinds: ShotKind[];
  validTargetIds: string[];
  successTargetIds: string[];
  failureOutcomes: ShotOutcome[];
  nextDecisionId?: string;
}
export interface CameraDefinition {
  id: string;
  kind: CameraKind;
  position: Vec3Data;
  target: Vec3Data;
  fov: number;
}
export interface RewardDefinition {
  coins: number;
  firstWinBonus: number;
}
export interface StarConditions {
  one: string;
  two: string;
  three: string;
}
export interface LevelDefinition {
  id: string;
  formatVersion: 1;
  chapter: 1 | 2 | 3;
  title: LocalizedText;
  description: LocalizedText;
  episodeType: EpisodeType;
  environment: 'training-field' | 'small-stadium' | 'rainy-field';
  teams: TeamDefinition[];
  routePoints: RoutePointDefinition[];
  players: PlayerDefinition[];
  decisions: DecisionPointDefinition[];
  targets: TargetZone[];
  passZones: string[];
  interceptionZones: InterceptionZone[];
  cameras: CameraDefinition[];
  successConditions: string[];
  failureConditions: string[];
  starConditions: StarConditions;
  rewards: RewardDefinition;
  defenderDifficulty: number;
  goalkeeperDifficulty: number;
  hints: LocalizedText[];
  effects: { goal: string; fail: string; trail: string };
  nextLevelId?: string;
}
