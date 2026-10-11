import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { lettersOf, scriptedGenerator } from '../../../tests/support/boards';
import { fakeClock } from '../../../tests/support/fakeClock';
import { fixtureDictionary } from '../../../tests/support/fixtureDictionary';
import { memoryScoreStore } from '../../../tests/support/memoryScoreStore';
import { seededRandom } from '../../../tests/support/seededRandom';
import { createGameEngine } from '../../domain/gameEngine';
import { currentWord } from '../../domain/selectors';
import { useGame } from './useGame';

function setup() {
  const clock = fakeClock();
  const engine = createGameEngine({
    dictionary: fixtureDictionary(['cat', 'dog']),
    boardGenerator: scriptedGenerator(['CATDOGEINUSE'], 'XYZ'),
    random: seededRandom(1),
    clock,
    scoreStore: memoryScoreStore(),
    timestamp: () => '2026-10-11T00:00:00.000Z',
  });
  return { clock, ...renderHook(() => useGame(engine)) };
}

describe('useGame', () => {
  it('is not ready and ignores intents until an engine exists', () => {
    const { result } = renderHook(() => useGame(null));
    expect(result.current.ready).toBe(false);
    expect(result.current.best).toBeNull();
    act(() => result.current.start());
    act(() => result.current.submit());
    act(() => result.current.expire());
    expect(result.current.state.status).toBe('ready');
  });

  it('plays a word from start to score', () => {
    const { result } = setup();
    expect(result.current.ready).toBe(true);
    act(() => result.current.start());
    act(() => result.current.selectTile(result.current.state.board[0]!.id));
    act(() => result.current.selectLetter('A'));
    act(() => result.current.selectLetter('T'));
    expect(currentWord(result.current.state)).toBe('CAT');
    act(() => result.current.submit());
    expect(result.current.state.score).toBe(5);
    expect(lettersOf(result.current.state.board)).toBe('XYZDOGEINUSE');
  });

  it('edits the selection and shuffles', () => {
    const { result } = setup();
    act(() => result.current.start());
    act(() => result.current.selectLetter('D'));
    act(() => result.current.selectLetter('O'));
    act(() => result.current.removeLast());
    expect(currentWord(result.current.state)).toBe('D');
    act(() => result.current.clearSelection());
    expect(currentWord(result.current.state)).toBe('');
    act(() => result.current.shuffle());
    expect(lettersOf(result.current.state.board)).not.toBe('CATDOGEINUSE');
  });

  it('counts typed letters that have no free tile, during play only', () => {
    const { result } = setup();
    act(() => result.current.selectLetter('Z'));
    expect(result.current.missedLetters).toBe(0);
    act(() => result.current.start());
    act(() => result.current.selectLetter('Z'));
    act(() => result.current.selectLetter('C'));
    act(() => result.current.selectLetter('C'));
    expect(result.current.missedLetters).toBe(2);
    expect(currentWord(result.current.state)).toBe('C');
  });

  it('pauses, resumes, expires and then reports the new personal best', () => {
    const { result, clock } = setup();
    act(() => result.current.pause());
    act(() => result.current.shuffle());
    expect(result.current.state.status).toBe('ready');

    act(() => result.current.start());
    act(() => result.current.resume());
    expect(result.current.state.status).toBe('playing');
    act(() => result.current.pause());
    expect(result.current.state.status).toBe('paused');
    act(() => result.current.resume());
    expect(result.current.state.status).toBe('playing');

    for (const letter of ['C', 'A', 'T'] as const) act(() => result.current.selectLetter(letter));
    act(() => result.current.submit());
    act(() => result.current.expire());
    expect(result.current.state.status).toBe('playing');
    act(() => clock.advance(60_000));
    act(() => result.current.expire());
    expect(result.current.state).toMatchObject({ status: 'over', isNewBest: true });
    expect(result.current.best).toMatchObject({ score: 5, level: 1 });
  });
});
