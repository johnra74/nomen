import type { Dictionary } from '../ports';

const signatureOf = (word: string): string => [...word].sort().join('');

/** Builds the dictionary from a noun list with one word per line. */
export function createWordListDictionary(text: string): Dictionary {
  const words = new Set<string>();
  const bySignature = new Map<string, string[]>();
  for (const line of text.split('\n')) {
    const word = line.trim().toLowerCase();
    if (word === '' || words.has(word)) continue;
    words.add(word);
    const signature = signatureOf(word);
    const group = bySignature.get(signature);
    if (group) group.push(word);
    else bySignature.set(signature, [word]);
  }
  // Shortest first: short nouns are the likeliest to fit a board, so searches exit early.
  const groups = [...bySignature.entries()].sort((a, b) => a[0].length - b[0].length);

  return {
    has: (word) => words.has(word.toLowerCase()),
    signatures: () => groups,
    size: words.size,
  };
}

export async function loadDictionary(
  url: string,
  fetchFn: (url: string) => Promise<Pick<Response, 'ok' | 'status' | 'text'>> = fetch,
): Promise<Dictionary> {
  const response = await fetchFn(url);
  if (!response.ok) throw new Error(`Could not load the noun list (HTTP ${response.status})`);
  return createWordListDictionary(await response.text());
}
