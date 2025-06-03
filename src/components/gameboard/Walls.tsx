import { GameState } from "../../lib/types";
import { WALL_IMAGES_H, WALL_IMAGES_V } from "../../lib/Elements";

export function WallsH({ game }:
    {
        game: GameState }) {
    return (
        <>
        {game.walls_h.map(([coord, player], i) => (
            <image
                key={`h-${coord.row}-${coord.col}-${i}`}
                href={WALL_IMAGES_H[player]}
                x={coord.col}
                y={coord.row + 1 - 0.12}
                width={1}
                height={0.23}
                style={{
                    pointerEvents: "none",
                    userSelect: "none"
                }}
                // draggable={false}
            />
        ))}
        </>
    );
}

export function WallsV({ game }:
    {
        game: GameState }) {
    return (
        <>
        {game.walls_v.map(([coord, player], i) => (
            <image
                key={`v-${coord.row}-${coord.col}-${i}`}
                href={WALL_IMAGES_V[player]}
                x={coord.col + 1 - 0.14}
                y={coord.row}
                width={0.28}
                height={1}
                style={{
                    pointerEvents: "none",
                    userSelect: "none"
                }}
            // draggable={false}
            />
        ))}
        </>
    );
}