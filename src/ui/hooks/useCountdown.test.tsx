import { act, fireEvent, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fakeClock } from '../../../tests/support/fakeClock';
import type { GameStatus } from '../../domain/types';
import { TICK_MS, useCountdown } from './useCountdown';

interface Props {
  status: GameStatus;
  deadline: number | null;
  pausedRemainingMs: number | null;
}

function setup(initial: Partial<Props> = {}) {
  const clock = fakeClock();
  const onExpire = vi.fn();
  const onHidden = vi.fn();
  const hook = renderHook((props: Props) => useCountdown({ clock, onExpire, onHidden, ...props }), {
    initialProps: { status: 'playing', deadline: 60_000, pausedRemainingMs: null, ...initial },
  });
  const advance = (ms: number) =>
    act(() => {
      clock.advance(ms);
      vi.advanceTimersByTime(TICK_MS);
    });
  return { clock, onExpire, onHidden, advance, ...hook };
}

function setHidden(hidden: boolean) {
  Object.defineProperty(document, 'hidden', { configurable: true, get: () => hidden });
  fireEvent(document, new Event('visibilitychange'));
}

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  vi.useRealTimers();
  Reflect.deleteProperty(document, 'hidden');
});

describe('useCountdown', () => {
  it('derives the remaining time from the deadline', () => {
    const { result, advance } = setup();
    expect(result.current).toEqual({ remainingMs: 60_000, isWarning: false });
    advance(12_345);
    expect(result.current.remainingMs).toBe(47_655);
  });

  it('warns from 10 seconds down', () => {
    const { result, advance } = setup();
    advance(49_999);
    expect(result.current.isWarning).toBe(false);
    advance(1);
    expect(result.current).toEqual({ remainingMs: 10_000, isWarning: true });
  });

  it('expires exactly once and never reports negative time', () => {
    const { result, advance, onExpire } = setup();
    advance(59_999);
    expect(onExpire).not.toHaveBeenCalled();
    advance(5000);
    advance(5000);
    expect(onExpire).toHaveBeenCalledTimes(1);
    expect(result.current.remainingMs).toBe(0);
  });

  it('follows a reset deadline immediately and can expire again', () => {
    const { result, advance, rerender, onExpire, clock } = setup();
    advance(60_000);
    rerender({ status: 'playing', deadline: clock.now() + 55_000, pausedRemainingMs: null });
    expect(result.current.remainingMs).toBe(55_000);
    advance(55_000);
    expect(onExpire).toHaveBeenCalledTimes(2);
  });

  it('freezes on the stored time while paused', () => {
    const { result, advance, rerender, onExpire } = setup();
    rerender({ status: 'paused', deadline: null, pausedRemainingMs: 40_000 });
    advance(500_000);
    expect(result.current).toEqual({ remainingMs: 40_000, isWarning: false });
    expect(onExpire).not.toHaveBeenCalled();
    rerender({ status: 'paused', deadline: null, pausedRemainingMs: null });
    expect(result.current.remainingMs).toBe(0);
  });

  it('reports nothing before and after a game', () => {
    expect(setup({ status: 'ready', deadline: null }).result.current.remainingMs).toBe(0);
    expect(setup({ status: 'over', deadline: null }).result.current.isWarning).toBe(false);
  });

  it('asks to pause when the page is hidden during play only', () => {
    const { onHidden, rerender } = setup();
    setHidden(false);
    expect(onHidden).not.toHaveBeenCalled();
    setHidden(true);
    expect(onHidden).toHaveBeenCalledTimes(1);
    rerender({ status: 'paused', deadline: null, pausedRemainingMs: 1000 });
    setHidden(true);
    expect(onHidden).toHaveBeenCalledTimes(1);
  });
});
