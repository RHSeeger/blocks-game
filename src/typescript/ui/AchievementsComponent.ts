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
    getElement('achievements-list').innerHTML = `<ul style="margin-top:0">${items.join('')}</ul>`;
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
        unlocksHtml = `<div style="font-size:0.9em;color:#0077cc;margin-top:2px;">Unlocks: <b>${augmentationName}</b> (${PLAYER_NAMES[player]})</div>`;
    }
    return `<li style="margin-bottom:8px;${accomplished ? '' : 'opacity:0.5;'}">
            <b>${achievement.displayName}</b><br>
            <span>${achievement.description}</span><br>
            ${unlocksHtml}
            <span style="font-size:0.9em;color:${accomplished ? 'green' : 'gray'};">${accomplished ? 'Accomplished' : 'Not yet'}</span>
        </li>`;
}
