import type { LevelDefinition } from './schema';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}
const allowedCameras = new Set(['overview', 'pass-follow', 'shot-follow', 'celebration']);

export function validateLevel(level: LevelDefinition): ValidationResult {
  const errors: string[] = [];
  const require = (condition: boolean, message: string): void => {
    if (!condition) errors.push(`${level.id}: ${message}`);
  };
  require(level.formatVersion === 1, 'formatVersion must be 1');
  require(Boolean(level.id), 'id is required');
  require(level.players.length > 0, 'players are required');
  require(level.decisions.length > 0, 'decisions are required');
  require(level.targets.length > 0, 'targets are required');
  require(level.successConditions.length > 0, 'success condition is required');
  require(level.failureConditions.length > 0, 'failure condition is required');
  require(level.rewards.coins >= 0 &&
    level.rewards.firstWinBonus >= 0, 'rewards must be non-negative');
  const playerIds = new Set(level.players.map((player) => player.id));
  const routeIds = new Set(level.routePoints.map((point) => point.id));
  const targetIds = new Set(level.targets.map((target) => target.id));
  require(playerIds.size === level.players.length, 'player ids must be unique');
  require(targetIds.size === level.targets.length, 'target ids must be unique');
  for (const player of level.players) {
    require(level.teams.some(
      (team) => team.id === player.team,
    ), `player ${player.id} has unknown team`);
    require(player.speed > 0, `player ${player.id} speed must be positive`);
    for (const pointId of player.route)
      require(routeIds.has(
        pointId,
      ), `player ${player.id} references missing route point ${pointId}`);
  }
  for (const decision of level.decisions) {
    require(playerIds.has(
      decision.actorId,
    ), `decision ${decision.id} references missing actor ${decision.actorId}`);
    for (const targetId of decision.validTargetIds)
      require(targetIds.has(
        targetId,
      ), `decision ${decision.id} references missing target ${targetId}`);
    for (const targetId of decision.successTargetIds)
      require(targetIds.has(
        targetId,
      ), `decision ${decision.id} references missing success target ${targetId}`);
    if (decision.nextDecisionId)
      require(level.decisions.some(
        (item) => item.id === decision.nextDecisionId,
      ), `decision ${decision.id} references missing next decision ${decision.nextDecisionId}`);
  }
  for (const zone of level.interceptionZones)
    require(playerIds.has(
      zone.defenderId,
    ), `interception zone ${zone.id} references missing defender ${zone.defenderId}`);
  for (const camera of level.cameras)
    require(allowedCameras.has(camera.kind), `camera ${camera.id} has invalid kind ${camera.kind}`);
  const hasPassablePath = level.decisions.every((decision) =>
    decision.successTargetIds.some((targetId) => targetIds.has(targetId)),
  );
  require(hasPassablePath, 'level must have at least one passable path');
  return { valid: errors.length === 0, errors };
}

export function validateLevels(levels: LevelDefinition[]): ValidationResult {
  const errors: string[] = [];
  const ids = new Set<string>();
  for (const level of levels) {
    if (ids.has(level.id)) errors.push(`Duplicate level id ${level.id}`);
    ids.add(level.id);
    errors.push(...validateLevel(level).errors);
  }
  for (const level of levels)
    if (level.nextLevelId && !ids.has(level.nextLevelId))
      errors.push(`${level.id}: nextLevelId ${level.nextLevelId} does not exist`);
  return { valid: errors.length === 0, errors };
}

export function getNextDecisionId(level: LevelDefinition, decisionId: string): string | undefined {
  return level.decisions.find((decision) => decision.id === decisionId)?.nextDecisionId;
}
