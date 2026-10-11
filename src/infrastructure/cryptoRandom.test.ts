import { afterEach, describe, expect, it, vi } from 'vitest';
import { cryptoRandom } from './cryptoRandom';

afterEach(() => vi.restoreAllMocks());

describe('cryptoRandom', () => {
  it('returns values in [0, 1)', () => {
    for (let i = 0; i < 1000; i++) {
      const value = cryptoRandom.next();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  it('draws from crypto.getRandomValues', () => {
    const spy = vi.spyOn(globalThis.crypto, 'getRandomValues').mockImplementation((array) => {
      (array as Uint32Array)[0] = 0xffffffff;
      return array;
    });
    expect(cryptoRandom.next()).toBeLessThan(1);
    expect(cryptoRandom.next()).toBeGreaterThan(0.99);
    expect(spy).toHaveBeenCalledTimes(2);
  });
});
