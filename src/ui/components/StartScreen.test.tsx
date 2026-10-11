import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { StartScreen } from './StartScreen';

const best = { score: 150, level: 4, achievedAt: '2026-10-11T00:00:00.000Z' };

describe('StartScreen', () => {
  it('explains the game and starts it', async () => {
    const onPlay = vi.fn();
    render(<StartScreen ready loadFailed={false} best={null} onPlay={onPlay} />);
    expect(screen.getByText(/noun of 3 to 8 letters from the 12 tiles/)).toBeInTheDocument();
    const play = screen.getByRole('button', { name: 'Play' });
    expect(play).toHaveFocus();
    await userEvent.click(play);
    expect(onPlay).toHaveBeenCalledTimes(1);
  });

  it('keeps Play disabled while the noun list loads', () => {
    render(<StartScreen ready={false} loadFailed={false} best={null} onPlay={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Loading words…' })).toBeDisabled();
  });

  it('reports a failed load instead of offering Play', () => {
    render(<StartScreen ready={false} loadFailed best={null} onPlay={vi.fn()} />);
    expect(screen.getByRole('alert')).toHaveTextContent(/could not be loaded/);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('shows the personal best only when there is one', () => {
    const { rerender } = render(
      <StartScreen ready loadFailed={false} best={null} onPlay={vi.fn()} />,
    );
    expect(screen.queryByText(/Personal best/)).not.toBeInTheDocument();
    rerender(<StartScreen ready loadFailed={false} best={best} onPlay={vi.fn()} />);
    expect(screen.getByText(/Personal best/)).toHaveTextContent('Personal best: 150 (level 4)');
  });
});
