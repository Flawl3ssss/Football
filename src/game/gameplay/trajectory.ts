/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Vector3 } from '@babylonjs/core/Maths/math.vector';

export interface Point2D {
  x: number;
  y: number;
}
export interface TrajectoryGesture {
  points: Point2D[];
  viewport: { width: number; height: number };
  ballScreenPosition?: Point2D;
  startRadius?: number;
}
export type ShotKind = 'pass' | 'power' | 'lob' | 'curve';
export type ShotOutcome = 'goal' | 'miss' | 'post' | 'crossbar' | 'out';
export interface TrajectoryPlan {
  kind: ShotKind;
  points2D: Point2D[];
  points3D: Vector3[];
  power: number;
  height: number;
  spin: number;
  valid: boolean;
  reason?: string;
}
export interface SimulationResult {
  outcome: ShotOutcome;
  finalPosition: Vector3;
  frames: number;
  path: Vector3[];
}

const BALL_START = new Vector3(0, 0.18, -3.2);
const GOAL_Z = 3.45;
const FIELD_X = 2.9;
const GOAL_HALF_WIDTH = 0.95;
const CROSSBAR_Y = 1.25;
const POST_RADIUS = 0.14;
const MIN_LENGTH = 28;
const MAX_LENGTH = 520;
const DEFAULT_BALL_SCREEN_Y = 0.72;
const MIN_START_RADIUS = 70;
const MAX_START_RADIUS = 110;

export function distance(a: Point2D, b: Point2D): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
export function pathLength(points: Point2D[]): number {
  return points.slice(1).reduce((sum, p, i) => sum + distance(points[i]!, p), 0);
}
export function clampPathLength(points: Point2D[], maxLength = MAX_LENGTH): Point2D[] {
  if (points.length < 2) return points;
  const output = [points[0]!];
  let used = 0;
  for (let i = 1; i < points.length; i += 1) {
    const prev = output[output.length - 1]!;
    const segment = distance(prev, points[i]!);
    if (used + segment >= maxLength) {
      const t = (maxLength - used) / Math.max(segment, 0.0001);
      output.push({
        x: prev.x + (points[i]!.x - prev.x) * t,
        y: prev.y + (points[i]!.y - prev.y) * t,
      });
      break;
    }
    output.push(points[i]!);
    used += segment;
  }
  return output;
}
export function smoothPath(points: Point2D[]): Point2D[] {
  if (points.length < 3) return points;
  return points.map((p, i) => {
    if (i === 0 || i === points.length - 1) return p;
    const a = points[i - 1]!;
    const c = points[i + 1]!;
    return { x: (a.x + p.x * 2 + c.x) / 4, y: (a.y + p.y * 2 + c.y) / 4 };
  });
}
export function simplifyPath(points: Point2D[], minStep = 10): Point2D[] {
  if (points.length < 3) return points;
  const output = [points[0]!];
  for (const point of points.slice(1, -1))
    if (distance(output[output.length - 1]!, point) >= minStep) output.push(point);
  output.push(points[points.length - 1]!);
  return output;
}
export function hasSelfIntersection(points: Point2D[]): boolean {
  const ccw = (a: Point2D, b: Point2D, c: Point2D) =>
    (c.y - a.y) * (b.x - a.x) > (b.y - a.y) * (c.x - a.x);
  for (let i = 0; i < points.length - 3; i += 1)
    for (let j = i + 2; j < points.length - 1; j += 1) {
      const a = points[i]!;
      const b = points[i + 1]!;
      const c = points[j]!;
      const d = points[j + 1]!;
      if (ccw(a, c, d) !== ccw(b, c, d) && ccw(a, b, c) !== ccw(a, b, d)) return true;
    }
  return false;
}
export function screenToField(
  point: Point2D,
  viewport: { width: number; height: number },
): Vector3 {
  const nx = (point.x / viewport.width - 0.5) * 5.2;
  const nz = (0.78 - point.y / viewport.height) * 7.2;
  return new Vector3(nx, 0.18, nz);
}
export function getGestureStartRadius(viewport: { width: number; height: number }): number {
  return Math.max(
    MIN_START_RADIUS,
    Math.min(MAX_START_RADIUS, Math.min(viewport.width, viewport.height) * 0.18),
  );
}
export function createTrajectoryPlan(gesture: TrajectoryGesture): TrajectoryPlan {
  if (gesture.points.length < 2) return invalid('Жест слишком короткий', gesture.points);
  const start = gesture.points[0]!;
  const ballScreen = gesture.ballScreenPosition ?? {
    x: gesture.viewport.width / 2,
    y: gesture.viewport.height * DEFAULT_BALL_SCREEN_Y,
  };
  const startRadius = gesture.startRadius ?? getGestureStartRadius(gesture.viewport);
  if (distance(start, ballScreen) > startRadius)
    return invalid('Начните жест рядом с мячом', gesture.points);
  let points = simplifyPath(smoothPath(clampPathLength(gesture.points)));
  const length = pathLength(points);
  if (length < MIN_LENGTH) return invalid('Проведите длиннее', points);
  if (hasSelfIntersection(points))
    points = simplifyPath([points[0]!, ...points.slice(1).filter((_, i) => i % 2 === 0)]);
  const first = points[0]!;
  const last = points[points.length - 1]!;
  if (last.y >= first.y - 8) return invalid('Проведите траекторию к воротам', points);
  const dx = last.x - first.x;
  const dy = first.y - last.y;
  const deviations = points.map((p) =>
    Math.abs(p.x - first.x - (dx * (first.y - p.y)) / Math.max(dy, 1)),
  );
  const curvature = deviations.reduce((sum, value) => sum + value, 0) / points.length;
  const maxDeviation = Math.max(...deviations);
  const kind: ShotKind =
    length < 120
      ? 'pass'
      : maxDeviation > 40 || curvature > 24
        ? 'curve'
        : dy > 430
          ? 'lob'
          : 'power';
  const power = Math.min(1, length / 360);
  const height = kind === 'lob' ? 1.25 : kind === 'curve' ? 0.75 : power * 0.5;
  const spin = Math.max(-1, Math.min(1, dx / 180 + (curvature / 220) * Math.sign(dx || 1)));
  const target = screenToField(last, gesture.viewport);
  target.x = Math.max(-FIELD_X, Math.min(FIELD_X, target.x));
  const mid = new Vector3(
    (BALL_START.x + target.x) / 2 + spin * 0.45,
    height,
    (BALL_START.z + GOAL_Z) / 2,
  );
  return {
    kind,
    points2D: points,
    points3D: [BALL_START.clone(), mid, new Vector3(target.x, 0.18, GOAL_Z)],
    power,
    height,
    spin,
    valid: true,
  };
}
function invalid(reason: string, points: Point2D[]): TrajectoryPlan {
  return {
    kind: 'pass',
    points2D: points,
    points3D: [],
    power: 0,
    height: 0,
    spin: 0,
    valid: false,
    reason,
  };
}
export function simulateTrajectory(plan: TrajectoryPlan, fps = 60): SimulationResult {
  if (!plan.valid || plan.points3D.length < 3)
    return { outcome: 'out', finalPosition: BALL_START.clone(), frames: 0, path: [] };
  const dt = 1 / fps;
  const duration = 0.75 + plan.power * 0.55;
  const frames = Math.max(1, Math.round(duration / dt));
  const path: Vector3[] = [];
  const a = plan.points3D[0]!;
  const b = plan.points3D[1]!;
  const c = plan.points3D[2]!;
  for (let frame = 0; frame <= frames; frame += 1) {
    const t = frame / frames;
    const inv = 1 - t;
    path.push(
      new Vector3(
        inv * inv * a.x + 2 * inv * t * b.x + t * t * c.x,
        inv * inv * a.y + 2 * inv * t * b.y + t * t * c.y,
        inv * inv * a.z + 2 * inv * t * b.z + t * t * c.z,
      ),
    );
  }
  const final = path[path.length - 1]!;
  const absX = Math.abs(final.x);
  let outcome: ShotOutcome = 'miss';
  if (Math.abs(absX - GOAL_HALF_WIDTH) <= POST_RADIUS) outcome = 'post';
  else if (
    plan.height >= CROSSBAR_Y - 0.1 &&
    plan.height <= CROSSBAR_Y + 0.25 &&
    absX <= GOAL_HALF_WIDTH
  )
    outcome = 'crossbar';
  else if (absX < GOAL_HALF_WIDTH && plan.height < CROSSBAR_Y) outcome = 'goal';
  else if (absX > FIELD_X) outcome = 'out';
  return { outcome, finalPosition: final, frames, path };
}
