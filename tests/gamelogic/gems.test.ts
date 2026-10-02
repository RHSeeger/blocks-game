import {
    awardBoardFinishedGems,
    getNextComputerMilestone,
    isComputerMilestone,
} from '../../src/typescript/gamelogic/gems';
import { calculateDerivedGameInfo } from '../../src/typescript/gamelogic/calculateDerivedGameInfo';
import { applyBlockClick } from '../../src/typescript/gamelogic/applyBlockClick';
import { checkAchievementsAfterRemoval } from '../../src/typescript/gamelogic/achievements';
import { ACHIEVEMENT_GEMS } from '../../src/typescript/data/achievements';
import { GEM_GOAL_INCREASE, GEM_GOAL_STARTING_BOARD_SCORE } from '../../src/typescript/data/gems';
import { boardWith, boardWithFirstRow, makeGameState, regular } from '../helpers/testBoards';

/**
 * Tests for earning Gems, and for earning Coins and Chips.
 */

describe('awardBoardFinishedGems', () => {
    it('gives the human a Gem for reaching the board score goal, then raises the goal', () => {
        const gameState = makeGameState(boardWithFirstRow([regular('red')]));
        gameState.humanPlayer.boardScore = GEM_GOAL_STARTING_BOARD_SCORE;

        expect(awardBoardFinishedGems(gameState, 'human')).toEqual([
            { kind: 'gems', amount: 1, source: 'boardGoal', detail: GEM_GOAL_STARTING_BOARD_SCORE },
        ]);
        expect(gameState.wallet.gems).toBe(1);
        expect(gameState.gemGoalBoardScore).toBe(GEM_GOAL_STARTING_BOARD_SCORE + GEM_GOAL_INCREASE);
    });

    it('gives nothing below the goal', () => {
        const gameState = makeGameState(boardWithFirstRow([regular('red')]));
        gameState.humanPlayer.boardScore = GEM_GOAL_STARTING_BOARD_SCORE - 1;
        expect(awardBoardFinishedGems(gameState, 'human')).toEqual([]);
        expect(gameState.wallet.gems).toBe(0);
        expect(gameState.gemGoalBoardScore).toBe(GEM_GOAL_STARTING_BOARD_SCORE);
    });

    it('gives the human a Gem every time they finish a board with no blocks left', () => {
        const gameState = makeGameState(boardWith());
        expect(awardBoardFinishedGems(gameState, 'human')).toEqual([
            { kind: 'gems', amount: 1, source: 'spotless', detail: 0 },
        ]);
        awardBoardFinishedGems(gameState, 'human');
        expect(gameState.wallet.gems).toBe(2);
    });

    it('gives a Gem when the computer finishes its 10th, 20th, 40th, ... board', () => {
        const gameState = makeGameState(undefined, boardWithFirstRow([regular('red')]));
        gameState.computerPlayer.boardNumber = 20;
        expect(awardBoardFinishedGems(gameState, 'computer')).toEqual([
            { kind: 'gems', amount: 1, source: 'computerMilestone', detail: 20 },
        ]);
        gameState.computerPlayer.boardNumber = 30;
        expect(awardBoardFinishedGems(gameState, 'computer')).toEqual([]);
        expect(gameState.wallet.gems).toBe(1);
    });

    it.each([
        [9, false],
        [10, true],
        [15, false],
        [20, true],
        [30, false],
        [40, true],
        [80, true],
    ])('treats finishing %i boards as a computer milestone: %s', (boards, expected) => {
        expect(isComputerMilestone(boards)).toBe(expected);
    });
});

describe('getNextComputerMilestone', () => {
    it.each([
        [1, 10],
        [10, 10],
        [11, 20],
        [20, 20],
        [21, 40],
        [41, 80],
    ])('on board %i, the next milestone is board %i', (boardNumber, expected) => {
        expect(getNextComputerMilestone(boardNumber)).toBe(expected);
    });
});

describe('calculateDerivedGameInfo', () => {
    it("includes the computer player's next milestone", () => {
        const gameState = makeGameState();
        gameState.computerPlayer.boardNumber = 12;
        expect(calculateDerivedGameInfo(gameState).nextComputerMilestoneBoard).toBe(20);
    });
});

describe('earning currencies', () => {
    it('gives the human Coins equal to the score they earn', () => {
        const gameState = makeGameState(boardWithFirstRow([regular('red'), regular('red'), regular('red')]));
        applyBlockClick(gameState, 'human', 0);
        applyBlockClick(gameState, 'human', 0);
        expect(gameState.wallet.coins).toBe(gameState.humanPlayer.totalScore);
        expect(gameState.wallet.chips).toBe(0);
    });

    it('gives Chips equal to the score the computer earns', () => {
        const gameState = makeGameState(undefined, boardWithFirstRow([regular('red'), regular('red')]));
        applyBlockClick(gameState, 'computer', 0);
        applyBlockClick(gameState, 'computer', 0);
        expect(gameState.wallet.chips).toBe(gameState.computerPlayer.totalScore);
        expect(gameState.wallet.coins).toBe(0);
    });

    it('gives Gems for each achievement accomplished', () => {
        const gameState = makeGameState(boardWithFirstRow([regular('red'), regular('blue')]));
        checkAchievementsAfterRemoval(gameState, 'human', 2, [regular('red'), regular('red')]); // First Board Clear
        expect(gameState.wallet.gems).toBe(ACHIEVEMENT_GEMS);
    });

    it('awards board Gems when a removal finishes the board', () => {
        const gameState = makeGameState(boardWithFirstRow([regular('red'), regular('red')]));
        gameState.gemGoalBoardScore = 1;
        const notifications = applyBlockClick(gameState, 'human', 0).concat(applyBlockClick(gameState, 'human', 0));
        expect(notifications).toContainEqual({ kind: 'gems', amount: 1, source: 'boardGoal', detail: 1 });
        expect(notifications).toContainEqual({ kind: 'gems', amount: 1, source: 'spotless', detail: 0 });
    });
});
