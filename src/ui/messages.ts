import { MAX_WORD_LENGTH, MIN_WORD_LENGTH } from '../domain/constants';
import { levelConfig } from '../domain/levels';
import { letterValue } from '../domain/scoring';
import type { GameState, Letter, RejectionReason, SubmitResult } from '../domain/types';

export const plural = (count: number, unit: string): string =>
  `${count} ${unit}${count === 1 ? '' : 's'}`;

export const tileLabel = (letter: Letter): string =>
  `${letter}, ${plural(letterValue(letter), 'point')}`;

const REJECTIONS: Record<RejectionReason, (word: string) => string> = {
  'not-a-noun': (word) => `${word} is not in the noun list.`,
  'too-short': () => `Words need at least ${MIN_WORD_LENGTH} letters.`,
  'too-long': () => `Words can have at most ${MAX_WORD_LENGTH} letters.`,
};

export function resultMessage(result: SubmitResult, totalScore: number): string {
  if (result.kind === 'rejected') return REJECTIONS[result.reason](result.word);
  const scored = `${result.word}, ${plural(result.score, 'point')}. Score ${totalScore}.`;
  if (result.leveledUpTo === undefined) return scored;
  const seconds = levelConfig(result.leveledUpTo).allowanceMs / 1000;
  return `${scored} Level ${result.leveledUpTo}. ${seconds} seconds per word.`;
}

/** The one line of feedback shown, and announced, for the current state. */
export function statusMessage(state: GameState): string {
  switch (state.status) {
    case 'over':
      return (
        `Time's up. Final score ${state.score}, level ${state.level}.` +
        (state.isNewBest ? ' New personal best.' : '')
      );
    case 'paused':
      return 'Paused.';
    case 'playing':
      return state.lastResult ? resultMessage(state.lastResult, state.score) : '';
    default:
      return '';
  }
}
