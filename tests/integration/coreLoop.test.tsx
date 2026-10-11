import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createBoardGenerator } from '../../src/domain/boardGenerator';
import { MAX_VOWELS, MIN_VOWELS } from '../../src/domain/constants';
import { fixtureDictionary } from '../support/fixtureDictionary';
import {
  BOARD,
  currentWord,
  feedback,
  startGame,
  tile,
  tileLetters,
  tiles,
} from '../support/renderGame';
import { seededRandom } from '../support/seededRandom';

const vowelsIn = (letters: string) => letters.replace(/[^AEIOU]/g, '').length;

describe('User Story 1: build a noun from the board and score it', () => {
  it('shows 12 valued tiles with enough vowels, and keeps the guarantee after a refill', async () => {
    const words = [
      'tea',
      'toe',
      'tie',
      'oat',
      'ear',
      'era',
      'ore',
      'sea',
      'ion',
      'oil',
      'air',
      'one',
      'net',
      'ant',
      'art',
      'rat',
      'tar',
      'eon',
    ];
    const dictionary = fixtureDictionary(words);
    const { user } = await startGame({
      words,
      boardGenerator: createBoardGenerator({ dictionary, random: seededRandom(11) }),
    });

    expect(tiles()).toHaveLength(12);
    for (const button of tiles()) expect(button).toHaveAccessibleName(/^[A-Z], \d+ points?$/);
    expect(vowelsIn(tileLetters())).toBeGreaterThanOrEqual(MIN_VOWELS);
    expect(vowelsIn(tileLetters())).toBeLessThanOrEqual(MAX_VOWELS);

    const playable = words.find((word) => {
      const pool = [...tileLetters()];
      return [...word.toUpperCase()].every((letter) => {
        const at = pool.indexOf(letter);
        if (at >= 0) pool.splice(at, 1);
        return at >= 0;
      });
    })!;
    expect(playable).toBeDefined();
    await user.keyboard(`${playable}{Enter}`);

    expect(feedback()).toMatch(
      new RegExp(`^${playable.toUpperCase()}, \\d+ points?\\. Score \\d+\\.`),
    );
    expect(tiles()).toHaveLength(12);
    expect(vowelsIn(tileLetters())).toBeGreaterThanOrEqual(MIN_VOWELS);
    expect(vowelsIn(tileLetters())).toBeLessThanOrEqual(MAX_VOWELS);
  });

  it('scores CAT as 5 points and replaces only the three used tiles', async () => {
    const { user } = await startGame();
    const untouched = tiles().slice(3);

    await user.click(tile('C'));
    await user.click(tile('A'));
    await user.click(tile('T'));
    expect(currentWord()).toBe('CAT, 5 points');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(feedback()).toBe('CAT, 5 points. Score 5.');
    expect(screen.getByTestId('score')).toHaveTextContent('5');
    expect(tileLetters()).toBe('XYZDOGEINUSE');
    expect(tiles().slice(3)).toEqual(untouched);
    expect(currentWord()).toBe('No letters selected');
  });

  it('does not let a single tile be used twice', async () => {
    const { user } = await startGame();
    await user.click(tile('C'));
    expect(tile('C')).toHaveAttribute('aria-pressed', 'true');
    await user.click(tile('C'));
    await user.keyboard('c');
    expect(currentWord()).toBe('C, 3 points');
  });

  it('uses a separate tile for each repeated letter', async () => {
    const { user } = await startGame();
    await user.keyboard('tee');
    expect(tile('E', 0)).toHaveAttribute('aria-pressed', 'true');
    expect(tile('E', 1)).toHaveAttribute('aria-pressed', 'true');
    await user.keyboard('e{Enter}');
    expect(feedback()).toBe('TEE, 3 points. Score 3.');
  });

  it('rejects a word that is not a noun, with a reason and no other change', async () => {
    const { user } = await startGame();
    await user.keyboard('ate{Enter}');
    expect(feedback()).toBe('ATE is not in the noun list.');
    expect(screen.getByTestId('score')).toHaveTextContent('0');
    expect(tileLetters()).toBe(BOARD);
    expect(currentWord()).toBe('No letters selected');
  });

  it('only allows submission with 3 to 8 tiles, and never selects a ninth', async () => {
    const { user } = await startGame();
    const submit = screen.getByRole('button', { name: 'Submit' });
    await user.keyboard('ca');
    expect(submit).toBeDisabled();
    await user.keyboard('{Enter}');
    expect(feedback()).toBe('');
    await user.keyboard('t');
    expect(submit).toBeEnabled();
    await user.keyboard('dogei');
    expect(currentWord()).toMatch(/^CATDOGEI,/);
    await user.click(tile('U'));
    await user.keyboard('a');
    expect(currentWord()).toMatch(/^CATDOGEI,/);
    expect(submit).toBeEnabled();
  });

  it('removes the last letter and clears the selection without penalty', async () => {
    const { user } = await startGame();
    await user.keyboard('cat');
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(currentWord()).toBe('CA, 4 points');
    await user.keyboard('{Backspace}');
    expect(currentWord()).toBe('C, 3 points');
    await user.keyboard('at');
    await user.click(screen.getByRole('button', { name: 'Clear' }));
    expect(currentWord()).toBe('No letters selected');
    await user.keyboard('do{Escape}');
    expect(currentWord()).toBe('No letters selected');
    expect(screen.getByTestId('score')).toHaveTextContent('0');
    expect(tile('C')).toHaveAttribute('aria-pressed', 'false');
  });

  it('shuffles tile positions without changing the letters or the selection', async () => {
    const { user } = await startGame();
    await user.keyboard('c');
    await user.click(screen.getByRole('button', { name: 'Shuffle' }));
    expect(tileLetters()).not.toBe(BOARD);
    expect([...tileLetters()].sort().join('')).toBe([...BOARD].sort().join(''));
    expect(currentWord()).toBe('C, 3 points');
  });

  it('can be played with the keyboard alone', async () => {
    const { user } = await startGame();
    await user.keyboard('cat{Enter}');
    expect(feedback()).toBe('CAT, 5 points. Score 5.');
    await user.keyboard('dog{Enter}');
    expect(feedback()).toBe('DOG, 5 points. Score 10.');
  });
});
