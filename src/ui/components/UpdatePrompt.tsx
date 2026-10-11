import type { GameStatus } from '../../domain/types';

interface UpdatePromptProps {
  readonly available: boolean;
  readonly status: GameStatus;
  onUpdate(): void;
}

/** Offers a waiting app update, but never in the middle of a game. */
export function UpdatePrompt({ available, status, onUpdate }: UpdatePromptProps) {
  if (!available || status === 'playing' || status === 'paused') return null;
  return (
    <aside
      className="update alert alert-info d-flex align-items-center justify-content-between gap-3 mb-0"
      aria-label="Update available"
    >
      <span>Update available</span>
      <button type="button" className="btn btn-secondary" onClick={onUpdate}>
        Update now
      </button>
    </aside>
  );
}
