import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./styles/App.css";
import HomePage from './pages/HomePage';
import RulesPage from './pages/RulesPage';
import AboutPage from './pages/AboutPage'
import GameOptionsPage from "./pages/GameOptionsPage";
import MultiplayerPage from "./pages/MultiplayerPage";

const BOARD_DIM = 70; // Board cell size in px (change as desired)

// function getDefaultTokens(numPlayers, piecesPerPlayer) {
//   return Array(numPlayers).fill(piecesPerPlayer);
// }

function App() {
    const [page, setPage] = useState("home"); // "home", "gameOptions", "rules", "about"
    switch (page) {
        case "home":
        return (
            <HomePage
            onLocal={() => {
                setPage("gameOptions");
            }}
            onMulti={() => {
                setPage("multiOptions");
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
                }}
                gameMode={"local"}
            />
        );
        case "multiOptions":
        return (
            <MultiplayerPage
                onBack={() => {
                    setPage("home");
                    invoke("reset_setup");
                    invoke("reset_game");
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
