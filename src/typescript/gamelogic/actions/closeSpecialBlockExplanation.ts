import { getGameState } from '../gameStateStore';
import { publishGameState } from '../publishGameState';
import { markSpecialBlockExplained } from '../specialBlockExplanations';

/**
 * Game-logic entry point: the player closed the pop-up explaining a special block they unlocked.
 */

/**
 * Records that the special block has been explained, so its pop-up isn't shown again (and the next one, if any, can
 * be). Does nothing if it already had been, or isn't a special block.
 *
 * @param augmentation - The special block Augmentation's internalName
 */
export function closeSpecialBlockExplanation(augmentation: string): void {
    const gameState = getGameState();
    if (!markSpecialBlockExplained(gameState, augmentation)) return;
    publishGameState(gameState);
}
