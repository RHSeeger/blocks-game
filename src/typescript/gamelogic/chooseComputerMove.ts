import type { PlayerState } from '../types/PlayerState';
import { GREEDY } from '../data/augmentations';
import { getMoveScore, getValidGroupMoves, getValidMoves } from './board/moves';
import { getGreedyGroupsChecked } from './upgrades';

/**
 * How the computer player decides which move to make.
 */

/**
 * Chooses the computer player's next move.
 * - Without the Greedy Augmentation: a random valid move
 * - With Greedy: checks several different groups (how many depends on the "Greedier" Upgrade), chosen at random, and
 *   picks the one worth the most points (the first one checked, if there's a tie). If there are fewer groups than
 *   that, it checks all of them
 *
 * @param computer - The computer player's state
 * @returns The index of the block to click, or undefined if there are no valid moves
 */
export function chooseComputerMove(computer: PlayerState): number | undefined {
    const board = computer.board;
    if (!computer.augmentations.includes(GREEDY)) {
        return pickRandom(getValidMoves(board), 1)[0];
    }
    const candidates = pickRandom(getValidGroupMoves(board), getGreedyGroupsChecked(computer));
    return candidates.reduce<number | undefined>(
        (best, index) => (best === undefined || getMoveScore(board, index) > getMoveScore(board, best) ? index : best),
        undefined,
    );
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
