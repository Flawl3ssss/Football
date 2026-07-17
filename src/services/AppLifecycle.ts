import type { PlatformAdapter } from '../platform/PlatformAdapter';

export interface LifecycleState {
  readonly focused: boolean;
  readonly visible: boolean;
  readonly portrait: boolean;
  readonly paused: boolean;
}

export type LifecycleListener = (state: LifecycleState) => void;

export class AppLifecycle {
  private state: LifecycleState;
  private readonly listeners = new Set<LifecycleListener>();

  public constructor(private readonly platform: PlatformAdapter) {
    this.state = this.createState();
  }

  public start(): () => void {
    const onFocus = (): void => this.update();
    const onBlur = (): void => this.update({ focused: false });
    const onVisibility = (): void => this.update();
    const onResize = (): void => this.update();

    window.addEventListener('focus', onFocus);
    window.addEventListener('blur', onBlur);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);

    this.update();

    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
    };
  }

  public subscribe(listener: LifecycleListener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  public getState(): LifecycleState {
    return this.state;
  }

  private update(patch: Partial<LifecycleState> = {}): void {
    const next = { ...this.createState(), ...patch };
    const wasPaused = this.state.paused;
    this.state = next;

    if (next.paused && !wasPaused) {
      this.platform.gameplayStop();
    }

    if (!next.paused && wasPaused) {
      this.platform.gameplayStart();
    }

    this.listeners.forEach((listener) => listener(next));
  }

  private createState(): LifecycleState {
    const portrait = window.matchMedia('(orientation: portrait)').matches || window.innerHeight >= window.innerWidth;
    const visible = document.visibilityState !== 'hidden';
    const focused = document.hasFocus();

    return {
      focused,
      visible,
      portrait,
      paused: !focused || !visible || !portrait,
    };
  }
}
