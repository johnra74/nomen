import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { WordTray } from './WordTray';

describe('WordTray', () => {
  it('shows the letters picked so far and their running total', () => {
    const { container } = render(<WordTray word="CAT" points={5} nudge={0} />);
    expect(screen.getByRole('group', { name: 'Current word' })).toBeInTheDocument();
    expect(screen.getByTestId('current-word')).toHaveTextContent('CAT, 5 points');
    expect(container.querySelectorAll('.tray__slot')).toHaveLength(8);
    expect(container.querySelectorAll('.tray__slot--filled')).toHaveLength(3);
  });

  it('says when nothing is selected', () => {
    render(<WordTray word="" points={0} nudge={0} />);
    expect(screen.getByTestId('current-word')).toHaveTextContent('No letters selected');
  });

  it('nudges only after a typed letter missed', () => {
    const { container, rerender } = render(<WordTray word="" points={0} nudge={0} />);
    expect(container.querySelector('.tray__slots--nudge')).toBeNull();
    rerender(<WordTray word="" points={0} nudge={1} />);
    expect(container.querySelector('.tray__slots--nudge')).not.toBeNull();
  });
});
