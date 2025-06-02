import { useState, useEffect } from "react";
import BouncingImages from "../../components/BouncingImages";
import "../../styles/App.css";
import { GameData, GameState } from "../../lib/types";
import BackButton from "../../components/BackButton";
import { getGameState, getRegionScores, getValidMovesForPiece, hasValidMoves, nextPlayer } from "../../lib/api";
import GameBoard from "../../components/gameboard/GameBoard";
import GameHeader from "./GameHeader";

function GamePhasePage({ onBack}: { onBack: (e: React.FormEvent) => void }) {
	const [gameData, setGameData] = useState<GameData>({
		selectablePieces: {},
		validMoves: [],
		validMovesSource: null,
		regionScores: [],
		lastMoved: null,
	})

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
		console.log("GAME PHASE: getting game state");
		(async () => {
			await new Promise((resolve) => setTimeout(resolve, 200));
			const gameState = await getGameState();
			setGame(gameState);
			console.log(gameState);
		})()
    }, []);

	// Get selectable pieces for the current player
	useEffect(() => {
		if (game.phase === "Main") {
			console.log("TRIGGERING");
		(async () => {
			const newSelectable = {};
			const promises: Promise<void>[] = [];
			for (let row = 0; row < game.board_size; row++) {
			for (let col = 0; col < game.board_size; col++) {
				if (game.board[row][col]?.player === game.current_player) {
				// Check for valid moves
				promises.push(
					hasValidMoves(row, col).then(async (hasMoves) => {
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
			const gameState = await nextPlayer();
			setGame(gameState);
			}
			setGameData(prev => ({ ...prev, selectablePieces: newSelectable }));
			console.log("new selectables: ", newSelectable);
		})();
		}
	}, [game.board, game.current_player, game.phase, game.board_size, game.walls_h, game.walls_v, game.wall_pending]);

  // Get valid moves for the selected piece?
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
		getValidMovesForPiece(row, col).then((moves) => {
			if (!cancelled) {
				setGameData(prev => ({ ...prev, validMoves: moves }));
			}
		});
		return () => { cancelled = true; };
	} else {
		setGameData(prev => ({ ...prev, validMoves: [], validMovesSource: null }));
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
		<GameHeader game={game} gameData={gameData}/>
		<GameBoard
			game={game}
			setGame={setGame}
			gameData={gameData}
			setGameData={setGameData}
		/>
	</main>
	);
}

export default GamePhasePage;