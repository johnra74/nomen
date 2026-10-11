import type { RandomSource } from '../ports';
import { MAX_WORD_LENGTH, MIN_WORD_LENGTH } from './constants';
import type { Board, Letter, Selection } from './types';

/** Adds a tile to the selection. Returns the same selection when the pick is not allowed. */
export function selectTile(board: Board, selection: Selection, tileId: string): Selection {
  const allowed =
    selection.length < MAX_WORD_LENGTH &&
    !selection.includes(tileId) &&
    board.some((tile) => tile.id === tileId);
  return allowed ? [...selection, tileId] : selection;
}

/** Adds the first unselected tile showing `letter`, if there is one. */
export function selectLetter(board: Board, selection: Selection, letter: Letter): Selection {
  const tile = board.find(
    (candidate) => candidate.letter === letter && !selection.includes(candidate.id),
  );
  return tile ? selectTile(board, selection, tile.id) : selection;
}

export function removeLast(selection: Selection): Selection {
  return selection.length === 0 ? selection : selection.slice(0, -1);
}

export function selectedLetters(board: Board, selection: Selection): readonly Letter[] {
  const letterById = new Map(board.map((tile) => [tile.id, tile.letter]));
  return selection.flatMap((id) => letterById.get(id) ?? []);
}

export function canSubmit(selection: Selection): boolean {
  return selection.length >= MIN_WORD_LENGTH && selection.length <= MAX_WORD_LENGTH;
}

/** A random permutation of the positions 0 to size - 1 (Fisher-Yates). */
export function shuffleOrder(size: number, random: RandomSource): readonly number[] {
  const order = Array.from({ length: size }, (_, index) => index);
  for (let i = size - 1; i > 0; i--) {
    const j = Math.floor(random.next() * (i + 1));
    [order[i], order[j]] = [order[j]!, order[i]!];
  }
  return order;
}
