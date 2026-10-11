import { describe, expect, it } from 'vitest';
import { levelConfig, levelForScore } from './levels';

describe('levelConfig', () => {
  it('starts at 60 seconds and drops 5 seconds per level to a 15 second floor', () => {
    expect(levelConfig(1).allowanceMs).toBe(60_000);
    expect(levelConfig(2).allowanceMs).toBe(55_000);
    expect(levelConfig(9).allowanceMs).toBe(20_000);
    expect(levelConfig(10).allowanceMs).toBe(15_000);
    expect(levelConfig(25).allowanceMs).toBe(15_000);
  });

  it('uses targets 30, 70, 120, 180 and then adds 75 per level', () => {
    expect([1, 2, 3, 4].map((n) => levelConfig(n).targetScore)).toEqual([30, 70, 120, 180]);
    expect(levelConfig(5).targetScore).toBe(255);
    expect(levelConfig(10).targetScore).toBe(630);
  });

  it('raises the hard-letter multiplier by 0.25 per level, capped at 4', () => {
    expect(levelConfig(1).hardLetterMultiplier).toBe(1);
    expect(levelConfig(2).hardLetterMultiplier).toBe(1.25);
    expect(levelConfig(13).hardLetterMultiplier).toBe(4);
    expect(levelConfig(40).hardLetterMultiplier).toBe(4);
  });

  it('reports its own level number', () => {
    expect(levelConfig(7).level).toBe(7);
  });
});

describe('levelForScore', () => {
  it('returns the lowest level whose target is above the score', () => {
    expect(levelForScore(0)).toBe(1);
    expect(levelForScore(29)).toBe(1);
    expect(levelForScore(30)).toBe(2);
    expect(levelForScore(70)).toBe(3);
    expect(levelForScore(254)).toBe(5);
    expect(levelForScore(255)).toBe(6);
  });

  it('never decreases as score grows', () => {
    let previous = 1;
    for (let score = 0; score <= 2000; score++) {
      const level = levelForScore(score);
      expect(level).toBeGreaterThanOrEqual(previous);
      previous = level;
    }
  });
});
