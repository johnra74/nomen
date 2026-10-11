import { createWordListDictionary } from '../../src/infrastructure/wordListDictionary';
import type { Dictionary } from '../../src/ports';

export function fixtureDictionary(words: readonly string[]): Dictionary {
  return createWordListDictionary(words.join('\n'));
}
