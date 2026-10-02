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
 * Returns the indices of every space within the given number of steps (up, down, left or right) of a group, not
 * counting the group itself. Steps can pass through any space, including empty spaces and special blocks.
 *
 * @param board - The board
 * @param group - The indices of the group
 * @param reach - How many steps out from the group to go (0 returns nothing)
 * @returns The indices of the spaces within reach of the group, nearest first
 */
function getIndicesWithinReach(board: DeepReadonly<Board>, group: readonly number[], reach: number): number[] {
    const reached = new Set<number>(group);
    let ring: readonly number[] = group;
    for (let step = 0; step < reach; step++) {
        ring = [...new Set(ring.flatMap((i) => getNeighborIndices(board, i)))].filter((i) => !reached.has(i));
        ring.forEach((i) => reached.add(i));
    }
    return [...reached].slice(group.length);
}

/**
 * Returns the indices of every block that clicking the given block would remove, or an empty array if it is not a
 * valid move.
 *
 * Returns the "+1" blocks a move uses, worked out as a chain reaction. A "+1" is used if it touches the area the move
 * reaches (the group, plus every space within reach of it). Each "+1" used adds 1 to the reach, which can bring more
 * "+1"s into the area or next to it, so this repeats until no more are found.
 *
 * Starting with a reach of 0, the first "+1"s found are the ones touching the group itself.
 *
 * @param board - The board
 * @param group - The indices of the move's same-color group
 * @returns The indices of every "+1" the move uses. The move's reach is the number of them
 */
function getPlus1sUsed(board: DeepReadonly<Board>, group: readonly number[]): number[] {
    const isPlus1 = (i: number) => board.blocks[i].special === 'plus1';
    let used: number[] = [];
    for (;;) {
        const found = getIndicesWithinReach(board, group, used.length + 1).filter(isPlus1);
        if (found.length === used.length) return used;
        used = found;
    }
}

/**
 * Returns the indices of every block that clicking the given block would remove, or an empty array if it is not a
 * valid move.
 *
 * A move removes:
 * 1. The same-color group (see getSameColorGroup)
 * 2. Any other special blocks touching that group
 * 3. Every "+1" the move uses (see getPlus1sUsed), as a chain reaction: a "+1" touching the area the move reaches is
 *    used, and each one used makes the move reach 1 space further
 * 4. Every regular block (any color) within reach of the group. One "+1" removes the blocks touching the group, two
 *    remove those up to 2 spaces away, and so on
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
    const otherTouchingSpecials = getIndicesWithinReach(board, group, 1).filter(
        (i) => blocks[i].special !== undefined && blocks[i].special !== 'plus1',
    );
    const plus1sUsed = getPlus1sUsed(board, group);
    const reachedRegular = getIndicesWithinReach(board, group, plus1sUsed.length).filter(
        (i) => blocks[i].special === undefined && !isEmptyBlock(blocks[i]),
    );
    return [...group, ...otherTouchingSpecials, ...plus1sUsed, ...reachedRegular];
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
