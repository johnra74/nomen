import { describe, expect, it } from 'vitest';
import { LETTERS, LETTER_VALUES } from './constants';
import { letterValue, wordScore } from './scoring';

describe('scoring', () => {
  it('gives every letter its Scrabble value', () => {
    for (const letter of LETTERS) expect(letterValue(letter)).toBe(LETTER_VALUES[letter]);
  });

  it('sums tile values for a word', () => {
    expect(wordScore(['C', 'A', 'T'])).toBe(5);
    expect(wordScore(['Q', 'U', 'I', 'Z'])).toBe(22);
  });

  it('scores nothing for no letters', () => {
    expect(wordScore([])).toBe(0);
  });
});
