import { describe, expect, it } from 'vitest';
import { seededRandom } from '../../tests/support/seededRandom';
import { CONSONANTS, HARD_LETTERS, LETTER_WEIGHTS, VOWELS } from './constants';
import { type LetterBag, createLetterBag } from './letterBag';
import type { Letter } from './types';

const DRAWS = 100_000;

function frequencies(draw: () => Letter): Map<Letter, number> {
  const counts = new Map<Letter, number>();
  for (let i = 0; i < DRAWS; i++) {
    const letter = draw();
    counts.set(letter, (counts.get(letter) ?? 0) + 1);
  }
  return counts;
}

const bagAt = (level: number, seed: number): LetterBag =>
  createLetterBag(level, seededRandom(seed));

/** Checks that draws stay inside `pool` and follow its Scrabble weights. */
function expectWeighted(counts: Map<Letter, number>, pool: readonly Letter[]) {
  const totalWeight = pool.reduce((sum, letter) => sum + LETTER_WEIGHTS[letter], 0);
  for (const letter of counts.keys()) expect(pool).toContain(letter);
  for (const letter of pool) {
    expect((counts.get(letter) ?? 0) / DRAWS).toBeCloseTo(LETTER_WEIGHTS[letter] / totalWeight, 2);
  }
}

const hardShare = (counts: Map<Letter, number>): number =>
  HARD_LETTERS.reduce((sum, letter) => sum + (counts.get(letter) ?? 0), 0) / DRAWS;

describe('createLetterBag', () => {
  it('draws only vowels from drawVowel, tracking the Scrabble weights', () => {
    expectWeighted(frequencies(bagAt(1, 1).drawVowel), VOWELS);
  });

  it('draws only consonants from drawConsonant, tracking the Scrabble weights at level 1', () => {
    expectWeighted(frequencies(bagAt(1, 2).drawConsonant), CONSONANTS);
  });

  it('makes hard consonants more frequent at higher levels', () => {
    const early = hardShare(frequencies(bagAt(1, 3).drawConsonant));
    const late = hardShare(frequencies(bagAt(10, 3).drawConsonant));
    expect(late).toBeGreaterThan(early * 2);
  });

  it('caps the hard-letter boost from level 13', () => {
    expect(frequencies(bagAt(20, 4).drawConsonant)).toEqual(
      frequencies(bagAt(13, 4).drawConsonant),
    );
  });

  it('leaves vowel weights alone at every level', () => {
    expect(frequencies(bagAt(20, 5).drawVowel)).toEqual(frequencies(bagAt(1, 5).drawVowel));
  });

  it('still returns a letter when the random source returns its extremes', () => {
    expect(createLetterBag(1, { next: () => 0 }).drawConsonant()).toBe('B');
    expect(createLetterBag(1, { next: () => 0.999999999 }).drawConsonant()).toBe('Z');
    expect(createLetterBag(1, { next: () => 1 }).drawConsonant()).toBe('Z');
    expect(createLetterBag(1, { next: () => 0 }).drawVowel()).toBe('A');
  });
});
