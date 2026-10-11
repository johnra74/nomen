import type { Dictionary } from '../ports';
import { MAX_WORD_LENGTH, MIN_WORD_LENGTH } from './constants';
import type { Letter, RejectionReason } from './types';

export type Validation =
  | { readonly valid: true; readonly word: string }
  | { readonly valid: false; readonly word: string; readonly reason: RejectionReason };

export function validateWord(letters: readonly Letter[], dictionary: Dictionary): Validation {
  const word = letters.join('');
  const reject = (reason: RejectionReason): Validation => ({ valid: false, word, reason });
  if (word.length < MIN_WORD_LENGTH) return reject('too-short');
  if (word.length > MAX_WORD_LENGTH) return reject('too-long');
  if (!dictionary.has(word)) return reject('not-a-noun');
  return { valid: true, word };
}
