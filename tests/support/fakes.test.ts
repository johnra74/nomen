import { describe, expect, it } from 'vitest';
import { boardOf, lettersOf, scriptedGenerator } from './boards';
import { fakeClock } from './fakeClock';
import { fixtureDictionary } from './fixtureDictionary';
import { memoryScoreStore } from './memoryScoreStore';
import { seededRandom } from './seededRandom';

describe('test fakes', () => {
  it('seededRandom is deterministic and within [0, 1)', () => {
    const a = seededRandom(7);
    const b = seededRandom(7);
    for (let i = 0; i < 1000; i++) {
      const value = a.next();
      expect(value).toBe(b.next());
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
    expect(seededRandom(8).next()).not.toBe(seededRandom(7).next());
  });

  it('fakeClock only moves when advanced', () => {
    const clock = fakeClock(100);
    expect(clock.now()).toBe(100);
    clock.advance(250);
    expect(clock.now()).toBe(350);
  });

  it('memoryScoreStore round-trips a personal best', () => {
    const store = memoryScoreStore();
    expect(store.load()).toBeNull();
    const best = { score: 10, level: 1, achievedAt: '2026-01-01T00:00:00.000Z' };
    expect(store.save(best)).toBe(true);
    expect(store.load()).toEqual(best);
  });

  it('fixtureDictionary holds exactly the given words', () => {
    const dictionary = fixtureDictionary(['cat', 'dog']);
    expect(dictionary.size).toBe(2);
    expect(dictionary.has('cat')).toBe(true);
    expect(dictionary.has('cow')).toBe(false);
  });

  it('scriptedGenerator deals fixed boards and refills from its queue', () => {
    const generator = scriptedGenerator(['CAT', 'DOG'], 'XY');
    const first = generator.deal(1);
    expect(lettersOf(first)).toBe('CAT');
    expect(lettersOf(generator.deal(1))).toBe('DOG');
    expect(lettersOf(generator.deal(1))).toBe('DOG');
    const refilled = generator.refill(first, [first[0]!.id, first[2]!.id], 1);
    expect(lettersOf(refilled)).toBe('XAY');
    expect(refilled[1]).toBe(first[1]);
    expect(lettersOf(generator.refill(boardOf('AB'), [], 1))).toBe('AB');
  });
});
