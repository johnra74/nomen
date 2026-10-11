import type { Board as BoardModel, Selection } from '../../domain/types';
import { Tile } from './Tile';

interface BoardProps {
  readonly board: BoardModel;
  readonly selection: Selection;
  onSelect(tileId: string): void;
}

export function Board({ board, selection, onSelect }: BoardProps) {
  return (
    <div className="board" role="group" aria-label="Letter tiles">
      {board.map((tile) => (
        <Tile
          key={tile.id}
          tile={tile}
          selected={selection.includes(tile.id)}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
