import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LETTERS, LETTER_VALUES } from '../../domain/constants';
import { levelConfig } from '../../domain/levels';
import { RulesPage } from './RulesPage';

describe('RulesPage', () => {
  it('is a titled page that takes focus for screen readers', () => {
    render(<RulesPage />);
    const title = screen.getByRole('heading', { level: 2, name: 'Game play rules' });
    expect(title).toHaveFocus();
    expect(screen.getByRole('region', { name: 'Game play rules' })).toBeInTheDocument();
  });

  it("states the core rules using the game's real numbers", () => {
    render(<RulesPage />);
    const page = screen.getByRole('region', { name: 'Game play rules' });
    expect(page).toHaveTextContent('12 letter tiles');
    expect(page).toHaveTextContent('5 or 6 of them are vowels');
    expect(page).toHaveTextContent('at least 2 nouns');
    expect(page).toHaveTextContent('3 to 8 letters');
    expect(page).toHaveTextContent(/each tile can be used only once/i);
    expect(page).toHaveTextContent(/resets the clock/i);
    expect(page).toHaveTextContent(/last 10 seconds/i);
    expect(page).toHaveTextContent(/proper nouns/i);
  });

  it('lists every letter under its Scrabble value', () => {
    render(<RulesPage />);
    const table = screen.getByRole('table', { name: 'Letter values' });
    for (const letter of LETTERS) {
      const row = within(table)
        .getAllByRole('row')
        .find((candidate) => within(candidate).queryByText(letter, { selector: '.letter' }));
      expect(row, letter).toBeDefined();
      expect(within(row!).getByRole('rowheader')).toHaveTextContent(String(LETTER_VALUES[letter]));
    }
    expect(within(table).getAllByRole('row')).toHaveLength(
      1 + new Set(Object.values(LETTER_VALUES)).size,
    );
  });

  it('shows the level table straight from the level rules', () => {
    render(<RulesPage />);
    const rows = within(screen.getByRole('table', { name: 'Levels' }))
      .getAllByRole('row')
      .slice(1);
    expect(rows).toHaveLength(10);
    rows.forEach((row, index) => {
      const config = levelConfig(index + 1);
      const cells = within(row).getAllByRole('cell');
      expect(within(row).getByRole('rowheader')).toHaveTextContent(String(index + 1));
      expect(cells[0]).toHaveTextContent(`${config.allowanceMs / 1000} s`);
      expect(cells[1]).toHaveTextContent(String(config.targetScore));
    });
    expect(screen.getByRole('region', { name: 'Game play rules' })).toHaveTextContent(
      'J, K, Q, V, W, X and Z',
    );
  });

  it('offers a way back to the game', () => {
    render(<RulesPage />);
    expect(screen.getByRole('link', { name: 'Play the game' })).toHaveAttribute('href', '#/');
  });
});
