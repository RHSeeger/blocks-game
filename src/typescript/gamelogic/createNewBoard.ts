import type { Board } from '../types/Board';
import type { PlayerId } from '../types/PlayerId';
import type { PlayerState } from '../types/PlayerState';
import type { SpecialBlockType } from '../types/SpecialBlockType';
import { SPECIAL_BLOCK_SPAWNS } from '../data/specialBlocks';
import { generateBoard } from './board/generateBoard';
import { getBiggerBlockChance, getBoardSize, getSpecialBlockChance, rollSpecialBlockCount } from './upgrades';

/**
 * Creates a new board for a player, based on their Augmentations and Upgrades.
 */

/**
 * Creates a new board for a player: its size comes from the player's starting size and the "Bigger Board" Upgrade,
 * and its special blocks from the player's Augmentations and chance Upgrades (such as "+1 Block Chance").
 *
 * @param playerState - The player's state (not changed)
 * @param player - Which player it is for
 * @returns The new board
 */
export function createNewBoard(playerState: PlayerState, player: PlayerId): Board {
    const { width, height } = getBoardSize(playerState, player);
    return generateBoard(width, height, rollSpecialBlocks(playerState));
}

/**
 * Decides which special blocks go on a player's new board (or among the new blocks of a refill): for each kind they
 * have unlocked, how many (from its chance), and, for a kind with more than one type (such as line blocks), which
 * type each one is. A kind with a bigger version (a +2 for a +1, a big bomb for a bomb) makes each block the bigger
 * version instead, with the chance its "bigger" Upgrade gives (see getBiggerBlockChance).
 *
 * @param playerState - The player's state
 * @param share - How much of a board the blocks are for, from 0 to 1 (each chance is multiplied by this). 1 for a new
 *   board; for a refill, the share of the board being refilled, so special blocks are about as common as on a new board
 * @param exclude - Special block types that must not be placed (a refill never brings another refill block)
 * @returns The special blocks to place
 */
export function rollSpecialBlocks(
    playerState: PlayerState,
    share = 1,
    exclude: readonly SpecialBlockType[] = [],
): SpecialBlockType[] {
    return SPECIAL_BLOCK_SPAWNS.flatMap((spawn) => {
        const types = spawn.types.filter((type) => !exclude.includes(type));
        if (types.length === 0) return [];
        const count = rollSpecialBlockCount(getSpecialBlockChance(playerState, spawn) * share);
        const biggerChance = getBiggerBlockChance(playerState, spawn);
        return Array.from({ length: count }, () => {
            if (spawn.bigger !== undefined && Math.random() * 100 < biggerChance) return spawn.bigger.type;
            return types[Math.floor(Math.random() * types.length)];
        });
    });
}
