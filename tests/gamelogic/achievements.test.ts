import { checkAchievementsAfterRemoval } from '../../src/typescript/gamelogic/achievements';
import { FIRST_CLEAR, GROUP_20, NO_NOT_LIKE_THAT, SCORE_1000 } from '../../src/typescript/data/achievements';
import { PLUS1_BLOCK } from '../../src/typescript/data/augmentations';
import type { Block } from '../../src/typescript/types/Block';
import { boardWithFirstRow, makeGameState, plus1, regular } from '../helpers/testBoards';

/**
 * Tests for awarding achievements, and the Augmentations they unlock.
 */

/** A board that still has a valid move, so First Board Clear is not awarded */
const unfinishedBoard = () => boardWithFirstRow([regular('red'), regular('red')]);

/** Creates the given number of regular blocks, as if they had been removed */
const removed = (count: number): Block[] => Array.from({ length: count }, () => regular('red'));

describe('checkAchievementsAfterRemoval', () => {
    it('awards nothing for an ordinary removal', () => {
        const gameState = makeGameState(unfinishedBoard());
        checkAchievementsAfterRemoval(gameState, 'human', 3, removed(3));
        expect(gameState.accomplishedAchievements).toEqual([]);
    });

    it('awards First Board Clear when the human player finishes a board, and unlocks +1 Blocks for them', () => {
        const gameState = makeGameState(boardWithFirstRow([regular('red'), regular('blue')]));
        checkAchievementsAfterRemoval(gameState, 'human', 2, removed(2));
        expect(gameState.accomplishedAchievements).toEqual([FIRST_CLEAR]);
        expect(gameState.humanPlayer.augmentations).toEqual([PLUS1_BLOCK]);
        expect(gameState.computerPlayer.augmentations).toEqual([]);
    });

    it('awards "No, not like that" for a group of 2 with a +1, and unlocks +1 Blocks for the computer', () => {
        const gameState = makeGameState(unfinishedBoard());
        checkAchievementsAfterRemoval(gameState, 'human', 2, [...removed(2), plus1()]);
        expect(gameState.accomplishedAchievements).toEqual([NO_NOT_LIKE_THAT]);
        expect(gameState.computerPlayer.augmentations).toEqual([PLUS1_BLOCK]);
        expect(gameState.humanPlayer.augmentations).toEqual([]);
    });

    it('does not award "No, not like that" for a bigger group with a +1', () => {
        const gameState = makeGameState(unfinishedBoard());
        checkAchievementsAfterRemoval(gameState, 'human', 3, [...removed(3), plus1()]);
        expect(gameState.accomplishedAchievements).toEqual([]);
    });

    it('awards Big Group! for removing 20 or more regular blocks at once', () => {
        const gameState = makeGameState(unfinishedBoard());
        checkAchievementsAfterRemoval(gameState, 'human', 19, removed(19));
        expect(gameState.accomplishedAchievements).toEqual([]);
        checkAchievementsAfterRemoval(gameState, 'human', 20, removed(20));
        expect(gameState.accomplishedAchievements).toEqual([GROUP_20]);
    });

    it('awards Score 1000! once the total score reaches 1000', () => {
        const gameState = makeGameState(unfinishedBoard());
        gameState.humanPlayer.totalScore = 999;
        checkAchievementsAfterRemoval(gameState, 'human', 2, removed(2));
        expect(gameState.accomplishedAchievements).toEqual([]);
        gameState.humanPlayer.totalScore = 1000;
        checkAchievementsAfterRemoval(gameState, 'human', 2, removed(2));
        expect(gameState.accomplishedAchievements).toEqual([SCORE_1000]);
    });

    it('awards each achievement only once', () => {
        const gameState = makeGameState(boardWithFirstRow([regular('red'), regular('blue')]));
        checkAchievementsAfterRemoval(gameState, 'human', 2, removed(2));
        checkAchievementsAfterRemoval(gameState, 'human', 2, removed(2));
        expect(gameState.accomplishedAchievements).toEqual([FIRST_CLEAR]);
        expect(gameState.humanPlayer.augmentations).toEqual([PLUS1_BLOCK]);
    });

    it('does not award achievements for the computer player', () => {
        const gameState = makeGameState(undefined, boardWithFirstRow([regular('red'), regular('blue')]));
        checkAchievementsAfterRemoval(gameState, 'computer', 2, [...removed(2), plus1()]);
        expect(gameState.accomplishedAchievements).toEqual([]);
    });
});
