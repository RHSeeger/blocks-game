import {
    getSpecialBlockToExplain,
    markSpecialBlockExplained,
} from '../../src/typescript/gamelogic/specialBlockExplanations';
import { BOMB_BLOCK, GREEDY, LINE_BLOCK, PLUS1_BLOCK } from '../../src/typescript/data/augmentations';
import { makeGameState } from '../helpers/testBoards';

/**
 * Tests for choosing which special block to explain to the human player, and recording that it's been explained.
 */

describe('getSpecialBlockToExplain', () => {
    it('is nothing until the human player unlocks a special block', () => {
        expect(getSpecialBlockToExplain(makeGameState())).toBeUndefined();
    });

    it('is a special block the human player has unlocked but not had explained', () => {
        const gameState = makeGameState();
        gameState.humanPlayer.augmentations = [PLUS1_BLOCK];
        expect(getSpecialBlockToExplain(gameState)).toBe(PLUS1_BLOCK);
    });

    it('explains one at a time, in the order of the special blocks, skipping ones already explained', () => {
        const gameState = makeGameState();
        gameState.humanPlayer.augmentations = [BOMB_BLOCK, LINE_BLOCK, PLUS1_BLOCK];
        gameState.specialBlocksExplained = [PLUS1_BLOCK];
        expect(getSpecialBlockToExplain(gameState)).toBe(LINE_BLOCK);
        gameState.specialBlocksExplained.push(LINE_BLOCK, BOMB_BLOCK);
        expect(getSpecialBlockToExplain(gameState)).toBeUndefined();
    });

    it("ignores Augmentations that aren't special blocks, and the computer player's", () => {
        const gameState = makeGameState();
        gameState.humanPlayer.augmentations = [GREEDY];
        gameState.computerPlayer.augmentations = [PLUS1_BLOCK];
        expect(getSpecialBlockToExplain(gameState)).toBeUndefined();
    });

    it('waits until the introduction has been seen', () => {
        const gameState = makeGameState();
        gameState.humanPlayer.augmentations = [PLUS1_BLOCK];
        gameState.introSeen = false;
        expect(getSpecialBlockToExplain(gameState)).toBeUndefined();
    });
});

describe('markSpecialBlockExplained', () => {
    it('records it once', () => {
        const gameState = makeGameState();
        expect(markSpecialBlockExplained(gameState, PLUS1_BLOCK)).toBe(true);
        expect(markSpecialBlockExplained(gameState, PLUS1_BLOCK)).toBe(false);
        expect(gameState.specialBlocksExplained).toEqual([PLUS1_BLOCK]);
    });

    it("ignores an Augmentation that isn't a special block", () => {
        const gameState = makeGameState();
        expect(markSpecialBlockExplained(gameState, GREEDY)).toBe(false);
        expect(gameState.specialBlocksExplained).toEqual([]);
    });
});
