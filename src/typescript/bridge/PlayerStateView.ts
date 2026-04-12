import type { BoardState } from '../BoardState';
/**
 * Read-only view for PlayerState, for UI display only.
 */
export interface PlayerStateView {
    readonly board: BoardState;
    readonly totalScore: number;
    readonly boardScore: number;
    readonly maxBoardScore: number;
    readonly boardNumber: number;
    readonly selectedIndices?: readonly number[];
}
