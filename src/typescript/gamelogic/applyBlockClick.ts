import type { Board } from '../types/Board';
import type { GameNotification } from '../types/GameNotification';
import type { GameState } from '../types/GameState';
import type { PlayerId } from '../types/PlayerId';
import type { PlayerState } from '../types/PlayerState';
import { settleBoard } from './board/applyGravity';
import { createEmptyBlock, isEmptyBlock } from './board/blocks';
import { getCleanupBonus } from './board/cleanupBonus';
import { refillBoard } from './board/generateBoard';
import { getMoveAt, getMoveScore, getSameColorGroup, getSpecialsTouchingGroup, isBoardFinished } from './board/moves';
import { checkAchievementsAfterRemoval } from './achievements';
import { rollSpecialBlocks } from './createNewBoard';
import { recordBoardFinished, recordGroupRemoved } from './gameStats';
import { awardBoardFinishedGems } from './gems';
import { getPlayerState } from './getPlayerState';

/**
 * Applies a click on a block to the game state: selecting a group, or removing the selected group.
 */

/**
 * Applies a click on a block to the game state.
 * - Clicking a block in the current selection removes the selected group
 * - Clicking a block outside the current selection only clears the selection (even if that block is a valid move; it
 *   takes another click to select it, so a new selection never looks like the old one growing)
 * - With nothing selected, clicking a block selects its move (nothing, if it isn't a valid move)
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
    playerState.selectedIndices = playerState.selectedIndices.length > 0 ? [] : getMoveAt(playerState.board, index);
    return [];
}

/**
 * Removes the player's selected group: empties those spaces, settles the board (then refills it, if the move set off
 * a refill block), adds the score (and the same amount of Coins for the human, or Chips for the computer), updates the
 * game statistics (human player only; including, if the board is now finished, how clean it was), and, if the board
 * is now finished, awards the clean-up bonus. Then it checks
 * for achievements, and awards Gems if the board is finished. The move is re-checked first, so a selection that is no
 * longer valid is just cleared.
 *
 * @param gameState - The game state (updated in place)
 * @param player - The player whose selection is removed
 * @returns A `blocksRemoved` notification describing the move (so the UI can show it), followed by notifications for
 *          the achievements and Gems awarded. Empty if the selection was no longer a valid move
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
    const group = getSameColorGroup(board, clickedIndex);
    const specialsTouchingGroup = getSpecialsTouchingGroup(board, group).map((index) => board.blocks[index]);

    const settled = settleBoard({
        ...board,
        blocks: board.blocks.map((block, index) => (move.includes(index) ? createEmptyBlock() : block)),
    });
    const refilled = removedBlocks.some((block) => block.special === 'refill')
        ? refillAfterMove(playerState, settled.board)
        : { board: settled.board, added: [] };
    playerState.board = refilled.board;
    addScore(gameState, player, score);
    if (player === 'human') {
        recordGroupRemoved(gameState.gameStats, removedBlocks.filter((block) => block.special === undefined).length);
    }
    const boardFinished = isBoardFinished(playerState.board);
    if (boardFinished && player === 'human') {
        const blocksLeft = playerState.board.blocks.filter((block) => !isEmptyBlock(block)).length;
        recordBoardFinished(gameState.gameStats, blocksLeft);
    }
    // The clean-up bonus is added before achievements and Gems are checked, so it counts toward them
    const bonusNotifications = boardFinished ? awardCleanupBonus(gameState, player) : [];
    const achievementNotifications = checkAchievementsAfterRemoval(
        gameState,
        player,
        group.length,
        removedBlocks,
        specialsTouchingGroup,
    );
    const gemNotifications = boardFinished ? awardBoardFinishedGems(gameState, player) : [];
    const removal: GameNotification = {
        kind: 'blocksRemoved',
        player,
        clicked: clickedIndex,
        removed: move,
        score,
        cameFrom: settled.cameFrom,
        added: refilled.added,
    };
    return [removal, ...bonusNotifications, ...achievementNotifications, ...gemNotifications];
}

/**
 * Adds points to a player's score: their total and board scores (and best board score), and the same amount of the
 * currency their score earns (Coins for the human, Chips for the computer).
 *
 * @param gameState - The game state (updated in place)
 * @param player - The player who scored
 * @param points - The points to add
 */
function addScore(gameState: GameState, player: PlayerId, points: number): void {
    const playerState = getPlayerState(gameState, player);
    playerState.totalScore += points;
    playerState.boardScore += points;
    playerState.maxBoardScore = Math.max(playerState.maxBoardScore, playerState.boardScore);
    gameState.wallet[player === 'human' ? 'coins' : 'chips'] += points;
}

/**
 * Awards the clean-up bonus for a board that just ended, if few enough blocks are left (see getCleanupBonus): adds it
 * to the player's score like any other points.
 *
 * @param gameState - The game state (updated in place)
 * @param player - The player whose board just ended
 * @returns A `cleanupBonus` notification, or nothing if there's no bonus
 */
function awardCleanupBonus(gameState: GameState, player: PlayerId): GameNotification[] {
    const playerState = getPlayerState(gameState, player);
    const { blocksLeft, percent, points } = getCleanupBonus(playerState.board, playerState.boardScore);
    if (points <= 0) return [];
    addScore(gameState, player, points);
    return [{ kind: 'cleanupBonus', player, blocksLeft, percent, points }];
}

/**
 * Refills a settled board, for a move that set off a refill block: every empty space gets a new block. Special blocks
 * can be among them (never another refill block), with the player's usual chances scaled by how much of the board is
 * being refilled.
 *
 * @param playerState - The player's state (for their special block chances)
 * @param board - The settled board (not changed)
 * @returns The refilled board, and the indices of the spaces that were filled
 */
function refillAfterMove(playerState: PlayerState, board: Board): { board: Board; added: number[] } {
    const share = board.blocks.filter(isEmptyBlock).length / board.blocks.length;
    return refillBoard(board, rollSpecialBlocks(playerState, share, ['refill']));
}
