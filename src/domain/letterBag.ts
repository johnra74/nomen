import type { RandomSource } from '../ports';
import { CONSONANTS, HARD_LETTERS, LETTER_WEIGHTS, VOWELS } from './constants';
import { levelConfig } from './levels';
import type { Letter } from './types';

export interface LetterBag {
  /** Draws a vowel using the level's vowel weights. */
  drawVowel(): Letter;
  /** Draws a consonant using the level's consonant weights. */
  drawConsonant(): Letter;
}

function weightedPicker(
  letters: readonly Letter[],
  weightOf: (letter: Letter) => number,
  random: RandomSource,
): () => Letter {
  const weights = letters.map(weightOf);
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  return () => {
    let remaining = random.next() * total;
    for (let i = 0; i < letters.length; i++) {
      remaining -= weights[i]!;
      if (remaining < 0) return letters[i]!;
    }
    return letters[letters.length - 1]!;
  };
}

export function createLetterBag(level: number, random: RandomSource): LetterBag {
  const { hardLetterMultiplier } = levelConfig(level);
  const weightOf = (letter: Letter) =>
    LETTER_WEIGHTS[letter] * (HARD_LETTERS.includes(letter) ? hardLetterMultiplier : 1);
  return {
    drawVowel: weightedPicker(VOWELS, weightOf, random),
    drawConsonant: weightedPicker(CONSONANTS, weightOf, random),
  };
}
