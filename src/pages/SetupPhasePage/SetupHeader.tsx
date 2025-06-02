import { PLAYER_COLORS, PLAYER_NAMES } from "../../lib/Elements";
import { GameState, SetupState } from "../../lib/types";

export default function SetupHeader({ game, setup }: { game: GameState; setup: SetupState }) {
    return (
    <div
        className="container-rounded-bordered"
        style={{
            width: "clamp(20rem, 40vw, 60rem)",
            height: "clamp(10rem, 28vh, 15rem)",
            margin: "5vh auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            border: "2px solid #333",
            borderRadius: "20px",
            padding: "clamp(0.5rem, 2vh, 1.5rem)",
            boxSizing: "border-box",
            overflow: "auto",
            textAlign: "center",
        }}
        >
        <h1 style={{ fontSize: "clamp(1rem, 4vh, 2rem)" }}>Wall Go Setup</h1>
        <h2 style={{ fontSize: "clamp(0.8rem, 3vh, 1.5rem)", margin: 0 }}>Setup Phase</h2>
        <div style={{ fontSize: "clamp(0.7rem, 2.5vh, 1.2rem)" }}>
            Current Player:{" "}
            <span style={{ color: PLAYER_COLORS[game.current_player], fontWeight: "bold" }}>
                {PLAYER_NAMES[game.current_player] ?? `Player ${game.current_player + 1}`}
            </span>
        </div>
        <div style={{ marginTop: "clamp(0.5rem, 2vh, 1.5rem)" }}>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            <div style={{ display: "inline-block", marginRight: "1rem" }}>Pieces Left:</div>
            {PLAYER_NAMES.slice(0, game.num_players).map((name, idx) => (
                <li
                key={name}
                style={{
                    display: "inline-block",
                    marginRight: "clamp(0.5rem, 2vw, 1rem)",
                    fontWeight: "bold",
                    color: PLAYER_COLORS[idx],
                }}
                >
                    {name}: {setup.pieces[idx]}
                </li>
            ))}
            </ul>
        </div>
    </div>
    );
}
