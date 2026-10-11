import { useEffect, useReducer, useRef } from 'react';
import { WARNING_SECONDS } from '../../domain/constants';
import type { GameStatus } from '../../domain/types';
import type { Clock } from '../../ports';
import { useLatest } from './useLatest';

/** How often the display refreshes and expiry is checked. */
export const TICK_MS = 100;

export interface CountdownOptions {
  readonly clock: Clock;
  readonly status: GameStatus;
  /** Clock time at which the countdown ends; set while playing. */
  readonly deadline: number | null;
  /** Time left on a paused countdown. */
  readonly pausedRemainingMs: number | null;
  onExpire(): void;
  /** Called when the page is hidden during play, so the game can pause itself. */
  onHidden(): void;
}

export interface Countdown {
  readonly remainingMs: number;
  readonly isWarning: boolean;
}

/**
 * Deadline-based countdown: remaining time is always read from the clock, never
 * accumulated from ticks, so it cannot drift. Ticks only trigger a repaint.
 */
export function useCountdown(options: CountdownOptions): Countdown {
  const { clock, status, deadline, pausedRemainingMs } = options;
  const [, repaint] = useReducer((count: number) => count + 1, 0);
  const onExpire = useLatest(options.onExpire);
  const onHidden = useLatest(options.onHidden);
  const expiredDeadline = useRef<number | null>(null);
  const playing = status === 'playing';

  useEffect(() => {
    if (!playing || deadline === null) return;
    const tick = () => {
      repaint();
      if (clock.now() >= deadline && expiredDeadline.current !== deadline) {
        expiredDeadline.current = deadline;
        onExpire.current();
      }
    };
    const timer = setInterval(tick, TICK_MS);
    return () => clearInterval(timer);
  }, [clock, playing, deadline, onExpire]);

  useEffect(() => {
    if (!playing) return;
    const onVisibilityChange = () => {
      if (document.hidden) onHidden.current();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [playing, onHidden]);

  let remainingMs = 0;
  if (playing && deadline !== null) {
    remainingMs = Math.max(0, deadline - clock.now());
  } else if (status === 'paused') {
    remainingMs = pausedRemainingMs ?? 0;
  }

  return { remainingMs, isWarning: playing && remainingMs <= WARNING_SECONDS * 1000 };
}
