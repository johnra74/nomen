import { describe, expect, it } from 'vitest';
import { fixtureDictionary } from '../../tests/support/fixtureDictionary';
import type { Letter } from './types';
import { validateWord } from './wordValidator';

const letters = (text: string) => [...text] as Letter[];
const dictionary = fixtureDictionary(['cat', 'abstract', 'abstracts']);

describe('validateWord', () => {
  it('accepts a listed noun regardless of case', () => {
    expect(validateWord(letters('CAT'), dictionary)).toEqual({ valid: true, word: 'CAT' });
    expect(validateWord(letters('ABSTRACT'), dictionary).valid).toBe(true);
  });

  it('rejects words under three letters as too short', () => {
    expect(validateWord(letters('CA'), dictionary)).toEqual({
      valid: false,
      word: 'CA',
      reason: 'too-short',
    });
  });

  it('rejects words over eight letters as too long, even if listed', () => {
    expect(validateWord(letters('ABSTRACTS'), dictionary)).toMatchObject({
      valid: false,
      reason: 'too-long',
    });
  });

  it('rejects words missing from the noun list', () => {
    expect(validateWord(letters('ATE'), dictionary)).toEqual({
      valid: false,
      word: 'ATE',
      reason: 'not-a-noun',
    });
  });
});
