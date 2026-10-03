import type { Board } from '../types/Board';
import type { PlayerId } from '../types/PlayerId';
import type { PlayerState } from '../types/PlayerState';
import type { SpecialBlockType } from '../types/SpecialBlockType';
import { SPECIAL_BLOCK_SPAWNS } from '../data/specialBlocks';
import { generateBoard } from './board/generateBoard';
import { getBoardSize, getSpecialBlockChance, rollSpecialBlockCount } from './upgrades';

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
 * Decides which special blocks go on a player's new board: for each kind they have unlocked, how many (from its
 * chance), and, for a kind with more than one type (such as line blocks), which type each one is.
 *
 * @param playerState - The player's state
 * @returns The special blocks to place
 */
function rollSpecialBlocks(playerState: PlayerState): SpecialBlockType[] {
    return SPECIAL_BLOCK_SPAWNS.flatMap((spawn) =>
        Array.from(
            { length: rollSpecialBlockCount(getSpecialBlockChance(playerState, spawn)) },
            () => spawn.types[Math.floor(Math.random() * spawn.types.length)],
        ),
    );
}
