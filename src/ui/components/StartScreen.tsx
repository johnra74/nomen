import { BOARD_SIZE, MAX_WORD_LENGTH, MIN_WORD_LENGTH } from '../../domain/constants';
import type { PersonalBest } from '../../domain/types';
import { hashOf } from '../routes';
import { BestScore } from './BestScore';

interface StartScreenProps {
  readonly ready: boolean;
  readonly loadFailed: boolean;
  readonly best: PersonalBest | null;
  onPlay(): void;
}

export function StartScreen({ ready, loadFailed, best, onPlay }: StartScreenProps) {
  return (
    <section className="card" aria-label="How to play">
      <div className="card-body d-flex flex-column gap-3">
        <p className="lead mb-0">
          Spell an English noun of {MIN_WORD_LENGTH} to {MAX_WORD_LENGTH} letters from the{' '}
          {BOARD_SIZE} tiles before the clock runs out.
        </p>
        <ul className="text-body-secondary mb-0 ps-3">
          <li>Tap tiles or type. Each tile can be used once per word.</li>
          <li>Letters score their Scrabble values. A valid noun resets the clock.</li>
          <li>Reach the score target to level up: less time, tougher letters.</li>
        </ul>
        <p className="mb-0">
          <a className="link-dark fw-bold" href={hashOf('rules')}>
            Full rules
          </a>
        </p>
        <BestScore best={best} />
        {loadFailed ? (
          <p className="alert alert-danger mb-0" role="alert">
            The word list could not be loaded. Check your connection and reload.
          </p>
        ) : (
          // Remounted once the game can start, so it takes focus and Enter begins play.
          <button
            key={String(ready)}
            type="button"
            className="btn btn-primary btn-lg w-100"
            onClick={onPlay}
            disabled={!ready}
            autoFocus={ready}
          >
            {ready ? 'Play' : 'Loading words…'}
          </button>
        )}
      </div>
    </section>
  );
}
