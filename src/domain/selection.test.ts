import { describe, expect, it } from 'vitest';
import { boardOf } from '../../tests/support/boards';
import { seededRandom } from '../../tests/support/seededRandom';
import {
  canSubmit,
  removeLast,
  selectLetter,
  selectTile,
  selectedLetters,
  shuffleOrder,
} from './selection';

const board = boardOf('EELCATDOGIRU');
const ids = board.map((tile) => tile.id);

describe('selectTile', () => {
  it('appends an unselected tile', () => {
    expect(selectTile(board, [], ids[3]!)).toEqual([ids[3]]);
  });

  it('ignores a tile that is already selected', () => {
    const selection = [ids[3]!];
    expect(selectTile(board, selection, ids[3]!)).toBe(selection);
  });

  it('ignores ids that are not on the board', () => {
    const selection = [ids[3]!];
    expect(selectTile(board, selection, 'nope')).toBe(selection);
  });

  it('stops at eight tiles', () => {
    const full = ids.slice(0, 8);
    expect(selectTile(board, full, ids[9]!)).toBe(full);
  });
});

describe('selectLetter', () => {
  it('picks the first unselected tile with that letter', () => {
    expect(selectLetter(board, [], 'E')).toEqual([ids[0]]);
  });

  it('uses a second tile for a repeated letter', () => {
    expect(selectLetter(board, [ids[0]!], 'E')).toEqual([ids[0], ids[1]]);
  });

  it('changes nothing when no unselected tile has the letter', () => {
    const both = [ids[0]!, ids[1]!];
    expect(selectLetter(board, both, 'E')).toBe(both);
    expect(selectLetter(board, [], 'Z')).toEqual([]);
  });
});

describe('removeLast', () => {
  it('drops the last tile', () => {
    expect(removeLast([ids[0]!, ids[1]!])).toEqual([ids[0]]);
  });

  it('returns the same empty selection', () => {
    const empty: string[] = [];
    expect(removeLast(empty)).toBe(empty);
  });
});

describe('selectedLetters and canSubmit', () => {
  it('spells the selection in order', () => {
    expect(selectedLetters(board, [ids[3]!, ids[4]!, ids[5]!]).join('')).toBe('CAT');
  });

  it('allows submission only for 3 to 8 tiles', () => {
    expect(canSubmit(ids.slice(0, 2))).toBe(false);
    expect(canSubmit(ids.slice(0, 3))).toBe(true);
    expect(canSubmit(ids.slice(0, 8))).toBe(true);
    expect(canSubmit(ids.slice(0, 9))).toBe(false);
  });
});

describe('shuffleOrder', () => {
  it('returns a permutation of the positions', () => {
    const order = shuffleOrder(12, seededRandom(5));
    expect([...order].sort((a, b) => a - b)).toEqual([...Array(12).keys()]);
    expect(order).not.toEqual([...Array(12).keys()]);
  });
});
