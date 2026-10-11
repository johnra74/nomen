import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { STORAGE_KEY, createLocalStorageScoreStore } from './localStorageScoreStore';

const best = { score: 150, level: 4, achievedAt: '2026-10-11T00:00:00.000Z' };

beforeEach(() => localStorage.clear());
afterEach(() => vi.restoreAllMocks());

describe('localStorageScoreStore', () => {
  it('round-trips a personal best under the versioned key', () => {
    const store = createLocalStorageScoreStore();
    expect(store.load()).toBeNull();
    expect(store.save(best)).toBe(true);
    expect(STORAGE_KEY).toBe('nomen.best.v1');
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual(best);
    expect(createLocalStorageScoreStore().load()).toEqual(best);
  });

  it.each([
    ['malformed JSON', '{not json'],
    ['a non-object', '42'],
    ['null', 'null'],
    ['a missing field', JSON.stringify({ score: 1, level: 1 })],
    ['a wrongly typed field', JSON.stringify({ ...best, score: 'high' })],
    ['a negative score', JSON.stringify({ ...best, score: -1 })],
  ])('treats %s as no record', (_, raw) => {
    localStorage.setItem(STORAGE_KEY, raw);
    expect(createLocalStorageScoreStore().load()).toBeNull();
  });

  it('never throws when storage is unavailable', () => {
    const broken = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
    };
    const store = createLocalStorageScoreStore(() => broken);
    expect(store.load()).toBeNull();
    expect(store.save(best)).toBe(false);
    const missing = createLocalStorageScoreStore(() => {
      throw new Error('no storage');
    });
    expect(missing.load()).toBeNull();
    expect(missing.save(best)).toBe(false);
  });
});
