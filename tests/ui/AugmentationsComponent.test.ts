import { renderAugmentations } from '../../src/typescript/ui/AugmentationsComponent';
import { GREEDY } from '../../src/typescript/data/augmentations';
import { makeGameState } from '../helpers/testBoards';

/**
 * Tests for drawing the Augmentations tab.
 */

/** Returns the text of the list item for the Augmentation with the given display name */
const itemText = (displayName: string): string => {
    const items = [...document.querySelectorAll('#augmentations-list li')];
    return items.find((item) => item.textContent?.includes(displayName))?.textContent ?? '';
};

describe('renderAugmentations', () => {
    beforeEach(() => {
        document.body.innerHTML = '<div id="augmentations-list"></div>';
    });

    it('shows a status for each player an Augmentation applies to', () => {
        renderAugmentations(makeGameState());
        expect(itemText('+1 Blocks')).toContain('Human Player: Locked');
        expect(itemText('+1 Blocks')).toContain('Computer Player: Locked');
    });

    it('shows Greedy for the computer player only', () => {
        const gameState = makeGameState();
        gameState.computerPlayer.augmentations = [GREEDY];
        renderAugmentations(gameState);
        expect(itemText('Greedy')).toContain('Computer Player: Unlocked');
        expect(itemText('Greedy')).not.toContain('Human Player');
    });
});
