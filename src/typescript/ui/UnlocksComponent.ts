// UnlocksComponent.ts
// Handles unlocks display DOM updates
import { ALL_UNLOCKS } from '../unlocks-list';
import type { Unlock } from '../Unlock';

export function updateUnlocksDisplay(gameState: { unlockedUnlocks: Unlock[] }) {
    const listElem = document.getElementById('unlocks-list');
    if (!listElem) return;
    let html = '<ul style="margin-top:0">';
    for (const unlock of ALL_UNLOCKS) {
        const unlocked = gameState.unlockedUnlocks.some((u) => u.internalName === unlock.internalName);
        html += `<li style="margin-bottom:8px;${unlocked ? '' : 'opacity:0.5;'}">
            <b>${unlock.displayName}</b><br>
            <span>${unlock.description}</span><br>
            <span style="font-size:0.9em;color:${unlocked ? 'green' : 'gray'};">${unlocked ? 'Unlocked' : 'Locked'}</span>
        </li>`;
    }
    html += '</ul>';
    listElem.innerHTML = html;
}
