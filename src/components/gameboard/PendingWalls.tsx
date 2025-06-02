import { GameData, GameState } from "../../lib/types";
import { WALL_IMAGES_V } from "../../lib/Elements";
import { placeWall } from "../../lib/api";
import { Dispatch, SetStateAction } from "react";

// Place a wall after a move
  async function handleWallPlace(
    game: GameState,
    setGame: Dispatch<SetStateAction<GameState>>,
    type: "h" | "v",
    row: number, col: number) {
        console.log(`Placing ${type} wall at (${row}, ${col})`);
        if (!game.wall_pending) return;
        const state = await placeWall( type, row, col );
        console.log(`Placed ${type} wall at (${row}, ${col})`);
        // setFromBackend(state);
        setGame(state);
  }
  
export function PendingWallsV({ game, setGame, gameData }:
    {
        game: GameState;
        setGame: Dispatch<SetStateAction<GameState>>;
        gameData: GameData; }) {
    return (
        <>
        {game.wall_pending &&
            Array.from({ length: game.board_size }).map((_, r) =>
                Array.from({ length: game.board_size - 1 }).map((_, c) => {
                // If wall already exists, skip it
                if (game.walls_v.some(([vr, vc, _]) => vr === r && vc === c)) return null;
                const last = gameData.lastMoved;
                //If not adjacent to most recently moved piece, ignore
                if (
                    !last ||
                    !(
                        (last.row === r && last.col === c) ||
                        (last.row === r && last.col === c + 1)
                    )
                )
                    return null;
                return (
                    <rect
                        key={`vwall-sel-${r}-${c}`}
                        x={c + 1 - 0.057}
                        y={r}
                        width={0.11}
                        height={1}
                        fill="#ffb347"
                        opacity={0.4}
                        rx={0.02}
                        style={{ cursor: "pointer" }}
                        onClick={() => handleWallPlace(game, setGame, "v", r, c)}
                    />
                );
            })
        )}
        </>
    );
}

export function PendingWallsH({ game, setGame, gameData }:
    {
        game: GameState;
        setGame: Dispatch<SetStateAction<GameState>>;
        gameData: GameData; }) {
    return (
        <>
        {game.wall_pending &&
            Array.from({ length: game.board_size - 1 }).map((_, r) =>
                Array.from({ length: game.board_size }).map((_, c) => {
                // If wall already exists, skip it
                if (game.walls_h.some(([hr, hc, _]) => hr === r && hc === c)) return null;
                const last = gameData.lastMoved;
                //If not adjacent to most recently moved piece, ignore
                if (
                    !last ||
                    !(
                    (last.row === r && last.col === c) ||
                    (last.row === r + 1 && last.col === c)
                    )
                )
                    return null;
                return (
                    <rect
                    key={`hwall-sel-${r}-${c}`}
                    x={c}
                    y={r + 1 - 0.057}
                    width={1}
                    height={0.11}
                    fill="#ffb347"
                    opacity={0.6}
                    rx={0.02}
                    style={{ cursor: "pointer" }}
                    onClick={() => handleWallPlace(game, setGame, "h", r, c)}
                    />
                );
                })
            )}
        </>
    );
}
