import { GameState } from "../../lib/types";
import { WALL_IMAGES_H, WALL_IMAGES_V } from "../../lib/Elements";

export function WallsH({ game }:
    {
        game: GameState }) {
    return (
        <>
        {game.walls_h.map(([r, c, player], i) => (
            <image
                key={`h-${r}-${c}-${i}`}
                href={WALL_IMAGES_H[player]}
                x={c}
                y={r + 1 - 0.12}
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
        {game.walls_v.map(([r, c, player], i) => (
            <image
                key={`v-${r}-${c}-${i}`}
                href={WALL_IMAGES_V[player]}
                x={c + 1 - 0.14}
                y={r}
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