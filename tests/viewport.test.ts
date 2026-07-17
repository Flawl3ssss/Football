import { describe, expect, it } from 'vitest';
import { getViewportSnapshot } from '../src/services/viewportService';

describe('viewport service', () => {
  it('detects portrait and landscape snapshots', () => {
    const portraitWindow = { innerWidth: 390, innerHeight: 844 } as Window;
    const landscapeWindow = { innerWidth: 844, innerHeight: 390 } as Window;

    expect(getViewportSnapshot(portraitWindow).orientation).toBe('portrait');
    expect(getViewportSnapshot(landscapeWindow).orientation).toBe('landscape');
  });
});
