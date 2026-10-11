/**
 * Domain contracts for nōmən: types and the signatures of the pure functions
 * that implement the game rules. Design reference for `src/domain/**`.
 * Behavioural rules are in ../data-model.md; requirement ids refer to ../spec.md.
 */

import type { Clock, Dictionary, PersonalBest, RandomSource, ScoreStore } from './ports';

// ---------- Types ----------

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
  | { readonly kind: 'accepted'; readonly word: string; readonly score: number; readonly leveledUpTo?: number }
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
  | { readonly type: 'WORD_ACCEPTED'; readonly word: string; readonly score: number; readonly board: Board; readonly now: number }
  | { readonly type: 'WORD_REJECTED'; readonly word: string; readonly reason: RejectionReason }
  | { readonly type: 'PAUSE'; readonly now: number }
  | { readonly type: 'RESUME'; readonly now: number }
  | { readonly type: 'EXPIRE'; readonly isNewBest: boolean };

// ---------- scoring.ts (FR-002, FR-014) ----------

export declare function letterValue(letter: Letter): number;
export declare function wordScore(letters: readonly Letter[]): number;

// ---------- levels.ts (FR-022 to FR-027) ----------

export declare function levelConfig(level: number): LevelConfig;
/** Lowest level whose targetScore is greater than `score`. Non-decreasing in `score`. */
export declare function levelForScore(score: number): number;

// ---------- letterBag.ts (FR-025) ----------

export interface LetterBag {
  /** Draws a vowel using the level's vowel weights. */
  drawVowel(): Letter;
  /** Draws a consonant using the level's consonant weights (hard letters boosted by level). */
  drawConsonant(): Letter;
}
export declare function createLetterBag(level: number, random: RandomSource): LetterBag;

// ---------- solvability.ts (FR-004) ----------

/**
 * Number of distinct dictionary nouns of legal length formable from `letters`,
 * counting no further than `limit` (early exit).
 */
export declare function countFormableWords(
  letters: readonly Letter[],
  dictionary: Dictionary,
  limit: number,
): number;

// ---------- boardGenerator.ts (FR-001, FR-003, FR-004, FR-005, FR-015) ----------

export interface BoardGenerator {
  /** A fresh board satisfying the vowel and solvability guarantees. */
  deal(level: number): Board;
  /**
   * Replaces the tiles in `usedTileIds`, in place, with new tiles. Other tiles are
   * unchanged unless the guarantees force a full redeal. Always returns a valid board.
   */
  refill(board: Board, usedTileIds: readonly string[], level: number): Board;
}
export declare function createBoardGenerator(deps: {
  readonly dictionary: Dictionary;
  readonly random: RandomSource;
}): BoardGenerator;

export declare function countVowels(board: Board): number;
export declare function isValidBoard(board: Board, dictionary: Dictionary): boolean;

// ---------- selection.ts (FR-006 to FR-011) ----------

export declare function selectTile(board: Board, selection: Selection, tileId: string): Selection;
export declare function selectLetter(board: Board, selection: Selection, letter: Letter): Selection;
export declare function removeLast(selection: Selection): Selection;
export declare function selectedLetters(board: Board, selection: Selection): readonly Letter[];
export declare function canSubmit(selection: Selection): boolean;
/** A random permutation of board positions, for the SHUFFLE action. */
export declare function shuffleOrder(size: number, random: RandomSource): readonly number[];

// ---------- wordValidator.ts (FR-012, FR-013, FR-016) ----------

export type Validation =
  | { readonly valid: true; readonly word: string }
  | { readonly valid: false; readonly word: string; readonly reason: RejectionReason };

export declare function validateWord(letters: readonly Letter[], dictionary: Dictionary): Validation;

// ---------- gameReducer.ts ----------

export declare const initialGameState: GameState;
/** Pure. Ignores actions that are not legal in the current status. */
export declare function gameReducer(state: GameState, action: GameAction): GameState;

// ---------- gameEngine.ts ----------

export interface GameEngine {
  /** Deals a level 1 board and returns the START action. */
  start(): GameAction;
  /**
   * Validates the current selection. Returns WORD_ACCEPTED (with score and refilled
   * board) or WORD_REJECTED. Returns null when the game is not playing, the selection
   * is not submittable, or the deadline has passed (FR-019).
   */
  submit(state: GameState): GameAction | null;
  /** Returns EXPIRE once the deadline has passed, saving a new personal best if earned; otherwise null. */
  expireIfDue(state: GameState): GameAction | null;
  shuffle(state: GameState): GameAction;
  pause(): GameAction;
  resume(): GameAction;
  personalBest(): PersonalBest | null;
}
export declare function createGameEngine(deps: {
  readonly dictionary: Dictionary;
  /** Injected rather than built inside, so tests can script boards. */
  readonly boardGenerator: BoardGenerator;
  readonly random: RandomSource;
  readonly clock: Clock;
  readonly scoreStore: ScoreStore;
  /** Wall-clock time as ISO 8601, used only to date a personal best. */
  readonly timestamp: () => string;
}): GameEngine;
