import { bestPlayedWord } from '../../domain/selectors';
import type { GameState, PersonalBest } from '../../domain/types';
import { plural } from '../messages';
import { BestScore } from './BestScore';

interface GameOverProps {
  readonly state: GameState;
  readonly best: PersonalBest | null;
  onPlayAgain(): void;
}

export function GameOver({ state, best, onPlayAgain }: GameOverProps) {
  const bestWord = bestPlayedWord(state.history);
  const stats = [
    ['Final score', state.score],
    ['Level reached', state.level],
    ['Words played', state.history.length],
    ['Best word', bestWord ? `${bestWord.word} (${plural(bestWord.score, 'point')})` : 'None'],
  ] as const;

  return (
    <section className="card text-center" aria-label="Game over">
      <div className="card-body d-flex flex-column gap-3">
        <h2 className="card-title h3 mb-0">Time's up</h2>
        {state.isNewBest && (
          <p className="alert alert-success fw-bold py-2 mb-0">New personal best</p>
        )}
        <dl className="summary row row-cols-2 g-3 mb-0">
          {stats.map(([label, value]) => (
            <div key={label} className="col">
              <dt className="text-uppercase text-body-secondary fw-normal">{label}</dt>
              <dd className="fs-5 fw-bold mb-0">{value}</dd>
            </div>
          ))}
        </dl>
        <BestScore best={best} />
        <button
          type="button"
          className="btn btn-primary btn-lg w-100"
          onClick={onPlayAgain}
          autoFocus
        >
          Play again
        </button>
      </div>
    </section>
  );
}
