import type { Dictionary, RandomSource } from '../ports';
import { BOARD_SIZE, MAX_VOWELS, MIN_FORMABLE_WORDS, MIN_VOWELS, isVowel } from './constants';
import { type LetterBag, createLetterBag } from './letterBag';
import { shuffleOrder } from './selection';
import { countFormableWords } from './solvability';
import type { Board, Letter, Tile } from './types';

export interface BoardGenerator {
  /** A fresh board satisfying the vowel and solvability guarantees. */
  deal(level: number): Board;
  /**
   * Replaces the tiles in `usedTileIds`, in place, with new tiles. Other tiles are
   * unchanged unless the guarantees force a full redeal. Always returns a valid board.
   */
  refill(board: Board, usedTileIds: readonly string[], level: number): Board;
}

const MAX_ATTEMPTS = 50;
// Nouns within these limits can always share one board without breaking the vowel range.
const FALLBACK_MAX_LENGTH = Math.floor(BOARD_SIZE / MIN_FORMABLE_WORDS);
const FALLBACK_MAX_CONSONANTS = Math.floor((BOARD_SIZE - MIN_VOWELS) / MIN_FORMABLE_WORDS);
const FALLBACK_MAX_VOWELS = Math.floor(MAX_VOWELS / MIN_FORMABLE_WORDS);

const lettersOf = (word: string): Letter[] => [...word.toUpperCase()] as Letter[];
const vowelCount = (letters: readonly Letter[]): number => letters.filter(isVowel).length;
const hasVowelsInRange = (letters: readonly Letter[]): boolean => {
  const vowels = vowelCount(letters);
  return vowels >= MIN_VOWELS && vowels <= MAX_VOWELS;
};

export function countVowels(board: Board): number {
  return vowelCount(board.map((tile) => tile.letter));
}

function isSolvable(letters: readonly Letter[], dictionary: Dictionary): boolean {
  return countFormableWords(letters, dictionary, MIN_FORMABLE_WORDS) >= MIN_FORMABLE_WORDS;
}

export function isValidBoard(board: Board, dictionary: Dictionary): boolean {
  return (
    board.length === BOARD_SIZE &&
    hasVowelsInRange(board.map((tile) => tile.letter)) &&
    isSolvable(
      board.map((tile) => tile.letter),
      dictionary,
    )
  );
}

export function createBoardGenerator(deps: {
  readonly dictionary: Dictionary;
  readonly random: RandomSource;
}): BoardGenerator {
  const { dictionary, random } = deps;
  let nextTileId = 0;
  let fallbackWords: string[] | null = null;

  const toTile = (letter: Letter): Tile => ({ id: `t${nextTileId++}`, letter });
  const shuffled = (letters: readonly Letter[]): Letter[] =>
    shuffleOrder(letters.length, random).map((index) => letters[index]!);

  /**
   * Draws `count` letters of which between `minVowels` and `maxVowels` are vowels.
   * Vowels and consonants come from separate bags, so the split is exact rather than
   * left to chance.
   */
  function drawLetters(
    bag: LetterBag,
    count: number,
    minVowels: number,
    maxVowels: number,
  ): Letter[] {
    const vowels = minVowels + Math.floor(random.next() * (maxVowels - minVowels + 1));
    const letters = Array.from({ length: count }, (_, index) =>
      index < vowels ? bag.drawVowel() : bag.drawConsonant(),
    );
    return shuffled(letters);
  }

  /** Builds a board around nouns from the list, so the guarantees hold by construction. */
  function constructLetters(bag: LetterBag): Letter[] {
    fallbackWords ??= [...dictionary.signatures()]
      .flatMap(([, words]) => words)
      .filter(
        (word) =>
          word.length <= FALLBACK_MAX_LENGTH &&
          vowelCount(lettersOf(word)) <= FALLBACK_MAX_VOWELS &&
          word.length - vowelCount(lettersOf(word)) <= FALLBACK_MAX_CONSONANTS,
      );
    if (fallbackWords.length < MIN_FORMABLE_WORDS) {
      throw new Error('The noun list is too small to guarantee a solvable board');
    }
    const start = Math.floor(random.next() * fallbackWords.length);
    const letters = Array.from({ length: MIN_FORMABLE_WORDS }, (_, offset) =>
      lettersOf(fallbackWords![(start + offset) % fallbackWords!.length]!),
    ).flat();
    while (letters.length < BOARD_SIZE) {
      letters.push(vowelCount(letters) < MIN_VOWELS ? bag.drawVowel() : bag.drawConsonant());
    }
    return shuffled(letters);
  }

  function deal(level: number): Board {
    const bag = createLetterBag(level, random);
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      const letters = drawLetters(bag, BOARD_SIZE, MIN_VOWELS, MAX_VOWELS);
      if (isSolvable(letters, dictionary)) return letters.map(toTile);
    }
    return constructLetters(bag).map(toTile);
  }

  function refill(board: Board, usedTileIds: readonly string[], level: number): Board {
    const used = new Set(usedTileIds);
    const staying = board.filter((tile) => !used.has(tile.id)).map((tile) => tile.letter);
    const count = board.length - staying.length;
    if (count === 0) return board;

    // How many of the new tiles must, and may, be vowels to keep the board in range.
    const stayingVowels = vowelCount(staying);
    const minVowels = Math.max(0, MIN_VOWELS - stayingVowels);
    const maxVowels = Math.max(minVowels, Math.min(count, MAX_VOWELS - stayingVowels));
    const bag = createLetterBag(level, random);
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      const fresh = drawLetters(bag, count, minVowels, maxVowels);
      if (isSolvable([...staying, ...fresh], dictionary)) {
        let next = 0;
        return board.map((tile) => (used.has(tile.id) ? toTile(fresh[next++]!) : tile));
      }
    }
    return deal(level);
  }

  return { deal, refill };
}
