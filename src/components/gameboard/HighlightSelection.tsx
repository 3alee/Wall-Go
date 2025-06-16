import { Dispatch, SetStateAction } from "react";
import { CoordPath, GameData, GameState } from "../../lib/types";
import { movePiece } from "../../lib/api";

// Select and move a piece (send path to backend)
async function handleMovePath(
    game: GameState,
    setGame: (game: GameState) => void | Promise<void>,
    setGameData: Dispatch<SetStateAction<GameData>>,
    path: CoordPath)
    {
    if (game.winner !== null || game.phase !== "Main" || game.wall_pending) return;
    const state = await movePiece(path);
    const pathTaken: CoordPath = state.move_path;
    // console.log("* {", path, "}");
    if (pathTaken.length > 0) {
        // If made a valid move?
        const prevCoord = pathTaken[pathTaken.length - 1];
        // console.log("Move successful to {", prevCoord, "}");
        setGameData(prev => ({ ...prev, lastMoved: prevCoord}));
    } else {
        // If haven't moved
        // console.log("Haven't moved.");
        setGameData(prev => ({ ...prev, lastMoved: null }));
    }
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
            {gameData.validPaths.map((path: CoordPath) => (
            <rect
                key={`valid-move-highlight-${path[path.length - 1].row}-${path[path.length - 1].col}`}
                x={path[path.length - 1].col}
                y={path[path.length - 1].row}
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
        setGame: (game: GameState) => void | Promise<void>;
        setGameData: Dispatch<SetStateAction<GameData>>;
        gameData: GameData }) {
    return (
        <>
        {game.move_path.length === 1 && !game.wall_pending && game.phase === "Main" && game.winner === null && gameData.validMovesSource && (
            <>
                {/* 2. Draw transparent clickable rects on top */}
                {gameData.validPaths.map((path: CoordPath) => (
                    <rect
                    key={`valid-move-clickable-${path[path.length - 1].row}-${path[path.length - 1].col}`}
                    x={path[path.length - 1].col}
                    y={path[path.length - 1].row}
                    width={1}
                    height={1}
                    fill="transparent"
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                        // console.log(path);
                        // console.log("• ATTEMPTING MOVE", path[path.length - 1].col, path[path.length - 1].row);
                        if (!gameData.validMovesSource) return;
                        // console.log("**", gameData.validMovesSource.row, path[path.length - 1].row, gameData.validMovesSource.col, path[path.length - 1].col);
                        handleMovePath(game, setGame, setGameData, path);
                        // console.log("HandleMovePath");
                        // if (gameData.validMovesSource.row === path[path.length - 1].row && gameData.validMovesSource.col === path[path.length - 1].col) {
                        //     handleMovePath(game, setGame, setGameData, path);
                        //     console.log("HandleMovePath");
                        // }
                        setGame({
                            ...game,
                            move_path: []
                        });
                        // console.log("• Successful Move", game.move_path);
                    }}
                    />
                ))}
                </>
            )}
        </>
    );
}
