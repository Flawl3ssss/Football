/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { describe, expect, it } from 'vitest';
import {
  getNextDecisionId,
  levels,
  validateLevel,
  validateLevels,
  type LevelDefinition,
} from '../src/game/levels';

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

describe('data-driven levels', () => {
  it('loads five test levels', () => {
    expect(levels).toHaveLength(5);
    expect(validateLevels(levels).valid).toBe(true);
  });
  it('validates schema for every level', () => {
    for (const level of levels) expect(validateLevel(level).errors).toEqual([]);
  });
  it('detects duplicated ids', () => {
    expect(
      validateLevels([
        levels[0]!,
        { ...levels[1]!, id: levels[0]!.id } as LevelDefinition,
      ]).errors.join('\n'),
    ).toContain('Duplicate level id');
  });
  it('detects missing players', () => {
    const level = clone(levels[0]!);
    level.decisions[0]!.actorId = 'missing';
    expect(validateLevel(level).errors.join('\n')).toContain('missing actor');
  });
  it('detects missing targets', () => {
    const level = clone(levels[0]!);
    level.decisions[0]!.validTargetIds = ['missing-target'];
    expect(validateLevel(level).errors.join('\n')).toContain('missing target');
  });
  it('detects invalid camera kinds', () => {
    const level = clone(levels[0]!);
    level.cameras[0]!.kind = 'bad-camera' as never;
    expect(validateLevel(level).errors.join('\n')).toContain('invalid kind');
  });
  it('detects invalid rewards', () => {
    const level = clone(levels[0]!);
    level.rewards.coins = -1;
    expect(validateLevel(level).errors.join('\n')).toContain('rewards');
  });
  it('detects obviously impossible configs', () => {
    const level = clone(levels[0]!);
    level.decisions[0]!.successTargetIds = [];
    expect(validateLevel(level).errors.join('\n')).toContain('passable path');
  });
  it('resolves transition between decisions', () => {
    expect(getNextDecisionId(levels[0]!, 'd-pass')).toBe('d-shot');
  });
});
