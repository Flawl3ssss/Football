export interface PlatformAdapter {
  readonly name: string;
  init(): Promise<void>;
  getLanguage(): 'ru' | 'en';
  notifyReady(): Promise<void>;
  gameplayStart(): void;
  gameplayStop(): void;
}
