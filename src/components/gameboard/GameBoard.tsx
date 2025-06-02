import { Dispatch, SetStateAction } from "react";
import {  GameData, GameState } from "../../lib/types";
import BoardGrid from "../board/BoardGrid";
import GamePieces from "./GamePieces";
import { HighlightSelection, ClickableSelection } from "./HighlightSelection";
import { PendingWallsH, PendingWallsV } from "./PendingWalls";
import { WallsH, WallsV } from "./Walls";

export default function GameBoard(
    {
        game,
        setGame,
        gameData,
        setGameData,
    }: {
        game: GameState;
        setGame: Dispatch<SetStateAction<GameState>>;
        gameData: GameData;
        setGameData: Dispatch<SetStateAction<GameData>>;
    }) {

    const svgStyle = {
        display: "block",
        background: "#fff",
    };

    return (
        <div
            style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "center",
                width: "100%",
                gap: 40,
                position: "relative",
                marginTop: "0vh",
            }}
        >
            <div className="board-container">
                <svg
                    width="100%"
                    height="100%"
                    viewBox={`0 0 ${game.board_size} ${game.board_size}`}
                    style={svgStyle}
                    onContextMenu={e => {
                        if (
                            game.move_path.length === 1 &&
                            !game.wall_pending &&
                            game.phase === "Main" &&
                            game.winner === null
                        ) {
                            e.preventDefault();
                            setGame({
                                ...game,
                                move_path: []
                            });
                        }
                    }}
                >   
                    <BoardGrid game={game} />
                    <HighlightSelection
                        game={game}
                        gameData={gameData}
                    />
                    <GamePieces
                        game={game}
                        setGame={setGame}
                        gameData={gameData}
                    />
                    <ClickableSelection
                        game={game}
                        setGame={setGame}
                        gameData={gameData}
                        setGameData={setGameData}
                    />
                    <WallsH
                        game={game}
                    />
                    <WallsV
                        game={game}
                    />
                    <PendingWallsH
                        game={game}
                        setGame={setGame}
                        gameData={gameData}
                    />
                    <PendingWallsV
                        game={game}
                        setGame={setGame}
                        gameData={gameData}
                    />
                </svg>
            </div>
        </div>
    );
}
