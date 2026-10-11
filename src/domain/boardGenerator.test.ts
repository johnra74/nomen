import { describe, expect, it } from 'vitest';
import { boardOf, lettersOf } from '../../tests/support/boards';
import { fixtureDictionary } from '../../tests/support/fixtureDictionary';
import { seededRandom } from '../../tests/support/seededRandom';
import { countVowels, createBoardGenerator, isValidBoard } from './boardGenerator';
import { BOARD_SIZE, MAX_VOWELS, MIN_VOWELS, isVowel } from './constants';
import type { Board } from './types';

const common = fixtureDictionary([
  'cat',
  'act',
  'dog',
  'tea',
  'toe',
  'tie',
  'oat',
  'ear',
  'era',
  'ore',
  'sea',
  'ion',
  'oil',
  'air',
  'eon',
  'one',
  'nut',
  'net',
  'ant',
  'art',
  'rat',
  'tar',
  'idea',
  'area',
  'aura',
  'onion',
]);
// Nouns that random draws essentially never spell, to force the fallback paths.
const rare = fixtureDictionary(['jazz', 'quiz']);

function expectVowelRange(board: Board) {
  expect(countVowels(board)).toBeGreaterThanOrEqual(MIN_VOWELS);
  expect(countVowels(board)).toBeLessThanOrEqual(MAX_VOWELS);
}

describe('deal', () => {
  it('returns 12 uniquely identified tiles that satisfy both guarantees', () => {
    const generator = createBoardGenerator({ dictionary: common, random: seededRandom(1) });
    for (let i = 0; i < 200; i++) {
      const board = generator.deal(1 + (i % 15));
      expect(board).toHaveLength(BOARD_SIZE);
      expect(new Set(board.map((tile) => tile.id)).size).toBe(BOARD_SIZE);
      expectVowelRange(board);
      expect(isValidBoard(board, common)).toBe(true);
    }
  });

  it('deals both 5-vowel and 6-vowel boards', () => {
    const generator = createBoardGenerator({ dictionary: common, random: seededRandom(12) });
    const counts = new Set(Array.from({ length: 100 }, () => countVowels(generator.deal(1))));
    expect([...counts].sort()).toEqual([MIN_VOWELS, MAX_VOWELS]);
  });

  it('falls back to a board built around two nouns when random draws never work', () => {
    const generator = createBoardGenerator({ dictionary: rare, random: seededRandom(2) });
    const board = generator.deal(1);
    expect(isValidBoard(board, rare)).toBe(true);
    expectVowelRange(board);
    const letters = lettersOf(board);
    expect(letters.match(/Z/g)!.length).toBeGreaterThanOrEqual(3);
    expect(letters).toMatch(/J/);
    expect(letters).toMatch(/Q/);
  });

  it('fails loudly when the noun list cannot guarantee two words', () => {
    const generator = createBoardGenerator({
      dictionary: fixtureDictionary(['jazz']),
      random: seededRandom(3),
    });
    expect(() => generator.deal(1)).toThrow(/noun list/i);
  });
});

describe('refill', () => {
  it('replaces exactly the used positions and keeps the other tiles', () => {
    const generator = createBoardGenerator({ dictionary: common, random: seededRandom(4) });
    for (let i = 0; i < 100; i++) {
      const board = generator.deal(1);
      const used = [board[0]!.id, board[5]!.id, board[11]!.id];
      const next = generator.refill(board, used, 1);
      expect(isValidBoard(next, common)).toBe(true);
      next.forEach((tile, index) => {
        if ([0, 5, 11].includes(index)) expect(used).not.toContain(tile.id);
        else expect(tile).toBe(board[index]);
      });
      expect(new Set(next.map((tile) => tile.id)).size).toBe(BOARD_SIZE);
    }
  });

  it('brings the vowels back into range after the vowels are used', () => {
    const generator = createBoardGenerator({ dictionary: common, random: seededRandom(5) });
    for (let i = 0; i < 100; i++) {
      const board = generator.deal(1);
      const vowels = board.filter((tile) => isVowel(tile.letter));
      const next = generator.refill(
        board,
        vowels.map((tile) => tile.id),
        1,
      );
      expectVowelRange(next);
    }
  });

  it('never pushes the vowels over the maximum when only consonants are used', () => {
    const generator = createBoardGenerator({ dictionary: common, random: seededRandom(9) });
    for (let i = 0; i < 100; i++) {
      const board = generator.deal(1);
      const consonants = board.filter((tile) => !isVowel(tile.letter)).slice(0, 5);
      const next = generator.refill(
        board,
        consonants.map((tile) => tile.id),
        1,
      );
      expectVowelRange(next);
      expect(isValidBoard(next, common)).toBe(true);
    }
  });

  it('returns the same board when no tiles were used', () => {
    const generator = createBoardGenerator({ dictionary: common, random: seededRandom(6) });
    const board = generator.deal(1);
    expect(generator.refill(board, [], 1)).toBe(board);
  });

  it('redeals the whole board when a refill cannot be made solvable', () => {
    const generator = createBoardGenerator({ dictionary: rare, random: seededRandom(7) });
    const board = generator.deal(1);
    const next = generator.refill(
      board,
      [
        board[0]!.id,
        board[1]!.id,
        board[2]!.id,
        board[3]!.id,
        board[4]!.id,
        board[5]!.id,
        board[6]!.id,
        board[7]!.id,
      ],
      1,
    );
    expect(isValidBoard(next, rare)).toBe(true);
    expect(next.every((tile) => !board.includes(tile))).toBe(true);
  });
});

describe('isValidBoard', () => {
  const generator = createBoardGenerator({ dictionary: common, random: seededRandom(8) });

  it('rejects boards of the wrong size', () => {
    expect(isValidBoard(generator.deal(1).slice(1), common)).toBe(false);
  });

  it('rejects boards with too many vowels', () => {
    const board = generator.deal(1);
    let extra = MAX_VOWELS + 1 - countVowels(board);
    const heavy = board.map((tile) =>
      !isVowel(tile.letter) && extra-- > 0 ? { ...tile, letter: 'A' as const } : tile,
    );
    expect(countVowels(heavy)).toBe(MAX_VOWELS + 1);
    expect(isValidBoard(heavy, common)).toBe(false);
  });

  it('rejects boards with too few vowels or too few nouns', () => {
    expect(isValidBoard(boardOf('TTTTTTTTTTTT'), common)).toBe(false);
    expect(isValidBoard(boardOf('UUUUUXXXXXXX'), common)).toBe(false);
  });
});
