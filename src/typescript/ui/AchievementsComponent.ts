import type { Achievement } from '../types/Achievement';
import type { ReadonlyGameState } from '../types/ReadonlyGameState';
import { ALL_ACHIEVEMENTS } from '../data/achievements';
import { ALL_AUGMENTATIONS } from '../data/augmentations';
import { getElement } from './getElement';

/**
 * Draws the Achievements tab.
 */

const PLAYER_NAMES = { human: 'Human Player', computer: 'Computer Player' };

/**
 * Draws the Achievements tab: every achievement, whether it has been accomplished, and what it unlocks.
 *
 * @param gameState - The game state (read-only)
 */
export function renderAchievements(gameState: ReadonlyGameState): void {
    const items = ALL_ACHIEVEMENTS.map((achievement) =>
        renderAchievement(achievement, gameState.accomplishedAchievements.includes(achievement.internalName)),
    );
    getElement('achievements-list').innerHTML = `<ul class="card-list">${items.join('')}</ul>`;
}

/**
 * Returns the HTML for one achievement in the list.
 *
 * @param achievement - The achievement's definition
 * @param accomplished - Whether it has been accomplished
 * @returns The HTML for the list item
 */
function renderAchievement(achievement: Achievement, accomplished: boolean): string {
    let unlocksHtml = '';
    if (achievement.unlocks !== undefined) {
        const { augmentation, player } = achievement.unlocks;
        const augmentationName =
            ALL_AUGMENTATIONS.find((a) => a.internalName === augmentation)?.displayName ?? augmentation;
        unlocksHtml = `<div class="card-unlocks">Unlocks: <b>${augmentationName}</b> (${PLAYER_NAMES[player]})</div>`;
    }
    // The Grant button is a debug tool: hidden by the CSS unless the debug tools are turned on (see DebugToolsComponent)
    const status = accomplished
        ? '<span class="badge badge-done">Accomplished</span>'
        : `<span class="badge">Not yet</span>
           <button class="btn btn-debug debug-only grant-achievement-btn" data-achievement="${achievement.internalName}">Grant</button>`;
    return `<li class="card-item${accomplished ? '' : ' locked'}">
            <div class="card-item-title"><b>${achievement.displayName}</b>
                <span class="badge badge-gems">+${achievement.gems} Gems</span></div>
            <div class="card-item-description">${achievement.description}</div>
            ${unlocksHtml}
            <div class="card-item-status">${status}</div>
        </li>`;
}
