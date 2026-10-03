import type { Board } from '../../types/Board';
import type { DeepReadonly } from '../../types/DeepReadonly';
import { MIN_GROUP_SIZE } from '../../data/board';
import { BOMB_RADIUS } from '../../data/specialBlocks';
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
 * Returns the indices of every space in a line block's line: its whole row for a horizontal line block, or its whole
 * column for a vertical one.
 *
 * @param board - The board
 * @param index - The index of the line block
 * @returns The indices of the spaces in its line (empty if the block isn't a line block)
 */
function getLineIndices(board: DeepReadonly<Board>, index: number): number[] {
    const { width, height } = board;
    const special = board.blocks[index].special;
    if (special === 'lineHorizontal') {
        const rowStart = index - (index % width);
        return Array.from({ length: width }, (_, column) => rowStart + column);
    }
    if (special === 'lineVertical') {
        return Array.from({ length: height }, (_, row) => row * width + (index % width));
    }
    return [];
}

/**
 * Returns the indices of every space in a bomb block's square: every space up to BOMB_RADIUS spaces from it in each
 * direction, diagonals included (a 3x3 square for a radius of 1), cut off at the edges of the board.
 *
 * @param board - The board
 * @param index - The index of the bomb block
 * @returns The indices of the spaces in its square (empty if the block isn't a bomb block)
 */
function getBombIndices(board: DeepReadonly<Board>, index: number): number[] {
    if (board.blocks[index].special !== 'bomb') return [];
    const { width, height } = board;
    const row = Math.floor(index / width);
    const column = index % width;
    const offsets = Array.from({ length: 2 * BOMB_RADIUS + 1 }, (_, i) => i - BOMB_RADIUS);
    return offsets.flatMap((dRow) =>
        offsets
            .map((dColumn) => [row + dRow, column + dColumn])
            .filter(([r, c]) => r >= 0 && r < height && c >= 0 && c < width)
            .map(([r, c]) => r * width + c),
    );
}

/**
 * Returns the area a move reaches, given the special blocks it uses: the group, every space within reach of the group
 * (the reach is the number of "+1"s used), the line of every line block used, and the square of every bomb block used.
 *
 * @param board - The board
 * @param group - The indices of the move's same-color group
 * @param specialsUsed - The indices of the special blocks the move uses
 * @returns The indices of every space in the area
 */
function getMoveArea(
    board: DeepReadonly<Board>,
    group: readonly number[],
    specialsUsed: readonly number[],
): Set<number> {
    const reach = specialsUsed.filter((i) => board.blocks[i].special === 'plus1').length;
    return new Set([
        ...group,
        ...getIndicesWithinReach(board, group, reach),
        ...specialsUsed.flatMap((i) => getLineIndices(board, i)),
        ...specialsUsed.flatMap((i) => getBombIndices(board, i)),
    ]);
}

/**
 * Returns the special blocks a move uses, worked out as a chain reaction. A special block is used if it is inside, or
 * touching, the area the move reaches (see getMoveArea). Each one used grows the area (a "+1" makes the move reach 1
 * space further from the group, a line block adds its row or column, and a bomb block the square around it), which
 * can bring more special blocks into
 * the area or next to it, so this repeats until no more are found.
 *
 * To start with, the area is just the group, so the first special blocks found are the ones touching it.
 *
 * @param board - The board
 * @param group - The indices of the move's same-color group
 * @returns The indices of every special block the move uses
 */
function getSpecialsUsed(board: DeepReadonly<Board>, group: readonly number[]): number[] {
    let used: number[] = [];
    for (;;) {
        const area = getMoveArea(board, group, used);
        const touching = new Set([...area, ...[...area].flatMap((i) => getNeighborIndices(board, i))]);
        const found = [...touching].filter((i) => board.blocks[i].special !== undefined);
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
 * 2. Every special block the move uses (see getSpecialsUsed), as a chain reaction: a special block inside or touching
 *    the area the move reaches is used, and each one used grows the area
 * 3. Every regular block (any color) in that area. Each "+1" makes the area reach 1 space further from the group (one
 *    removes the blocks touching the group, two remove those up to 2 spaces away, and so on), each line block adds
 *    its whole row or column, and each bomb block the square around it
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
    const specialsUsed = getSpecialsUsed(board, group);
    const inGroup = new Set(group);
    const areaRegular = [...getMoveArea(board, group, specialsUsed)].filter(
        (i) => !inGroup.has(i) && blocks[i].special === undefined && !isEmptyBlock(blocks[i]),
    );
    return [...group, ...specialsUsed, ...areaRegular];
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
