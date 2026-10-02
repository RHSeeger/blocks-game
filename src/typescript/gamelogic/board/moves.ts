import type { Block } from '../../types/Block';
import type { DeepReadonly } from '../../types/DeepReadonly';
import { MIN_GROUP_SIZE } from '../../data/board';
import { getNeighborIndices, isEmptyBlock } from './blocks';

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
 * @param blocks - The blocks on the board
 * @param startIndex - The index of the block to start from
 * @returns The indices of the group (including the start index), or an empty array if the start is not a regular block
 */
export function getSameColorGroup(blocks: readonly DeepReadonly<Block>[], startIndex: number): number[] {
    const start = blocks[startIndex];
    if (start === undefined || start.special !== undefined || start.color === null) return [];
    const group = new Set<number>([startIndex]);
    const toVisit = [startIndex];
    while (toVisit.length > 0) {
        const index = toVisit.pop() as number;
        for (const neighborIndex of getNeighborIndices(index)) {
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
 * @param blocks - The blocks on the board
 * @param index - The index of the clicked block
 * @returns True if it is a valid move
 */
export function isValidMove(blocks: readonly DeepReadonly<Block>[], index: number): boolean {
    return getSameColorGroup(blocks, index).length >= MIN_GROUP_SIZE;
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
 * @param blocks - The blocks on the board
 * @param index - The index of the clicked block
 * @returns The indices of the blocks that would be removed, or an empty array if it is not a valid move
 */
export function getMoveAt(blocks: readonly DeepReadonly<Block>[], index: number): number[] {
    const group = getSameColorGroup(blocks, index);
    if (group.length < MIN_GROUP_SIZE) return [];
    const neighbors = new Set<number>();
    group.forEach((i) => getNeighborIndices(i).forEach((neighbor) => neighbors.add(neighbor)));
    const touching = [...neighbors].filter((i) => !group.includes(i));
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
 * @param blocks - The blocks on the board
 * @returns The indices of every valid move
 */
export function getValidMoves(blocks: readonly DeepReadonly<Block>[]): number[] {
    return blocks.map((_, index) => index).filter((index) => isValidMove(blocks, index));
}

/**
 * Determines whether a board is finished: there are no valid moves left.
 *
 * @param blocks - The blocks on the board
 * @returns True if no valid moves remain
 */
export function isBoardFinished(blocks: readonly DeepReadonly<Block>[]): boolean {
    return !blocks.some((_, index) => isValidMove(blocks, index));
}
