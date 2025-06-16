export type GameOptions = {
    boardSize: number;
    piecesPerPlayer: number;
    numPlayers: number;
    gameMode: GameMode;
    gameId?: string;
};

export type GameMode = "local" | "multiplayer";

export type SetupState = {
    pieces: number[];
    direction: number;
};

export type Piece = {
  player: number;
  id: string; // unique UUID or generated at game setup
};

export type BoardCell = Piece | null;

export type GameState = {
    board: (BoardCell | null)[][];
    board_size: number;
    current_player: number;
    winner: number | null;
    walls_h: [Coord, number][];
    walls_v: [Coord, number][];
    phase: "Setup" | "Main" | string; // Use a union type or `string` if uncertain
    move_path: CoordPath;
    wall_pending: boolean;
    num_players: number;
    pieces_per_player: number;
    game_mode: GameMode;
    game_id?: string;};

export type SetupAndGameState = {
    setup_state: SetupState;
    game_state: GameState;
};

export type GameData = {
    selectablePieces: Record<string, boolean>;
	validPaths: CoordPath[];
	validMovesSource: Coord | null;
	regionScores: number[];
	lastMoved: Coord | null;
};

export type Coord = { row: number; col: number };

export type CoordPath = Coord[];