import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Announcer } from './Announcer';

describe('Announcer', () => {
  it('exposes the latest result as a polite status and the time warning as assertive', () => {
    render(<Announcer message="CAT, 5 points. Score 5." warning="10 seconds left." tone="good" />);
    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('CAT, 5 points. Score 5.');
    expect(status).toHaveClass('feedback--good', 'text-success-emphasis');
    const warning = screen.getByTestId('warning');
    expect(warning).toHaveTextContent('10 seconds left.');
    expect(warning).toHaveAttribute('aria-live', 'assertive');
  });

  it('defaults to a neutral tone', () => {
    render(<Announcer message="" warning="" />);
    expect(screen.getByRole('status')).toHaveClass('feedback--neutral');
  });

  it('can announce without displaying', () => {
    render(<Announcer message="Paused." warning="" visible={false} />);
    expect(screen.getByRole('status')).toHaveClass('visually-hidden');
    expect(screen.getByRole('status')).toHaveTextContent('Paused.');
  });
});
