import type { Board } from '../types/Board';
import type { PlayerId } from '../types/PlayerId';
import type { PlayerState } from '../types/PlayerState';
import { generateBoard } from './board/generateBoard';
import { getBoardSize, getPlus1Chance, rollPlus1Count } from './upgrades';

/**
 * Creates a new board for a player, based on their Augmentations and Upgrades.
 */

/**
 * Creates a new board for a player: its size comes from the player's starting size and the "Bigger Board" Upgrade,
 * and the number of +1 blocks from the +1 Blocks Augmentation and the "+1 Block Chance" Upgrade.
 *
 * @param playerState - The player's state (not changed)
 * @param player - Which player it is for
 * @returns The new board
 */
export function createNewBoard(playerState: PlayerState, player: PlayerId): Board {
    const { width, height } = getBoardSize(playerState, player);
    return generateBoard(width, height, rollPlus1Count(getPlus1Chance(playerState)));
}
