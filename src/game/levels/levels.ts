import type { LevelDefinition } from './schema';

const commonTeams = [
  { id: 'home' as const, kit: 'blue-training' },
  { id: 'away' as const, kit: 'red-training' },
];

const firstLevel: LevelDefinition = {
  id: 'level-001-first-pass-and-shot',
  formatVersion: 1,
  chapter: 1,
  title: { ru: 'Первый пас', en: 'First Pass' },
  description: { ru: 'Отдай пас и забей простой гол.', en: 'Pass and score a simple goal.' },
  episodeType: 'pass',
  environment: 'training-field',
  teams: commonTeams,
  routePoints: [
    { id: 'p-start', x: 0, y: 0, z: -3.2 },
    { id: 'p-wing', x: -1.1, y: 0, z: -0.6 },
    { id: 'p-shot', x: 0, y: 0, z: 3.45 },
  ],
  players: [
    {
      id: 'home-striker',
      team: 'home',
      role: 'striker',
      position: { x: 0, y: 0, z: -2.7 },
      route: ['p-start'],
      speed: 1,
    },
    {
      id: 'home-wing',
      team: 'home',
      role: 'winger',
      position: { x: -1.2, y: 0, z: -1.4 },
      route: ['p-wing'],
      speed: 1.1,
    },
    {
      id: 'away-defender',
      team: 'away',
      role: 'defender',
      position: { x: 0.7, y: 0, z: 0.4 },
      route: ['p-wing'],
      speed: 0.8,
    },
    {
      id: 'keeper',
      team: 'away',
      role: 'goalkeeper',
      position: { x: 0, y: 0, z: 3.2 },
      route: ['p-shot'],
      speed: 0.7,
    },
  ],
  decisions: [
    {
      id: 'd-pass',
      kind: 'pass',
      actorId: 'home-striker',
      prompt: { ru: 'Проведи к партнёру', en: 'Draw to teammate' },
      allowedShotKinds: ['pass', 'curve'],
      validTargetIds: ['t-pass'],
      successTargetIds: ['t-pass'],
      failureOutcomes: ['miss', 'out'],
      nextDecisionId: 'd-shot',
    },
    {
      id: 'd-shot',
      kind: 'shot',
      actorId: 'home-wing',
      prompt: { ru: 'Проведи к воротам', en: 'Draw to goal' },
      allowedShotKinds: ['power', 'lob', 'curve'],
      validTargetIds: ['t-goal'],
      successTargetIds: ['t-goal'],
      failureOutcomes: ['miss', 'post', 'crossbar', 'out'],
    },
  ],
  targets: [
    {
      id: 't-pass',
      type: 'pass-zone',
      center: { x: -1, y: 0, z: -0.4 },
      radius: 0.9,
      allowedOutcomes: ['goal'],
    },
    {
      id: 't-goal',
      type: 'goal-zone',
      center: { x: 0, y: 0, z: 3.45 },
      radius: 1.1,
      allowedOutcomes: ['goal'],
    },
  ],
  passZones: ['t-pass'],
  interceptionZones: [
    {
      id: 'i-defender',
      defenderId: 'away-defender',
      center: { x: 0.45, y: 0, z: 0.6 },
      radius: 0.45,
      difficulty: 0.35,
    },
  ],
  cameras: [
    {
      id: 'cam-overview',
      kind: 'overview',
      position: { x: 0, y: 6, z: -7 },
      target: { x: 0, y: 0, z: 0 },
      fov: 0.72,
    },
    {
      id: 'cam-shot',
      kind: 'shot-follow',
      position: { x: 0, y: 3, z: -4 },
      target: { x: 0, y: 0.4, z: 2 },
      fov: 0.65,
    },
  ],
  successConditions: ['score-goal-after-pass'],
  failureConditions: ['intercepted', 'miss', 'out'],
  starConditions: { one: 'complete', two: 'no-retry', three: 'goal-on-second-decision' },
  rewards: { coins: 40, firstWinBonus: 20 },
  defenderDifficulty: 0.35,
  goalkeeperDifficulty: 0.25,
  hints: [
    { ru: 'Начни у мяча', en: 'Start near the ball' },
    { ru: 'Веди к синему игроку', en: 'Draw to the blue player' },
    { ru: 'Теперь бей в ворота', en: 'Now shoot at goal' },
  ],
  effects: { goal: 'confetti-temp', fail: 'red-flash-temp', trail: 'white-trail-temp' },
  nextLevelId: 'level-002-cross',
};

export const levels: LevelDefinition[] = [
  firstLevel,
  template('level-002-cross', 'Навес', 'Cross', 'cross', 'level-003-header'),
  template('level-003-header', 'Удар головой', 'Header', 'header', 'level-004-free-kick'),
  template('level-004-free-kick', 'Штрафной', 'Free Kick', 'free-kick', 'level-005-one-on-one'),
  template('level-005-one-on-one', 'Один на один', 'One on One', 'one-on-one'),
];

function template(
  id: string,
  ru: string,
  en: string,
  episodeType: LevelDefinition['episodeType'],
  nextLevelId?: string,
): LevelDefinition {
  return {
    ...firstLevel,
    id,
    title: { ru, en },
    description: { ru: `${ru}: тестовый эпизод.`, en: `${en}: test episode.` },
    episodeType,
    nextLevelId,
    decisions: firstLevel.decisions.map((decision, index) => ({
      ...decision,
      id: `${id}-d${index + 1}`,
      nextDecisionId: index === 0 ? `${id}-d2` : undefined,
    })),
    successConditions: [`complete-${episodeType}`],
  };
}
