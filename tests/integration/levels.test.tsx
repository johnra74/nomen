import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { feedback, startGame, timer } from '../support/renderGame';

const options = { deals: ['QUIZJAZZETON'], refills: 'TIERTIER' };

describe('User Story 3: climb through levels', () => {
  it('starts at level 1 with 60 seconds and a target of 30', async () => {
    await startGame(options);
    expect(screen.getByTestId('level')).toHaveTextContent('1');
    expect(timer()).toHaveTextContent('60s');
    const progress = screen.getByRole('progressbar', { name: 'Progress to next level' });
    expect(progress).toHaveAttribute('aria-valuemin', '0');
    expect(progress).toHaveAttribute('aria-valuemax', '30');
    expect(progress).toHaveAttribute('aria-valuenow', '0');
    expect(screen.getByText('Next level at 30')).toBeInTheDocument();
  });

  it('levels up when the score reaches the target, announcing it and shortening the clock', async () => {
    const { user } = await startGame(options);
    await user.keyboard('quiz{Enter}');
    expect(feedback()).toBe('QUIZ, 22 points. Score 22.');
    expect(screen.getByTestId('level')).toHaveTextContent('1');

    await user.keyboard('jazz{Enter}');
    expect(feedback()).toBe('JAZZ, 29 points. Score 51. Level 2. 55 seconds per word.');
    expect(screen.getByTestId('level')).toHaveTextContent('2');
    expect(await screen.findByText('55s')).toBeInTheDocument();

    const progress = screen.getByRole('progressbar', { name: 'Progress to next level' });
    expect(progress).toHaveAttribute('aria-valuemin', '30');
    expect(progress).toHaveAttribute('aria-valuemax', '70');
    expect(progress).toHaveAttribute('aria-valuenow', '51');
  });
});
