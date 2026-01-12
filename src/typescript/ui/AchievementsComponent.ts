// AchievementsComponent.ts
// Handles achievements display DOM updates
import { ALL_ACHIEVEMENTS } from '../achievements-list';
//import { loadAchievements } from '../initialization';
import type { Achievement } from '../Achievement';

export function updateAchievementsDisplay(gameState: { accomplishedAchievements: Achievement[] }) {
    const listElem = document.getElementById('achievements-list');
    if (!listElem) return;
    let html = '<ul style="margin-top:0">';
    for (const ach of ALL_ACHIEVEMENTS) {
        const unlocked = gameState.accomplishedAchievements.some((a) => a.internalName === ach.internalName);
        html += `<li style="margin-bottom:8px;${unlocked ? '' : 'opacity:0.5;'}">
            <b>${ach.displayName}</b><br>
            <span>${ach.description}</span><br>
            <span style="font-size:0.9em;color:${unlocked ? 'green' : 'gray'};">${unlocked ? 'Unlocked' : 'Locked'}</span>
        </li>`;
    }
    html += '</ul>';
    listElem.innerHTML = html;
}
