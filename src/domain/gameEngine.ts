import type { Clock, Dictionary, PersonalBest, RandomSource, ScoreStore } from '../ports';
import type { BoardGenerator } from './boardGenerator';
import { levelForScore } from './levels';
import { wordScore } from './scoring';
import { canSubmit, selectedLetters, shuffleOrder } from './selection';
import type { GameAction, GameState } from './types';
import { validateWord } from './wordValidator';

/**
 * Commands that need the outside world (time, randomness, the noun list, storage).
 * Each returns a plain action for the pure reducer to apply.
 */
export interface GameEngine {
  /** Deals a level 1 board and returns the START action. */
  start(): GameAction;
  /**
   * Validates the current selection. Returns WORD_ACCEPTED (with score and refilled
   * board) or WORD_REJECTED. Returns null when the game is not being played, the
   * selection is not submittable, or time has run out.
   */
  submit(state: GameState): GameAction | null;
  /** Returns EXPIRE once the deadline has passed, saving a new personal best if earned. */
  expireIfDue(state: GameState): GameAction | null;
  shuffle(state: GameState): GameAction;
  pause(): GameAction;
  resume(): GameAction;
  personalBest(): PersonalBest | null;
}

export interface GameEngineDeps {
  readonly dictionary: Dictionary;
  readonly boardGenerator: BoardGenerator;
  readonly random: RandomSource;
  readonly clock: Clock;
  readonly scoreStore: ScoreStore;
  /** Wall-clock time as ISO 8601, used only to date a personal best. */
  readonly timestamp: () => string;
}

export function createGameEngine(deps: GameEngineDeps): GameEngine {
  const { dictionary, boardGenerator, random, clock, scoreStore, timestamp } = deps;

  const timeIsUp = (state: GameState): boolean =>
    state.deadline !== null && clock.now() >= state.deadline;

  function recordIfBest(state: GameState): boolean {
    const best = scoreStore.load();
    const isNewBest = state.score > (best?.score ?? 0);
    if (isNewBest) {
      scoreStore.save({ score: state.score, level: state.level, achievedAt: timestamp() });
    }
    return isNewBest;
  }

  return {
    start: () => ({ type: 'START', board: boardGenerator.deal(1), now: clock.now() }),

    submit(state) {
      if (state.status !== 'playing' || !canSubmit(state.selection) || timeIsUp(state)) return null;
      const letters = selectedLetters(state.board, state.selection);
      const validation = validateWord(letters, dictionary);
      if (!validation.valid) {
        return { type: 'WORD_REJECTED', word: validation.word, reason: validation.reason };
      }
      const score = wordScore(letters);
      const level = levelForScore(state.score + score);
      return {
        type: 'WORD_ACCEPTED',
        word: validation.word,
        score,
        board: boardGenerator.refill(state.board, state.selection, level),
        now: clock.now(),
      };
    },

    expireIfDue(state) {
      if (state.status !== 'playing' || !timeIsUp(state)) return null;
      return { type: 'EXPIRE', isNewBest: recordIfBest(state) };
    },

    shuffle: (state) => ({ type: 'SHUFFLE', order: shuffleOrder(state.board.length, random) }),
    pause: () => ({ type: 'PAUSE', now: clock.now() }),
    resume: () => ({ type: 'RESUME', now: clock.now() }),
    personalBest: () => scoreStore.load(),
  };
}
