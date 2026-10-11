import { describe, expect, it } from 'vitest';
import { fixtureDictionary } from '../../tests/support/fixtureDictionary';
import { countFormableWords } from './solvability';
import type { Letter } from './types';

const letters = (text: string) => [...text] as Letter[];
const dictionary = fixtureDictionary(['cat', 'act', 'dog', 'eel', 'keel', 'zebra']);

describe('countFormableWords', () => {
  it('counts distinct nouns that the letters can spell', () => {
    expect(countFormableWords(letters('CATDOG'), dictionary, 10)).toBe(3);
  });

  it('counts anagrams separately', () => {
    expect(countFormableWords(letters('TAC'), dictionary, 10)).toBe(2);
  });

  it('respects letter multiplicity', () => {
    expect(countFormableWords(letters('ELK'), dictionary, 10)).toBe(0);
    expect(countFormableWords(letters('ELKE'), dictionary, 10)).toBe(2);
  });

  it('stops counting at the limit', () => {
    expect(countFormableWords(letters('CATDOGEEL'), dictionary, 2)).toBe(2);
    expect(countFormableWords(letters('CATDOGEEL'), dictionary, 0)).toBe(0);
  });

  it('returns 0 when nothing can be formed', () => {
    expect(countFormableWords(letters('XXQQ'), dictionary, 10)).toBe(0);
    expect(countFormableWords([], dictionary, 10)).toBe(0);
  });
});
