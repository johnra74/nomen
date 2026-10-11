import { levelConfig } from './levels';
import { wordScore } from './scoring';
import { selectedLetters } from './selection';
import type { GameState, PlayedWord } from './types';

export function currentWord(state: GameState): string {
  return selectedLetters(state.board, state.selection).join('');
}

export function selectionScore(state: GameState): number {
  return wordScore(selectedLetters(state.board, state.selection));
}

/** The highest-scoring word played; the earliest wins a tie. */
export function bestPlayedWord(history: readonly PlayedWord[]): PlayedWord | null {
  return history.reduce<PlayedWord | null>(
    (best, entry) => (best === null || entry.score > best.score ? entry : best),
    null,
  );
}

/** Where `score` sits between the previous level's target and the current one. */
export function levelProgress(
  score: number,
  level: number,
): { min: number; max: number; value: number } {
  return {
    min: level > 1 ? levelConfig(level - 1).targetScore : 0,
    max: levelConfig(level).targetScore,
    value: score,
  };
}
