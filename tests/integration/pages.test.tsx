import { act, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { BOARD, renderGame, startGame, tileLetters, timer } from '../support/renderGame';

function go(hash: string) {
  act(() => {
    window.location.hash = hash;
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  });
}

afterEach(() => {
  window.location.hash = '';
});

describe('User Story 6: read about the game and its rules', () => {
  it('opens the rules and about pages from the navigation and returns to the game', async () => {
    const { user } = renderGame();
    expect(screen.getByRole('link', { name: 'Play' })).toHaveAttribute('aria-current', 'page');

    await user.click(screen.getByRole('link', { name: 'Rules' }));
    go('#/rules');
    expect(screen.getByRole('heading', { name: 'Game play rules' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Play' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Rules' })).toHaveAttribute('aria-current', 'page');

    go('#/about');
    expect(screen.getByRole('heading', { name: 'About nōmən' })).toBeInTheDocument();

    go('#/');
    expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument();
  });

  it('links from the start screen to the full rules', () => {
    renderGame();
    expect(screen.getByRole('link', { name: 'Full rules' })).toHaveAttribute('href', '#/rules');
  });

  it('opens directly on a page when the address names one', () => {
    window.location.hash = '#/about';
    renderGame();
    expect(screen.getByRole('heading', { name: 'About nōmən' })).toBeInTheDocument();
  });

  it('pauses a game in progress when the player leaves for a page, and keeps it', async () => {
    const { clock, user } = await startGame();
    await user.keyboard('ca');
    act(() => clock.advance(20_000));
    await screen.findByText('40s');

    go('#/rules');
    expect(screen.queryByRole('group', { name: 'Letter tiles' })).not.toBeInTheDocument();
    act(() => clock.advance(500_000));
    await user.keyboard('t');

    go('#/');
    expect(screen.getByRole('region', { name: 'Paused' })).toBeInTheDocument();
    expect(timer()).toHaveTextContent('40s');
    await user.click(screen.getByRole('button', { name: 'Resume' }));
    expect(tileLetters()).toBe(BOARD);
    expect(screen.getByTestId('current-word')).toHaveTextContent('CA, 4 points');
  });
});
