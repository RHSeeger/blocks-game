import type { GameState } from '../types/GameState';
import type { PlayerId } from '../types/PlayerId';
import { applyGravity } from './board/applyGravity';
import { createEmptyBlock } from './board/blocks';
import { calculateGroupScore } from './board/calculateGroupScore';
import { getMoveAt, getSameColorGroup } from './board/moves';
import { checkAchievementsAfterRemoval } from './achievements';
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
 */
export function applyBlockClick(gameState: GameState, player: PlayerId, index: number): void {
    const playerState = getPlayerState(gameState, player);
    if (playerState.selectedIndices.includes(index)) {
        removeSelectedGroup(gameState, player);
    } else {
        playerState.selectedIndices = getMoveAt(playerState.board.blocks, index);
    }
}

/**
 * Removes the player's selected group: empties those spaces, settles the board, adds the score, and checks for
 * achievements. The move is re-checked first, so a selection that is no longer valid is just cleared.
 *
 * @param gameState - The game state (updated in place)
 * @param player - The player whose selection is removed
 */
function removeSelectedGroup(gameState: GameState, player: PlayerId): void {
    const playerState = getPlayerState(gameState, player);
    const blocks = playerState.board.blocks;
    const clickedIndex = playerState.selectedIndices[0];
    const move = getMoveAt(blocks, clickedIndex);
    playerState.selectedIndices = [];
    if (move.length === 0) return;

    const removedBlocks = move.map((index) => blocks[index]);
    const score = calculateGroupScore(removedBlocks.filter((block) => block.special === undefined).length);
    const sameColorGroupSize = getSameColorGroup(blocks, clickedIndex).length;

    playerState.board = {
        blocks: applyGravity(blocks.map((block, index) => (move.includes(index) ? createEmptyBlock() : block))),
    };
    playerState.totalScore += score;
    playerState.boardScore += score;
    playerState.maxBoardScore = Math.max(playerState.maxBoardScore, playerState.boardScore);
    checkAchievementsAfterRemoval(gameState, player, sameColorGroupSize, removedBlocks);
}
