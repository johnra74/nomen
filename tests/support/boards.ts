import type { BoardGenerator } from '../../src/domain/boardGenerator';
import type { Board, Letter } from '../../src/domain/types';

let nextId = 0;

/** A board spelled out as a string, e.g. boardOf('CATDOGEINUSE'). */
export function boardOf(letters: string): Board {
  return [...letters].map((letter) => ({ id: `x${nextId++}`, letter: letter as Letter }));
}

/** Deals fixed boards and refills used positions from a queue of letters. */
export function scriptedGenerator(deals: readonly string[], refills = ''): BoardGenerator {
  const dealQueue = [...deals];
  const refillQueue = [...refills];
  return {
    deal: () => boardOf(dealQueue.length > 1 ? dealQueue.shift()! : dealQueue[0]!),
    refill(board, usedTileIds) {
      const used = new Set(usedTileIds);
      return board.map((tile) =>
        used.has(tile.id) ? boardOf(refillQueue.shift() ?? 'E')[0]! : tile,
      );
    },
  };
}

export const lettersOf = (board: Board): string => board.map((tile) => tile.letter).join('');
