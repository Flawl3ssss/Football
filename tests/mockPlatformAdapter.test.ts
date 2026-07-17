import { describe, expect, it } from 'vitest';
import { MockPlatformAdapter } from '../src/platform/MockPlatformAdapter';

describe('MockPlatformAdapter', () => {
  it('does not grant the same rewarded event twice', async () => {
    const adapter = new MockPlatformAdapter();
    const request = { id: 'reward-1', placement: 'stage-complete', coins: 50 };

    await expect(adapter.showRewardedAd(request)).resolves.toEqual({ id: 'reward-1', granted: true });
    await expect(adapter.showRewardedAd(request)).resolves.toEqual({ id: 'reward-1', granted: false });
  });
});
