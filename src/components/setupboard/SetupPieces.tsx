import { GameState } from "../../lib/types";
import { PLAYER_IMAGES } from "../../lib/Elements";

export default function SetupPieces({ game }: { game: GameState }) {
    return (
        <>
        {game.board.map((row, rowIdx) =>
            row.map((cell, colIdx) =>
            cell !== null ? (
                <image
                key={`piece-${rowIdx}-${colIdx}`}
                href={PLAYER_IMAGES[cell.player]}
                x={colIdx + 0.15}
                y={rowIdx + 0.15}
                width={0.7}
                height={0.7}
                style={{ pointerEvents: "none" }}
                />
            ) : null
            )
        )}
        </>
    );
}
