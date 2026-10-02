import { renderAchievements } from '../../src/typescript/ui/AchievementsComponent';
import { ACHIEVEMENT_GEMS, FIRST_CLEAR } from '../../src/typescript/data/achievements';
import { makeGameState } from '../helpers/testBoards';

/**
 * Tests for drawing the Achievements tab.
 */

/** Returns the list item for the achievement with the given display name */
const item = (displayName: string): Element | undefined =>
    [...document.querySelectorAll('#achievements-list li')].find((li) => li.textContent?.includes(displayName));

describe('renderAchievements', () => {
    beforeEach(() => {
        document.body.innerHTML = '<div id="achievements-list"></div>';
    });

    it('shows an achievement that has not been accomplished as locked, with its Gems and what it unlocks', () => {
        renderAchievements(makeGameState());
        const firstBoardClear = item('First Board Clear');
        expect(firstBoardClear?.classList.contains('locked')).toBe(true);
        expect(firstBoardClear?.textContent).toContain('Not yet');
        expect(firstBoardClear?.textContent).toContain(`+${ACHIEVEMENT_GEMS} Gems`);
        expect(firstBoardClear?.textContent).toContain('Unlocks: +1 Blocks (Human Player)');
    });

    it('shows an accomplished achievement as accomplished', () => {
        const gameState = makeGameState();
        gameState.accomplishedAchievements = [FIRST_CLEAR];
        renderAchievements(gameState);
        const firstBoardClear = item('First Board Clear');
        expect(firstBoardClear?.classList.contains('locked')).toBe(false);
        expect(firstBoardClear?.textContent).toContain('Accomplished');
    });
});
