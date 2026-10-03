import { calculateDerivedGameInfo } from '../../src/typescript/gamelogic/calculateDerivedGameInfo';
import { applyBlockClick } from '../../src/typescript/gamelogic/applyBlockClick';
import { calculateGroupScore } from '../../src/typescript/gamelogic/board/calculateGroupScore';
import { boardWithFirstRow, makeGameState, regular } from '../helpers/testBoards';

/**
 * Tests for the values calculated from the game state for the UI (only those not tested with the rules they come from).
 */

describe('calculateDerivedGameInfo: the selected group score', () => {
    it('is undefined when the human player has nothing selected', () => {
        expect(calculateDerivedGameInfo(makeGameState()).humanSelectionScore).toBeUndefined();
    });

    it('is what the selected group would score if removed', () => {
        const gameState = makeGameState(boardWithFirstRow([regular('red'), regular('red'), regular('red')]));
        applyBlockClick(gameState, 'human', 1);
        expect(calculateDerivedGameInfo(gameState).humanSelectionScore).toBe(calculateGroupScore(3));
    });
});
