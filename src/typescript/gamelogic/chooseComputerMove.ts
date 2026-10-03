import type { Board } from '../types/Board';
import type { DeepReadonly } from '../types/DeepReadonly';
import type { PlayerState } from '../types/PlayerState';
import { GREEDY } from '../data/augmentations';
import { getMoveAt, getMoveScore, getSameColorGroup, getValidGroupMoves, getValidMoves } from './board/moves';
import { getGreedyGroupsChecked } from './upgrades';

/**
 * How the computer player decides which move to make.
 */

/**
 * Chooses the computer player's next move.
 * - Without the Greedy Augmentation: a random valid move
 * - With Greedy: it plans (see choosePlannedMove), looking at several different groups (how many depends on the
 *   "Greedier" Upgrade), chosen at random. If there are fewer groups than that, it looks at all of them
 *
 * @param computer - The computer player's state
 * @returns The index of the block to click, or undefined if there are no valid moves
 */
export function chooseComputerMove(computer: PlayerState): number | undefined {
    const board = computer.board;
    if (!computer.augmentations.includes(GREEDY)) {
        return pickRandom(getValidMoves(board), 1)[0];
    }
    return choosePlannedMove(board, pickRandom(getValidGroupMoves(board), getGreedyGroupsChecked(computer)));
}

/**
 * Chooses a move the way Greedy plans: it saves up the most common color on the board, so that color's blocks merge
 * into big groups (a group's score is its size times itself, so one big group is worth far more than several small
 * ones).
 * 1. Among the candidates, it removes the smallest group of another color that sets off no special blocks (so special
 *    blocks aren't wasted on small groups)
 * 2. If there is no such group, it makes the candidate move worth the most points (the first one, if there's a tie)
 *
 * @param board - The board
 * @param candidates - One block from each group to choose from
 * @returns The index of the block to click, or undefined if there are no candidates
 */
export function choosePlannedMove(board: DeepReadonly<Board>, candidates: readonly number[]): number | undefined {
    const saved = getMostCommonColor(board);
    const groupSize = (index: number) => getSameColorGroup(board, index).length;
    const quiet = candidates.filter(
        (index) => board.blocks[index].color !== saved && getMoveAt(board, index).length === groupSize(index),
    );
    if (quiet.length > 0) {
        return quiet.reduce((best, index) => (groupSize(index) < groupSize(best) ? index : best));
    }
    return candidates.reduce<number | undefined>(
        (best, index) => (best === undefined || getMoveScore(board, index) > getMoveScore(board, best) ? index : best),
        undefined,
    );
}

/**
 * Returns the color with the most regular blocks on the board.
 *
 * @param board - The board
 * @returns The color (the first one found, if there's a tie), or undefined if there are no regular blocks
 */
function getMostCommonColor(board: DeepReadonly<Board>): string | undefined {
    const counts = new Map<string, number>();
    board.blocks.forEach((block) => {
        if (block.special === undefined && block.color !== null) {
            counts.set(block.color, (counts.get(block.color) ?? 0) + 1);
        }
    });
    let mostCommon: string | undefined;
    counts.forEach((count, color) => {
        if (mostCommon === undefined || count > (counts.get(mostCommon) ?? 0)) mostCommon = color;
    });
    return mostCommon;
}

/**
 * Picks up to the given number of different items from a list, at random.
 *
 * @param items - The items to pick from (not changed)
 * @param count - How many to pick
 * @returns The picked items, in random order (all of them, if there are fewer than count)
 */
function pickRandom(items: readonly number[], count: number): number[] {
    const remaining = [...items];
    const picked: number[] = [];
    while (picked.length < count && remaining.length > 0) {
        picked.push(remaining.splice(Math.floor(Math.random() * remaining.length), 1)[0]);
    }
    return picked;
}
