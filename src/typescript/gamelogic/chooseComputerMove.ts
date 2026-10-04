import type { Board } from '../types/Board';
import type { DeepReadonly } from '../types/DeepReadonly';
import type { PlayerState } from '../types/PlayerState';
import { GREEDY, TIDY, TIDY_ENDGAME_PERCENT } from '../data/augmentations';
import { applyGravity } from './board/applyGravity';
import { createEmptyBlock, isEmptyBlock } from './board/blocks';
import { getCleanupBonusPercent } from './board/cleanupBonus';
import { getMoveAt, getMoveScore, getSameColorGroup, getValidGroupMoves, getValidMoves } from './board/moves';
import { getGreedyGroupsChecked } from './upgrades';

/**
 * How the computer player decides which move to make.
 */

/**
 * Chooses the computer player's next move.
 * - Without the Greedy or Tidy Augmentations: a random valid move
 * - With Greedy: it plans (see choosePlannedMove), looking at several different groups (how many depends on the
 *   "Greedier" Upgrade), chosen at random. If there are fewer groups than that, it looks at all of them
 * - With Tidy, near the end of a board (see isEndgame): it looks ahead instead (see chooseTidyMove), at the same groups
 *   Greedy would check. Earlier in the board, it plays as it would without Tidy
 *
 * @param computer - The computer player's state
 * @returns The index of the block to click, or undefined if there are no valid moves
 */
export function chooseComputerMove(computer: PlayerState): number | undefined {
    const board = computer.board;
    const greedy = computer.augmentations.includes(GREEDY);
    const tidy = computer.augmentations.includes(TIDY) && isEndgame(board);
    if (!greedy && !tidy) {
        return pickRandom(getValidMoves(board), 1)[0];
    }
    const candidates = pickRandom(getValidGroupMoves(board), getGreedyGroupsChecked(computer));
    return tidy ? chooseTidyMove(board, candidates, computer.boardScore) : choosePlannedMove(board, candidates);
}

/**
 * Determines whether a board is near its end, for the Tidy Augmentation: TIDY_ENDGAME_PERCENT of its spaces, or fewer,
 * still have blocks in them.
 *
 * @param board - The board
 * @returns True if the board is near its end
 */
export function isEndgame(board: DeepReadonly<Board>): boolean {
    const blocksLeft = board.blocks.filter((block) => !isEmptyBlock(block)).length;
    return blocksLeft * 100 <= board.width * board.height * TIDY_ENDGAME_PERCENT;
}

/**
 * Chooses a move the way Tidy looks ahead: for each candidate, it makes that move, plays the rest of the board out with
 * Greedy's plan (see playOut), and works out the board score it would end with, including the clean-up bonus. It makes
 * the candidate move that ends with the most (the first one, if there's a tie). So it gives up points from moves only
 * when a better clean-up bonus is worth more.
 *
 * Refill blocks are treated as removing nothing more (what a refill would bring can't be known ahead).
 *
 * @param board - The board
 * @param candidates - One block from each group to choose from
 * @param boardScore - The score earned on this board so far (the clean-up bonus is a share of the whole board score)
 * @returns The index of the block to click, or undefined if there are no candidates
 */
export function chooseTidyMove(
    board: DeepReadonly<Board>,
    candidates: readonly number[],
    boardScore: number,
): number | undefined {
    const finalScore = (index: number): number => {
        const rest = playOut(removeMove(board, index));
        const score = boardScore + getMoveScore(board, index) + rest.points;
        return score * (1 + getCleanupBonusPercent(rest.blocksLeft) / 100);
    };
    const scored = candidates.map((index) => ({ index, final: finalScore(index) }));
    return scored.reduce<{ index: number; final: number } | undefined>(
        (best, candidate) => (best === undefined || candidate.final > best.final ? candidate : best),
        undefined,
    )?.index;
}

/**
 * Plays a board out to its end with Greedy's plan, checking every group each move (see choosePlannedMove), without
 * changing it. Used by Tidy to look ahead.
 *
 * @param board - The board to start from
 * @returns The points the moves would score, and how many blocks would be left at the end
 */
function playOut(board: DeepReadonly<Board>): { points: number; blocksLeft: number } {
    let current = board;
    let points = 0;
    let move = choosePlannedMove(current, getValidGroupMoves(current));
    while (move !== undefined) {
        points += getMoveScore(current, move);
        current = removeMove(current, move);
        move = choosePlannedMove(current, getValidGroupMoves(current));
    }
    return { points, blocksLeft: current.blocks.filter((block) => !isEmptyBlock(block)).length };
}

/**
 * Returns the board after a move: the move's blocks removed, and the board settled. A refill block's refill isn't
 * done (see chooseTidyMove).
 *
 * @param board - The board (not changed)
 * @param index - The block clicked
 * @returns The new board
 */
function removeMove(board: DeepReadonly<Board>, index: number): DeepReadonly<Board> {
    const move = new Set(getMoveAt(board, index));
    return applyGravity({
        ...board,
        blocks: board.blocks.map((block, i) => (move.has(i) ? createEmptyBlock() : { ...block })),
    });
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
