import { describe, expect, it } from 'vitest';
import { lettersOf, scriptedGenerator } from '../../tests/support/boards';
import { fakeClock } from '../../tests/support/fakeClock';
import { fixtureDictionary } from '../../tests/support/fixtureDictionary';
import { memoryScoreStore } from '../../tests/support/memoryScoreStore';
import { seededRandom } from '../../tests/support/seededRandom';
import type { PersonalBest } from '../ports';
import { createGameEngine } from './gameEngine';
import { gameReducer, initialGameState } from './gameReducer';
import type { GameAction, GameState } from './types';

const STAMP = '2026-10-11T00:00:00.000Z';

function setup(options: { best?: PersonalBest | null; deals?: string[]; refills?: string } = {}) {
  const clock = fakeClock(1000);
  const scoreStore = memoryScoreStore(options.best ?? null);
  const engine = createGameEngine({
    dictionary: fixtureDictionary(['cat', 'act', 'dog', 'quiz', 'jazz']),
    boardGenerator: scriptedGenerator(options.deals ?? ['CATDOGEINUSE'], options.refills ?? 'XYZ'),
    random: seededRandom(1),
    clock,
    scoreStore,
    timestamp: () => STAMP,
  });
  return { clock, scoreStore, engine };
}

const apply = (state: GameState, action: GameAction | null): GameState =>
  action ? gameReducer(state, action) : state;

function type(state: GameState, word: string): GameState {
  return [...word].reduce(
    (current, letter) => gameReducer(current, { type: 'SELECT_LETTER', letter } as GameAction),
    state,
  );
}

describe('start', () => {
  it('deals a board and stamps the current time', () => {
    const { engine } = setup();
    const action = engine.start();
    expect(action).toMatchObject({ type: 'START', now: 1000 });
    expect(lettersOf(apply(initialGameState, action).board)).toBe('CATDOGEINUSE');
  });
});

describe('submit', () => {
  it('accepts a noun with its score and a board refilled only where tiles were used', () => {
    const { engine, clock } = setup();
    const state = type(apply(initialGameState, engine.start()), 'CAT');
    clock.advance(5000);
    const action = engine.submit(state);
    expect(action).toMatchObject({ type: 'WORD_ACCEPTED', word: 'CAT', score: 5, now: 6000 });
    const next = apply(state, action);
    expect(lettersOf(next.board)).toBe('XYZDOGEINUSE');
    expect(next.board.slice(3)).toEqual(state.board.slice(3));
  });

  it('rejects a word that is not in the noun list', () => {
    const { engine } = setup();
    const state = type(apply(initialGameState, engine.start()), 'TAG');
    expect(engine.submit(state)).toEqual({
      type: 'WORD_REJECTED',
      word: 'TAG',
      reason: 'not-a-noun',
    });
  });

  it('does nothing when not playing or when the selection cannot be submitted', () => {
    const { engine } = setup();
    expect(engine.submit(initialGameState)).toBeNull();
    const state = type(apply(initialGameState, engine.start()), 'CA');
    expect(engine.submit(state)).toBeNull();
  });

  it('does not count a submission made once time has run out', () => {
    const { engine, clock } = setup();
    const state = type(apply(initialGameState, engine.start()), 'CAT');
    clock.advance(59_999);
    expect(engine.submit(state)).not.toBeNull();
    clock.advance(1);
    expect(engine.submit(state)).toBeNull();
  });

  it('refills for the level reached and reports the level-up', () => {
    const levels: number[] = [];
    const { engine } = setup({ deals: ['QUIZJAZZETON'] });
    const generator = scriptedGenerator(['QUIZJAZZETON'], 'TIERTIER');
    const spying = createGameEngine({
      dictionary: fixtureDictionary(['quiz', 'jazz']),
      boardGenerator: {
        deal: generator.deal,
        refill(board, used, level) {
          levels.push(level);
          return generator.refill(board, used, level);
        },
      },
      random: seededRandom(1),
      clock: fakeClock(),
      scoreStore: memoryScoreStore(),
      timestamp: () => STAMP,
    });
    let state = type(apply(initialGameState, spying.start()), 'QUIZ');
    state = apply(state, spying.submit(state));
    expect(state.lastResult).not.toHaveProperty('leveledUpTo');
    state = type(state, 'JAZZ');
    state = apply(state, spying.submit(state));
    expect(levels).toEqual([1, 2]);
    expect(state).toMatchObject({ score: 51, level: 2, lastResult: { leveledUpTo: 2 } });
    expect(engine.personalBest()).toBeNull();
  });
});

describe('shuffle, pause and resume', () => {
  it('produces a permutation of the board positions', () => {
    const { engine } = setup();
    const state = apply(initialGameState, engine.start());
    const action = engine.shuffle(state);
    expect(action.type).toBe('SHUFFLE');
    expect(lettersOf(apply(state, action).board).split('').sort().join('')).toBe('ACDEEGINOSTU');
  });

  it('stamps pause and resume with the clock', () => {
    const { engine, clock } = setup();
    expect(engine.pause()).toEqual({ type: 'PAUSE', now: 1000 });
    clock.advance(10);
    expect(engine.resume()).toEqual({ type: 'RESUME', now: 1010 });
  });
});

describe('expireIfDue', () => {
  function playedOut(options: Parameters<typeof setup>[0], word = 'CAT') {
    const context = setup(options);
    let state = type(apply(initialGameState, context.engine.start()), word);
    state = apply(state, context.engine.submit(state));
    return { ...context, state };
  }

  it('returns nothing until the deadline passes', () => {
    const { engine, clock, state } = playedOut({});
    clock.advance(59_999);
    expect(engine.expireIfDue(state)).toBeNull();
    expect(engine.expireIfDue(initialGameState)).toBeNull();
    clock.advance(1);
    expect(engine.expireIfDue(state)).toMatchObject({ type: 'EXPIRE' });
  });

  it('saves the first scoring game as the personal best', () => {
    const { engine, clock, scoreStore, state } = playedOut({});
    clock.advance(60_000);
    expect(engine.expireIfDue(state)).toEqual({ type: 'EXPIRE', isNewBest: true });
    expect(scoreStore.load()).toEqual({ score: 5, level: 1, achievedAt: STAMP });
    expect(engine.personalBest()).toEqual({ score: 5, level: 1, achievedAt: STAMP });
  });

  it('replaces a lower stored best', () => {
    const best = { score: 4, level: 1, achievedAt: 'earlier' };
    const { engine, clock, scoreStore, state } = playedOut({ best });
    clock.advance(60_000);
    expect(engine.expireIfDue(state)).toEqual({ type: 'EXPIRE', isNewBest: true });
    expect(scoreStore.load()?.score).toBe(5);
  });

  it('keeps an equal or higher stored best', () => {
    const best = { score: 5, level: 1, achievedAt: 'earlier' };
    const { engine, clock, scoreStore, state } = playedOut({ best });
    clock.advance(60_000);
    expect(engine.expireIfDue(state)).toEqual({ type: 'EXPIRE', isNewBest: false });
    expect(scoreStore.load()).toBe(best);
  });

  it('does not record a scoreless game', () => {
    const { engine, clock, scoreStore } = setup();
    const state = apply(initialGameState, engine.start());
    clock.advance(60_000);
    expect(engine.expireIfDue(state)).toEqual({ type: 'EXPIRE', isNewBest: false });
    expect(scoreStore.load()).toBeNull();
  });
});
