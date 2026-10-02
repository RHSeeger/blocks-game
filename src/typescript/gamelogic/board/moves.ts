import type { Board } from '../../types/Board';
import type { DeepReadonly } from '../../types/DeepReadonly';
import { MIN_GROUP_SIZE } from '../../data/board';
import { getNeighborIndices, isEmptyBlock } from './blocks';
import { calculateGroupScore } from './calculateGroupScore';

/**
 * The rules for what counts as a valid move, and what a move removes.
 *
 * This is the single source of truth for "is this a valid move" (see design/game-design.md, "Board Behavior").
 * Clicking, the computer player, and the board-finished check all use these functions.
 */

/**
 * Returns the group of connected regular blocks with the same color as the block at the start index.
 * Special blocks and empty spaces are never part of this group.
 *
 * @param board - The board
 * @param startIndex - The index of the block to start from
 * @returns The indices of the group (including the start index), or an empty array if the start is not a regular block
 */
export function getSameColorGroup(board: DeepReadonly<Board>, startIndex: number): number[] {
    const { blocks } = board;
    const start = blocks[startIndex];
    if (start === undefined || start.special !== undefined || start.color === null) return [];
    const group = new Set<number>([startIndex]);
    const toVisit = [startIndex];
    while (toVisit.length > 0) {
        const index = toVisit.pop() as number;
        for (const neighborIndex of getNeighborIndices(board, index)) {
            const neighbor = blocks[neighborIndex];
            if (!group.has(neighborIndex) && neighbor.special === undefined && neighbor.color === start.color) {
                group.add(neighborIndex);
                toVisit.push(neighborIndex);
            }
        }
    }
    return [...group];
}

/**
 * Determines whether clicking the block at the given index is a valid move: it must be part of a group of at least
 * MIN_GROUP_SIZE connected blocks of the same color. Special blocks do not count toward this.
 *
 * @param board - The board
 * @param index - The index of the clicked block
 * @returns True if it is a valid move
 */
export function isValidMove(board: DeepReadonly<Board>, index: number): boolean {
    return getSameColorGroup(board, index).length >= MIN_GROUP_SIZE;
}

/**
 * Returns the indices of every block that clicking the given block would remove, or an empty array if it is not a
 * valid move.
 *
 * A move removes:
 * 1. The same-color group (see getSameColorGroup)
 * 2. Any special blocks touching that group
 * 3. If one of those special blocks is a "+1", every non-special block touching the group (any color)
 *
 * The first index returned is always the clicked block.
 *
 * @param board - The board
 * @param index - The index of the clicked block
 * @returns The indices of the blocks that would be removed, or an empty array if it is not a valid move
 */
export function getMoveAt(board: DeepReadonly<Board>, index: number): number[] {
    const { blocks } = board;
    const group = getSameColorGroup(board, index);
    if (group.length < MIN_GROUP_SIZE) return [];
    const neighbors = group.flatMap((i) => getNeighborIndices(board, i));
    const touching = [...new Set(neighbors)].filter((i) => !group.includes(i));
    const touchingSpecials = touching.filter((i) => blocks[i].special !== undefined);
    const hasPlus1 = touchingSpecials.some((i) => blocks[i].special === 'plus1');
    const touchingRegular = hasPlus1
        ? touching.filter((i) => blocks[i].special === undefined && !isEmptyBlock(blocks[i]))
        : [];
    return [...group, ...touchingSpecials, ...touchingRegular];
}

/**
 * Returns the index of every block that would be a valid move if clicked.
 *
 * @param board - The board
 * @returns The indices of every valid move
 */
export function getValidMoves(board: DeepReadonly<Board>): number[] {
    return board.blocks.map((_, index) => index).filter((index) => isValidMove(board, index));
}

/**
 * Returns one valid move for each group on the board. Clicking any block in a group makes the same move, so this
 * returns just one block from each group (unlike getValidMoves, which returns every block).
 *
 * @param board - The board
 * @returns The index of one block from each group that is a valid move
 */
export function getValidGroupMoves(board: DeepReadonly<Board>): number[] {
    const seen = new Set<number>();
    return getValidMoves(board).filter((index) => {
        if (seen.has(index)) return false;
        getSameColorGroup(board, index).forEach((groupIndex) => seen.add(groupIndex));
        return true;
    });
}

/**
 * Calculates the score that clicking the given block would earn. Only regular blocks count toward the score; special
 * blocks that are removed do not.
 *
 * @param board - The board
 * @param index - The index of the clicked block
 * @returns The score for the move, or 0 if it is not a valid move
 */
export function getMoveScore(board: DeepReadonly<Board>, index: number): number {
    const regularBlocksRemoved = getMoveAt(board, index).filter((i) => board.blocks[i].special === undefined).length;
    return calculateGroupScore(regularBlocksRemoved);
}

/**
 * Determines whether a board is finished: there are no valid moves left.
 *
 * @param board - The board
 * @returns True if no valid moves remain
 */
export function isBoardFinished(board: DeepReadonly<Board>): boolean {
    return !board.blocks.some((_, index) => isValidMove(board, index));
}
