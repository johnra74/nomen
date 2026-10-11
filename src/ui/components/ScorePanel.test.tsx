import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ScorePanel } from './ScorePanel';

describe('ScorePanel', () => {
  it('shows level and score in a labelled region', () => {
    render(<ScorePanel level={1} score={12} />);
    expect(screen.getByRole('region', { name: 'Score' })).toBeInTheDocument();
    expect(screen.getByTestId('level')).toHaveTextContent('1');
    expect(screen.getByTestId('score')).toHaveTextContent('12');
  });

  it('reports progress between the previous and the next target', () => {
    const { container } = render(<ScorePanel level={2} score={50} />);
    const progress = screen.getByRole('progressbar', { name: 'Progress to next level' });
    expect(progress).toHaveAttribute('aria-valuemin', '30');
    expect(progress).toHaveAttribute('aria-valuemax', '70');
    expect(progress).toHaveAttribute('aria-valuenow', '50');
    expect(container.querySelector('.meter__fill')).toHaveStyle({ width: '50%' });
    expect(screen.getByText('Next level at 70')).toBeInTheDocument();
  });
});
