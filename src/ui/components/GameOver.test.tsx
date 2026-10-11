import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { initialGameState } from '../../domain/gameReducer';
import type { GameState } from '../../domain/types';
import { GameOver } from './GameOver';

const over: GameState = {
  ...initialGameState,
  status: 'over',
  score: 27,
  level: 1,
  history: [
    { word: 'CAT', score: 5, level: 1 },
    { word: 'QUIZ', score: 22, level: 1 },
  ],
};
const best = { score: 150, level: 4, achievedAt: '2026-10-11T00:00:00.000Z' };

describe('GameOver', () => {
  it('summarises the game and offers another', async () => {
    const onPlayAgain = vi.fn();
    render(<GameOver state={over} best={best} onPlayAgain={onPlayAgain} />);
    const summary = screen.getByRole('region', { name: 'Game over' });
    expect(summary).toHaveTextContent('Final score27');
    expect(summary).toHaveTextContent('Level reached1');
    expect(summary).toHaveTextContent('Words played2');
    expect(summary).toHaveTextContent('Best wordQUIZ (22 points)');
    expect(summary).toHaveTextContent('Personal best: 150 (level 4)');
    expect(summary).not.toHaveTextContent('New personal best');

    const again = screen.getByRole('button', { name: 'Play again' });
    expect(again).toHaveFocus();
    await userEvent.click(again);
    expect(onPlayAgain).toHaveBeenCalledTimes(1);
  });

  it('calls out a new personal best', () => {
    render(<GameOver state={{ ...over, isNewBest: true }} best={null} onPlayAgain={vi.fn()} />);
    expect(screen.getByText('New personal best')).toBeInTheDocument();
    expect(screen.queryByText(/Personal best:/)).not.toBeInTheDocument();
  });

  it('handles a game with no words', () => {
    render(
      <GameOver state={{ ...over, score: 0, history: [] }} best={null} onPlayAgain={vi.fn()} />,
    );
    expect(screen.getByRole('region', { name: 'Game over' })).toHaveTextContent('Best wordNone');
  });
});
