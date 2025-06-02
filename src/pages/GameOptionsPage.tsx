import { useEffect, useState } from "react";
import BouncingImages from "../components/BouncingImages";
import "../styles/App.css";
import SetupPhasePage from "./SetupPhasePage/SetupPhasePage";
import { GameOptions } from "../lib/types";
import { invoke } from "@tauri-apps/api/core";
import BackButton from "../components/BackButton";
import { setBoardAndPlayer, setSetup } from "../lib/api";

function GameOptionsPage({ onBack }: { onBack: () => void }) {

    const [gameOptions, setGameOptions] = useState<GameOptions>({
        boardSize: 7,
        piecesPerPlayer: 2,
        numPlayers: 2,
    });

    const [boardSizeInput, setBoardSizeInput] = useState<string>("7"); // raw string from input
    const [playersInput, setPlayersInput] = useState<string>("2"); // raw string from input
    const [piecesInput, setPiecesInput] = useState<string>("2"); // raw string from input

    const [page, setPage] = useState<String>("gameoptions"); // "gameoptions", "setupphase"
    const [shouldInitSetup, setShouldInitSetup] = useState(false);

    useEffect(() => {
        if (!shouldInitSetup) return;
        console.log("INITIALISING");

        (async () => {
            console.log("Setting up board and player");

            await setBoardAndPlayer({
                newBoard: Array(gameOptions.boardSize)
                    .fill(null)
                    .map(() => Array(gameOptions.boardSize).fill(null)),
                currentPlayer: 0,
                numPlayers: gameOptions.numPlayers,
                piecesPerPlayer: gameOptions.piecesPerPlayer,
                boardSize: gameOptions.boardSize,
            });

            console.log("Invoking set_setup with:", {
                pieces: Array(gameOptions.numPlayers).fill(gameOptions.piecesPerPlayer),
                direction: 1,
            });
            await setSetup({
                pieces: Array(gameOptions.numPlayers).fill(gameOptions.piecesPerPlayer),
                direction: 1,
        });

            setShouldInitSetup(false); // prevent re-invoking on rerenders
        })();
    }, [shouldInitSetup, gameOptions]);

    if (page == "setupphase") {
        return <SetupPhasePage onBack={onBack}/>
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
                Wall Go Setup Options
            </h1>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    setShouldInitSetup(true);
                    setPage("setupphase");
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
                Board Size:
                <input
                    type="number"
                    min={5}
                    max={15}
                    value={boardSizeInput}
                    onChange={(e) => {
                    const rawBoardSize = e.target.value;
                    setBoardSizeInput(rawBoardSize);
                    if (rawBoardSize === "") return;

                    const parsedBoardSize = Number(rawBoardSize);
                    if (!isNaN(parsedBoardSize)) {
                        setGameOptions({
                        ...gameOptions,
                        boardSize: parsedBoardSize
                        });
                    }
                    }}
                    style={{
                    width: "clamp(3rem, 8vw, 5rem)",
                    marginLeft: "1rem",
                    fontSize: "inherit",
                    }}
                />
                </label>

                <label style={{ display: "flex", justifyContent: "space-between" }}>
                Number of Players:
                <input
                    type="number"
                    min={2}
                    max={4}
                    value={playersInput}
                    onChange={(e) => {
                        const rawPlayers = e.target.value;
                        setPlayersInput(rawPlayers);
                        if (rawPlayers === "") return;

                        const parsedNumPlayers = Number(rawPlayers);
                        if (!isNaN(parsedNumPlayers)) {
                        setGameOptions({
                            ...gameOptions,
                            numPlayers: parsedNumPlayers
                        });
                        }
                    //   setSetupTokens(getDefaultTokens(n, Number(piecesPerPlayer) || 1));
                    }}
                    style={{
                    width: "clamp(3rem, 8vw, 5rem)",
                    marginLeft: "1rem",
                    fontSize: "inherit",
                    }}
                />
                </label>

                <label style={{ display: "flex", justifyContent: "space-between" }}>
                Pieces per Player:
                <input
                    type="number"
                    min={1}
                    max={Math.floor(Math.pow(Number(gameOptions.boardSize),2) / Number(gameOptions.numPlayers))}
                    value={piecesInput}
                    onChange={(e) => {
                    const rawPieces = e.target.value;
                    setPiecesInput(rawPieces);
                    if (rawPieces === "") return;

                    const parsedPiecesPerPlayer = Number(rawPieces);
                    if (!isNaN(parsedPiecesPerPlayer)) {
                        setGameOptions({
                            ...gameOptions,
                            piecesPerPlayer: parsedPiecesPerPlayer
                        });
                    }
                    }}
                    style={{
                    width: "clamp(3rem, 8vw, 5rem)",
                    marginLeft: "1rem",
                    fontSize: "inherit",
                    }}
                />
                </label>

                <button
                type="submit"
                style={{
                    padding: "clamp(0.5rem, 2vh, 1rem)",
                    fontSize: "clamp(1rem, 3vh, 1.5rem)",
                    width: "100%",
                    borderRadius: "8px",
                }}
                >
                Start Setup
                </button>
            </form>
            </div>
        </main>
    );
}

export default GameOptionsPage;