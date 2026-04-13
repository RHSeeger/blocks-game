/**
 * Read-only view for BoardState, for UI display only.
 */
import type { CubeView } from './CubeView';

export interface BoardStateView {
    readonly cubes: readonly CubeView[];
    /**
     * Returns true if no removable groups remain on the board.
     */
    isBoardFinished(): boolean;
}
