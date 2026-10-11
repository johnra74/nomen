import { describe, expect, it, vi } from 'vitest';
import { createWordListDictionary, loadDictionary } from './wordListDictionary';

describe('createWordListDictionary', () => {
  const dictionary = createWordListDictionary('cat\nact\n\nDog\r\nkeel\n  \ncat\n');

  it('looks words up case-insensitively', () => {
    expect(dictionary.has('CAT')).toBe(true);
    expect(dictionary.has('dog')).toBe(true);
    expect(dictionary.has('cow')).toBe(false);
  });

  it('ignores blank lines and duplicates when counting', () => {
    expect(dictionary.size).toBe(4);
  });

  it('groups anagrams under one sorted-letter signature, shortest signatures first', () => {
    const groups = [...dictionary.signatures()];
    expect(groups).toEqual([
      ['act', ['cat', 'act']],
      ['dgo', ['dog']],
      ['eekl', ['keel']],
    ]);
  });
});

describe('loadDictionary', () => {
  it('fetches and parses the noun list', async () => {
    const fetchFn = vi.fn().mockResolvedValue({ ok: true, text: async () => 'cat\ndog\n' });
    const dictionary = await loadDictionary('/nouns.txt', fetchFn);
    expect(fetchFn).toHaveBeenCalledWith('/nouns.txt');
    expect(dictionary.size).toBe(2);
  });

  it('fails when the list cannot be fetched', async () => {
    const fetchFn = vi.fn().mockResolvedValue({ ok: false, status: 404 });
    await expect(loadDictionary('/nouns.txt', fetchFn)).rejects.toThrow(/404/);
  });
});
