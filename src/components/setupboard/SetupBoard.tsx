import { GameState, SetupState } from "../../lib/types";
import BoardGrid from "../board/BoardGrid";
import Pieces from "./SetupPieces";
import PlacementLayer from "./PlacementLayer";

export default function SetupBoard(
    {
        game,
        setup,
        onCellClick,
    }: {
        game: GameState;
        setup: SetupState;
        onCellClick: (row: number, col: number) => void;
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
                <svg width="100%" height="100%" viewBox={`0 0 ${game.board_size} ${game.board_size}`} style={svgStyle}>
                    <BoardGrid game={game} />
                    <Pieces game={game} />
                    <PlacementLayer game={game} setup={setup} onCellClick={onCellClick} />
                </svg>
            </div>
        </div>
    );
}
