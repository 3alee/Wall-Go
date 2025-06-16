import { useEffect, useState } from "react";
import BouncingImages from "../../components/BouncingImages";
import "../../styles/App.css";
import GamePhasePage from "../GamePhasePage/GamePhasePage";
import { SetupState, GameState, SetupAndGameState, Coord, GameMode } from "../../lib/types";
import BackButton from "../../components/BackButton";
import SetupHeader from "./SetupHeader";
import SetupBoard from "../../components/setupboard/SetupBoard";
import { getGameState, getSetupState, handleSetupMove, startMainPhase } from "../../lib/api";
import { useGameSync } from "../../multiplayer/useGameSync";

type Props = {
    onBack: (e: React.FormEvent) => void;
    gameMode: GameMode;
    gameId?: string;
};

function SetupPhasePage({ onBack, gameMode, gameId }: Props) {
    const [setup, setSetup] = useState<SetupState>({
        pieces: [2, 2],
        direction: 1,
    });

    // Local fallback state for useGameSync
    const [localGame, setLocalGame] = useState<GameState>({
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
        game_mode: "local",
        game_id: undefined,
    });

    // --- useGameSync handles local or multiplayer state ---
    const { game, updateGame } = useGameSync(gameMode, localGame, setLocalGame, gameId);

    useEffect(() => {
        if (gameMode === "local") {
            (async () => {
                await new Promise((resolve) => setTimeout(resolve, 200));
                const setupState = await getSetupState();
                const gameState = await getGameState();
                setSetup(setupState);
                setLocalGame(gameState);
            })();
        }
        // Multiplayer handled by useGameSync
        // eslint-disable-next-line
    }, [gameMode, gameId]);

    async function onCellClick(coord: Coord) {
        if (gameMode === "local") {
            const setupandgame: SetupAndGameState = await handleSetupMove(coord);
            setSetup(setupandgame.setup_state);
            setLocalGame(setupandgame.game_state);
        } else {
            // For multiplayer, you need to implement multiplayer setup move logic here.
            // For now, just update the game state via updateGame if you have the logic.
            // Example (pseudo):
            // const newGame = { ...game, ...changesFromMove };
            // await updateGame(newGame);
            // You may also want to sync setup state via Firebase if needed.
        }
    }

    useEffect(() => {
        if (setup.pieces.length === 0) return;
        const totalPieces = setup.pieces.reduce((a, b) => a + b, 0);
        if (totalPieces === 0) {
            (async () => {
                if (gameMode === "local") {
                    const game: GameState = await startMainPhase();
                    setLocalGame(game);
                } else {
                    // For multiplayer, update the game phase to "Main" and sync via updateGame
                    const next = { ...game, phase: "Main" };
                    await updateGame(next);
                }
            })();
        }
    }, [setup.pieces, gameMode, game, updateGame]);

    if (game.phase === "Main") {
        return (
            <GamePhasePage
                onBack={onBack}
                gameMode={gameMode}
                gameId={gameId}
            />
        );
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