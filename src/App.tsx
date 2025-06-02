import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./styles/App.css";
import HomePage from './pages/HomePage';
import GameOptionsPage from './pages/GameOptionsPage';
import RulesPage from './pages/RulesPage';
import AboutPage from './pages/AboutPage'

const BOARD_DIM = 70; // Board cell size in px (change as desired)

function getDefaultTokens(numPlayers, piecesPerPlayer) {
  return Array(numPlayers).fill(piecesPerPlayer);
}

function App() {
  // Use string state for boardSize and piecesPerPlayer for input flexibility

//   const [board, setBoard] = useState(Array(boardSize).fill(null).map(() => Array(boardSize).fill(null)));
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [winner, setWinner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [setup, setSetup] = useState(false);
//   const [setupTokens, setSetupTokens] = useState(getDefaultTokens(2, 2));
  const [setupTurn, setSetupTurn] = useState(0);
  const [phase, setPhase] = useState("setup");
  const [movePath, setMovePath] = useState([]);
  const [wallPending, setWallPending] = useState(false);
  const [wallsH, setWallsH] = useState([]);
  const [wallsV, setWallsV] = useState([]);
  const [setupTransitioned, setSetupTransitioned] = useState(false);
  const [lastMoved, setLastMoved] = useState(null);

  // // Update setFromBackend to use boardSize from backend if present
  // function setFromBackend(state) {
  //   if (typeof state.board_size === "number") setBoardSize(String(state.board_size));
  //   setBoard(state.board.map(row => row.map(cell => cell === null ? null : cell)));
  //   setCurrentPlayer(state.current_player);
  //   setWinner(state.winner);
  //   setWallsH(state.walls_h || []);
  //   setWallsV(state.walls_v || []);
  //   setMovePath(state.move_path ? state.move_path.map(([row, col]) => ({ row, col })) : []);
  //   setWallPending(state.wall_pending || false);
  //   setPhase(state.phase === "Setup" ? "setup" : "main");
  //   if (typeof state.num_players === 'number') setNumPlayers(state.num_players);
  //   if (typeof state.pieces_per_player === 'number') setPiecesPerPlayer(String(state.pieces_per_player));
  //   if (state.move_path && state.move_path.length > 0) {
  //     const [row, col] = state.move_path[state.move_path.length - 1];
  //     setLastMoved({ row, col });
  //   } else {
  //     setLastMoved(null);
  //   }
  // }




  // async function handleReset() {
  //   const state = await invoke("reset_game");
  //   setFromBackend(state);
  //   setShowHomepage(true);
  //   setShowRules(false);
  //   setShowAbout(false);
  //   setSetup(false);
  //   setSetupTransitioned(false);
  // }

  const [page, setPage] = useState("home"); // "home", "gameOptions", "rules", "about"
  switch (page) {
    case "home":
      return (
        <HomePage
          onPlay={() => {
            setPage("gameOptions");
          }}
          onRules={() => {
            setPage("rules");
          }}
          onAbout={() => {
            setPage("about");
          }}
        />
      );
    case "gameOptions":
      return (
        <GameOptionsPage
          onBack={() => {
            setPage("home");
            invoke("reset_setup");
            invoke("reset_game");
            // handleReset();
          }}
        />
      );
    case "rules":
      return (
        <RulesPage
          onBack={() => {
            setPage("home");
            // handleReset();
          }}
        />
      );
    case "about":
      return (
        <AboutPage
          onBack={() => {
            setPage("home");
            // handleReset();
          }}
        />
      );
  }

}

export default App;
