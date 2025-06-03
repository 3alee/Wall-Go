import { Coord, GameData, GameState } from "../../lib/types";
import { PLAYER_IMAGES } from "../../lib/Elements";
import { Dispatch, SetStateAction, useEffect, useRef } from "react";
import { motion } from "framer-motion";

type Position = { row: number; col: number };

export default function GamePieces(
    {
        game,
        setGame,
        gameData,
    }: {
        game: GameState;
        setGame: Dispatch<SetStateAction<GameState>>;
        gameData: GameData;
    }) {
    const prevPositionsRef = useRef<Map<string, Position>>(new Map());

    // Track previous piece positions
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

    const moveStart = game.move_path[0];
    const moveEnd = game.move_path[game.move_path.length - 1];

    let movingPieceId: string | null = null;

    if (moveStart && moveEnd) {
        for (let row = 0; row < game.board.length; row++) {
            for (let col = 0; col < game.board[row].length; col++) {
                const cell = game.board[row][col];
                if (
                cell &&
                row === moveEnd.row &&
                col === moveEnd.col &&
                game.move_path.length > 1
                ) {
                movingPieceId = cell.id;
                }
            }
        }
    }

    return (
        <>
        {game.board.flatMap((row, rowIdx) =>
            row.map((cell, colIdx) => {
            if (cell === null) return null;

            const { id, player } = cell;
            const isSelectable =
                !game.wall_pending &&
                game.phase === "Main" &&
                game.winner === null &&
                game.move_path.length === 0 &&
                player === game.current_player &&
                gameData.selectablePieces[`${rowIdx},${colIdx}`];

            const isMovingPiece = id === movingPieceId;

            let animateX = colIdx + 0.15;
            let animateY = rowIdx + 0.15;
            let animationKeyframesX: number[] = [];
            let animationKeyframesY: number[] = [];

            if (isMovingPiece && game.move_path.length > 1) {
                animationKeyframesX = game.move_path.map((c) => c.col + 0.15);
                animationKeyframesY = game.move_path.map((c) => c.row + 0.15);
            }

            return (
                <g key={id}>
                <motion.image
                    key={id}
                    href={PLAYER_IMAGES[player]}
                    width={0.7}
                    height={0.7}
                    initial={false}
                    animate={
                    isMovingPiece && animationKeyframesX.length > 1
                        ? {
                            x: animationKeyframesX,
                            y: animationKeyframesY,
                        }
                        : {
                            x: animateX,
                            y: animateY,
                        }
                    }
                    transition={
                    isMovingPiece && animationKeyframesX.length > 1
                        ? {
                            duration: 0.4,
                            times: animationKeyframesX.map((_, i) =>
                            i / (animationKeyframesX.length - 1)
                            ),
                            ease: "easeInOut",
                        }
                        : {
                            type: "spring",
                            stiffness: 300,
                            damping: 25,
                        }
                    }
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
