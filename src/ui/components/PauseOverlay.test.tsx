import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { PauseOverlay } from './PauseOverlay';

describe('PauseOverlay', () => {
  it('shows no tiles and offers a focused Resume button', async () => {
    const onResume = vi.fn();
    render(<PauseOverlay onResume={onResume} />);
    expect(screen.getByRole('region', { name: 'Paused' })).toHaveTextContent(/tiles are hidden/);
    expect(screen.getAllByRole('button')).toHaveLength(1);
    const resume = screen.getByRole('button', { name: 'Resume' });
    expect(resume).toHaveFocus();
    await userEvent.click(resume);
    expect(onResume).toHaveBeenCalledTimes(1);
  });
});
