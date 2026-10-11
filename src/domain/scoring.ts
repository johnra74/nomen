import { LETTER_VALUES } from './constants';
import type { Letter } from './types';

export function letterValue(letter: Letter): number {
  return LETTER_VALUES[letter];
}

export function wordScore(letters: readonly Letter[]): number {
  return letters.reduce((total, letter) => total + letterValue(letter), 0);
}
