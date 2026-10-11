import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { BoardGenerator } from '../../src/domain/boardGenerator';
import { createGameEngine } from '../../src/domain/gameEngine';
import type { PersonalBest, ScoreStore } from '../../src/ports';
import { App } from '../../src/ui/App';
import { scriptedGenerator } from './boards';
import { fakeClock } from './fakeClock';
import { fixtureDictionary } from './fixtureDictionary';
import { memoryScoreStore } from './memoryScoreStore';
import { seededRandom } from './seededRandom';

export const WORDS = ['cat', 'act', 'dog', 'god', 'tee', 'toe', 'idea', 'quiz', 'jazz'];
export const BOARD = 'CATDOGEINUSE';

interface GameOptions {
  readonly deals?: readonly string[];
  readonly refills?: string;
  readonly best?: PersonalBest | null;
  readonly scoreStore?: ScoreStore;
  readonly boardGenerator?: BoardGenerator;
  readonly words?: readonly string[];
}

/** Renders the whole app around the real domain with controllable time and boards. */
export function renderGame(options: GameOptions = {}) {
  const clock = fakeClock();
  const scoreStore = options.scoreStore ?? memoryScoreStore(options.best ?? null);
  const engine = createGameEngine({
    dictionary: fixtureDictionary(options.words ?? WORDS),
    boardGenerator:
      options.boardGenerator ??
      scriptedGenerator(options.deals ?? [BOARD], options.refills ?? 'XYZ'),
    random: seededRandom(1),
    clock,
    scoreStore,
    timestamp: () => '2026-10-11T00:00:00.000Z',
  });
  const user = userEvent.setup();
  const view = render(<App engine={engine} clock={clock} />);
  return { clock, scoreStore, engine, user, ...view };
}

export async function startGame(options: GameOptions = {}) {
  const game = renderGame(options);
  await game.user.click(screen.getByRole('button', { name: 'Play' }));
  return game;
}

export const tiles = () =>
  within(screen.getByRole('group', { name: 'Letter tiles' })).getAllByRole('button');
export const tileLetters = () =>
  tiles()
    .map((tile) => tile.getAttribute('aria-label')![0])
    .join('');
export const tile = (letter: string, index = 0) =>
  tiles().filter((candidate) => candidate.getAttribute('aria-label')!.startsWith(`${letter},`))[
    index
  ]!;
export const currentWord = () => screen.getByTestId('current-word').textContent;
export const feedback = () => screen.getByRole('status').textContent;
export const timer = () => screen.getByRole('timer', { name: 'Time remaining' });
