// @vitest-environment node
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { seededRandom } from '../../tests/support/seededRandom';
import { createWordListDictionary } from '../infrastructure/wordListDictionary';
import { createBoardGenerator } from './boardGenerator';
import { MIN_FORMABLE_WORDS } from './constants';
import { countFormableWords } from './solvability';
import type { Letter } from './types';

const dictionary = createWordListDictionary(readFileSync('src/assets/nouns.txt', 'utf8'));

function worstMs(runs: number, task: () => void): number {
  let worst = 0;
  for (let i = 0; i < runs; i++) {
    const started = performance.now();
    task();
    worst = Math.max(worst, performance.now() - started);
  }
  return worst;
}

describe('performance against the real noun list (SC-003)', () => {
  it('checks solvability within 10 ms, even when it must scan the whole list', () => {
    const unsolvable = [...'QQQQXXXXZZZZ'] as Letter[];
    expect(countFormableWords(unsolvable, dictionary, MIN_FORMABLE_WORDS)).toBe(0);
    const worst = worstMs(50, () => countFormableWords(unsolvable, dictionary, MIN_FORMABLE_WORDS));
    expect(worst).toBeLessThan(10);
  });

  it('refills a board well within the 100 ms feedback budget', () => {
    const generator = createBoardGenerator({ dictionary, random: seededRandom(3) });
    let board = generator.deal(1);
    const worst = worstMs(500, () => {
      board = generator.refill(
        board,
        board.slice(0, 5).map((tile) => tile.id),
        10,
      );
    });
    expect(worst).toBeLessThan(100);
  });
});
