import { GameState } from "../../lib/types";

export default function BoardGrid({ game }: { game: GameState }) {
    return (
        <>
        {game.board.map((row, rowIdx) =>
            row.map((_, colIdx) => (
            <image
                key={`bg-${rowIdx}-${colIdx}`}
                href="/boardcell.png"
                x={colIdx}
                y={rowIdx}
                width={1}
                height={1}
                style={{ pointerEvents: "none" }}
            />
            ))
        )}
        </>
    );
}
