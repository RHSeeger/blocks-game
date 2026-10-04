import { checkAchievementsAfterRemoval } from '../../src/typescript/gamelogic/achievements';
import {
    BLAST_NOT_LIKE_THAT,
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
    SPOTLESS_5,
    TIDY_BOARD,
} from '../../src/typescript/data/achievements';
import {
    BOMB_BLOCK,
    COLOR_BLAST_BLOCK,
    GREEDY,
    LINE_BLOCK,
    PLUS1_BLOCK,
    REFILL_BLOCK,
    TIDY,
} from '../../src/typescript/data/augmentations';
import { BLOCK_COLORS } from '../../src/typescript/data/board';
import type { Block } from '../../src/typescript/types/Block';
import {
    bigBomb,
    boardWith,
    boardWithFirstRow,
    bomb,
    colorBlast,
    line,
    makeGameState,
    plus1,
    plus2,
    refill,
    regular,
} from '../helpers/testBoards';

/**
 * Tests for awarding achievements, and the Augmentations they unlock.
 */

/** A board that still has a valid move, so First Board Clear is not awarded */
const unfinishedBoard = () => boardWithFirstRow([regular('red'), regular('red')]);

/**
 * A finished board (no valid moves) with 3 blocks left: it earns First Board Clear, but not Tidy (2 or fewer left).
 * Changed 2026-10-03: the tests using it used to have 2 blocks left, which now also earns Tidy
 */
const finishedBoard = () => boardWithFirstRow([regular('red'), regular('blue'), regular('green')]);

/** Creates the given number of regular blocks, as if they had been removed */
const removed = (count: number): Block[] => Array.from({ length: count }, () => regular('red'));

describe('checkAchievementsAfterRemoval', () => {
    it('awards nothing for an ordinary removal', () => {
        const gameState = makeGameState(unfinishedBoard());
        checkAchievementsAfterRemoval(gameState, 'human', 3, removed(3), []);
        expect(gameState.accomplishedAchievements).toEqual([]);
    });

    // Changed 2026-10-03: this board used to have 2 blocks left; that now also earns Tidy, so it has 3
    it('awards First Board Clear when the human player finishes a board, and unlocks +1 Blocks for them', () => {
        const gameState = makeGameState(boardWithFirstRow([regular('red'), regular('blue'), regular('green')]));
        checkAchievementsAfterRemoval(gameState, 'human', 2, removed(2), []);
        expect(gameState.accomplishedAchievements).toEqual([FIRST_CLEAR]);
        expect(gameState.humanPlayer.augmentations).toEqual([PLUS1_BLOCK]);
        expect(gameState.computerPlayer.augmentations).toEqual([]);
    });

    it('awards "No, not like that" for a group of 2 with a +1, and unlocks +1 Blocks for the computer', () => {
        const gameState = makeGameState(unfinishedBoard());
        checkAchievementsAfterRemoval(gameState, 'human', 2, [...removed(2), plus1()], [plus1()]);
        expect(gameState.accomplishedAchievements).toEqual([NO_NOT_LIKE_THAT]);
        expect(gameState.computerPlayer.augmentations).toEqual([PLUS1_BLOCK]);
        expect(gameState.humanPlayer.augmentations).toEqual([]);
    });

    it('counts a +2 as a +1, and a big bomb as a bomb, for the "let me show you" achievements', () => {
        const gameState = makeGameState(unfinishedBoard());
        checkAchievementsAfterRemoval(gameState, 'human', 2, [...removed(2), plus2(), bigBomb()], [plus2(), bigBomb()]);
        expect(gameState.accomplishedAchievements).toEqual([NO_NOT_LIKE_THAT, BOMB_NOT_LIKE_THAT]);
    });

    // Changed 2026-10-03: any special block the move set off used to count, including ones set off in a chain, far
    // from the pair. Now only special blocks touching the pair itself count
    it('does not count a special block the move set off in a chain, away from the pair', () => {
        const gameState = makeGameState(unfinishedBoard());
        checkAchievementsAfterRemoval(gameState, 'human', 2, [...removed(2), plus1(), bomb()], [plus1()]);
        expect(gameState.accomplishedAchievements).toEqual([NO_NOT_LIKE_THAT]);
    });

    it('does not award "No, not like that" for a bigger group with a +1', () => {
        const gameState = makeGameState(unfinishedBoard());
        checkAchievementsAfterRemoval(gameState, 'human', 3, [...removed(3), plus1()], [plus1()]);
        expect(gameState.accomplishedAchievements).toEqual([]);
    });

    // Changed 2026-10-03: a spotless board now also earns Tidy (no blocks left is 2 or fewer)
    it('awards Spotless when the board is finished with no blocks left, and unlocks Color Blast Blocks', () => {
        const gameState = makeGameState(boardWith());
        checkAchievementsAfterRemoval(gameState, 'human', 2, removed(2), []);
        expect(gameState.accomplishedAchievements).toEqual([FIRST_CLEAR, CLEARED_BOARD, TIDY_BOARD]);
        expect(gameState.humanPlayer.augmentations).toEqual([PLUS1_BLOCK, COLOR_BLAST_BLOCK]);
    });

    it('awards Tidy when the board is finished with 2 blocks left (special blocks count), and unlocks Tidy for the computer', () => {
        const gameState = makeGameState(boardWithFirstRow([regular('red'), plus1()]));
        checkAchievementsAfterRemoval(gameState, 'human', 2, removed(2), []);
        expect(gameState.accomplishedAchievements).toContain(TIDY_BOARD);
        expect(gameState.accomplishedAchievements).not.toContain(CLEARED_BOARD);
        expect(gameState.computerPlayer.augmentations).toEqual([TIDY]);
    });

    it('awards Spotless x5 (10 Gems, no unlock) once 5 boards have been finished spotless', () => {
        const gameState = makeGameState(boardWith());
        gameState.accomplishedAchievements = [FIRST_CLEAR, CLEARED_BOARD, TIDY_BOARD];
        gameState.gameStats.spotlessBoards = 4;
        checkAchievementsAfterRemoval(gameState, 'human', 2, removed(2), []);
        expect(gameState.accomplishedAchievements).not.toContain(SPOTLESS_5);

        gameState.gameStats.spotlessBoards = 5;
        const notifications = checkAchievementsAfterRemoval(gameState, 'human', 2, removed(2), []);
        expect(notifications).toEqual([{ kind: 'achievement', achievement: SPOTLESS_5 }]);
        expect(gameState.wallet.gems).toBe(10);
    });

    it('does not award Tidy with 3 blocks left, or on a board that is not finished', () => {
        const threeLeft = makeGameState(boardWithFirstRow([regular('red'), regular('blue'), regular('green')]));
        checkAchievementsAfterRemoval(threeLeft, 'human', 2, removed(2), []);
        expect(threeLeft.accomplishedAchievements).not.toContain(TIDY_BOARD);

        const unfinished = makeGameState(unfinishedBoard());
        checkAchievementsAfterRemoval(unfinished, 'human', 2, removed(2), []);
        expect(unfinished.accomplishedAchievements).not.toContain(TIDY_BOARD);
    });

    it('awards "You call that a blast?" for a group of 2 with a Color Blast, and unlocks it for the computer', () => {
        const gameState = makeGameState(unfinishedBoard());
        checkAchievementsAfterRemoval(gameState, 'human', 2, [...removed(2), colorBlast()], [colorBlast()]);
        expect(gameState.accomplishedAchievements).toEqual([BLAST_NOT_LIKE_THAT]);
        expect(gameState.computerPlayer.augmentations).toEqual([COLOR_BLAST_BLOCK]);
    });

    it('does not award Spotless when a leftover special block remains', () => {
        const gameState = makeGameState(boardWithFirstRow([plus1()]));
        checkAchievementsAfterRemoval(gameState, 'human', 2, removed(2), []);
        expect(gameState.accomplishedAchievements).not.toContain(CLEARED_BOARD);
    });

    it('awards Taste the Rainbow when the board is finished with every color left, and unlocks Bomb Blocks', () => {
        const gameState = makeGameState(boardWithFirstRow(BLOCK_COLORS.map(regular)));
        checkAchievementsAfterRemoval(gameState, 'human', 2, removed(2), []);
        expect(gameState.accomplishedAchievements).toEqual([FIRST_CLEAR, EVERY_COLOR_LEFT]);
        expect(gameState.humanPlayer.augmentations).toEqual([PLUS1_BLOCK, BOMB_BLOCK]);
    });

    it('awards Chain Reaction for setting off 3 special blocks in one move, and unlocks Refill Blocks', () => {
        const gameState = makeGameState(unfinishedBoard());
        checkAchievementsAfterRemoval(
            gameState,
            'human',
            3,
            [...removed(3), plus1(), line('horizontal'), bomb()],
            [plus1(), line('horizontal'), bomb()],
        );
        expect(gameState.accomplishedAchievements).toEqual([CHAIN_REACTION]);
        expect(gameState.humanPlayer.augmentations).toEqual([REFILL_BLOCK]);
    });

    it('does not award Chain Reaction for 2 special blocks', () => {
        const gameState = makeGameState(unfinishedBoard());
        checkAchievementsAfterRemoval(gameState, 'human', 3, [...removed(3), plus1(), bomb()], [plus1(), bomb()]);
        expect(gameState.accomplishedAchievements).toEqual([]);
    });

    it('awards "You call that a refill?" for a group of 2 with a refill, and unlocks Refill Blocks for the computer', () => {
        const gameState = makeGameState(unfinishedBoard());
        checkAchievementsAfterRemoval(gameState, 'human', 2, [...removed(2), refill()], [refill()]);
        expect(gameState.accomplishedAchievements).toEqual([REFILL_NOT_LIKE_THAT]);
        expect(gameState.computerPlayer.augmentations).toEqual([REFILL_BLOCK]);
    });

    it('awards "You call that an explosion?" for a group of 2 with a bomb, and unlocks Bomb Blocks for the computer', () => {
        const gameState = makeGameState(unfinishedBoard());
        checkAchievementsAfterRemoval(gameState, 'human', 2, [...removed(2), bomb()], [bomb()]);
        expect(gameState.accomplishedAchievements).toEqual([BOMB_NOT_LIKE_THAT]);
        expect(gameState.computerPlayer.augmentations).toEqual([BOMB_BLOCK]);
    });

    it('does not award Taste the Rainbow when a color is missing, or the board is not finished', () => {
        const missingOne = makeGameState(boardWithFirstRow(BLOCK_COLORS.slice(1).map(regular)));
        checkAchievementsAfterRemoval(missingOne, 'human', 2, removed(2), []);
        expect(missingOne.accomplishedAchievements).not.toContain(EVERY_COLOR_LEFT);

        const notFinished = makeGameState(boardWithFirstRow([...BLOCK_COLORS.map(regular), regular(BLOCK_COLORS[0])]));
        notFinished.humanPlayer.board.blocks[10] = regular(BLOCK_COLORS[0]); // under the first block: a valid move
        checkAchievementsAfterRemoval(notFinished, 'human', 2, removed(2), []);
        expect(notFinished.accomplishedAchievements).toEqual([]);
    });

    it('awards Big Group! for removing 20 or more regular blocks at once', () => {
        const gameState = makeGameState(unfinishedBoard());
        checkAchievementsAfterRemoval(gameState, 'human', 19, removed(19), []);
        expect(gameState.accomplishedAchievements).toEqual([]);
        checkAchievementsAfterRemoval(gameState, 'human', 20, removed(20), []);
        expect(gameState.accomplishedAchievements).toEqual([GROUP_20]);
    });

    it('unlocks Greedy for the computer when Big Group! is awarded', () => {
        const gameState = makeGameState(unfinishedBoard());
        checkAchievementsAfterRemoval(gameState, 'human', 20, removed(20), []);
        expect(gameState.computerPlayer.augmentations).toEqual([GREEDY]);
        expect(gameState.humanPlayer.augmentations).toEqual([]);
    });

    // Score 2,500! was Score 1000! until scoring changed to size x size (2026-10-03); its internalName is still SCORE_1000
    it('awards Score 2,500! once the total score reaches 2500', () => {
        const gameState = makeGameState(unfinishedBoard());
        gameState.humanPlayer.totalScore = 2499;
        checkAchievementsAfterRemoval(gameState, 'human', 2, removed(2), []);
        expect(gameState.accomplishedAchievements).toEqual([]);
        gameState.humanPlayer.totalScore = 2500;
        checkAchievementsAfterRemoval(gameState, 'human', 2, removed(2), []);
        expect(gameState.accomplishedAchievements).toEqual([SCORE_1000]);
    });

    it('awards each achievement only once', () => {
        const gameState = makeGameState(finishedBoard());
        checkAchievementsAfterRemoval(gameState, 'human', 2, removed(2), []);
        checkAchievementsAfterRemoval(gameState, 'human', 2, removed(2), []);
        expect(gameState.accomplishedAchievements).toEqual([FIRST_CLEAR]);
        expect(gameState.humanPlayer.augmentations).toEqual([PLUS1_BLOCK]);
    });

    it('returns a notification for each achievement awarded and each Augmentation unlocked', () => {
        const gameState = makeGameState(finishedBoard());
        expect(checkAchievementsAfterRemoval(gameState, 'human', 2, removed(2), [])).toEqual([
            { kind: 'achievement', achievement: FIRST_CLEAR },
            { kind: 'augmentation', augmentation: PLUS1_BLOCK, player: 'human' },
        ]);
    });

    it('returns nothing when nothing new is awarded', () => {
        const gameState = makeGameState(finishedBoard());
        checkAchievementsAfterRemoval(gameState, 'human', 2, removed(2), []);
        expect(checkAchievementsAfterRemoval(gameState, 'human', 2, removed(2), [])).toEqual([]);
    });

    it('only notifies about the achievement when it unlocks nothing new', () => {
        const gameState = makeGameState(unfinishedBoard());
        gameState.humanPlayer.totalScore = 2500;
        gameState.humanPlayer.augmentations = [LINE_BLOCK]; // already unlocked, so Score 2,500! unlocks nothing new
        expect(checkAchievementsAfterRemoval(gameState, 'human', 2, removed(2), [])).toEqual([
            { kind: 'achievement', achievement: SCORE_1000 },
        ]);
    });

    it('awards Score 2,500! and unlocks Line Blocks for the human player', () => {
        const gameState = makeGameState(unfinishedBoard());
        gameState.humanPlayer.totalScore = 2500;
        checkAchievementsAfterRemoval(gameState, 'human', 3, removed(3), []);
        expect(gameState.accomplishedAchievements).toEqual([SCORE_1000]);
        expect(gameState.humanPlayer.augmentations).toEqual([LINE_BLOCK]);
    });

    it.each(['horizontal', 'vertical'] as const)(
        'awards "You call that a line?" for a group of 2 with a %s line block, and unlocks Line Blocks for the computer',
        (direction) => {
            const gameState = makeGameState(unfinishedBoard());
            checkAchievementsAfterRemoval(gameState, 'human', 2, [...removed(2), line(direction)], [line(direction)]);
            expect(gameState.accomplishedAchievements).toEqual([LINE_NOT_LIKE_THAT]);
            expect(gameState.computerPlayer.augmentations).toEqual([LINE_BLOCK]);
            expect(gameState.humanPlayer.augmentations).toEqual([]);
        },
    );

    it('does not award "You call that a line?" for a bigger group with a line block', () => {
        const gameState = makeGameState(unfinishedBoard());
        checkAchievementsAfterRemoval(gameState, 'human', 3, [...removed(3), line('vertical')], [line('vertical')]);
        expect(gameState.accomplishedAchievements).toEqual([]);
    });

    it('does not award achievements for the computer player', () => {
        const gameState = makeGameState(undefined, boardWithFirstRow([regular('red'), regular('blue')]));
        checkAchievementsAfterRemoval(gameState, 'computer', 2, [...removed(2), plus1()], [plus1()]);
        expect(gameState.accomplishedAchievements).toEqual([]);
    });
});
