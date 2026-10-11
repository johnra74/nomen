import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { boardOf } from '../../../tests/support/boards';
import { Board } from './Board';

describe('Board', () => {
  it('renders every tile in a labelled group and reports which is picked', async () => {
    const board = boardOf('CATDOGEINUSE');
    const onSelect = vi.fn();
    render(<Board board={board} selection={[board[1]!.id]} onSelect={onSelect} />);

    const buttons = within(screen.getByRole('group', { name: 'Letter tiles' })).getAllByRole(
      'button',
    );
    expect(buttons).toHaveLength(12);
    expect(buttons.filter((button) => button.getAttribute('aria-pressed') === 'true')).toEqual([
      buttons[1],
    ]);
    await userEvent.click(buttons[3]!);
    expect(onSelect).toHaveBeenCalledWith(board[3]!.id);
  });
});
