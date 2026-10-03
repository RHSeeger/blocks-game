import { checkAchievementsAfterRemoval } from '../../src/typescript/gamelogic/achievements';
import {
    CLEARED_BOARD,
    BOMB_NOT_LIKE_THAT,
    CHAIN_REACTION,
    EVERY_COLOR_LEFT,
    FIRST_CLEAR,
    GROUP_20,
    LINE_NOT_LIKE_THAT,
    NO_NOT_LIKE_THAT,
    REFILL_NOT_LIKE_THAT,
    SCORE_1000,
} from '../../src/typescript/data/achievements';
import { BOMB_BLOCK, GREEDY, LINE_BLOCK, PLUS1_BLOCK, REFILL_BLOCK } from '../../src/typescript/data/augmentations';
import { BLOCK_COLORS } from '../../src/typescript/data/board';
import type { Block } from '../../src/typescript/types/Block';
import { boardWith, boardWithFirstRow, bomb, line, makeGameState, plus1, refill, regular } from '../helpers/testBoards';

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

    it('awards Spotless when the board is finished with no blocks left', () => {
        const gameState = makeGameState(boardWith());
        checkAchievementsAfterRemoval(gameState, 'human', 2, removed(2));
        expect(gameState.accomplishedAchievements).toEqual([FIRST_CLEAR, CLEARED_BOARD]);
    });

    it('does not award Spotless when a leftover special block remains', () => {
        const gameState = makeGameState(boardWithFirstRow([plus1()]));
        checkAchievementsAfterRemoval(gameState, 'human', 2, removed(2));
        expect(gameState.accomplishedAchievements).not.toContain(CLEARED_BOARD);
    });

    it('awards Taste the Rainbow when the board is finished with every color left, and unlocks Bomb Blocks', () => {
        const gameState = makeGameState(boardWithFirstRow(BLOCK_COLORS.map(regular)));
        checkAchievementsAfterRemoval(gameState, 'human', 2, removed(2));
        expect(gameState.accomplishedAchievements).toEqual([FIRST_CLEAR, EVERY_COLOR_LEFT]);
        expect(gameState.humanPlayer.augmentations).toEqual([PLUS1_BLOCK, BOMB_BLOCK]);
    });

    it('awards Chain Reaction for setting off 3 special blocks in one move, and unlocks Refill Blocks', () => {
        const gameState = makeGameState(unfinishedBoard());
        checkAchievementsAfterRemoval(gameState, 'human', 3, [...removed(3), plus1(), line('horizontal'), bomb()]);
        expect(gameState.accomplishedAchievements).toEqual([CHAIN_REACTION]);
        expect(gameState.humanPlayer.augmentations).toEqual([REFILL_BLOCK]);
    });

    it('does not award Chain Reaction for 2 special blocks', () => {
        const gameState = makeGameState(unfinishedBoard());
        checkAchievementsAfterRemoval(gameState, 'human', 3, [...removed(3), plus1(), bomb()]);
        expect(gameState.accomplishedAchievements).toEqual([]);
    });

    it('awards "You call that a refill?" for a group of 2 with a refill, and unlocks Refill Blocks for the computer', () => {
        const gameState = makeGameState(unfinishedBoard());
        checkAchievementsAfterRemoval(gameState, 'human', 2, [...removed(2), refill()]);
        expect(gameState.accomplishedAchievements).toEqual([REFILL_NOT_LIKE_THAT]);
        expect(gameState.computerPlayer.augmentations).toEqual([REFILL_BLOCK]);
    });

    it('awards "You call that an explosion?" for a group of 2 with a bomb, and unlocks Bomb Blocks for the computer', () => {
        const gameState = makeGameState(unfinishedBoard());
        checkAchievementsAfterRemoval(gameState, 'human', 2, [...removed(2), bomb()]);
        expect(gameState.accomplishedAchievements).toEqual([BOMB_NOT_LIKE_THAT]);
        expect(gameState.computerPlayer.augmentations).toEqual([BOMB_BLOCK]);
    });

    it('does not award Taste the Rainbow when a color is missing, or the board is not finished', () => {
        const missingOne = makeGameState(boardWithFirstRow(BLOCK_COLORS.slice(1).map(regular)));
        checkAchievementsAfterRemoval(missingOne, 'human', 2, removed(2));
        expect(missingOne.accomplishedAchievements).not.toContain(EVERY_COLOR_LEFT);

        const notFinished = makeGameState(boardWithFirstRow([...BLOCK_COLORS.map(regular), regular(BLOCK_COLORS[0])]));
        notFinished.humanPlayer.board.blocks[10] = regular(BLOCK_COLORS[0]); // under the first block: a valid move
        checkAchievementsAfterRemoval(notFinished, 'human', 2, removed(2));
        expect(notFinished.accomplishedAchievements).toEqual([]);
    });

    it('awards Big Group! for removing 20 or more regular blocks at once', () => {
        const gameState = makeGameState(unfinishedBoard());
        checkAchievementsAfterRemoval(gameState, 'human', 19, removed(19));
        expect(gameState.accomplishedAchievements).toEqual([]);
        checkAchievementsAfterRemoval(gameState, 'human', 20, removed(20));
        expect(gameState.accomplishedAchievements).toEqual([GROUP_20]);
    });

    it('unlocks Greedy for the computer when Big Group! is awarded', () => {
        const gameState = makeGameState(unfinishedBoard());
        checkAchievementsAfterRemoval(gameState, 'human', 20, removed(20));
        expect(gameState.computerPlayer.augmentations).toEqual([GREEDY]);
        expect(gameState.humanPlayer.augmentations).toEqual([]);
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

    it('returns a notification for each achievement awarded and each Augmentation unlocked', () => {
        const gameState = makeGameState(boardWithFirstRow([regular('red'), regular('blue')]));
        expect(checkAchievementsAfterRemoval(gameState, 'human', 2, removed(2))).toEqual([
            { kind: 'achievement', achievement: FIRST_CLEAR },
            { kind: 'augmentation', augmentation: PLUS1_BLOCK, player: 'human' },
        ]);
    });

    it('returns nothing when nothing new is awarded', () => {
        const gameState = makeGameState(boardWithFirstRow([regular('red'), regular('blue')]));
        checkAchievementsAfterRemoval(gameState, 'human', 2, removed(2));
        expect(checkAchievementsAfterRemoval(gameState, 'human', 2, removed(2))).toEqual([]);
    });

    it('only notifies about the achievement when it unlocks nothing new', () => {
        const gameState = makeGameState(unfinishedBoard());
        gameState.humanPlayer.totalScore = 1000;
        gameState.humanPlayer.augmentations = [LINE_BLOCK]; // already unlocked, so Score 1000! unlocks nothing new
        expect(checkAchievementsAfterRemoval(gameState, 'human', 2, removed(2))).toEqual([
            { kind: 'achievement', achievement: SCORE_1000 },
        ]);
    });

    it('awards Score 1000! and unlocks Line Blocks for the human player', () => {
        const gameState = makeGameState(unfinishedBoard());
        gameState.humanPlayer.totalScore = 1000;
        checkAchievementsAfterRemoval(gameState, 'human', 3, removed(3));
        expect(gameState.accomplishedAchievements).toEqual([SCORE_1000]);
        expect(gameState.humanPlayer.augmentations).toEqual([LINE_BLOCK]);
    });

    it.each(['horizontal', 'vertical'] as const)(
        'awards "You call that a line?" for a group of 2 with a %s line block, and unlocks Line Blocks for the computer',
        (direction) => {
            const gameState = makeGameState(unfinishedBoard());
            checkAchievementsAfterRemoval(gameState, 'human', 2, [...removed(2), line(direction)]);
            expect(gameState.accomplishedAchievements).toEqual([LINE_NOT_LIKE_THAT]);
            expect(gameState.computerPlayer.augmentations).toEqual([LINE_BLOCK]);
            expect(gameState.humanPlayer.augmentations).toEqual([]);
        },
    );

    it('does not award "You call that a line?" for a bigger group with a line block', () => {
        const gameState = makeGameState(unfinishedBoard());
        checkAchievementsAfterRemoval(gameState, 'human', 3, [...removed(3), line('vertical')]);
        expect(gameState.accomplishedAchievements).toEqual([]);
    });

    it('does not award achievements for the computer player', () => {
        const gameState = makeGameState(undefined, boardWithFirstRow([regular('red'), regular('blue')]));
        checkAchievementsAfterRemoval(gameState, 'computer', 2, [...removed(2), plus1()]);
        expect(gameState.accomplishedAchievements).toEqual([]);
    });
});
