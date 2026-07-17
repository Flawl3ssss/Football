import { describe, expect, it } from 'vitest';
import { MockPlatformAdapter } from '../src/platform/mock/mockPlatformAdapter';

describe('MockPlatformAdapter', () => {
  it('initializes, reports language and tracks gameplay calls', async () => {
    const adapter = new MockPlatformAdapter();
    await adapter.init();
    expect(adapter.getLanguage()).toBe('ru');
    await adapter.notifyReady();
    adapter.gameplayStart();
    adapter.gameplayStop();
    expect(adapter.readyNotified).toBe(true);
    expect(adapter.gameplayStarts).toBe(1);
    expect(adapter.gameplayStops).toBe(1);
  });
});
