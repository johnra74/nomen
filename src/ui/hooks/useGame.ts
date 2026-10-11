import { useMemo, useReducer, useState } from 'react';
import type { GameEngine } from '../../domain/gameEngine';
import { gameReducer, initialGameState } from '../../domain/gameReducer';
import { selectLetter as pickLetter } from '../../domain/selection';
import type { GameAction, GameState, Letter, PersonalBest } from '../../domain/types';

export interface Game {
  readonly state: GameState;
  /** False until the noun list has loaded and an engine exists. */
  readonly ready: boolean;
  readonly best: PersonalBest | null;
  /** Counts typed letters that had no free tile, so the UI can give feedback. */
  readonly missedLetters: number;
  start(): void;
  selectTile(tileId: string): void;
  selectLetter(letter: Letter): void;
  removeLast(): void;
  clearSelection(): void;
  shuffle(): void;
  submit(): void;
  pause(): void;
  resume(): void;
  expire(): void;
}

/** Holds the game state and turns player intents into reducer actions. */
export function useGame(engine: GameEngine | null): Game {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);
  const [missedLetters, setMissedLetters] = useState(0);
  // Re-read when a game ends, since that is when a new best may have been saved.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const best = useMemo(() => engine?.personalBest() ?? null, [engine, state.status]);

  const send = (action: GameAction | null | undefined) => {
    if (action) dispatch(action);
  };

  return {
    state,
    ready: engine !== null,
    best,
    missedLetters,
    start: () => send(engine?.start()),
    selectTile: (tileId) => send({ type: 'SELECT_TILE', tileId }),
    selectLetter(letter) {
      const missed =
        state.status === 'playing' &&
        pickLetter(state.board, state.selection, letter) === state.selection;
      if (missed) setMissedLetters((count) => count + 1);
      else send({ type: 'SELECT_LETTER', letter });
    },
    removeLast: () => send({ type: 'REMOVE_LAST' }),
    clearSelection: () => send({ type: 'CLEAR_SELECTION' }),
    shuffle: () => send(state.status === 'playing' ? engine?.shuffle(state) : null),
    submit: () => send(engine?.submit(state)),
    pause: () => send(state.status === 'playing' ? engine?.pause() : null),
    resume: () => send(state.status === 'paused' ? engine?.resume() : null),
    expire: () => send(engine?.expireIfDue(state)),
  };
}
