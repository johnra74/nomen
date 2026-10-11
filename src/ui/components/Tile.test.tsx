import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Tile } from './Tile';

const tile = { id: 't1', letter: 'E' } as const;

describe('Tile', () => {
  it('is a button named with its letter and point value', async () => {
    const onSelect = vi.fn();
    render(<Tile tile={tile} selected={false} onSelect={onSelect} />);
    const button = screen.getByRole('button', { name: 'E, 1 point' });
    expect(button).toHaveAttribute('aria-pressed', 'false');
    expect(button).toHaveClass('btn', 'btn-dark', 'tile');
    expect(button).toHaveTextContent('E1');
    await userEvent.click(button);
    expect(onSelect).toHaveBeenCalledWith('t1');
  });

  it('is marked pressed and cannot be picked again once selected', async () => {
    const onSelect = vi.fn();
    render(<Tile tile={tile} selected onSelect={onSelect} />);
    const button = screen.getByRole('button', { name: 'E, 1 point' });
    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(button).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(button);
    expect(onSelect).not.toHaveBeenCalled();
  });
});
