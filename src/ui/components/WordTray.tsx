import { MAX_WORD_LENGTH } from '../../domain/constants';
import { plural } from '../messages';

interface WordTrayProps {
  readonly word: string;
  readonly points: number;
  /** Changes whenever a typed letter had no free tile; restarts the nudge animation. */
  readonly nudge: number;
}

export function WordTray({ word, points, nudge }: WordTrayProps) {
  const slots = Array.from({ length: MAX_WORD_LENGTH }, (_, index) => word[index] ?? '');
  return (
    <div className="tray" role="group" aria-label="Current word">
      <div
        key={nudge}
        className={nudge > 0 ? 'tray__slots tray__slots--nudge' : 'tray__slots'}
        aria-hidden="true"
      >
        {slots.map((letter, index) => (
          <span key={index} className={letter ? 'tray__slot tray__slot--filled' : 'tray__slot'}>
            {letter}
          </span>
        ))}
      </div>
      <p
        className="tray__summary small text-body-secondary text-center mb-0 mt-1"
        data-testid="current-word"
      >
        {word === '' ? 'No letters selected' : `${word}, ${plural(points, 'point')}`}
      </p>
    </div>
  );
}
