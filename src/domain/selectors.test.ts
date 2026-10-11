import { describe, expect, it } from 'vitest';
import { boardOf } from '../../tests/support/boards';
import { gameReducer, initialGameState } from './gameReducer';
import { bestPlayedWord, currentWord, levelProgress, selectionScore } from './selectors';

describe('selectors', () => {
  it('spells and scores the current selection', () => {
    const board = boardOf('CATDOGEINUSE');
    let state = gameReducer(initialGameState, { type: 'START', board, now: 0 });
    for (const letter of ['C', 'A', 'T'] as const) {
      state = gameReducer(state, { type: 'SELECT_LETTER', letter });
    }
    expect(currentWord(state)).toBe('CAT');
    expect(selectionScore(state)).toBe(5);
    expect(currentWord(initialGameState)).toBe('');
  });

  it('finds the highest-scoring word, preferring the earliest on a tie', () => {
    expect(bestPlayedWord([])).toBeNull();
    expect(
      bestPlayedWord([
        { word: 'CAT', score: 5, level: 1 },
        { word: 'QUIZ', score: 22, level: 1 },
        { word: 'JINX', score: 22, level: 2 },
      ])?.word,
    ).toBe('QUIZ');
  });

  it('reports progress between the previous and next targets', () => {
    expect(levelProgress(12, 1)).toEqual({ min: 0, max: 30, value: 12 });
    expect(levelProgress(45, 2)).toEqual({ min: 30, max: 70, value: 45 });
  });
});
