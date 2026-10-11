/**
 * Port contracts for nōmən.
 *
 * These are the only seams between the pure domain and the outside world.
 * The domain depends on these interfaces; `src/infrastructure` implements them;
 * `tests/support` provides fakes.
 */

/** The game's noun list. Words are lowercase a-z, 3 to 8 letters. */
export interface Dictionary {
  /** True if `word` (any case) is in the noun list. */
  has(word: string): boolean;

  /**
   * Every distinct sorted-letter signature in the list with the words sharing it,
   * e.g. ["act", ["act", "cat"]]. Used by the solvability check.
   */
  signatures(): Iterable<readonly [signature: string, words: readonly string[]]>;

  /** Number of words in the list. */
  readonly size: number;
}

/** Source of randomness. Injected so board generation is reproducible in tests. */
export interface RandomSource {
  /** A number in [0, 1). */
  next(): number;
}

/** Monotonic time source. Injected so the countdown is controllable in tests. */
export interface Clock {
  /** Milliseconds from an arbitrary fixed origin. Never goes backwards. */
  now(): number;
}

export interface PersonalBest {
  readonly score: number;
  readonly level: number;
  /** ISO 8601 timestamp. */
  readonly achievedAt: string;
}

/** Persistence for the personal best. Implementations must never throw. */
export interface ScoreStore {
  /** The stored best, or null when none exists or storage is unavailable or corrupt. */
  load(): PersonalBest | null;

  /** Stores `best`. Returns false when storage is unavailable; the game continues. */
  save(best: PersonalBest): boolean;
}
