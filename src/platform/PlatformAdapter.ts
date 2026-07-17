export type PlatformEvent = 'pause' | 'resume' | 'focus' | 'blur';

export interface RewardRequest {
  readonly id: string;
  readonly placement: string;
  readonly coins: number;
}

export interface RewardResult {
  readonly id: string;
  readonly granted: boolean;
}

export interface PlatformAdapter {
  readonly name: string;
  init(): Promise<void>;
  ready(): Promise<void>;
  gameplayStart(): void;
  gameplayStop(): void;
  saveProgress(data: unknown): Promise<void>;
  loadProgress<T>(): Promise<T | null>;
  showRewardedAd(request: RewardRequest): Promise<RewardResult>;
  on(event: PlatformEvent, listener: () => void): () => void;
}
