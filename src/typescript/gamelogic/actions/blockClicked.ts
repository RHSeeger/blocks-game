import { applyBlockClick } from '../applyBlockClick';
import { getGameState } from '../gameStateStore';
import { publishGameState } from '../publishGameState';

/**
 * Game-logic entry point: the human player clicked a block.
 */

/**
 * Handles the human player clicking a block on their board.
 *
 * @param index - The index of the clicked block
 */
export function blockClicked(index: number): void {
    const gameState = getGameState();
    const notifications = applyBlockClick(gameState, 'human', index);
    publishGameState(gameState, notifications);
}
