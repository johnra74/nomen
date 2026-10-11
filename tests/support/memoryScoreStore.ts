import type { PersonalBest, ScoreStore } from '../../src/ports';

export function memoryScoreStore(initial: PersonalBest | null = null): ScoreStore {
  let best = initial;
  return {
    load: () => best,
    save(next) {
      best = next;
      return true;
    },
  };
}
