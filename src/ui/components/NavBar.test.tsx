import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { NavBar } from './NavBar';

describe('NavBar', () => {
  it('shows the wordmark and a link to each page', () => {
    render(<NavBar route="game" />);
    expect(screen.getByRole('heading', { level: 1, name: 'nōmən' })).toBeInTheDocument();
    const nav = screen.getByRole('navigation', { name: 'Pages' });
    expect(within(nav).getByRole('link', { name: 'Play' })).toHaveAttribute('href', '#/');
    expect(within(nav).getByRole('link', { name: 'Rules' })).toHaveAttribute('href', '#/rules');
    expect(within(nav).getByRole('link', { name: 'About' })).toHaveAttribute('href', '#/about');
  });

  it('marks only the current page', () => {
    render(<NavBar route="rules" />);
    expect(screen.getByRole('link', { name: 'Rules' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Play' })).not.toHaveAttribute('aria-current');
    expect(screen.getByRole('link', { name: 'About' })).not.toHaveAttribute('aria-current');
  });
});
