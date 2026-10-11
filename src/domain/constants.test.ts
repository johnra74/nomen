import { describe, expect, it } from 'vitest';
import {
  BOARD_SIZE,
  CONSONANTS,
  HARD_LETTERS,
  LETTERS,
  LETTER_VALUES,
  LETTER_WEIGHTS,
  MAX_VOWELS,
  MIN_VOWELS,
  VOWELS,
  isVowel,
} from './constants';

describe('constants', () => {
  it('defines a value and a weight for all 26 letters', () => {
    expect(LETTERS).toHaveLength(26);
    for (const letter of LETTERS) {
      expect(LETTER_VALUES[letter]).toBeGreaterThan(0);
      expect(LETTER_WEIGHTS[letter]).toBeGreaterThan(0);
    }
    expect(Object.keys(LETTER_VALUES)).toHaveLength(26);
    expect(Object.keys(LETTER_WEIGHTS)).toHaveLength(26);
  });

  it('uses Scrabble values', () => {
    expect(LETTER_VALUES.A).toBe(1);
    expect(LETTER_VALUES.K).toBe(5);
    expect(LETTER_VALUES.Q).toBe(10);
    expect(LETTER_VALUES.Z).toBe(10);
  });

  it('derives the vowel range as 40% to 50% of the board', () => {
    expect(BOARD_SIZE).toBe(12);
    expect(MIN_VOWELS).toBe(5);
    expect(MAX_VOWELS).toBe(6);
  });

  it('splits the alphabet into vowels and consonants', () => {
    expect(CONSONANTS).toHaveLength(21);
    expect(CONSONANTS.some(isVowel)).toBe(false);
    expect([...VOWELS, ...CONSONANTS].sort()).toEqual([...LETTERS]);
  });

  it('treats only A E I O U as vowels', () => {
    expect(VOWELS.join('')).toBe('AEIOU');
    expect(isVowel('E')).toBe(true);
    expect(isVowel('Y')).toBe(false);
    expect(HARD_LETTERS.some(isVowel)).toBe(false);
  });
});
