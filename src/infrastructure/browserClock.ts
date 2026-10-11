import type { Clock } from '../ports';

/** Monotonic, so the countdown is unaffected by changes to the device clock. */
export const browserClock: Clock = {
  now: () => performance.now(),
};
