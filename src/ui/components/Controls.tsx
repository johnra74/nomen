interface ControlsProps {
  readonly hasSelection: boolean;
  readonly canSubmit: boolean;
  onRemove(): void;
  onClear(): void;
  onShuffle(): void;
  onSubmit(): void;
  onPause(): void;
}

export function Controls(props: ControlsProps) {
  const { hasSelection, canSubmit, onRemove, onClear, onShuffle, onSubmit, onPause } = props;
  return (
    <div className="controls">
      <button
        type="button"
        className="btn btn-secondary"
        onClick={onRemove}
        disabled={!hasSelection}
      >
        Delete
      </button>
      <button
        type="button"
        className="btn btn-secondary"
        onClick={onClear}
        disabled={!hasSelection}
      >
        Clear
      </button>
      <button type="button" className="btn btn-secondary" onClick={onShuffle}>
        Shuffle
      </button>
      <button type="button" className="btn btn-secondary" onClick={onPause}>
        Pause
      </button>
      <button
        type="button"
        className="btn btn-primary btn-lg controls__submit"
        onClick={onSubmit}
        disabled={!canSubmit}
      >
        Submit
      </button>
    </div>
  );
}
