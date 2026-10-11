import type { Letter } from './types';

export const LETTERS = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'] as readonly Letter[];

export const BOARD_SIZE = 12;
export const MIN_WORD_LENGTH = 3;
export const MAX_WORD_LENGTH = 8;

export const VOWELS: readonly Letter[] = ['A', 'E', 'I', 'O', 'U'];
export const MIN_VOWEL_RATIO = 0.4;
export const MAX_VOWEL_RATIO = 0.5;
export const MIN_VOWELS = Math.ceil(BOARD_SIZE * MIN_VOWEL_RATIO);
export const MAX_VOWELS = Math.floor(BOARD_SIZE * MAX_VOWEL_RATIO);
export const MIN_FORMABLE_WORDS = 2;

/** Standard English Scrabble letter values. */
// prettier-ignore
export const LETTER_VALUES: Readonly<Record<Letter, number>> = {
  A: 1, B: 3, C: 3, D: 2, E: 1, F: 4, G: 2, H: 4, I: 1, J: 8, K: 5, L: 1, M: 3,
  N: 1, O: 1, P: 3, Q: 10, R: 1, S: 1, T: 1, U: 1, V: 4, W: 4, X: 8, Y: 4, Z: 10,
};

/** Standard English Scrabble tile counts, used as draw weights. */
// prettier-ignore
export const LETTER_WEIGHTS: Readonly<Record<Letter, number>> = {
  A: 9, B: 2, C: 2, D: 4, E: 12, F: 2, G: 3, H: 2, I: 9, J: 1, K: 1, L: 4, M: 2,
  N: 6, O: 8, P: 2, Q: 1, R: 6, S: 4, T: 6, U: 4, V: 2, W: 2, X: 1, Y: 2, Z: 1,
};

/** High-value consonants that become more frequent as levels rise. */
export const HARD_LETTERS: readonly Letter[] = ['J', 'K', 'Q', 'V', 'W', 'X', 'Z'];

export const WARNING_SECONDS = 10;

export const isVowel = (letter: Letter): boolean => VOWELS.includes(letter);

export const CONSONANTS: readonly Letter[] = LETTERS.filter((letter) => !isVowel(letter));
