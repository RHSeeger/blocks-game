// PlayerState type and file
// ------------------------
// This file defines the PlayerState type, which represents the state for a player (either the human player or the computer player).
// It includes the cubes on that player's board, their health, score, and board number, and is used for saving/loading player progress.
// Each player (human or computer) has their own PlayerState instance.

import type { BoardState } from './board';

export type PlayerState = {
    board: BoardState;
    totalScore: number;
    boardScore: number;
    maxBoardScore: number;
    boardNumber: number;
};
