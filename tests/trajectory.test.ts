/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { describe, expect, it } from 'vitest';
import {
  DEFAULT_FIRST_DECISION_PASS_SECTOR,
  createTrajectoryPlan,
  hasSelfIntersection,
  pathLength,
  screenToField,
  simulateTrajectory,
  smoothPath,
  clampPathLength,
} from '../src/game/gameplay';
const viewport = { width: 390, height: 844 };
const gesture = (...points: { x: number; y: number }[]) => ({ points, viewport });
const firstDecisionGesture = (...points: { x: number; y: number }[]) => ({
  points,
  viewport,
  decisionTrajectory: DEFAULT_FIRST_DECISION_PASS_SECTOR,
});

describe('ball trajectory prototype', () => {
  it('converts 2D gesture points into 3D field space', () =>
    expect(screenToField({ x: 195, y: 120 }, viewport).z).toBeGreaterThan(2));
  it('smooths gesture points', () =>
    expect(
      smoothPath([
        { x: 0, y: 0 },
        { x: 10, y: 20 },
        { x: 20, y: 0 },
      ])[1]!.y,
    ).toBe(10));
  it('limits very long gestures', () =>
    expect(
      pathLength(
        clampPathLength(
          [
            { x: 0, y: 0 },
            { x: 0, y: 900 },
          ],
          100,
        ),
      ),
    ).toBeCloseTo(100));

  it('accepts first decision pass inside the partner sector', () =>
    expect(
      createTrajectoryPlan(
        firstDecisionGesture({ x: 195, y: 610 }, DEFAULT_FIRST_DECISION_PASS_SECTOR.targetZone),
      ).valid,
    ).toBe(true));
  it('rejects first decision pass too far to the left of the partner sector', () =>
    expect(
      createTrajectoryPlan(firstDecisionGesture({ x: 195, y: 610 }, { x: -80, y: 430 })).reason,
    ).toBe('Слишком влево'));
  it('rejects first decision pass too far to the right of the partner sector', () =>
    expect(
      createTrajectoryPlan(firstDecisionGesture({ x: 195, y: 610 }, { x: 250, y: 430 })).reason,
    ).toBe('Слишком вправо'));
  it('rejects first decision backward pass gestures', () =>
    expect(
      createTrajectoryPlan(firstDecisionGesture({ x: 195, y: 610 }, { x: 105, y: 700 })).reason,
    ).toBe('Проведи пас в сторону партнёра'));
  it('does not apply the partner pass sector to second decision shot trajectories', () =>
    expect(
      createTrajectoryPlan({
        ...gesture({ x: 195, y: 610 }, { x: 250, y: 300 }),
        decisionTrajectory: { ...DEFAULT_FIRST_DECISION_PASS_SECTOR, decision: 'shot' },
      }).valid,
    ).toBe(true));
  it('rejects short gestures', () =>
    expect(createTrajectoryPlan(gesture({ x: 195, y: 610 }, { x: 195, y: 600 })).valid).toBe(
      false,
    ));
  it('accepts long gestures after clamping', () =>
    expect(createTrajectoryPlan(gesture({ x: 195, y: 610 }, { x: 195, y: 10 })).valid).toBe(true));
  it('detects curved trajectories', () =>
    expect(
      createTrajectoryPlan(gesture({ x: 195, y: 610 }, { x: 340, y: 470 }, { x: 250, y: 220 }))
        .kind,
    ).toBe('curve'));
  it('detects straight trajectories', () =>
    expect(createTrajectoryPlan(gesture({ x: 195, y: 610 }, { x: 195, y: 280 })).kind).not.toBe(
      'curve',
    ));
  it('handles self intersections by detecting them', () =>
    expect(
      hasSelfIntersection([
        { x: 0, y: 0 },
        { x: 20, y: 20 },
        { x: 0, y: 20 },
        { x: 20, y: 0 },
      ]),
    ).toBe(true));
  it('is deterministic across repeated simulations', () => {
    const plan = createTrajectoryPlan(gesture({ x: 195, y: 610 }, { x: 195, y: 240 }));
    expect(simulateTrajectory(plan, 60).outcome).toBe(simulateTrajectory(plan, 60).outcome);
  });
  it('resolves goal', () =>
    expect(
      simulateTrajectory(createTrajectoryPlan(gesture({ x: 195, y: 610 }, { x: 195, y: 300 })), 60)
        .outcome,
    ).toBe('goal'));
  it('resolves post hit', () =>
    expect(
      simulateTrajectory(createTrajectoryPlan(gesture({ x: 195, y: 610 }, { x: 268, y: 300 })), 60)
        .outcome,
    ).toBe('post'));
  it('resolves crossbar hit', () =>
    expect(
      simulateTrajectory(createTrajectoryPlan(gesture({ x: 195, y: 610 }, { x: 195, y: 40 })), 60)
        .outcome,
    ).toBe('crossbar'));
  it('resolves miss', () =>
    expect(
      simulateTrajectory(createTrajectoryPlan(gesture({ x: 195, y: 610 }, { x: 335, y: 300 })), 60)
        .outcome,
    ).toBe('miss'));
  it('keeps outcomes stable at 30, 60 and uneven FPS samples', () => {
    const plan = createTrajectoryPlan(gesture({ x: 195, y: 610 }, { x: 195, y: 300 }));
    expect([30, 60, 47].map((fps) => simulateTrajectory(plan, fps).outcome)).toEqual([
      'goal',
      'goal',
      'goal',
    ]);
  });
});
