import { levelConfig, levelForScore } from './levels';
import { removeLast, selectLetter, selectTile } from './selection';
import type { GameAction, GameState, Selection } from './types';

export const initialGameState: GameState = {
  status: 'ready',
  board: [],
  selection: [],
  score: 0,
  level: 1,
  deadline: null,
  remainingMs: null,
  history: [],
  lastResult: null,
  isNewBest: false,
};

const withSelection = (state: GameState, selection: Selection): GameState =>
  selection === state.selection ? state : { ...state, selection };

function isPermutation(order: readonly number[], size: number): boolean {
  return (
    order.length === size &&
    new Set(order).size === size &&
    order.every((index) => Number.isInteger(index) && index >= 0 && index < size)
  );
}

/** Transitions that are only legal while the game is being played. */
function playingReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SELECT_TILE':
      return withSelection(state, selectTile(state.board, state.selection, action.tileId));
    case 'SELECT_LETTER':
      return withSelection(state, selectLetter(state.board, state.selection, action.letter));
    case 'REMOVE_LAST':
      return withSelection(state, removeLast(state.selection));
    case 'CLEAR_SELECTION':
      return state.selection.length === 0 ? state : { ...state, selection: [] };
    case 'SHUFFLE':
      return isPermutation(action.order, state.board.length)
        ? { ...state, board: action.order.map((index) => state.board[index]!) }
        : state;
    case 'WORD_ACCEPTED': {
      const score = state.score + action.score;
      const level = levelForScore(score);
      return {
        ...state,
        score,
        level,
        board: action.board,
        selection: [],
        deadline: action.now + levelConfig(level).allowanceMs,
        history: [...state.history, { word: action.word, score: action.score, level: state.level }],
        lastResult: {
          kind: 'accepted',
          word: action.word,
          score: action.score,
          ...(level > state.level ? { leveledUpTo: level } : {}),
        },
      };
    }
    case 'WORD_REJECTED':
      return {
        ...state,
        selection: [],
        lastResult: { kind: 'rejected', word: action.word, reason: action.reason },
      };
    case 'PAUSE':
      return {
        ...state,
        status: 'paused',
        remainingMs: Math.max(0, (state.deadline ?? action.now) - action.now),
        deadline: null,
      };
    case 'EXPIRE':
      return {
        ...state,
        status: 'over',
        selection: [],
        deadline: null,
        isNewBest: action.isNewBest,
      };
    default:
      return state;
  }
}

/** Pure. Actions that are not legal in the current status return the same state object. */
export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START':
      if (state.status !== 'ready' && state.status !== 'over') return state;
      return {
        ...initialGameState,
        status: 'playing',
        board: action.board,
        deadline: action.now + levelConfig(1).allowanceMs,
      };
    case 'RESUME':
      if (state.status !== 'paused') return state;
      return {
        ...state,
        status: 'playing',
        deadline: action.now + (state.remainingMs ?? 0),
        remainingMs: null,
      };
    default:
      return state.status === 'playing' ? playingReducer(state, action) : state;
  }
}
