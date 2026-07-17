import { describe, expect, it } from 'vitest';
import { economyConfig } from '../src/economy/economyConfig';
import { progressionConfig } from '../src/progression/progressionConfig';
import { isPortraitViewport } from '../src/ui/mobileViewport';

describe('mobile-only configuration', () => {
  it('detects portrait viewports', () => {
    expect(isPortraitViewport(390, 844)).toBe(true);
    expect(isPortraitViewport(844, 390)).toBe(false);
  });

  it('keeps version 1 scope in config', () => {
    expect(progressionConfig.levels).toBe(30);
    expect(progressionConfig.chapters).toBe(3);
    expect(economyConfig.currency).toBe('coins');
    expect(economyConfig.cosmetics.balls).toBe(15);
  });
});
