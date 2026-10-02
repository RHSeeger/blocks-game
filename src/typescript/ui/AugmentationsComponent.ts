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
        return `<li class="card-item${augmentation.players.some(unlockedBy) ? '' : ' locked'}">
            <div class="card-item-title"><b>${augmentation.displayName}</b></div>
            <div class="card-item-description">${augmentation.description}</div>
            <div class="card-item-status">${statuses.join(' ')}</div>
        </li>`;
    });
    getElement('augmentations-list').innerHTML = `<ul class="card-list">${items.join('')}</ul>`;
}

/**
 * Returns the HTML showing whether one player has unlocked an Augmentation.
 *
 * @param playerName - The player's display name
 * @param unlocked - Whether that player has unlocked it
 * @returns The HTML for the status
 */
function renderStatus(playerName: string, unlocked: boolean): string {
    return `<span class="badge${unlocked ? ' badge-done' : ''}">${playerName}: ${unlocked ? 'Unlocked' : 'Locked'}</span>`;
}
