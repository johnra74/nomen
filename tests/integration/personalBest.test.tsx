import { act, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createLocalStorageScoreStore } from '../../src/infrastructure/localStorageScoreStore';
import { renderGame, startGame } from '../support/renderGame';

type Game = Awaited<ReturnType<typeof startGame>>;

async function finish({ clock, user }: Game, ...words: string[]) {
  for (const word of words) await user.keyboard(`${word}{Enter}`);
  act(() => clock.advance(60_000));
  return screen.findByRole('region', { name: 'Game over' });
}

describe('User Story 5: keep a personal best', () => {
  it('stores the first game as the personal best', async () => {
    const game = await startGame();
    const summary = await finish(game, 'cat');
    expect(summary).toHaveTextContent('New personal best');
    expect(summary).toHaveTextContent('Personal best: 5 (level 1)');
    expect(game.scoreStore.load()).toMatchObject({ score: 5, level: 1 });
  });

  it('replaces a lower best and says so', async () => {
    const best = { score: 4, level: 1, achievedAt: 'earlier' };
    const summary = await finish(await startGame({ best }), 'cat');
    expect(summary).toHaveTextContent('New personal best');
    expect(summary).toHaveTextContent('Personal best: 5 (level 1)');
  });

  it('keeps a higher best', async () => {
    const best = { score: 120, level: 3, achievedAt: 'earlier' };
    const game = await startGame({ best });
    const summary = await finish(game, 'cat');
    expect(summary).not.toHaveTextContent('New personal best');
    expect(summary).toHaveTextContent('Personal best: 120 (level 3)');
    expect(game.scoreStore.load()).toBe(best);
  });

  it('still shows the best after the game is closed and reopened', async () => {
    const first = await startGame({ scoreStore: createLocalStorageScoreStore() });
    await finish(first, 'cat', 'dog');
    first.unmount();

    renderGame({ scoreStore: createLocalStorageScoreStore() });
    expect(screen.getByText(/Personal best:/)).toHaveTextContent('Personal best: 10 (level 1)');
  });

  it('plays normally, with no saved best, when storage is unavailable', async () => {
    const blocked = createLocalStorageScoreStore(() => {
      throw new Error('blocked');
    });
    const first = renderGame({ scoreStore: blocked });
    expect(screen.queryByText(/Personal best:/)).not.toBeInTheDocument();
    await first.user.click(screen.getByRole('button', { name: 'Play' }));
    const summary = await finish(first, 'cat');
    expect(summary).toHaveTextContent('Final score5');
    expect(summary).not.toHaveTextContent('Personal best:');
  });
});
