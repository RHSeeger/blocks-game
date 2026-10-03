import type { DerivedGameInfo } from '../types/DerivedGameInfo';
import type { GameState } from '../types/GameState';
import { getMoveScore, isBoardFinished } from './board/moves';
import { getNextComputerMilestone } from './gems';
import { getSpecialBlockToExplain } from './specialBlockExplanations';
import { getUpgradeOffers } from './upgrades';

/**
 * Calculates the values the UI needs that are derived from the game state (rather than stored in it).
 */

/**
 * Calculates the values the UI needs that are derived from the game state.
 *
 * @param gameState - The game state
 * @returns The derived values
 */
export function calculateDerivedGameInfo(gameState: GameState): DerivedGameInfo {
    return {
        boardFinished: {
            human: isBoardFinished(gameState.humanPlayer.board),
            computer: isBoardFinished(gameState.computerPlayer.board),
        },
        upgradeOffers: getUpgradeOffers(gameState),
        nextComputerMilestoneBoard: getNextComputerMilestone(gameState.computerPlayer.boardNumber),
        specialBlockToExplain: getSpecialBlockToExplain(gameState),
        humanSelectionScore: getSelectionScore(gameState),
    };
}

/**
 * Returns the score the human player's selected group would earn if they removed it now. The first selected index is
 * always the block that was clicked (see getMoveAt), so the move is worked out again from it.
 *
 * @param gameState - The game state
 * @returns The score, or undefined if nothing is selected
 */
function getSelectionScore(gameState: GameState): number | undefined {
    const { board, selectedIndices } = gameState.humanPlayer;
    return selectedIndices.length === 0 ? undefined : getMoveScore(board, selectedIndices[0]);
}
