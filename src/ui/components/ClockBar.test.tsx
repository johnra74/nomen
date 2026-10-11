import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ClockBar } from './ClockBar';

describe('ClockBar', () => {
  it('is a timer showing whole seconds remaining', () => {
    const { container } = render(
      <ClockBar remainingMs={29_100} allowanceMs={60_000} isWarning={false} />,
    );
    const timer = screen.getByRole('timer', { name: 'Time remaining' });
    expect(timer).toHaveTextContent('30s');
    expect(timer).not.toHaveTextContent('Hurry');
    expect(timer.querySelector('.progress-bar')).not.toHaveClass('progress-bar-striped');
    expect(container.querySelector('.meter__fill')).toHaveStyle({ width: '48.5%' });
  });

  it('adds a written warning in the warning state', () => {
    render(<ClockBar remainingMs={4000} allowanceMs={60_000} isWarning />);
    const timer = screen.getByRole('timer', { name: 'Time remaining' });
    expect(timer).toHaveTextContent('Hurry 4s');
    expect(timer).toHaveClass('clock--warning');
    expect(timer.querySelector('.progress-bar')).toHaveClass('progress-bar-striped', 'bg-danger');
  });

  it('never draws a bar outside its track', () => {
    const { container } = render(
      <ClockBar remainingMs={90_000} allowanceMs={60_000} isWarning={false} />,
    );
    expect(container.querySelector('.meter__fill')).toHaveStyle({ width: '100%' });
  });
});
