interface AnnouncerProps {
  /** Latest word result or game status; read out politely. */
  readonly message: string;
  /** Time warning; read out immediately. Never shown, because the clock shows it. */
  readonly warning: string;
  readonly tone?: 'neutral' | 'good' | 'bad';
  /** When false the message is still announced but not displayed. */
  readonly visible?: boolean;
}

// "Emphasis" shades, because Lumen's plain success and danger colours are too pale for text.
const TONE_CLASSES = {
  neutral: 'feedback--neutral',
  good: 'feedback--good text-success-emphasis',
  bad: 'feedback--bad text-danger-emphasis',
};

export function Announcer({ message, warning, tone = 'neutral', visible = true }: AnnouncerProps) {
  const shown = `feedback ${TONE_CLASSES[tone]} fw-bold text-center mb-0`;
  return (
    <>
      <p className={visible ? shown : 'visually-hidden'} role="status">
        {message}
      </p>
      <p className="visually-hidden" aria-live="assertive" data-testid="warning">
        {warning}
      </p>
    </>
  );
}
