import { invoke } from "@tauri-apps/api/core";
import { Coord, CoordPath, GameState, Piece, SetupAndGameState, SetupState } from "./types";

//----------------------------------------------------------------
// Game Options Phase
/**
 * Initialize the game board and player configuration.
 */
export async function setBoardAndPlayer(params: {
    newBoard: (Piece | null)[][]; // assuming pieces can be placed or null
    currentPlayer: number;
    numPlayers: number;
    piecesPerPlayer: number;
    boardSize: number;
}): Promise<void> {
  return await invoke("set_board_and_player", params);
}

/**
 * Initialize the setup state with piece distribution and direction.
 */
export async function setSetup(params: {
    pieces: number[];
    direction: number;
}): Promise<void> {
    return await invoke("set_setup", params);
}

//----------------------------------------------------------------
// Setup Phase

/**
 * Fetch the current setup state from the backend.
 */
export async function getSetupState(): Promise<SetupState> {
    return await invoke<SetupState>("get_setup_state");
}

/**
 * Fetch the current game state from the backend.
 */
export async function getGameState(): Promise<GameState> {
    return await invoke<GameState>("get_game_state");
}

/**
 * Handle a setup phase move by clicking a cell.
 * Returns both the updated setup and game states.
 * 
 * @param rowIdx - The row index of the clicked cell.
 * @param colIdx - The column index of the clicked cell.
 */
export async function handleSetupMove(coord: Coord): Promise<SetupAndGameState> {
    return await invoke<SetupAndGameState>("handle_setup_move", { coord });
}

/**
 * Transition the game from Setup to Main phase.
 */
export async function startMainPhase(): Promise<GameState> {
    return await invoke<GameState>("start_main_phase");
}

//----------------------------------------------------------------
// Main Phase

// Check if a piece has valid moves
export async function hasValidMoves(coord: Coord): Promise<boolean> {
    return await invoke<boolean>("has_valid_moves", { coord });
}

// Get valid moves for a piece
export async function getValidMovesForPiece(coord: Coord): Promise<CoordPath[]> {
    return await invoke<CoordPath[]>("get_valid_moves_for_piece", { coord });
    // return result;
}

// Move a piece along a given path
export async function movePiece(path: CoordPath): Promise<GameState> {
    return await invoke<GameState>("move_piece", { path });
    // const rustPath = path.map(({ row, col }) => [row, col]);
    // return await invoke<GameState>("move_piece", { path: rustPath });
}

// Place a wall
export async function placeWall(type: "h" | "v", coord: Coord): Promise<GameState> {
    return await invoke<GameState>("place_wall", { wallType: type, coord: coord });
}

// Skip to next player if no valid moves
export async function nextPlayer(): Promise<GameState> {
    return await invoke<GameState>("next_player");
}

// Get region scores
export async function getRegionScores(): Promise<number[]> {
    return await invoke<number[]>("get_region_scores");
}