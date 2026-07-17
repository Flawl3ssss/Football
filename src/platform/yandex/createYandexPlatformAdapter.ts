import { MockPlatformAdapter } from '../MockPlatformAdapter';
import type { PlatformAdapter } from '../PlatformAdapter';

export const createYandexPlatformAdapter = (): PlatformAdapter => {
  // Stage 1 keeps the Yandex SDK behind the adapter boundary.
  // Real ysdk calls will be added only after current official requirements are checked again.
  return new MockPlatformAdapter();
};
