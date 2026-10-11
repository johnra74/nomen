interface ClockBarProps {
  readonly remainingMs: number;
  readonly allowanceMs: number;
  readonly isWarning: boolean;
}

export function ClockBar({ remainingMs, allowanceMs, isWarning }: ClockBarProps) {
  const seconds = Math.ceil(remainingMs / 1000);
  const percent = Math.min(100, Math.max(0, (remainingMs / allowanceMs) * 100));
  // The warning is striped and spelled out, so it never depends on colour alone.
  const bar = isWarning ? 'progress-bar-striped bg-danger' : '';
  return (
    <div
      className={`clock d-flex align-items-center gap-3${isWarning ? ' clock--warning' : ''}`}
      role="timer"
      aria-label="Time remaining"
    >
      <div className="progress flex-grow-1" aria-hidden="true">
        <div className={`progress-bar meter__fill ${bar}`} style={{ width: `${percent}%` }} />
      </div>
      <p className={`clock__text fw-bold text-end mb-0${isWarning ? ' text-danger-emphasis' : ''}`}>
        {isWarning && <span className="clock__hurry text-uppercase">Hurry </span>}
        <span>{seconds}s</span>
      </p>
    </div>
  );
}
