#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Piece {
    pub id: String,       // unique identifier, e.g. "p1-0"
    pub player: usize,    // player number
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum GameMode {
    Local,
    Multiplayer,
}

// #[tauri::command(rename_all = "snake_case")]
#[tauri::command]
fn set_game_state(
    game_state: GameState,
    state: State<SharedGameState>
) -> GameState {
    let mut game = state.lock().unwrap();
    println!("[Rust] set_game_state: {:?}", game);
    *game = game_state;
    game.clone()
}

// #[tauri::command]
// fn set_board(new_board: Vec<Vec<Option<Piece>>>, state: State<SharedGameState>) -> GameState {
//     let mut game = state.lock().unwrap();
//     // Replace the board entirely
//     if new_board.len() == game.board_size && new_board.iter().all(|row| row.len() == game.board_size) {
//         game.board = new_board.clone();
//     }
//     game.clone()
// }

#[tauri::command]
fn start_main_phase(state: State<SharedGameState>) -> GameState {
    let mut game = state.lock().unwrap();
    if game.phase == GamePhase::Setup {
        game.phase = GamePhase::Main;
    }
    game.clone()
}

use serde::{Serialize, Deserialize};
use std::{collections::HashSet, sync::{Arc, Mutex}};
use tauri::State;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GameState {
    pub board: Vec<Vec<Option<Piece>>>, // None = empty, Some(player_idx)
    pub board_size: usize, // <--- add this
    pub current_player: usize,
    pub winner: Option<usize>,
    pub walls_h: Vec<(Coord, usize)>, // horizontal walls: (row, col, player)
    pub walls_v: Vec<(Coord, usize)>, // vertical walls: (row, col, player)
    pub phase: GamePhase,
    pub move_path: Vec<Coord>, // path for the current move
    pub wall_pending: bool, // true if waiting for wall placement
    pub num_players: usize,           // <-- add this
    pub pieces_per_player: usize,     // <-- add this
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum GamePhase {
    Setup,
    Main,
}

impl Default for GameState {
    fn default() -> Self {
        let board_size = 7;
        Self {
            board: vec![vec![None; board_size]; board_size],
            board_size,
            current_player: 0,
            winner: None,
            walls_h: vec![],
            walls_v: vec![],
            phase: GamePhase::Setup,
            move_path: vec![],
            wall_pending: false,
            num_players: 2,           // default to 2
            pieces_per_player: 2,     // default to 2
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SetupState {
    pub pieces: Vec<usize>,
    pub direction: isize,
}

type SharedGameState = Arc<Mutex<GameState>>;
type SharedSetupState = Arc<Mutex<SetupState>>;

#[tauri::command]
fn get_game_state(game_state: State<SharedGameState>) -> GameState {
    game_state.lock().unwrap().clone()
}

#[tauri::command]
fn get_setup_state(setup_state: State<SharedSetupState>) -> SetupState {
    let setup = setup_state.lock().unwrap();
    // println!("[Rust] get_setup_state returns: {:?}", *setup);
    // let addr = Arc::as_ptr(&setup_state) as usize;
    // println!("set_setup accessing SetupState at {:p}", addr as *const ());
    setup.clone()
}

impl Default for SetupState {
    fn default() -> Self {
        Self {
            pieces: vec![],
            direction: 0,     // default to 2
        }
    }
}

#[tauri::command]
fn set_setup(
    pieces: Vec<usize>,
    direction: isize, // <-- add this parameter
    setup_state: State<SharedSetupState>
) -> SetupState {
    
    let mut setup = setup_state.lock().unwrap();
    println!("[Rust] Before set_setup: {:?}", *setup);

    setup.pieces = pieces;
    setup.direction = direction;
    println!("[Rust] After set_setup: {:?}", *setup);
    let addr = Arc::as_ptr(&setup_state) as usize;
    println!("set_setup accessing SetupState at {:p}", addr as *const ());
    setup.clone()
}

// Helper: check if a move is blocked by a wall
fn is_blocked(coord_1: Coord, coord_2: Coord, game: &GameState) -> bool {
    let Coord {row: r1, col: c1} = coord_1;
    let Coord {row: r2, col: c2} = coord_2;
    if r1 == r2 {
        // Horizontal move
        let min_c = c1.min(c2);
        wall_v_exists(game, Coord {row: r1, col: min_c})
    } else if c1 == c2 {
        // Vertical move
        let min_r = r1.min(r2);
        wall_h_exists(game, Coord {row: min_r, col: c1})
    } else {
        true
    }
}

// Helper: check if a path is a valid move for the current player
fn is_valid_move_path(game: &GameState, path: &[Coord]) -> bool {
    if path.len() == 1 {
        let Coord { row, col } = path[0];
        // Only allow if the piece belongs to the current player
        match game.board[row][col] {
            Some(ref p) if p.player == game.current_player => (),
            _ => return false,
        };
        // Check if at least one adjacent cell is NOT blocked by a wall
        let neighbors = [
            Coord { row: row.wrapping_sub(1), col },
            Coord { row: row + 1, col },
            Coord { row, col: col.wrapping_sub(1) },
            Coord { row, col: col + 1 },
        ];
        for &Coord { row: nr, col: nc } in &neighbors {
            if nr >= game.board_size || nc >= game.board_size {
                continue;
            }
            if !is_blocked(Coord {row: row, col: col}, Coord {row: nr, col: nc}, game) {
                return true;
            }
        }
        // All directions blocked: not a valid 0-length move
        return false;
    }

    if path.len() != 2 && path.len() != 3 {
        return false;
    }

    let start = path[0];
    let end = path[path.len() - 1];
    // Must start on a piece belonging to the current player
    match game.board[start.row][start.col] {
        Some(ref p) if p.player == game.current_player => (),
        _ => return false,
    };
    // End must be empty or the start (for return-to-start)
    if game.board[end.row][end.col].is_some() && end != start {
        return false;
    }

    use std::collections::VecDeque;
    let mut queue = VecDeque::new();
    let mut visited = vec![vec![false; game.board_size]; game.board_size];
    queue.push_back((start, 0));
    visited[start.row][start.col] = true;

    while let Some((pos, dist)) = queue.pop_front() {
        if dist > 2 {
            continue;
        }
        if pos == end && dist > 0 && dist <= 2 {
            return true;
        }
        if dist == 2 {
            continue;
        }
        let Coord { row: r, col: c } = pos;
        let neighbors = [
            Coord { row: r.wrapping_sub(1), col: c },
            Coord { row: r + 1, col: c },
            Coord { row: r, col: c.wrapping_sub(1) },
            Coord { row: r, col: c + 1 },
        ];
        for &Coord { row: nr, col: nc } in &neighbors {
            if nr >= game.board_size || nc >= game.board_size {
                continue;
            }
            // Allow revisiting any cell, but not passing through other pieces (except possibly the end)
            if game.board[nr][nc].is_some() && (Coord { row: nr, col: nc }) != end && (Coord { row: nr, col: nc }) != start {
                continue;
            }
            if is_blocked(Coord {row: r, col: c}, Coord {row: nr, col: nc}, game)  {
                continue;
            }
            // Only mark as visited if not the start, so we can revisit start for "back" moves
            if !(nr == start.row && nc == start.col) && visited[nr][nc] {
                continue;
            }
            visited[nr][nc] = true;
            queue.push_back((Coord { row: nr, col: nc }, dist + 1));
        }
    }
    false
}

#[tauri::command]
// fn has_valid_moves(row: usize, col: usize, state: State<SharedGameState>) -> bool {
fn has_valid_moves(coord: Coord, state: State<SharedGameState>) -> bool {
    let game = state.lock().unwrap();
    // Only check if this is the current player's piece
    // if game.board[row][col] != Some(game.current_player) {
    //     return false;
    // }
    match game.board[coord.row][coord.col] {
        Some(ref p) if p.player == game.current_player => p,
        _ => return false,
    };
    // Allow 0-length move (stay in place)
    if is_valid_move_path(&game, &[coord]) {
        return true;
    }
    // Try all possible destinations within 2 steps
    for r in 0..game.board_size {
        for c in 0..game.board_size {
            let target = Coord { row: r, col: c };
            if is_valid_move_path(&game, &[coord, target]) {
                return true;
            }
        }
    }
    false
}

#[tauri::command]
fn move_piece(path: CoordPath, state: State<SharedGameState>) -> GameState {
    let mut game = state.lock().unwrap();
    if game.winner.is_some() || game.phase != GamePhase::Main || game.wall_pending { return game.clone(); }
    if !is_valid_move_path(&game, &path) { return game.clone(); }
    let start = path[0];
    let end = path[path.len() - 1];

    // Only move the piece if start != end
    // if start != end {
    //     game.board[start.0][start.1] = None;
    //     game.board[end.0][end.1] = Some(game.current_player);
    // }
    if start != end {
        // let original_piece = game.board[start.0][start.1].take().unwrap(); // take ownership of the piece
        // game.board[end.0][end.1] = Some(original_piece);
        let original_piece = game.board[start.row][start.col].take().unwrap(); // take ownership of the piece
        game.board[end.row][end.col] = Some(original_piece);
    }
    game.move_path = path;
    game.wall_pending = true;

    if all_pieces_isolated(&game) {
        game.winner = Some(0); // or any value to indicate game over
    }
    game.clone()
}

// Helper: check if a wall placement is valid (adjacent to piece, not overlapping)
fn is_valid_wall(game: &GameState, wall_type: &str, coord: Coord) -> bool {
    let last = match game.move_path.last() {
        Some(&pos) => pos,
        None => return false,
    };
    let Coord { row, col } = coord;
    let Coord { row: r, col: c } = last;
    let adj = [
        (r.wrapping_sub(1), c),
        (r + 1, c),
        (r, c.wrapping_sub(1)),
        (r, c + 1),
    ];
    let is_adj = match wall_type {
        "h" => adj.iter().any(|&(ar, ac)| (ar == row && ac == col) || (ar == row + 1 && ac == col)),
        "v" => adj.iter().any(|&(ar, ac)| (ar == row && ac == col) || (ar == row && ac == col + 1)),
        _ => false,
    };
    if !is_adj { return false; }
    match wall_type {
        "h" => !wall_h_exists(game, coord) && row < game.board_size - 1,
        "v" => !wall_v_exists(game, coord) && col < game.board_size - 1,
        _ => false,
    }
}

// --- Add these helper functions near the top or with your other helpers ---
fn wall_h_exists(game: &GameState, coord: Coord) -> bool {
    let Coord { row, col } = coord;
    game.walls_h.iter().any(|&(Coord {row: r, col: c}, _)| r == row && c == col)
}
fn wall_v_exists(game: &GameState, coord: Coord) -> bool {
    let Coord { row, col } = coord;
    game.walls_v.iter().any(|&(Coord {row: r, col: c}, _)| r == row && c == col)
}

#[tauri::command]
fn next_player(state: State<SharedGameState>) -> GameState {
    let mut game = state.lock().unwrap();
    game.current_player = (game.current_player + 1) % game.num_players;
    game.clone()
}

#[tauri::command]
fn place_wall(wall_type: String, coord: Coord, state: State<SharedGameState>) -> GameState {
    let mut game = state.lock().unwrap();
    if !game.wall_pending { return game.clone(); }
    if !is_valid_wall(&game, &wall_type, coord) { return game.clone(); }
    let player = game.current_player; // <--- get before mut borrow
    match wall_type.as_str() {
        "h" => game.walls_h.push((coord, player)),
        "v" => game.walls_v.push((coord, player)),
        _ => {}
    }
    // End turn
    game.current_player = (game.current_player + 1) % game.num_players;
    game.wall_pending = false;
    game.move_path.clear();
    if all_pieces_isolated(&game) {
        game.winner = Some(0); // or any value to indicate game over
    }
    game.clone()
}

#[tauri::command]
fn reset_game(state: State<SharedGameState>) -> GameState {
    let mut game = state.lock().unwrap();
    *game = GameState::default();
    game.clone()
}

#[tauri::command]
fn reset_setup(state: State<SharedSetupState>) -> SetupState {
    let mut setup = state.lock().unwrap();
    *setup = SetupState::default();
    setup.clone()
}

// #[tauri::command]
// fn get_valid_moves_for_piece(row: usize, col: usize, state: State<SharedGameState>) -> Vec<(usize, usize)> {
//     let game = state.lock().unwrap();
//     let mut moves = Vec::new();
//     // Only check if this is the current player's piece
//     // if game.board[row][col] != Some(game.current_player) {
//     //     return moves;
//     // }
//     match game.board[row][col] {
//         Some(ref p) if p.player == game.current_player => p,
//         _ => return moves,
//     };
//     // Add 0-length move (stay in place)
//     if is_valid_move_path(&game, &[(row, col)]) {
//         moves.push((row, col));
//     }
//     // Try all possible destinations within 2 steps, but skip (row, col)
//     for r in 0..game.board_size {
//         for c in 0..game.board_size {
//             if r == row && c == col {
//                 continue; // skip duplicate
//             }
//             if is_valid_move_path(&game, &[(row, col), (r, c)]) {
//                 moves.push((r, c));
//             }
//         }
//     }
//     moves
// }

#[derive(serde::Serialize, serde::Deserialize, Clone, Copy, Debug, PartialEq, Eq, Hash)]
pub struct Coord {
    row: usize,
    col: usize,
}

pub type CoordPath = Vec<Coord>;

#[tauri::command]
fn get_valid_moves_for_piece(coord: Coord, state: State<SharedGameState>) -> Vec<CoordPath> {
    let game = state.lock().unwrap();
    let mut result_paths: Vec<CoordPath> = Vec::new();
    let Coord {row, col} = coord;

    // If coord in question does not belong to current player, return unaltered result_paths
    match game.board[row][col] {
        Some(ref p) if p.player == game.current_player => (),
        _ => return result_paths,
    };

    const MAX_PATH_LEN: usize = 3;

    fn dfs(
        game: &GameState,
        path: &mut Vec<Coord>,
        visited: &mut Vec<Vec<bool>>,
        results: &mut Vec<CoordPath>,
    ) {
        if !is_valid_move_path(game, path) {
            return;
        }

        results.push(path.clone());

        if path.len() == MAX_PATH_LEN {
            return;
        }

        let Coord { row: r, col: c } = path.last().cloned().unwrap();

        let neighbors = [
            Coord { row: r.wrapping_sub(1), col: c },
            Coord { row: r + 1, col: c },
            Coord { row: r, col: c.wrapping_sub(1) },
            Coord { row: r, col: c + 1 },
        ];

        for &Coord { row: nr, col: nc } in &neighbors {
            if nr >= game.board_size || nc >= game.board_size {
                // If out of bounds, end recursion
                continue;
            }
            if visited[nr][nc] {
                // If already visited, end recursion
                continue;
            }
            if let Some(_) = game.board[nr][nc] {
                // If already a piece, end recursion
                continue;
            }
            if is_blocked(Coord {row: r, col: c}, Coord {row: nr, col: nc}, game)  {
                // If blocked by wall, end recursion
                continue;
            }

            visited[nr][nc] = true;
            path.push(Coord { row: nr, col: nc });
            dfs(game, path, visited, results);
            path.pop();
            visited[nr][nc] = false;
        }
    }

    let mut visited = vec![vec![false; game.board_size]; game.board_size];
    visited[row][col] = true;
    dfs(&game, &mut vec![Coord { row, col }], &mut visited, &mut result_paths);

    // Delete all paths that share endpoints
    let mut seen = HashSet::new();
    result_paths.retain(|path| {
        let end = path.last().unwrap();
        seen.insert((end.row, end.col))
    });
    result_paths
}

fn is_valid_wall_anywhere(game: &GameState, wall_type: &str, coord: Coord) -> bool {
    let Coord { row, col } = coord;
    match wall_type {
        "h" => !wall_h_exists(game, coord) && row < game.board_size - 1,
        "v" => !wall_v_exists(game, coord) && col < game.board_size - 1,
        _ => false,
    }
}

#[tauri::command]
fn can_place_adjacent_wall(coord: Coord, state: State<SharedGameState>) -> bool {
    let game = state.lock().unwrap();
    let Coord { row, col } = coord;
    let adj = [
        (row.wrapping_sub(1), col),
        (row + 1, col),
        (row, col.wrapping_sub(1)),
        (row, col + 1),
    ];
    for &(ar, ac) in &adj {
        if ar < game.board_size && ac < game.board_size {
            if is_valid_wall_anywhere(&game, "h", Coord {row: ar, col: ac}) || is_valid_wall_anywhere(&game, "v", Coord {row: ar, col: ac}) {
                return true;
            }
        }
    }
    false
}

#[tauri::command]
fn get_region_scores(state: State<SharedGameState>) -> Vec<usize> {
    let game = state.lock().unwrap();
    let mut scores = vec![0; game.num_players];
    let mut visited = vec![vec![false; game.board_size]; game.board_size];

    for r in 0..game.board_size {
        for c in 0..game.board_size {
            if visited[r][c] {
                continue;
            }
            // BFS to find the region
            let mut queue = std::collections::VecDeque::new();
            let mut region = vec![];
            let mut region_players = std::collections::HashSet::new();
            queue.push_back((r, c));
            visited[r][c] = true;
            while let Some((rr, cc)) = queue.pop_front() {
                region.push((rr, cc));
                
                if let Some(ref piece) = game.board[rr][cc] {
                    region_players.insert(piece.player); // use .player field
                }
                let neighbors = [
                    (rr.wrapping_sub(1), cc),
                    (rr + 1, cc),
                    (rr, cc.wrapping_sub(1)),
                    (rr, cc + 1),
                ];
                for &(nr, nc) in &neighbors {
                    if nr >= game.board_size || nc >= game.board_size {
                        continue;
                    }
                    if visited[nr][nc] {
                        continue;
                    }
                    if is_blocked(Coord {row: rr, col: cc}, Coord {row: nr, col: nc}, &game) {
                        continue;
                    }
                    visited[nr][nc] = true;
                    queue.push_back((nr, nc));
                }
            }
            // If region contains only one player's pieces (or is empty), attribute score
            if region_players.len() == 1 {
                let player = *region_players.iter().next().unwrap();
                scores[player] += region.len();
            }
        }
    }

    scores
}


fn all_pieces_isolated(game: &GameState) -> bool {
    let mut visited = vec![vec![false; game.board_size]; game.board_size];
    for r in 0..game.board_size {
        for c in 0..game.board_size {
            if visited[r][c] {
                continue;
            }
            // BFS to find the region
            let mut queue = std::collections::VecDeque::new();
            let mut region_players = std::collections::HashSet::new();
            queue.push_back((r, c));
            visited[r][c] = true;
            let mut has_piece = false;
            while let Some((rr, cc)) = queue.pop_front() {
                // if let Some(player) = game.board[rr][cc] {
                //     region_players.insert(player);
                //     has_piece = true;
                // }
                if let Some(ref piece) = game.board[rr][cc] {
                    region_players.insert(piece.player);
                    has_piece = true;
                }
                let neighbors = [
                    (rr.wrapping_sub(1), cc),
                    (rr + 1, cc),
                    (rr, cc.wrapping_sub(1)),
                    (rr, cc + 1),
                ];
                for &(nr, nc) in &neighbors {
                    if nr >= game.board_size || nc >= game.board_size {
                        continue;
                    }
                    if visited[nr][nc] {
                        continue;
                    }
                    if is_blocked(Coord {row: rr, col: cc}, Coord {row: nr, col: nc}, game) {
                        continue;
                    }
                    visited[nr][nc] = true;
                    queue.push_back((nr, nc));
                }
            }
            // If region contains pieces from more than one player, not all isolated
            if has_piece && region_players.len() > 1 {
                return false;
            }
        }
    }
    true
}

#[derive(Serialize)]
pub struct SetupAndGameState {
    pub setup_state: SetupState,
    pub game_state: GameState,
}

#[tauri::command]
fn handle_setup_move(
    coord: Coord,
    game_state: State<SharedGameState>,
    setup_state: State<SharedSetupState>,
) -> SetupAndGameState {
    let mut game = game_state.lock().unwrap();
    let mut setup = setup_state.lock().unwrap();

    // Check move validity
    if game.board[coord.row][coord.col].is_some() || setup.pieces[game.current_player] == 0 {
        return SetupAndGameState {
            setup_state: setup.clone(),
            game_state: game.clone(),
        }
    }

    // Place piece
    // game.board[row_idx][col_idx] = Some(game.current_player);
    let new_piece = Piece {
        id: format!("p{}-{}", game.current_player, setup.pieces[game.current_player]), // or however you define IDs
        player: game.current_player,
    };
    println!("Placed {:?}", new_piece);
    game.board[coord.row][coord.col] = Some(new_piece);

    setup.pieces[game.current_player] -= 1;

    // Determine next player and direction
    let mut next_player = game.current_player as isize;
    let mut direction = setup.direction;

    let mut found = false;
    for _ in 0..game.num_players {
        // If next player is out of bounds, reverse direction
        next_player += direction;
        if next_player < 0 {
            next_player = 0;
            direction = 1;
        }
        // If next player is out of bounds, reverse direction
        if next_player >= game.num_players as isize {
            next_player = (game.num_players - 1) as isize;
            direction = -1;
        }
        // If the next player has pieces left, place a piece
        if setup.pieces[next_player as usize] > 0 {
            found = true;
            break;
        }
    }

    // Update whose setup turn it is
    if found {
        game.current_player = next_player as usize;
    }
    // Update direction
    setup.direction = direction;

    SetupAndGameState {
        setup_state: setup.clone(),
        game_state: game.clone(),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(Arc::new(Mutex::new(GameState::default())))
        .manage(Arc::new(Mutex::new(SetupState::default())))
        .invoke_handler(tauri::generate_handler![next_player, get_game_state, can_place_adjacent_wall, has_valid_moves, move_piece, place_wall, reset_game, reset_setup, start_main_phase, set_game_state, get_valid_moves_for_piece, get_region_scores, handle_setup_move, get_setup_state, set_setup])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
