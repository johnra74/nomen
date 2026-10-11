import { levelProgress } from '../../domain/selectors';

interface ScorePanelProps {
  readonly level: number;
  readonly score: number;
}

const LABEL = 'score__label d-block text-uppercase text-body-secondary';

export function ScorePanel({ level, score }: ScorePanelProps) {
  const { min, max, value } = levelProgress(score, level);
  const percent = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  return (
    <section className="score card" aria-label="Score">
      <div className="card-body d-flex align-items-center gap-3 py-2">
        <p className="score__stat text-center mb-0">
          <span className={LABEL}>Level</span>
          <span className="score__number fs-4 fw-bold lh-1" data-testid="level">
            {level}
          </span>
        </p>
        <div className="flex-grow-1">
          <div
            className="progress"
            role="progressbar"
            aria-label="Progress to next level"
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={value}
          >
            <div className="progress-bar meter__fill" style={{ width: `${percent}%` }} />
          </div>
          <p className="score__target text-uppercase text-body-secondary text-center mb-0 mt-1">
            Next level at {max}
          </p>
        </div>
        <p className="score__stat text-center mb-0">
          <span className={LABEL}>Score</span>
          <span className="score__number fs-4 fw-bold lh-1" data-testid="score">
            {score}
          </span>
        </p>
      </div>
    </section>
  );
}
