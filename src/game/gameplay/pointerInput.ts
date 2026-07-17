import type { Point2D } from './trajectory';

export interface PointerGesture {
  points: Point2D[];
  pointerType: string;
  cancelled: boolean;
}
export interface PointerInputOptions {
  onPreview(points: Point2D[]): void;
  onComplete(gesture: PointerGesture): void;
  onCancel(): void;
}
export interface PointerInputController {
  dispose(): void;
  cancel(): void;
  isActive(): boolean;
}

export function createPointerInput(
  canvas: HTMLElement,
  options: PointerInputOptions,
): PointerInputController {
  let activeId: number | null = null;
  let points: Point2D[] = [];
  const point = (event: PointerEvent): Point2D => ({ x: event.clientX, y: event.clientY });
  const cancel = (): void => {
    if (activeId !== null) {
      activeId = null;
      points = [];
      options.onCancel();
    }
  };
  const down = (event: PointerEvent): void => {
    if (activeId !== null) return;
    if (event.pointerType !== 'touch' && event.pointerType !== 'mouse') return;
    activeId = event.pointerId;
    points = [point(event)];
    canvas.setPointerCapture?.(event.pointerId);
    event.preventDefault();
  };
  const move = (event: PointerEvent): void => {
    if (event.pointerId !== activeId) return;
    points.push(point(event));
    options.onPreview([...points]);
    event.preventDefault();
  };
  const up = (event: PointerEvent): void => {
    if (event.pointerId !== activeId) return;
    points.push(point(event));
    const gesture = { points: [...points], pointerType: event.pointerType, cancelled: false };
    activeId = null;
    points = [];
    options.onComplete(gesture);
    event.preventDefault();
  };
  canvas.addEventListener('pointerdown', down);
  canvas.addEventListener('pointermove', move);
  canvas.addEventListener('pointerup', up);
  canvas.addEventListener('pointercancel', cancel);
  window.addEventListener('touchcancel', cancel);
  window.addEventListener('blur', cancel);
  const visibility = (): void => {
    if (document.hidden) cancel();
  };
  document.addEventListener('visibilitychange', visibility);
  return {
    dispose(): void {
      canvas.removeEventListener('pointerdown', down);
      canvas.removeEventListener('pointermove', move);
      canvas.removeEventListener('pointerup', up);
      canvas.removeEventListener('pointercancel', cancel);
      window.removeEventListener('touchcancel', cancel);
      window.removeEventListener('blur', cancel);
      document.removeEventListener('visibilitychange', visibility);
      cancel();
    },
    cancel,
    isActive: () => activeId !== null,
  };
}
