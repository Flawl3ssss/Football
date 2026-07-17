import type { PlatformAdapter } from '../platformAdapter';

export class MockPlatformAdapter implements PlatformAdapter {
  readonly name = 'mock';
  readyNotified = false;
  gameplayStarts = 0;
  gameplayStops = 0;
  private initialized = false;

  async init(): Promise<void> {
    this.initialized = true;
  }

  getLanguage(): 'ru' | 'en' {
    return 'ru';
  }

  async notifyReady(): Promise<void> {
    if (!this.initialized) throw new Error('Platform must be initialized before ready');
    this.readyNotified = true;
  }

  gameplayStart(): void {
    if (this.readyNotified) this.gameplayStarts += 1;
  }

  gameplayStop(): void {
    if (this.readyNotified) this.gameplayStops += 1;
  }
}
