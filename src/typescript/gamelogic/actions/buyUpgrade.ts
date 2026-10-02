import type { PlayerId } from '../../types/PlayerId';
import { getGameState } from '../gameStateStore';
import { publishGameState } from '../publishGameState';
import { buyUpgradeLevel } from '../upgrades';

/**
 * Game-logic entry point: the user asked to buy a level of an Upgrade for a player.
 */

/**
 * Buys the next level of an Upgrade for a player. Does nothing if it can't be bought (e.g. not enough currency).
 *
 * @param upgrade - The Upgrade's internalName
 * @param player - The player to buy it for
 */
export function buyUpgrade(upgrade: string, player: PlayerId): void {
    const gameState = getGameState();
    if (!buyUpgradeLevel(gameState, upgrade, player)) return;
    publishGameState(gameState);
}
