import { Dispatch, SetStateAction } from "react";
import { Coord, GameData, GameState } from "../../lib/types";
import { movePiece } from "../../lib/api";

// Select and move a piece (send path to backend)
async function handleMovePath(
    game: GameState,
    setGame: Dispatch<SetStateAction<GameState>>,
    setGameData: Dispatch<SetStateAction<GameData>>,
    path: Coord[]) {
        if (game.winner !== null || game.phase !== "Main" || game.wall_pending) return;
        const state = await movePiece(path);
        const pathTaken: Coord[] = state.move_path.map((pos) => {
            return { row: pos[0], col: pos[1] };
        });
        console.log("* {", path, "}");
        if (pathTaken.length > 0) {
            // If made a valid move?
            const prevCoord = pathTaken[pathTaken.length - 1];
            console.log("Move successful to {", prevCoord, "}");
            setGameData(prev => ({ ...prev, lastMoved: prevCoord}));
        } else {
            // If haven't moved
            console.log("Haven't moved.");
            setGameData(prev => ({ ...prev, lastMoved: null }));
        }
        console.log("HIYA");
        setGame(state);
}

export function HighlightSelection({ game, gameData }:
    {
        game: GameState;
        gameData: GameData }) {
    return (
        <>
        {game.move_path.length === 1 && !game.wall_pending && game.phase === "Main" && game.winner === null && gameData.validMovesSource && (
        <>
            {/* 1. Draw yellow highlights underneath */}
            {gameData.validMoves.map(({ row: r, col: c }) => (
            <rect
                key={`valid-move-highlight-${r}-${c}`}
                x={c}
                y={r}
                width={1}
                height={1}
                fill="#ffe066"
                opacity={0.5}
                style={{ pointerEvents: "none" }}
            />
            ))}
        </>
        )}
        </>
    );
}

export function ClickableSelection({ game, setGame, gameData, setGameData }:
    {
        game: GameState;
        setGame: Dispatch<SetStateAction<GameState>>;
        setGameData: Dispatch<SetStateAction<GameData>>;
        gameData: GameData }) {
    return (
        <>
        {game.move_path.length === 1 && !game.wall_pending && game.phase === "Main" && game.winner === null && gameData.validMovesSource && (
            <>
                {/* 2. Draw transparent clickable rects on top */}
                {gameData.validMoves.map(({ row: r, col: c }) => (
                    <rect
                    key={`valid-move-clickable-${r}-${c}`}
                    x={c}
                    y={r}
                    width={1}
                    height={1}
                    fill="transparent"
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                        console.log("• ATTEMPTING MOVE");
                        if (!gameData.validMovesSource) return;
                        if (gameData.validMovesSource.row === r && gameData.validMovesSource.col === c) {
                            // Stay-in-place move: path of length 1
                            handleMovePath(game, setGame, setGameData, [{ row: r, col: c }]);
                        } else {
                            handleMovePath(game, setGame, setGameData, [
                            { row: gameData.validMovesSource.row, col: gameData.validMovesSource.col },
                            { row: r, col: c }
                            ]);
                        }
                        setGame({
                            ...game,
                            move_path: []
                        });
                    }}
                    />
                ))}
                </>
            )}
        </>
    );
}
