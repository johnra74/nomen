import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { UpdatePrompt } from './UpdatePrompt';

describe('UpdatePrompt', () => {
  it('offers a waiting update on the start and game-over screens', async () => {
    const onUpdate = vi.fn();
    const { rerender } = render(<UpdatePrompt available status="ready" onUpdate={onUpdate} />);
    expect(screen.getByText('Update available')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Update now' }));
    expect(onUpdate).toHaveBeenCalledTimes(1);
    rerender(<UpdatePrompt available status="over" onUpdate={onUpdate} />);
    expect(screen.getByText('Update available')).toBeInTheDocument();
  });

  it.each(['playing', 'paused'] as const)('stays out of the way while %s', (status) => {
    render(<UpdatePrompt available status={status} onUpdate={vi.fn()} />);
    expect(screen.queryByText('Update available')).not.toBeInTheDocument();
  });

  it('shows nothing when there is no update', () => {
    render(<UpdatePrompt available={false} status="ready" onUpdate={vi.fn()} />);
    expect(screen.queryByText('Update available')).not.toBeInTheDocument();
  });
});
