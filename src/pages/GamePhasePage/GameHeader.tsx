import { PLAYER_COLORS, PLAYER_NAMES } from "../../lib/Elements";
import { GameData, GameState } from "../../lib/types";

export default function GameHeader({ game, gameData }: { game: GameState; gameData: GameData }) {
  return (
    <div
        className="container-rounded-bordered"
        style={{
        width: "clamp(20rem, 40vw, 60rem)",
        height: "clamp(13rem, 28vh, 15rem)",
        margin: "5vh auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        border: "2px solid #333",
        borderRadius: "20px",
        padding: "clamp(0.5rem, 2vh, 1.5rem)",
        boxSizing: "border-box",
        overflow: "auto", // allows scroll if needed on very small screens
        textAlign: "center",
        }}
    >
        <h1 style={{ fontSize: "clamp(1rem, 4vh, 2rem)" }}>Wall Go</h1>
        <h2 style={{ fontSize: "clamp(0.8rem, 3vh, 1.5rem)", margin: 0 }}>Main Phase</h2>
        <div style={{ marginTop: 0 }}>
        {game.winner === null ? (
            <div style={{ fontSize: "clamp(0.7rem, 2.5vh, 1.2rem)" }}>
            Current Player:{" "}
            <span
                style={{
                color: PLAYER_COLORS[game.current_player],
                fontWeight: "bold",
                }}
            >
                {PLAYER_NAMES[game.current_player]}
            </span>
            </div>
        ) : (
            <div style={{ fontSize: "clamp(0.7rem, 2.5vh, 1.2rem)" }}>
            Winner:{" "}
            <span
                style={{
                color: PLAYER_COLORS[game.winner],
                fontWeight: "bold",
                }}
            >
                {PLAYER_NAMES[game.winner]}
            </span>
            </div>
        )}
        </div>
        {/* Final Scores Panel */}
        {game.winner !== null && (
        <div>
            <h3 style={{ fontSize: "clamp(0.6rem, 2vh, 1.5rem)" }}>Final Scores</h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {PLAYER_NAMES.slice(0, game.num_players).map((name, idx) => (
                <li
                key={name}
                style={{
                    color: PLAYER_COLORS[idx],
                    fontWeight: "bold",
                    marginBottom: 8,
                    fontSize: "clamp(0.6rem, 2vh, 1.5rem)",
                    display: "inline-block",
                    marginRight: "clamp(0.5rem, 2vw, 1rem)",
                }}
                >
                {name}: {gameData.regionScores[idx] ?? 0}
                </li>
            ))}
            </ul>
        </div>
        )}
        <div className={"fade-anim"} style={{ fontSize: "clamp(0.7rem, 2.5vh, 1.2rem)", fontWeight: "bold", marginTop: "1vh" }}>
        {game.winner !== null ? null :
            game.wall_pending ? "Place a wall" :
            game.move_path.length === 1 ? "Move to a square" :
            "Select a piece to move"
        }
        </div>
    </div>
  );
}
