import type { Dictionary } from '../ports';
import { LETTERS } from './constants';
import type { Letter } from './types';

const UPPER_A = 'A'.charCodeAt(0);
const LOWER_A = 'a'.charCodeAt(0);

/** True when a sorted-letter signature needs no letter more often than `counts` has it. */
function fits(signature: string, counts: readonly number[]): boolean {
  let run = 0;
  for (let i = 0; i < signature.length; i++) {
    run = i > 0 && signature[i] === signature[i - 1] ? run + 1 : 1;
    if (run > counts[signature.charCodeAt(i) - LOWER_A]!) return false;
  }
  return true;
}

/**
 * Number of distinct dictionary nouns formable from `letters`, counting no further
 * than `limit`. Every dictionary word already has a legal length.
 */
export function countFormableWords(
  letters: readonly Letter[],
  dictionary: Dictionary,
  limit: number,
): number {
  if (limit <= 0) return 0;
  const counts = new Array<number>(LETTERS.length).fill(0);
  for (const letter of letters) counts[letter.charCodeAt(0) - UPPER_A]!++;

  let found = 0;
  for (const [signature, words] of dictionary.signatures()) {
    if (signature.length > letters.length || !fits(signature, counts)) continue;
    found += words.length;
    if (found >= limit) return limit;
  }
  return found;
}
