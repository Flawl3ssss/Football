import type { PlatformAdapter, PlatformEvent, RewardRequest, RewardResult } from './PlatformAdapter';

type ListenerSet = Set<() => void>;

export class MockPlatformAdapter implements PlatformAdapter {
  public readonly name = 'mock';
  private readonly listeners = new Map<PlatformEvent, ListenerSet>();
  private readonly consumedRewards = new Set<string>();
  private progress: unknown = null;
  private initialized = false;

  public async init(): Promise<void> {
    this.initialized = true;
  }

  public async ready(): Promise<void> {
    if (!this.initialized) {
      await this.init();
    }
  }

  public gameplayStart(): void {
    this.emit('resume');
  }

  public gameplayStop(): void {
    this.emit('pause');
  }

  public async saveProgress(data: unknown): Promise<void> {
    this.progress = structuredClone(data);
  }

  public async loadProgress<T>(): Promise<T | null> {
    return this.progress === null ? null : (structuredClone(this.progress) as T);
  }

  public async showRewardedAd(request: RewardRequest): Promise<RewardResult> {
    if (this.consumedRewards.has(request.id)) {
      return { id: request.id, granted: false };
    }

    this.consumedRewards.add(request.id);
    return { id: request.id, granted: true };
  }

  public on(event: PlatformEvent, listener: () => void): () => void {
    const listeners = this.listeners.get(event) ?? new Set<() => void>();
    listeners.add(listener);
    this.listeners.set(event, listeners);

    return () => listeners.delete(listener);
  }

  public emit(event: PlatformEvent): void {
    this.listeners.get(event)?.forEach((listener) => listener());
  }
}
