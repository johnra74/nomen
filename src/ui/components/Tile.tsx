import { letterValue } from '../../domain/scoring';
import type { Tile as TileModel } from '../../domain/types';
import { tileLabel } from '../messages';

interface TileProps {
  readonly tile: TileModel;
  readonly selected: boolean;
  onSelect(tileId: string): void;
}

export function Tile({ tile, selected, onSelect }: TileProps) {
  return (
    <button
      type="button"
      className="btn btn-dark tile"
      aria-label={tileLabel(tile.letter)}
      aria-pressed={selected}
      // Not `disabled`: a used tile keeps keyboard focus, it just cannot be picked again.
      aria-disabled={selected}
      onClick={() => {
        if (!selected) onSelect(tile.id);
      }}
    >
      <span className="tile__letter">{tile.letter}</span>
      <span className="tile__value">{letterValue(tile.letter)}</span>
    </button>
  );
}
