import { describe, expect, it } from 'vitest';
import { boardOf, lettersOf } from '../../tests/support/boards';
import { gameReducer, initialGameState } from './gameReducer';
import type { GameAction, GameState } from './types';

const board = boardOf('CATDOGEINUSE');
const ids = board.map((tile) => tile.id);

const play = (state: GameState, ...actions: GameAction[]): GameState =>
  actions.reduce(gameReducer, state);
const started = (now = 1000): GameState => play(initialGameState, { type: 'START', board, now });
const select = (...indexes: number[]): GameAction[] =>
  indexes.map((index) => ({ type: 'SELECT_TILE', tileId: ids[index]! }));

describe('START', () => {
  it('begins a level 1 game with the level 1 allowance on the clock', () => {
    const state = started(1000);
    expect(state).toMatchObject({
      status: 'playing',
      board,
      selection: [],
      score: 0,
      level: 1,
      deadline: 61_000,
      remainingMs: null,
      history: [],
      lastResult: null,
      isNewBest: false,
    });
  });

  it('is ignored while a game is in progress', () => {
    const state = started();
    expect(play(state, { type: 'START', board: boardOf('ABC'), now: 5 })).toBe(state);
  });

  it('resets everything when starting again after game over', () => {
    const over = play(
      started(),
      { type: 'WORD_ACCEPTED', word: 'CAT', score: 5, board, now: 2000 },
      { type: 'EXPIRE', isNewBest: true },
    );
    const again = play(over, { type: 'START', board, now: 9000 });
    expect(again).toMatchObject({
      status: 'playing',
      score: 0,
      level: 1,
      history: [],
      isNewBest: false,
    });
    expect(again.deadline).toBe(69_000);
  });
});

describe('selection actions', () => {
  it('selects tiles by id and by letter, without reusing a tile', () => {
    const state = play(
      started(),
      ...select(0),
      { type: 'SELECT_LETTER', letter: 'A' },
      ...select(0),
    );
    expect(state.selection).toEqual([ids[0], ids[1]]);
  });

  it('returns the same state when a letter has no free tile', () => {
    const state = started();
    expect(play(state, { type: 'SELECT_LETTER', letter: 'Z' })).toBe(state);
  });

  it('removes the last tile and clears the selection', () => {
    const state = play(started(), ...select(0, 1, 2));
    expect(play(state, { type: 'REMOVE_LAST' }).selection).toEqual([ids[0], ids[1]]);
    expect(play(state, { type: 'CLEAR_SELECTION' }).selection).toEqual([]);
    const empty = started();
    expect(play(empty, { type: 'CLEAR_SELECTION' })).toBe(empty);
    expect(play(empty, { type: 'REMOVE_LAST' })).toBe(empty);
  });

  it('is ignored unless the game is being played', () => {
    const paused = play(started(), { type: 'PAUSE', now: 2000 });
    expect(play(paused, ...select(0))).toBe(paused);
    const over = play(started(), { type: 'EXPIRE', isNewBest: false });
    expect(play(over, { type: 'SELECT_LETTER', letter: 'C' })).toBe(over);
    expect(play(initialGameState, ...select(0))).toBe(initialGameState);
  });
});

describe('SHUFFLE', () => {
  it('reorders tiles without changing letters, selection or deadline', () => {
    const state = play(started(), ...select(0));
    const order = [11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0];
    const shuffled = play(state, { type: 'SHUFFLE', order });
    expect(lettersOf(shuffled.board)).toBe('ESUNIEGODTAC');
    expect(shuffled.selection).toEqual(state.selection);
    expect(shuffled.deadline).toBe(state.deadline);
  });

  it('ignores an order that is not a permutation of the board', () => {
    const state = started();
    expect(play(state, { type: 'SHUFFLE', order: [0, 1, 2] })).toBe(state);
    expect(play(state, { type: 'SHUFFLE', order: Array(12).fill(0) })).toBe(state);
    expect(play(state, { type: 'SHUFFLE', order: [...Array(11).keys(), 12] })).toBe(state);
  });
});

describe('WORD_ACCEPTED', () => {
  const next = boardOf('XYZDOGEINUSE');

  it('adds the score, records the word, swaps the board, clears the selection and resets the clock', () => {
    const state = play(started(), ...select(0, 1, 2), {
      type: 'WORD_ACCEPTED',
      word: 'CAT',
      score: 5,
      board: next,
      now: 30_000,
    });
    expect(state).toMatchObject({
      score: 5,
      level: 1,
      board: next,
      selection: [],
      deadline: 90_000,
      history: [{ word: 'CAT', score: 5, level: 1 }],
      lastResult: { kind: 'accepted', word: 'CAT', score: 5 },
    });
    expect(state.lastResult).not.toHaveProperty('leveledUpTo');
  });

  it('moves to level 2 with a 55 second clock when 26 points become 31', () => {
    const state = play(
      started(),
      { type: 'WORD_ACCEPTED', word: 'FIRST', score: 26, board, now: 2000 },
      { type: 'WORD_ACCEPTED', word: 'CAT', score: 5, board, now: 10_000 },
    );
    expect(state.level).toBe(2);
    expect(state.deadline).toBe(65_000);
    expect(state.lastResult).toMatchObject({ kind: 'accepted', leveledUpTo: 2 });
    expect(state.history.map((entry) => entry.level)).toEqual([1, 1]);
  });

  it('can clear more than one level with a single word', () => {
    const state = play(started(), { type: 'WORD_ACCEPTED', word: 'BIG', score: 75, board, now: 0 });
    expect(state.level).toBe(3);
    expect(state.lastResult).toMatchObject({ leveledUpTo: 3 });
    expect(state.deadline).toBe(50_000);
  });

  it('keeps level equal to levelForScore and uses the 15 second floor late on', () => {
    const state = play(started(), {
      type: 'WORD_ACCEPTED',
      word: 'HUGE',
      score: 700,
      board,
      now: 0,
    });
    expect(state.level).toBe(11);
    expect(state.deadline).toBe(15_000);
  });
});

describe('WORD_REJECTED', () => {
  it('clears the selection and records the reason, leaving score, board and clock alone', () => {
    const before = play(started(), ...select(1, 2, 6));
    const state = play(before, { type: 'WORD_REJECTED', word: 'ATE', reason: 'not-a-noun' });
    expect(state.selection).toEqual([]);
    expect(state.lastResult).toEqual({ kind: 'rejected', word: 'ATE', reason: 'not-a-noun' });
    expect(state.score).toBe(0);
    expect(state.board).toBe(before.board);
    expect(state.deadline).toBe(before.deadline);
  });
});

describe('PAUSE and RESUME', () => {
  it('stores the remaining time and restores it on resume', () => {
    const paused = play(started(1000), { type: 'PAUSE', now: 21_000 });
    expect(paused).toMatchObject({ status: 'paused', remainingMs: 40_000, deadline: null });
    const resumed = play(paused, { type: 'RESUME', now: 500_000 });
    expect(resumed).toMatchObject({ status: 'playing', remainingMs: null, deadline: 540_000 });
    expect(resumed.board).toBe(paused.board);
  });

  it('never stores negative remaining time', () => {
    expect(play(started(0), { type: 'PAUSE', now: 999_999 }).remainingMs).toBe(0);
  });

  it('is ignored in the wrong status', () => {
    const state = started();
    expect(play(state, { type: 'RESUME', now: 1 })).toBe(state);
    expect(play(initialGameState, { type: 'PAUSE', now: 1 })).toBe(initialGameState);
  });
});

describe('EXPIRE', () => {
  it('ends the game, clearing selection and deadline', () => {
    const state = play(started(), ...select(0), { type: 'EXPIRE', isNewBest: true });
    expect(state).toMatchObject({ status: 'over', selection: [], deadline: null, isNewBest: true });
  });

  it('is ignored unless playing', () => {
    expect(play(initialGameState, { type: 'EXPIRE', isNewBest: false })).toBe(initialGameState);
  });
});
