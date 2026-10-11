// @vitest-environment node
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { seededRandom } from '../../tests/support/seededRandom';
import { createWordListDictionary } from '../infrastructure/wordListDictionary';
import { createBoardGenerator, isValidBoard } from './boardGenerator';
import { MAX_WORD_LENGTH, MIN_WORD_LENGTH } from './constants';

const dictionary = createWordListDictionary(readFileSync('src/assets/nouns.txt', 'utf8'));
const LEVELS = 20;
const BOARDS = 100_000;

describe('board guarantees against the real noun list (SC-002)', () => {
  it(
    `holds for ${BOARDS} deals and refills across levels 1 to ${LEVELS}`,
    { timeout: 120_000 },
    () => {
      const random = seededRandom(20261011);
      const generator = createBoardGenerator({ dictionary, random });
      let violations = 0;
      let checked = 0;

      for (let level = 1; level <= LEVELS; level++) {
        let board = generator.deal(level);
        for (let i = 0; i < BOARDS / LEVELS; i++) {
          // Alternate fresh deals with refills of a random 3 to 8 tile "word".
          if (i % 10 === 0) {
            board = generator.deal(level);
          } else {
            const size =
              MIN_WORD_LENGTH + Math.floor(random.next() * (MAX_WORD_LENGTH - MIN_WORD_LENGTH + 1));
            const start = Math.floor(random.next() * board.length);
            const used = Array.from(
              { length: size },
              (_, k) => board[(start + k) % board.length]!.id,
            );
            board = generator.refill(board, used, level);
          }
          if (!isValidBoard(board, dictionary)) violations++;
          checked++;
        }
      }

      expect(checked).toBe(BOARDS);
      expect(violations).toBe(0);
    },
  );
});
