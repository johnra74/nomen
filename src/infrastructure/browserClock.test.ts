import { afterEach, describe, expect, it, vi } from 'vitest';
import { browserClock } from './browserClock';

afterEach(() => vi.restoreAllMocks());

describe('browserClock', () => {
  it('reads performance.now()', () => {
    vi.spyOn(performance, 'now').mockReturnValue(1234.5);
    expect(browserClock.now()).toBe(1234.5);
  });

  it('never goes backwards', () => {
    const first = browserClock.now();
    expect(browserClock.now()).toBeGreaterThanOrEqual(first);
  });
});
