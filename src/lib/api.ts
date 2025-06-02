import { invoke } from "@tauri-apps/api/core";
import { Coord, GameState, Piece, SetupAndGameState, SetupState } from "./types";

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
export async function handleSetupMove(rowIdx: number, colIdx: number): Promise<SetupAndGameState> {
    return await invoke<SetupAndGameState>("handle_setup_move", { rowIdx, colIdx });
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
export async function hasValidMoves(row: number, col: number): Promise<boolean> {
    return await invoke<boolean>("has_valid_moves", { row, col });
}

// Get valid moves for a piece
export async function getValidMovesForPiece(row: number, col: number): Promise<Coord[]> {
    const result = await invoke<[number, number][]>("get_valid_moves_for_piece", { row, col });
    return result.map(([r, c]) => ({ row: r, col: c }));
}

// Move a piece along a given path
export async function movePiece(path: Coord[]): Promise<GameState> {
    const rustPath = path.map(({ row, col }) => [row, col]);
    return await invoke<GameState>("move_piece", { path: rustPath });
}

// Place a wall
export async function placeWall(type: "h" | "v", row: number, col: number): Promise<GameState> {
    return await invoke<GameState>("place_wall", { wallType: type, row, col });
}

// Skip to next player if no valid moves
export async function nextPlayer(): Promise<GameState> {
    return await invoke<GameState>("next_player");
}

// Get region scores
export async function getRegionScores(): Promise<number[]> {
    return await invoke<number[]>("get_region_scores");
}