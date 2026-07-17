import type { PlatformAdapter } from '../platformAdapter';

export class YandexPlatformAdapter implements PlatformAdapter {
  readonly name = 'yandex';

  async init(): Promise<void> {
    throw new Error('YandexPlatformAdapter will be implemented at SDK integration stage');
  }

  getLanguage(): 'ru' | 'en' {
    return 'ru';
  }

  async notifyReady(): Promise<void> {
    throw new Error('YandexPlatformAdapter will be implemented at SDK integration stage');
  }

  gameplayStart(): void {
    throw new Error('YandexPlatformAdapter will be implemented at SDK integration stage');
  }

  gameplayStop(): void {
    throw new Error('YandexPlatformAdapter will be implemented at SDK integration stage');
  }
}
