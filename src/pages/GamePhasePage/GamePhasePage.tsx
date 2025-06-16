import { useState, useEffect } from "react";
import BouncingImages from "../../components/BouncingImages";
import "../../styles/App.css";
import { GameData, GameState, GameMode } from "../../lib/types";
import BackButton from "../../components/BackButton";
import { getGameState, getRegionScores, getValidMovesForPiece, hasValidMoves, nextPlayer } from "../../lib/api";
import GameBoard from "../../components/gameboard/GameBoard";
import GameHeader from "./GameHeader";
import { useGameSync } from "../../multiplayer/useGameSync";

type Props = {
    onBack: (e: React.FormEvent) => void;
    gameMode: GameMode;
    gameId?: string;
};

function GamePhasePage({ onBack, gameMode, gameId }: Props) {
    const [gameData, setGameData] = useState<GameData>({
        selectablePieces: {},
        validPaths: [],
        validMovesSource: null,
        regionScores: [],
        lastMoved: null,
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

    // Only fetch from Rust if local mode
    useEffect(() => {
        if (gameMode === "local") {
            (async () => {
                await new Promise((resolve) => setTimeout(resolve, 200));
                const gameState = await getGameState();
                setLocalGame(gameState);
            })();
        }
        // Multiplayer handled by useGameSync
        // eslint-disable-next-line
    }, [gameMode, gameId]);

    // Get selectable pieces for the current player
    useEffect(() => {
        if (game.phase === "Main") {
            (async () => {
                const newSelectable: Record<string, boolean> = {};
                const promises: Promise<void>[] = [];
                for (let row = 0; row < game.board_size; row++) {
                    for (let col = 0; col < game.board_size; col++) {
                        if (game.board[row][col]?.player === game.current_player) {
                            promises.push(
                                hasValidMoves({ row, col }).then((hasMoves) => {
                                    if (hasMoves) {
                                        newSelectable[`${row},${col}`] = true;
                                    }
                                })
                            );
                        }
                    }
                }
                await Promise.all(promises);
                if (Object.values(newSelectable).every(val => val === false)) {
                    // If no selectable pieces, automatically move to next player
                    if (gameMode === "local") {
                        const gameState = await nextPlayer();
                        setLocalGame(gameState);
                    } else {
                        const next = { ...game, current_player: (game.current_player + 1) % game.num_players };
                        updateGame(next);
                    }
                }
                setGameData(prev => ({ ...prev, selectablePieces: newSelectable }));
            })();
        }
    }, [game, gameMode, updateGame]);

    // Get valid moves for the selected piece
    useEffect(() => {
        if (
            game.move_path.length === 1 &&
            !game.wall_pending &&
            game.phase === "Main" &&
            game.winner === null
        ) {
            const { row, col } = game.move_path[0];
            setGameData(prev => ({ ...prev, validMovesSource: { row, col } }));
            let cancelled = false;
            getValidMovesForPiece(game.move_path[0]).then((movePaths) => {
                if (!cancelled) {
                    setGameData(prev => ({ ...prev, validPaths: movePaths }));
                }
            });
            return () => { cancelled = true; };
        } else {
            setGameData(prev => ({ ...prev, validPaths: [], validMovesSource: null }));
        }
        // eslint-disable-next-line
    }, [game.move_path, game.board, game.walls_h, game.walls_v, game.wall_pending, game.phase, game.winner]);

    // Update Region Scores
    useEffect(() => {
        if (game.winner !== null) {
            getRegionScores().then(scores => setGameData(prev => ({ ...prev, regionScores: scores })));
        } else {
            setGameData(prev => ({ ...prev, regionScores: [] }));
        }
    }, [game.winner]);

    // Main phase
    return (
        <main className="container">
            <BouncingImages />
            <BackButton onBack={onBack} />
            <GameHeader game={game} gameData={gameData} />
            <GameBoard
                game={game}
                setGame={updateGame}
                gameData={gameData}
                setGameData={setGameData}
            />
        </main>
    );
}

export default GamePhasePage;