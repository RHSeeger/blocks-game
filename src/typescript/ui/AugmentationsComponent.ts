import type { PlayerId } from '../types/PlayerId';
import type { ReadonlyGameState } from '../types/ReadonlyGameState';
import { ALL_AUGMENTATIONS } from '../data/augmentations';
import { getElement } from './getElement';

/**
 * Draws the Augmentations tab.
 */

const PLAYER_NAMES: Record<PlayerId, string> = { human: 'Human Player', computer: 'Computer Player' };

/**
 * Draws the Augmentations tab: every Augmentation, and whether each player it applies to has unlocked it.
 *
 * @param gameState - The game state (read-only)
 */
export function renderAugmentations(gameState: ReadonlyGameState): void {
    const items = ALL_AUGMENTATIONS.map((augmentation) => {
        const unlockedBy = (player: PlayerId) =>
            (player === 'human' ? gameState.humanPlayer : gameState.computerPlayer).augmentations.includes(
                augmentation.internalName,
            );
        const statuses = augmentation.players.map((player) => renderStatus(PLAYER_NAMES[player], unlockedBy(player)));
        return `<li style="margin-bottom:8px;${augmentation.players.some(unlockedBy) ? '' : 'opacity:0.5;'}">
            <b>${augmentation.displayName}</b><br>
            <span>${augmentation.description}</span><br>
            <span style="font-size:0.9em;">${statuses.join(' &middot; ')}</span>
        </li>`;
    });
    getElement('augmentations-list').innerHTML = `<ul style="margin-top:0">${items.join('')}</ul>`;
}

/**
 * Returns the HTML showing whether one player has unlocked an Augmentation.
 *
 * @param playerName - The player's display name
 * @param unlocked - Whether that player has unlocked it
 * @returns The HTML for the status
 */
function renderStatus(playerName: string, unlocked: boolean): string {
    return `${playerName}: <span style="color:${unlocked ? 'green' : 'gray'};">${unlocked ? 'Unlocked' : 'Locked'}</span>`;
}
