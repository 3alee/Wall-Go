import { Coord, GameState, SetupState } from "../../lib/types";

export default function PlacementLayer({
    game,
    setup,
    onCellClick,
}: {
    game: GameState;
    setup: SetupState;
    onCellClick: (coord: Coord) => void;
}) {
    if (setup.pieces[game.current_player] === 0) return null;

    return (
        <>
        {game.board.map((row, rowIdx) =>
            row.map((cell, colIdx) =>
            cell === null ? (
                <rect
                key={`spot-${rowIdx}-${colIdx}`}
                x={colIdx}
                y={rowIdx}
                width={1}
                height={1}
                fill="#9a695e"
                opacity={0}
                style={{ cursor: "pointer" }}
                onClick={() => onCellClick({row: rowIdx, col: colIdx})}
                />
            ) : null
            )
        )}
        </>
    );
}
