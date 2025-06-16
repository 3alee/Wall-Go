import { useEffect, useState } from "react";
import BouncingImages from "../components/BouncingImages";
import "../styles/App.css";
import SetupPhasePage from "./SetupPhasePage/SetupPhasePage";
import { GameMode, GameOptions, GameState } from "../lib/types";
import BackButton from "../components/BackButton";
import { setGameState, setSetup } from "../lib/api";
import { invoke } from "@tauri-apps/api/core";
import GameOptionsPage from "./GameOptionsPage";

type MultiSelection = "host" | "join";

function MultiplayerPage({ onBack }: { onBack: () => void }) {

    const [gameModeInput, setGameModeInput] = useState<MultiSelection>("host");
    const [gameIdInput, setGameIdInput] = useState<string>("");

    const [page, setPage] = useState<String>("multiplayer"); // "multiplayer" "gameoptions"

    if (page == "gameoptions") {
        return (
            <GameOptionsPage
                onBack={() => {
                    setPage("home");
                    invoke("reset_setup");
                    invoke("reset_game");
                }}
                gameMode={"multiplayer"}
                gameId={gameIdInput}
            />
        );
    }

    return (
        <main className="container">
            <BouncingImages />
            <BackButton onBack={onBack} />
            <div
            className="container-rounded-bordered"
            style={{
                width: "clamp(20rem, 40vw, 60rem)",
                height: "clamp(30rem, 80vh, 45rem)",
                margin: "5vh auto",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                border: "2px solid #333",
                borderRadius: "20px",
                padding: "clamp(1rem, 2vw, 2rem)",
                boxSizing: "border-box",
                overflow: "auto", // scroll if needed
            }}
            >
            <h1
                style={{
                fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
                textAlign: "center",
                marginBottom: "clamp(1rem, 2vh, 2rem)",
                }}
            >
                Multiplayer
            </h1>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    if (gameModeInput === "host" && gameIdInput.trim() === "") {
                        alert("Game ID is required for multiplayer mode");
                        return;
                    }
                    setPage("gameoptions");
                }}
                style={{
                width: "100%",
                maxWidth: "30rem",
                display: "flex",
                flexDirection: "column",
                gap: "clamp(1rem, 3vh, 2rem)",
                fontSize: "clamp(1rem, 2.5vh, 1.5rem)",
                }}
            >
                <label style={{ display: "flex", justifyContent: "space-between" }}>
                    <select
                        value={gameModeInput}
                        onChange={(e) => {
                            setGameModeInput(e.target.value as "host" | "join");
                            // setGameOptions({
                            //     ...gameOptions,
                            //     gameMode: gameModeInput
                            // });
                        }}
                        style={{
                        width: "clamp(8rem, 20vw, 12rem)",
                        marginLeft: "1rem",
                        fontSize: "inherit",
                        }}
                    >
                        <option value="host">Host</option>
                        <option value="join">Join</option>
                    </select>
                </label>

                {gameModeInput === "host" && (
                <label style={{ display: "flex", justifyContent: "space-between" }}>
                    Game ID:
                    <input
                    type="text"
                    value={gameIdInput}
                    onChange={(e) => {
                        setGameIdInput(e.target.value);
                        // setGameOptions({
                        //     ...gameOptions,
                        //     gameId: e.target.value,
                        // });
                    }}
                    style={{
                        width: "clamp(6rem, 20vw, 12rem)",
                        marginLeft: "1rem",
                        fontSize: "inherit",
                    }}
                    required
                    />
                </label>
                )}


                {gameModeInput === "host" && (
                <button
                type="submit"
                style={{
                    padding: "clamp(0.5rem, 2vh, 1rem)",
                    fontSize: "clamp(1rem, 3vh, 1.5rem)",
                    width: "100%",
                    borderRadius: "8px",
                }}
                >
                Create
                </button>
                )}
            </form>
            </div>
        </main>
    );
}

export default MultiplayerPage;