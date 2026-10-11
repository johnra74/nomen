import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Controls } from './Controls';

function setup(overrides: { hasSelection?: boolean; canSubmit?: boolean } = {}) {
  const handlers = {
    onRemove: vi.fn(),
    onClear: vi.fn(),
    onShuffle: vi.fn(),
    onSubmit: vi.fn(),
    onPause: vi.fn(),
  };
  render(<Controls hasSelection canSubmit {...overrides} {...handlers} />);
  return handlers;
}

describe('Controls', () => {
  it('calls the matching handler for each button', async () => {
    const handlers = setup();
    for (const [name, handler] of [
      ['Delete', handlers.onRemove],
      ['Clear', handlers.onClear],
      ['Shuffle', handlers.onShuffle],
      ['Pause', handlers.onPause],
      ['Submit', handlers.onSubmit],
    ] as const) {
      await userEvent.click(screen.getByRole('button', { name }));
      expect(handler).toHaveBeenCalledTimes(1);
    }
  });

  it('disables Submit unless the word can be submitted', () => {
    setup({ canSubmit: false });
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Submit' })).toHaveClass(
      'btn',
      'btn-primary',
      'btn-lg',
    );
    expect(screen.getByRole('button', { name: 'Shuffle' })).toHaveClass('btn', 'btn-secondary');
  });

  it('disables Delete and Clear when nothing is selected', () => {
    setup({ hasSelection: false, canSubmit: false });
    expect(screen.getByRole('button', { name: 'Delete' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Clear' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Shuffle' })).toBeEnabled();
  });
});
