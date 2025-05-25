#[tauri::command]
fn set_board_and_player(
    new_board: Vec<Vec<Option<usize>>>,
    current_player: usize,
    num_players: usize,
    pieces_per_player: usize,
    board_size: usize, // <-- add this parameter
    state: State<SharedGameState>
) -> GameState {
    let mut game = state.lock().unwrap();
    // Update board size and reinitialize board if needed
    if game.board_size != board_size {
        game.board_size = board_size;
        game.board = vec![vec![None; board_size]; board_size];
        game.walls_h.clear();
        game.walls_v.clear();
        game.move_path.clear();
        game.winner = None;
        game.phase = GamePhase::Setup;
        game.wall_pending = false;
    }
    // Replace the board entirely (now guaranteed to match board_size)
    if new_board.len() == board_size && new_board.iter().all(|row| row.len() == board_size) {
        game.board = new_board.clone();
    }
    game.current_player = current_player;
    game.num_players = num_players;
    game.pieces_per_player = pieces_per_player;
    game.clone()
}
#[tauri::command]
fn set_board(new_board: Vec<Vec<Option<usize>>>, state: State<SharedGameState>) -> GameState {
    let mut game = state.lock().unwrap();
    // Replace the board entirely
    if new_board.len() == game.board_size && new_board.iter().all(|row| row.len() == game.board_size) {
        game.board = new_board.clone();
    }
    game.clone()
}
#[tauri::command]
fn start_main_phase(state: State<SharedGameState>) -> GameState {
    let mut game = state.lock().unwrap();
    if game.phase == GamePhase::Setup {
        game.phase = GamePhase::Main;
    }
    game.clone()
}

use serde::{Serialize, Deserialize};
use std::sync::Mutex;
use tauri::State;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GameState {
    pub board: Vec<Vec<Option<usize>>>, // None = empty, Some(player_idx)
    pub board_size: usize, // <--- add this
    pub current_player: usize,
    pub winner: Option<usize>,
    pub walls_h: Vec<(usize, usize, usize)>, // horizontal walls: (row, col, player)
    pub walls_v: Vec<(usize, usize, usize)>, // vertical walls: (row, col, player)
    pub phase: GamePhase,
    pub move_path: Vec<(usize, usize)>, // path for the current move
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

type SharedGameState = Mutex<GameState>;

#[tauri::command]
fn get_game_state(state: State<SharedGameState>) -> GameState {
    state.lock().unwrap().clone()
}


// Helper: check if a move is blocked by a wall
fn is_blocked(a: (usize, usize), b: (usize, usize), game: &GameState) -> bool {
    let (r1, c1) = a;
    let (r2, c2) = b;
    if r1 == r2 {
        // Horizontal move
        let min_c = c1.min(c2);
        wall_v_exists(game, r1, min_c)
    } else if c1 == c2 {
        // Vertical move
        let min_r = r1.min(r2);
        wall_h_exists(game, min_r, c1)
    } else {
        true
    }
}

// Helper: check if a path is a valid move for the current player
fn is_valid_move_path(game: &GameState, path: &[(usize, usize)]) -> bool {
    if path.len() == 1 {
        let (row, col) = path[0];
        // Only allow if the piece belongs to the current player
        if game.board[row][col] != Some(game.current_player) {
            return false;
        }
        // Check if at least one adjacent cell is NOT blocked by a wall
        let neighbors = [
            (row.wrapping_sub(1), col),
            (row + 1, col),
            (row, col.wrapping_sub(1)),
            (row, col + 1),
        ];
        for &(nr, nc) in &neighbors {
            if nr >= game.board_size || nc >= game.board_size {
                continue;
            }
            if !is_blocked((row, col), (nr, nc), game) {
                return true;
            }
        }
        // All directions blocked: not a valid 0-length move
        return false;
    }
    if path.len() != 2 && path.len() != 3 { return false; }
    let start = path[0];
    let end = path[path.len() - 1];
    // Must start on a piece belonging to the current player
    if game.board[start.0][start.1] != Some(game.current_player) { return false; }
    // End must be empty or the start (for return-to-start)
    if game.board[end.0][end.1].is_some() && end != start { return false; }
    // Allow revisiting any cell, but not passing through other pieces (except possibly the end)
    use std::collections::VecDeque;
    let mut queue = VecDeque::new();
    let mut visited = vec![vec![false; game.board_size]; game.board_size];
    queue.push_back((start, 0));
    visited[start.0][start.1] = true;
    while let Some((pos, dist)) = queue.pop_front() {
        if dist > 2 { continue; }
        if pos == end && dist > 0 && dist <= 2 { return true; }
        if dist == 2 { continue; }
        let (r, c) = pos;
        let neighbors = [
            (r.wrapping_sub(1), c),
            (r + 1, c),
            (r, c.wrapping_sub(1)),
            (r, c + 1),
        ];
        for &(nr, nc) in &neighbors {
            if nr >= game.board_size || nc >= game.board_size { continue; }
            // Allow revisiting any cell, but not passing through other pieces (except possibly the end)
            if game.board[nr][nc].is_some() && (nr, nc) != end && (nr, nc) != start { continue; }
            if is_blocked((r, c), (nr, nc), game) { continue; }
            // Only mark as visited if not the start, so we can revisit start for "back" moves
            if !(nr == start.0 && nc == start.1) && visited[nr][nc] { continue; }
            visited[nr][nc] = true;
            queue.push_back(((nr, nc), dist + 1));
        }
    }
    false
}

#[tauri::command]
fn has_valid_moves(row: usize, col: usize, state: State<SharedGameState>) -> bool {
    let game = state.lock().unwrap();
    // Only check if this is the current player's piece
    if game.board[row][col] != Some(game.current_player) {
        return false;
    }
    // Allow 0-length move (stay in place)
    if is_valid_move_path(&game, &[(row, col)]) {
        return true;
    }
    // Try all possible destinations within 2 steps
    for r in 0..game.board_size {
        for c in 0..game.board_size {
            if is_valid_move_path(&game, &[(row, col), (r, c)]) {
                return true;
            }
        }
    }
    false
}

#[tauri::command]
fn move_piece(path: Vec<(usize, usize)>, state: State<SharedGameState>) -> GameState {
    let mut game = state.lock().unwrap();
    if game.winner.is_some() || game.phase != GamePhase::Main || game.wall_pending { return game.clone(); }
    if !is_valid_move_path(&game, &path) { return game.clone(); }
    let start = path[0];
    let end = path[path.len() - 1];

    // Only move the piece if start != end
    if start != end {
        game.board[start.0][start.1] = None;
        game.board[end.0][end.1] = Some(game.current_player);
    }
    game.move_path = path;
    game.wall_pending = true;

    if all_pieces_isolated(&game) {
        game.winner = Some(0); // or any value to indicate game over
    }
    game.clone()
}

// Helper: check if a wall placement is valid (adjacent to piece, not overlapping)
fn is_valid_wall(game: &GameState, wall_type: &str, row: usize, col: usize) -> bool {
    let last = match game.move_path.last() {
        Some(&pos) => pos,
        None => return false,
    };
    let (r, c) = last;
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
        "h" => !wall_h_exists(game, row, col) && row < game.board_size - 1,
        "v" => !wall_v_exists(game, row, col) && col < game.board_size - 1,
        _ => false,
    }
}

// --- Add these helper functions near the top or with your other helpers ---
fn wall_h_exists(game: &GameState, row: usize, col: usize) -> bool {
    game.walls_h.iter().any(|&(r, c, _)| r == row && c == col)
}
fn wall_v_exists(game: &GameState, row: usize, col: usize) -> bool {
    game.walls_v.iter().any(|&(r, c, _)| r == row && c == col)
}

#[tauri::command]
fn place_wall(wall_type: String, row: usize, col: usize, state: State<SharedGameState>) -> GameState {
    let mut game = state.lock().unwrap();
    if !game.wall_pending { return game.clone(); }
    if !is_valid_wall(&game, &wall_type, row, col) { return game.clone(); }
    let player = game.current_player; // <--- get before mut borrow
    match wall_type.as_str() {
        "h" => game.walls_h.push((row, col, player)),
        "v" => game.walls_v.push((row, col, player)),
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
fn get_valid_moves_for_piece(row: usize, col: usize, state: State<SharedGameState>) -> Vec<(usize, usize)> {
    let game = state.lock().unwrap();
    let mut moves = Vec::new();
    // Only check if this is the current player's piece
    if game.board[row][col] != Some(game.current_player) {
        return moves;
    }
    // Add 0-length move (stay in place)
    if is_valid_move_path(&game, &[(row, col)]) {
        moves.push((row, col));
    }
    // Try all possible destinations within 2 steps, but skip (row, col)
    for r in 0..game.board_size {
        for c in 0..game.board_size {
            if r == row && c == col {
                continue; // skip duplicate
            }
            if is_valid_move_path(&game, &[(row, col), (r, c)]) {
                moves.push((r, c));
            }
        }
    }
    moves
}

fn is_valid_wall_anywhere(game: &GameState, wall_type: &str, row: usize, col: usize) -> bool {
    match wall_type {
        "h" => !wall_h_exists(game, row, col) && row < game.board_size - 1,
        "v" => !wall_v_exists(game, row, col) && col < game.board_size - 1,
        _ => false,
    }
}

#[tauri::command]
fn can_place_adjacent_wall(row: usize, col: usize, state: State<SharedGameState>) -> bool {
    let game = state.lock().unwrap();
    let adj = [
        (row.wrapping_sub(1), col),
        (row + 1, col),
        (row, col.wrapping_sub(1)),
        (row, col + 1),
    ];
    for &(ar, ac) in &adj {
        if ar < game.board_size && ac < game.board_size {
            if is_valid_wall_anywhere(&game, "h", ar, ac) || is_valid_wall_anywhere(&game, "v", ar, ac) {
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
                if let Some(player) = game.board[rr][cc] {
                    region_players.insert(player);
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
                    if is_blocked((rr, cc), (nr, nc), &game) {
                        continue;
                    }
                    visited[nr][nc] = true;
                    queue.push_back((nr, nc));
                }
            }
            // If region contains only one player's pieces (or is empty), attribute score
            if region_players.len() == 1 && !region_players.is_empty() {
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
                if let Some(player) = game.board[rr][cc] {
                    region_players.insert(player);
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
                    if is_blocked((rr, cc), (nr, nc), game) {
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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(Mutex::new(GameState::default()))
        .invoke_handler(tauri::generate_handler![get_game_state, can_place_adjacent_wall, get_valid_moves_for_piece, has_valid_moves, move_piece, place_wall, reset_game, start_main_phase, set_board, set_board_and_player, get_valid_moves_for_piece, get_region_scores])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
