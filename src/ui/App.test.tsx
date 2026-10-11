import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { fakeClock } from '../../tests/support/fakeClock';
import { renderGame, startGame } from '../../tests/support/renderGame';
import { createUpdateSource } from '../infrastructure/serviceWorkerUpdate';
import { App } from './App';

describe('App', () => {
  it('waits for the noun list before offering Play', () => {
    render(<App engine={null} clock={fakeClock()} />);
    expect(screen.getByRole('heading', { name: 'nōmən' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Loading words…' })).toBeDisabled();
  });

  it('reports a noun list that failed to load', () => {
    render(<App engine={null} clock={fakeClock()} loadFailed />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('colours feedback by outcome', async () => {
    const { user } = await startGame();
    expect(screen.getByRole('status')).toHaveClass('feedback--neutral');
    await user.keyboard('ate{Enter}');
    expect(screen.getByRole('status')).toHaveClass('feedback--bad');
    await user.keyboard('cat{Enter}');
    expect(screen.getByRole('status')).toHaveClass('feedback--good');
  });

  it('offers a waiting update before a game but not during one', async () => {
    let needRefresh = () => {};
    const activate = vi.fn().mockResolvedValue(undefined);
    const update = createUpdateSource((options) => {
      needRefresh = options.onNeedRefresh;
      return activate;
    });
    const { engine, clock, unmount } = renderGame();
    unmount();
    render(<App engine={engine} clock={clock} update={update} />);

    expect(screen.queryByText('Update available')).not.toBeInTheDocument();
    act(() => needRefresh());
    await userEvent.click(screen.getByRole('button', { name: 'Update now' }));
    expect(activate).toHaveBeenCalledWith(true);

    await userEvent.click(screen.getByRole('button', { name: 'Play' }));
    expect(screen.queryByText('Update available')).not.toBeInTheDocument();
  });
});
