import { describe, expect, it } from 'vitest';
import { initialGameState } from '../domain/gameReducer';
import type { GameState } from '../domain/types';
import { plural, resultMessage, statusMessage, tileLabel } from './messages';

const state = (overrides: Partial<GameState>): GameState => ({ ...initialGameState, ...overrides });

describe('messages', () => {
  it('pluralises units', () => {
    expect(plural(1, 'point')).toBe('1 point');
    expect(plural(5, 'point')).toBe('5 points');
  });

  it('labels tiles with letter and value', () => {
    expect(tileLabel('E')).toBe('E, 1 point');
    expect(tileLabel('Q')).toBe('Q, 10 points');
  });

  it('describes accepted words, with the level-up when there is one', () => {
    expect(resultMessage({ kind: 'accepted', word: 'CAT', score: 5 }, 31)).toBe(
      'CAT, 5 points. Score 31.',
    );
    expect(resultMessage({ kind: 'accepted', word: 'CAT', score: 5, leveledUpTo: 2 }, 31)).toBe(
      'CAT, 5 points. Score 31. Level 2. 55 seconds per word.',
    );
  });

  it('gives the reason for each kind of rejection', () => {
    expect(resultMessage({ kind: 'rejected', word: 'ATE', reason: 'not-a-noun' }, 0)).toBe(
      'ATE is not in the noun list.',
    );
    expect(resultMessage({ kind: 'rejected', word: 'AT', reason: 'too-short' }, 0)).toBe(
      'Words need at least 3 letters.',
    );
    expect(resultMessage({ kind: 'rejected', word: 'ABSTRACTS', reason: 'too-long' }, 0)).toBe(
      'Words can have at most 8 letters.',
    );
  });

  it('summarises each game status', () => {
    expect(statusMessage(initialGameState)).toBe('');
    expect(statusMessage(state({ status: 'playing' }))).toBe('');
    expect(statusMessage(state({ status: 'paused' }))).toBe('Paused.');
    expect(statusMessage(state({ status: 'over', score: 142, level: 4 }))).toBe(
      "Time's up. Final score 142, level 4.",
    );
    expect(statusMessage(state({ status: 'over', score: 142, level: 4, isNewBest: true }))).toBe(
      "Time's up. Final score 142, level 4. New personal best.",
    );
  });
});
