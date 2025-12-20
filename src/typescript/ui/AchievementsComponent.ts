// AchievementsComponent.ts
// Handles achievements display DOM updates
import { ALL_ACHIEVEMENTS } from "../achievements-list";
import { loadAchievements } from "../initialization";
import type { Achievement } from "../achievement";

export function updateAchievementsDisplay() {
    const listElem = document.getElementById("achievements-list");
    if (!listElem) return;
    let achievedAchievements: Achievement[] = loadAchievements();
    let html = '<ul style="margin-top:0">';
    for (const ach of ALL_ACHIEVEMENTS) {
        const unlocked = achievedAchievements.some(a => a.internalName === ach.internalName);
        html += `<li style="margin-bottom:8px;${unlocked ? '' : 'opacity:0.5;'}">
            <b>${ach.displayName}</b><br>
            <span>${ach.description}</span><br>
            <span style="font-size:0.9em;color:${unlocked ? 'green' : 'gray'};">${unlocked ? 'Unlocked' : 'Locked'}</span>
        </li>`;
    }
    html += '</ul>';
    listElem.innerHTML = html;
}
