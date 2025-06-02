import { GameData, GameState } from "../../lib/types";
import { PLAYER_IMAGES } from "../../lib/Elements";
import { Dispatch, SetStateAction, useEffect, useRef } from "react";
import { motion } from "framer-motion";

type Piece = { id: string; player: number };
type Position = { row: number; col: number };

export default function GamePieces({
  game,
  setGame,
  gameData,
}: {
  game: GameState;
  setGame: Dispatch<SetStateAction<GameState>>;
  gameData: GameData;
}) {
  const prevPositionsRef = useRef<Map<string, Position>>(new Map());

  // Update positions of each piece by its unique id
  useEffect(() => {
    const newMap = new Map<string, Position>();
    game.board.forEach((row, rowIdx) =>
      row.forEach((cell, colIdx) => {
        if (cell !== null) {
          newMap.set(cell.id, { row: rowIdx, col: colIdx });
        }
      })
    );
    prevPositionsRef.current = newMap;
  }, [game.board]);

  return (
    <>
      {game.board.flatMap((row, rowIdx) =>
        row.map((cell, colIdx) => {
          if (cell === null) return null;

          const { id, player } = cell;
          const prevPos = prevPositionsRef.current.get(id);
          const isSelectable =
            !game.wall_pending &&
            game.phase === "Main" &&
            game.winner === null &&
            game.move_path.length === 0 &&
            player === game.current_player &&
            gameData.selectablePieces[`${rowIdx},${colIdx}`];

          return (
            // <image
            //     key={id}
            //     href={PLAYER_IMAGES[player]}
            //     x={colIdx + 0.15}
            //     y={rowIdx + 0.15}
            //     // initial={{
            //     //     x: (prevPos?.col ?? colIdx) + 0.15,
            //     //     y: (prevPos?.row ?? rowIdx) + 0.15,
            //     // }}
            //     // animate={{
            //     //     x: colIdx + 0.15,
            //     //     y: rowIdx + 0.15,
            //     // }}
            //     // transition={{
            //     //     type: "spring",
            //     //     stiffness: 300,
            //     //     damping: 25,
            //     // }}
            //     width={0.7}
            //     height={0.7}
            //     className={isSelectable ? "fade-anim" : ""}
            //     style={{
            //         cursor: isSelectable ? "pointer" : "default",
            //         pointerEvents: "auto",
            //         userSelect: "none",
            //     }}
            //     onClick={() => {
            //         if (isSelectable) {
            //         setGame({
            //             ...game,
            //             move_path: [{ row: rowIdx, col: colIdx }],
            //         });
            //         }
            //     }}
            // />
            <g>
                <motion.image
                    key={id}
                    href={PLAYER_IMAGES[player]}
                    width={0.7}
                    height={0.7}
                    initial={{
                        x: (prevPos?.col ?? colIdx) + 0.15,
                        y: (prevPos?.row ?? rowIdx) + 0.15,
                    }}
                    animate={{
                        x: colIdx + 0.15,
                        y: rowIdx + 0.15,
                    }}
                    transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 25,
                    }}
                    className={isSelectable ? "fade-anim" : ""}
                    style={{ pointerEvents: "none" }}
                />
                <rect
                    x={colIdx}
                    y={rowIdx}
                    width={0.7}
                    height={0.7}
                    style={{
                    cursor: isSelectable ? "pointer" : "default",
                    fill: "transparent",
                    pointerEvents: "all",
                    }}
                    onClick={() => {
                    if (isSelectable) {
                        setGame({
                        ...game,
                        move_path: [{ row: rowIdx, col: colIdx }],
                        });
                    }
                    }}
                />
                </g>
          );
        })
      )}
      
    </>
  );
}
