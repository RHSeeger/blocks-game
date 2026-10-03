import { getGameState } from '../gameStateStore';
import { publishGameState } from '../publishGameState';

/**
 * Game-logic entry point: the player closed the introduction pop-up, or asked to see it again.
 */

/**
 * Records whether the introduction ("how to play") pop-up has been seen: true when the player closes it, false when
 * they ask to see it again (from the How to Play tab). The UI shows it whenever it hasn't been seen.
 *
 * @param seen - Whether it has been seen
 */
export function setIntroSeen(seen: boolean): void {
    const gameState = getGameState();
    if (gameState.introSeen === seen) return;
    gameState.introSeen = seen;
    publishGameState(gameState);
}
