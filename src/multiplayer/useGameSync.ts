// hooks/useGameSync.ts
import { useEffect, useState, useRef, useCallback } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { firestore } from "../lib/firebase"; // your Firebase init
import { GameState } from "../lib/types";

export type GameSyncMode = "local" | "multiplayer";

export function useGameSync(
    mode: GameSyncMode,
    localGame: GameState,
    setLocalGame: React.Dispatch<React.SetStateAction<GameState>>,
    gameId?: string // required for multiplayer
) {
    const [game, setGame] = useState<GameState>(localGame);
    const unsubRef = useRef<(() => void) | null>(null);

    // Local sync
    const updateLocalGame = useCallback(
        async (newGame: GameState) => {
            setLocalGame(newGame);
            setGame(newGame);
        },
        [setLocalGame]
    );

    // Multiplayer sync
    const updateRemoteGame = useCallback(
        async (newGame: GameState) => {
        if (!gameId) throw new Error("gameId is required for multiplayer mode");
            const gameDoc = doc(firestore, "games", gameId);
            await setDoc(gameDoc, newGame);
        },
        [gameId]
    );

    // Subscribe to updates if multiplayer
    useEffect(() => {
        if (mode === "multiplayer") {
            if (!gameId) throw new Error("gameId is required for multiplayer mode");
            const gameDoc = doc(firestore, "games", gameId);

            const unsub = onSnapshot(gameDoc, (snap) => {
                const data = snap.data() as GameState;
                if (data) setGame(data);
            });

            unsubRef.current = unsub;
            return unsub;
        } else {
            setGame(localGame);
        }
    }, [mode, gameId, localGame]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (unsubRef.current) unsubRef.current();
        };
    }, []);

    return {
        game,
        updateGame: mode === "multiplayer" ? updateRemoteGame : updateLocalGame,
    };
}
