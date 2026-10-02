import type { GameNotification } from '../types/GameNotification';
import type { GameState } from '../types/GameState';
import type { PlayerId } from '../types/PlayerId';
import { applyGravity } from './board/applyGravity';
import { createEmptyBlock } from './board/blocks';
import { getMoveAt, getMoveScore, getSameColorGroup } from './board/moves';
import { checkAchievementsAfterRemoval } from './achievements';
import { recordGroupRemoved } from './gameStats';
import { getPlayerState } from './getPlayerState';

/**
 * Applies a click on a block to the game state: selecting a group, or removing the selected group.
 */

/**
 * Applies a click on a block to the game state.
 * - Clicking a block in the current selection removes the selected group
 * - Clicking any other block selects its move, or clears the selection if it is not a valid move
 *
 * @param gameState - The game state (updated in place)
 * @param player - The player whose board was clicked
 * @param index - The index of the clicked block
 * @returns Notifications for anything the click awarded (empty if none)
 */
export function applyBlockClick(gameState: GameState, player: PlayerId, index: number): GameNotification[] {
    const playerState = getPlayerState(gameState, player);
    if (playerState.selectedIndices.includes(index)) {
        return removeSelectedGroup(gameState, player);
    }
    playerState.selectedIndices = getMoveAt(playerState.board.blocks, index);
    return [];
}

/**
 * Removes the player's selected group: empties those spaces, settles the board, adds the score, updates the game
 * statistics (human player only), and checks for achievements. The move is re-checked first, so a selection that is no longer valid is just cleared.
 *
 * @param gameState - The game state (updated in place)
 * @param player - The player whose selection is removed
 * @returns Notifications for the achievements awarded (empty if none)
 */
function removeSelectedGroup(gameState: GameState, player: PlayerId): GameNotification[] {
    const playerState = getPlayerState(gameState, player);
    const blocks = playerState.board.blocks;
    const clickedIndex = playerState.selectedIndices[0];
    const move = getMoveAt(blocks, clickedIndex);
    playerState.selectedIndices = [];
    if (move.length === 0) return [];

    const removedBlocks = move.map((index) => blocks[index]);
    const score = getMoveScore(blocks, clickedIndex);
    const sameColorGroupSize = getSameColorGroup(blocks, clickedIndex).length;

    playerState.board = {
        blocks: applyGravity(blocks.map((block, index) => (move.includes(index) ? createEmptyBlock() : block))),
    };
    playerState.totalScore += score;
    playerState.boardScore += score;
    playerState.maxBoardScore = Math.max(playerState.maxBoardScore, playerState.boardScore);
    if (player === 'human') {
        recordGroupRemoved(gameState.gameStats, removedBlocks.filter((block) => block.special === undefined).length);
    }
    return checkAchievementsAfterRemoval(gameState, player, sameColorGroupSize, removedBlocks);
}
