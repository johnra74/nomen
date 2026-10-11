interface PauseOverlayProps {
  onResume(): void;
}

/** Shown in place of the board, so letters cannot be studied while the clock is stopped. */
export function PauseOverlay({ onResume }: PauseOverlayProps) {
  return (
    <section className="card text-center" aria-label="Paused">
      <div className="card-body d-flex flex-column gap-3">
        <h2 className="card-title h3 mb-0">Paused</h2>
        <p className="mb-0">The tiles are hidden while the clock is stopped.</p>
        <button type="button" className="btn btn-primary btn-lg w-100" onClick={onResume} autoFocus>
          Resume
        </button>
      </div>
    </section>
  );
}
