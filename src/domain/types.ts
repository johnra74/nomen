import type { PersonalBest } from '../ports';

export type { PersonalBest };

// prettier-ignore
export type Letter =
  | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L' | 'M'
  | 'N' | 'O' | 'P' | 'Q' | 'R' | 'S' | 'T' | 'U' | 'V' | 'W' | 'X' | 'Y' | 'Z';

export interface Tile {
  readonly id: string;
  readonly letter: Letter;
}

/** Exactly BOARD_SIZE tiles in display order. */
export type Board = readonly Tile[];

/** Ordered tile ids, 0 to MAX_WORD_LENGTH long, no repeats. */
export type Selection = readonly string[];

export interface LevelConfig {
  readonly level: number;
  readonly allowanceMs: number;
  readonly targetScore: number;
  readonly hardLetterMultiplier: number;
}

export type RejectionReason = 'too-short' | 'too-long' | 'not-a-noun';

export type SubmitResult =
  | {
      readonly kind: 'accepted';
      readonly word: string;
      readonly score: number;
      readonly leveledUpTo?: number;
    }
  | { readonly kind: 'rejected'; readonly word: string; readonly reason: RejectionReason };

export interface PlayedWord {
  readonly word: string;
  readonly score: number;
  readonly level: number;
}

export type GameStatus = 'ready' | 'playing' | 'paused' | 'over';

export interface GameState {
  readonly status: GameStatus;
  readonly board: Board;
  readonly selection: Selection;
  readonly score: number;
  readonly level: number;
  readonly deadline: number | null;
  readonly remainingMs: number | null;
  readonly history: readonly PlayedWord[];
  readonly lastResult: SubmitResult | null;
  readonly isNewBest: boolean;
}

export type GameAction =
  | { readonly type: 'START'; readonly board: Board; readonly now: number }
  | { readonly type: 'SELECT_TILE'; readonly tileId: string }
  | { readonly type: 'SELECT_LETTER'; readonly letter: Letter }
  | { readonly type: 'REMOVE_LAST' }
  | { readonly type: 'CLEAR_SELECTION' }
  | { readonly type: 'SHUFFLE'; readonly order: readonly number[] }
  | {
      readonly type: 'WORD_ACCEPTED';
      readonly word: string;
      readonly score: number;
      readonly board: Board;
      readonly now: number;
    }
  | { readonly type: 'WORD_REJECTED'; readonly word: string; readonly reason: RejectionReason }
  | { readonly type: 'PAUSE'; readonly now: number }
  | { readonly type: 'RESUME'; readonly now: number }
  | { readonly type: 'EXPIRE'; readonly isNewBest: boolean };
