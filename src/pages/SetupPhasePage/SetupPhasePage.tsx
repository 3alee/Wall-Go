import { useEffect, useState } from "react";
import BouncingImages from "../../components/BouncingImages";
import "../../styles/App.css";
import GamePhasePage from "../GamePhasePage/GamePhasePage";
import { SetupState, GameState, SetupAndGameState, Coord } from "../../lib/types";
import BackButton from "../../components/BackButton";
import SetupHeader from "./SetupHeader";
import SetupBoard from "../../components/setupboard/SetupBoard";
import { getGameState, getSetupState, handleSetupMove, startMainPhase } from "../../lib/api";


function SetupPhasePage({ onBack}: { onBack: (e: React.FormEvent) => void }) {  
    const [setup, setSetup] = useState<SetupState>({
        pieces: [2, 2],
        direction: 1,
    });

    const [game, setGame] = useState<GameState>({
        board: [],
        board_size: 7,
        current_player: 0,
        winner: null,
        walls_h: [],
        walls_v: [],
        phase: "Setup",
        move_path: [],
        wall_pending: false,
        num_players: 2,
        pieces_per_player: 2,
    });

    useEffect(() => {
        (async () => {
            await new Promise((resolve) => setTimeout(resolve, 200));
            const setupState = await getSetupState();
            const gameState = await getGameState();
            console.log("GETTING BOTH STATES");
            setSetup(setupState);
            setGame(gameState);
            console.log(setupState);
        })()
    }, []);

    async function onCellClick (coord: Coord) {
        const setupandgame: SetupAndGameState = await handleSetupMove(coord);
        // Update frontend states with returned values
        setSetup(setupandgame.setup_state);
        setGame(setupandgame.game_state);
    };
        
    useEffect(() => {
        console.log("setup.pieces.length", setup.pieces.length);
        if (setup.pieces.length === 0) return;

        const totalPieces = setup.pieces.reduce((a, b) => a + b, 0);
        console.log("Total Pieces", totalPieces);
        if (totalPieces === 0) {
            (async () => {
                console.log("TOTAL PIECES = 0")
                const game: GameState = await startMainPhase();
                setGame(game);
            })();
        }
    }, [setup.pieces]);
    
    switch (game.phase) {
        case "Main":
        return (
            <GamePhasePage
                onBack={onBack}
            />
        );
        default:
            break;
    }

    return (
        <main className="container">
            <BouncingImages />
            <BackButton onBack={onBack} />
            <SetupHeader game={game} setup={setup} />
            <SetupBoard game={game} setup={setup} onCellClick={onCellClick} />
        </main>
    );
}

export default SetupPhasePage;