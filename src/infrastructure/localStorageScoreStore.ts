import type { PersonalBest, ScoreStore } from '../ports';

export const STORAGE_KEY = 'nomen.best.v1';

type KeyValueStorage = Pick<Storage, 'getItem' | 'setItem'>;

const isCount = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0;

function isPersonalBest(value: unknown): value is PersonalBest {
  if (typeof value !== 'object' || value === null) return false;
  const record = value as Record<string, unknown>;
  return isCount(record.score) && isCount(record.level) && typeof record.achievedAt === 'string';
}

/**
 * Keeps the personal best in localStorage. Storage can be blocked or full, so every
 * access is guarded and the game carries on without a saved best.
 */
export function createLocalStorageScoreStore(
  getStorage: () => KeyValueStorage = () => localStorage,
): ScoreStore {
  return {
    load() {
      try {
        const parsed: unknown = JSON.parse(getStorage().getItem(STORAGE_KEY) ?? 'null');
        return isPersonalBest(parsed) ? parsed : null;
      } catch {
        return null;
      }
    },
    save(best) {
      try {
        getStorage().setItem(STORAGE_KEY, JSON.stringify(best));
        return true;
      } catch {
        return false;
      }
    },
  };
}
