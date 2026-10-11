// The game's rule for which WordNet lemmas count as playable nouns (spec FR-013).
// Kept free of file I/O so it can be unit tested; scripts/build-wordlist.ts is the shell.
import { MAX_WORD_LENGTH, MIN_WORD_LENGTH } from '../src/domain/constants';

/** Lowercase a-z only, within the game's word-length bounds. */
const PLAYABLE = new RegExp(`^[a-z]{${MIN_WORD_LENGTH},${MAX_WORD_LENGTH}}$`);

/**
 * Lemmas on one line of WordNet's data.noun, with their original capitalisation.
 * Format: offset lex_filenum ss_type w_cnt(hex) word lex_id [word lex_id ...] p_cnt ... | gloss
 */
export function lemmasOfDataLine(line: string): string[] {
  if (line === '' || line.startsWith(' ')) return []; // blank or licence header
  const fields = line.split(' ');
  const wordCount = parseInt(fields[3] ?? '', 16);
  if (Number.isNaN(wordCount)) return [];
  return Array.from({ length: wordCount }, (_, index) => fields[4 + index * 2]!);
}

/**
 * Keeps single-word common nouns. WordNet capitalises proper nouns and abbreviations and
 * joins multi-word terms with underscores, so matching the original spelling against
 * PLAYABLE drops all of them while keeping words that also have a common sense.
 */
export function filterNouns(lemmas: Iterable<string>): string[] {
  const kept = new Set<string>();
  for (const lemma of lemmas) {
    if (PLAYABLE.test(lemma)) kept.add(lemma);
  }
  return [...kept].sort();
}
