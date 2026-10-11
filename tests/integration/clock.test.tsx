import { act, fireEvent, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { BOARD, feedback, startGame, tileLetters, timer } from '../support/renderGame';

function setHidden(hidden: boolean) {
  Object.defineProperty(document, 'hidden', { configurable: true, get: () => hidden });
  fireEvent(document, new Event('visibilitychange'));
}

afterEach(() => {
  Reflect.deleteProperty(document, 'hidden');
});

describe('User Story 2: race the clock', () => {
  it('counts down from the level 1 allowance', async () => {
    const { clock } = await startGame();
    expect(timer()).toHaveTextContent('60s');
    act(() => clock.advance(12_000));
    expect(await screen.findByText('48s')).toBeInTheDocument();
  });

  it('resets to the full allowance on a valid noun', async () => {
    const { clock, user } = await startGame();
    act(() => clock.advance(30_000));
    await screen.findByText('30s');
    await user.keyboard('cat{Enter}');
    expect(await screen.findByText('60s')).toBeInTheDocument();
  });

  it('keeps running, without penalty, after an invalid word', async () => {
    const { clock, user } = await startGame();
    act(() => clock.advance(30_000));
    await screen.findByText('30s');
    await user.keyboard('ate{Enter}');
    expect(feedback()).toBe('ATE is not in the noun list.');
    expect(timer()).toHaveTextContent('30s');
  });

  it('ends the game at zero with a summary and no playable tiles', async () => {
    const { clock, user } = await startGame();
    await user.keyboard('cat{Enter}');
    await user.keyboard('dog{Enter}');
    act(() => clock.advance(60_000));

    const summary = await screen.findByRole('region', { name: 'Game over' });
    expect(summary).toHaveTextContent('Final score10');
    expect(summary).toHaveTextContent('Level reached1');
    expect(summary).toHaveTextContent('Words played2');
    expect(summary).toHaveTextContent('Best wordCAT (5 points)');
    expect(feedback()).toBe("Time's up. Final score 10, level 1. New personal best.");
    expect(screen.queryByRole('group', { name: 'Letter tiles' })).not.toBeInTheDocument();
  });

  it('starts a fresh level 1 game on Play again', async () => {
    const { clock, user } = await startGame();
    await user.keyboard('cat{Enter}');
    act(() => clock.advance(60_000));
    await user.click(await screen.findByRole('button', { name: 'Play again' }));
    expect(screen.getByTestId('score')).toHaveTextContent('0');
    expect(screen.getByTestId('level')).toHaveTextContent('1');
    expect(tileLetters()).toBe(BOARD);
    expect(timer()).toHaveTextContent('60s');
  });

  it('does not count a word submitted once time is up', async () => {
    const { clock, user } = await startGame();
    await user.keyboard('cat');
    act(() => clock.advance(60_000));
    await user.keyboard('{Enter}');
    const summary = await screen.findByRole('region', { name: 'Game over' });
    expect(summary).toHaveTextContent('Final score0');
    expect(summary).toHaveTextContent('Best wordNone');
  });

  it('warns in words, not just colour, during the last 10 seconds', async () => {
    const { clock } = await startGame();
    expect(screen.queryByText(/Hurry/)).not.toBeInTheDocument();
    expect(screen.getByTestId('warning')).toBeEmptyDOMElement();
    act(() => clock.advance(50_500));
    expect(await screen.findByText(/Hurry/)).toBeInTheDocument();
    expect(timer()).toHaveTextContent('10s');
    expect(screen.getByTestId('warning')).toHaveTextContent('10 seconds left.');
  });

  it('pauses the clock and hides the tiles, then resumes where it stopped', async () => {
    const { clock, user } = await startGame();
    act(() => clock.advance(20_000));
    await screen.findByText('40s');
    await user.click(screen.getByRole('button', { name: 'Pause' }));

    expect(screen.queryByRole('group', { name: 'Letter tiles' })).not.toBeInTheDocument();
    expect(feedback()).toBe('Paused.');
    act(() => clock.advance(500_000));
    await new Promise((resolve) => setTimeout(resolve, 250));
    expect(timer()).toHaveTextContent('40s');

    await user.click(screen.getByRole('button', { name: 'Resume' }));
    expect(tileLetters()).toBe(BOARD);
    expect(timer()).toHaveTextContent('40s');
  });

  it('pauses itself when the app goes to the background', async () => {
    await startGame();
    act(() => setHidden(false));
    expect(screen.getByRole('group', { name: 'Letter tiles' })).toBeInTheDocument();
    act(() => setHidden(true));
    expect(await screen.findByRole('button', { name: 'Resume' })).toBeInTheDocument();
  });
});
