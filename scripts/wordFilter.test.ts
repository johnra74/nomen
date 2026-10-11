import { describe, expect, it } from 'vitest';
import { filterNouns, lemmasOfDataLine } from './wordFilter';

describe('lemmasOfDataLine', () => {
  it('extracts every lemma from a WordNet data line', () => {
    const line =
      '00002137 03 n 02 abstraction 0 abstract_entity 0 010 @ 00001740 n 0000 | a general concept';
    expect(lemmasOfDataLine(line)).toEqual(['abstraction', 'abstract_entity']);
  });

  it('reads the word count as hexadecimal', () => {
    const words = Array.from({ length: 10 }, (_, index) => `w${index} 0`).join(' ');
    expect(lemmasOfDataLine(`00000001 03 n 0a ${words} 000 | gloss`)).toHaveLength(10);
  });

  it('ignores licence header and blank lines', () => {
    expect(lemmasOfDataLine('  1 This software and database is being provided')).toEqual([]);
    expect(lemmasOfDataLine('')).toEqual([]);
  });
});

describe('filterNouns', () => {
  it('keeps lowercase single words of 3 to 8 letters', () => {
    expect(filterNouns(['cat', 'ox', 'entity', 'aardvark', 'abstracts'])).toEqual([
      'aardvark',
      'cat',
      'entity',
    ]);
  });

  it('drops multi-word, hyphenated, apostrophised and numeric lemmas', () => {
    expect(filterNouns(['physical_entity', 'co-op', "cat's-paw", 'a11y', '1900s', 'tea'])).toEqual([
      'tea',
    ]);
  });

  it('drops lemmas that only ever appear capitalised, but keeps ones with a common sense', () => {
    expect(filterNouns(['Paris', 'DNA', 'Turkey', 'turkey', 'China', 'china'])).toEqual([
      'china',
      'turkey',
    ]);
  });

  it('de-duplicates and sorts', () => {
    expect(filterNouns(['dog', 'cat', 'dog', 'ant'])).toEqual(['ant', 'cat', 'dog']);
  });
});
