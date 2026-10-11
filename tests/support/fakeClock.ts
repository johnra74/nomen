import type { Clock } from '../../src/ports';

export interface FakeClock extends Clock {
  advance(ms: number): void;
}

export function fakeClock(start = 0): FakeClock {
  let time = start;
  return {
    now: () => time,
    advance(ms) {
      time += ms;
    },
  };
}
