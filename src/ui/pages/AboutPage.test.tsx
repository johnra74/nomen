import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AboutPage } from './AboutPage';

describe('AboutPage', () => {
  it('is a titled page that takes focus for screen readers', () => {
    render(<AboutPage />);
    expect(screen.getByRole('heading', { level: 2, name: 'About nōmən' })).toHaveFocus();
  });

  it('explains that the Latin word means both name and noun', () => {
    render(<AboutPage />);
    const page = screen.getByRole('region', { name: 'About nōmən' });
    expect(page).toHaveTextContent(/Latin/);
    expect(page).toHaveTextContent(/“name”/);
    expect(page).toHaveTextContent(/“noun”/);
  });

  it('tells the longer story in several sections', () => {
    render(<AboutPage />);
    expect(screen.getAllByRole('heading', { level: 3 }).length).toBeGreaterThanOrEqual(5);
    const text = screen.getByRole('region', { name: 'About nōmən' }).textContent!;
    expect(text.split(/\s+/).length).toBeGreaterThan(400);
    for (const term of ['nomenclature', 'Caesar', 'nomen est omen', 'schwa', 'WordNet']) {
      expect(text).toContain(term);
    }
  });

  it('marks Latin words as Latin for assistive technology', () => {
    const { container } = render(<AboutPage />);
    expect(container.querySelectorAll('[lang="la"]').length).toBeGreaterThan(3);
  });

  it('links to the rules and back to the game', () => {
    render(<AboutPage />);
    expect(screen.getByRole('link', { name: 'Read the rules' })).toHaveAttribute('href', '#/rules');
    expect(screen.getByRole('link', { name: 'Play the game' })).toHaveAttribute('href', '#/');
  });
});
