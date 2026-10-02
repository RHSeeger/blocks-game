import type { GameNotification } from '../types/GameNotification';
import type { GameState } from '../types/GameState';
import type { PlayerId } from '../types/PlayerId';
import { applyGravity } from './board/applyGravity';
import { createEmptyBlock } from './board/blocks';
import { getMoveAt, getMoveScore, getSameColorGroup, isBoardFinished } from './board/moves';
import { checkAchievementsAfterRemoval } from './achievements';
import { recordGroupRemoved } from './gameStats';
import { awardBoardFinishedGems } from './gems';
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
    playerState.selectedIndices = getMoveAt(playerState.board, index);
    return [];
}

/**
 * Removes the player's selected group: empties those spaces, settles the board, adds the score (and the same amount
 * of Coins for the human, or Chips for the computer), updates the game statistics (human player only), checks for
 * achievements, and awards Gems if the board is now finished. The move is re-checked first, so a selection that is
 * no longer valid is just cleared.
 *
 * @param gameState - The game state (updated in place)
 * @param player - The player whose selection is removed
 * @returns Notifications for the achievements and Gems awarded (empty if none)
 */
function removeSelectedGroup(gameState: GameState, player: PlayerId): GameNotification[] {
    const playerState = getPlayerState(gameState, player);
    const board = playerState.board;
    const clickedIndex = playerState.selectedIndices[0];
    const move = getMoveAt(board, clickedIndex);
    playerState.selectedIndices = [];
    if (move.length === 0) return [];

    const removedBlocks = move.map((index) => board.blocks[index]);
    const score = getMoveScore(board, clickedIndex);
    const sameColorGroupSize = getSameColorGroup(board, clickedIndex).length;

    playerState.board = applyGravity({
        ...board,
        blocks: board.blocks.map((block, index) => (move.includes(index) ? createEmptyBlock() : block)),
    });
    playerState.totalScore += score;
    playerState.boardScore += score;
    playerState.maxBoardScore = Math.max(playerState.maxBoardScore, playerState.boardScore);
    gameState.wallet[player === 'human' ? 'coins' : 'chips'] += score;
    if (player === 'human') {
        recordGroupRemoved(gameState.gameStats, removedBlocks.filter((block) => block.special === undefined).length);
    }
    const achievementNotifications = checkAchievementsAfterRemoval(
        gameState,
        player,
        sameColorGroupSize,
        removedBlocks,
    );
    const gemNotifications = isBoardFinished(playerState.board) ? awardBoardFinishedGems(gameState, player) : [];
    return [...achievementNotifications, ...gemNotifications];
}
