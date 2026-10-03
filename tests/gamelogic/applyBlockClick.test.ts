import { applyBlockClick } from '../../src/typescript/gamelogic/applyBlockClick';
import { calculateGroupScore } from '../../src/typescript/gamelogic/board/calculateGroupScore';
import { NO_NOT_LIKE_THAT } from '../../src/typescript/data/achievements';
import type { Board } from '../../src/typescript/types/Board';
import { BOMB_BLOCK, REFILL_BLOCK } from '../../src/typescript/data/augmentations';
import { BOMB_CHANCE, REFILL_CHANCE } from '../../src/typescript/data/upgrades';
import { boardWith, boardWithFirstRow, makeGameState, plus1, refill, regular, rowColors } from '../helpers/testBoards';

/**
 * Tests for clicking blocks: selecting, removing, scoring, and achievements.
 */

describe('applyBlockClick', () => {
    it('selects on the first click, and removes the selected group on a second click in the selection', () => {
        // B, G, G, R, R, +1, G, Y
        const gameState = makeGameState(
            boardWithFirstRow([
                regular('blue'),
                regular('green'),
                regular('green'),
                regular('red'),
                regular('red'),
                plus1(),
                regular('green'),
                regular('yellow'),
            ]),
        );

        applyBlockClick(gameState, 'human', 3);
        expect([...gameState.humanPlayer.selectedIndices].sort()).toEqual([2, 3, 4, 5]);

        applyBlockClick(gameState, 'human', 4);
        const board = gameState.humanPlayer.board;
        expect(gameState.humanPlayer.selectedIndices).toEqual([]);
        expect(rowColors(board, 0)).toEqual([null, null, null, null, null, null, null, null, null, null]);
        expect(rowColors(board, 9)).toEqual(['blue', 'green', 'green', 'yellow', null, null, null, null, null, null]);
    });

    it('removes the selected group even when the second click is on a block a +1 added', () => {
        const gameState = makeGameState(boardWithFirstRow([regular('green'), regular('red'), regular('red'), plus1()]));
        applyBlockClick(gameState, 'human', 1);
        applyBlockClick(gameState, 'human', 0); // the green block, added to the move by the +1
        expect(gameState.humanPlayer.board.blocks.every((block) => block.color === null && !block.special)).toBe(true);
    });

    it('clears the selection when clicking a block that is not a valid move', () => {
        const gameState = makeGameState(boardWithFirstRow([regular('red'), regular('red'), regular('blue')]));
        applyBlockClick(gameState, 'human', 0);
        applyBlockClick(gameState, 'human', 2);
        expect(gameState.humanPlayer.selectedIndices).toEqual([]);
    });

    it('clears a selection that is no longer valid, instead of removing anything', () => {
        const gameState = makeGameState(boardWithFirstRow([regular('red'), regular('blue')]));
        gameState.humanPlayer.selectedIndices = [0, 1]; // e.g. set from the console
        applyBlockClick(gameState, 'human', 0);
        expect(gameState.humanPlayer.selectedIndices).toEqual([]);
        expect(rowColors(gameState.humanPlayer.board, 0).slice(0, 2)).toEqual(['red', 'blue']);
    });

    // Changed 2026-10-03: these boards also have a spare green pair at the bottom, so removing the group doesn't finish
    // the board (finishing it with few blocks left would add the clean-up bonus, tested separately below)
    const withSparePair = (board: Board): Board => {
        board.blocks[90] = regular('green');
        board.blocks[91] = regular('green');
        return board;
    };

    it.each([2, 3, 5, 10])('scores a removed group of %i blocks using calculateGroupScore', (size) => {
        const gameState = makeGameState(
            withSparePair(boardWithFirstRow(Array.from({ length: size }, () => regular('red')))),
        );
        applyBlockClick(gameState, 'human', 0);
        applyBlockClick(gameState, 'human', 0);
        expect(gameState.humanPlayer.totalScore).toBe(calculateGroupScore(size));
        expect(gameState.humanPlayer.boardScore).toBe(calculateGroupScore(size));
        expect(gameState.humanPlayer.maxBoardScore).toBe(calculateGroupScore(size));
    });

    it('does not count special blocks toward the score', () => {
        // Three reds and a +1; nothing else on the board for the +1 to add
        const gameState = makeGameState(
            withSparePair(boardWithFirstRow([regular('red'), regular('red'), regular('red'), plus1()])),
        );
        applyBlockClick(gameState, 'human', 0);
        applyBlockClick(gameState, 'human', 0);
        expect(gameState.humanPlayer.totalScore).toBe(calculateGroupScore(3));
    });

    it('keeps the max board score when the board score is lower', () => {
        const gameState = makeGameState(boardWithFirstRow([regular('red'), regular('red')]));
        gameState.humanPlayer.maxBoardScore = 100;
        applyBlockClick(gameState, 'human', 0);
        applyBlockClick(gameState, 'human', 0);
        expect(gameState.humanPlayer.maxBoardScore).toBe(100);
    });

    it('checks for achievements after removing a group', () => {
        // The individual achievement rules are tested in achievements.test.ts
        // (Changed 2026-10-01: this used toEqual([NO_NOT_LIKE_THAT]). Removing the last group now also finishes the
        // board, which awards First Board Clear as well.)
        const gameState = makeGameState(boardWithFirstRow([regular('red'), regular('red'), plus1()]));
        applyBlockClick(gameState, 'human', 0);
        applyBlockClick(gameState, 'human', 0);
        expect(gameState.accomplishedAchievements).toContain(NO_NOT_LIKE_THAT);
    });

    it('does not award achievements for the computer player', () => {
        const gameState = makeGameState(boardWith(), boardWithFirstRow([regular('red'), regular('red'), plus1()]));
        applyBlockClick(gameState, 'computer', 0);
        applyBlockClick(gameState, 'computer', 0);
        expect(gameState.accomplishedAchievements).toEqual([]);
    });
});

describe('applyBlockClick: the clean-up bonus when a board ends', () => {
    it('adds 50% of the board score for a board cleared completely, to the score and the Coins', () => {
        const gameState = makeGameState(boardWithFirstRow([regular('red'), regular('red')]));
        gameState.humanPlayer.boardScore = 96; // 100 once the pair (4) is removed
        applyBlockClick(gameState, 'human', 0);
        const notifications = applyBlockClick(gameState, 'human', 0);

        expect(gameState.humanPlayer.boardScore).toBe(150);
        expect(gameState.humanPlayer.totalScore).toBe(4 + 50);
        expect(gameState.wallet.coins).toBe(4 + 50);
        expect(notifications).toContainEqual({
            kind: 'cleanupBonus',
            player: 'human',
            blocksLeft: 0,
            percent: 50,
            points: 50,
        });
    });

    it('adds a smaller bonus for a few blocks left, and none for more than the number of colors', () => {
        // A pair to remove, and 3 single blocks left behind: 3 left is +15%
        const threeLeft = makeGameState(
            boardWithFirstRow([regular('red'), regular('red'), regular('blue'), regular('green'), regular('blue')]),
        );
        threeLeft.humanPlayer.boardScore = 96;
        applyBlockClick(threeLeft, 'human', 0);
        applyBlockClick(threeLeft, 'human', 0);
        expect(threeLeft.humanPlayer.boardScore).toBe(100 + 15);

        // 6 single blocks left (more than the 5 colors): no bonus
        const sixLeft = makeGameState(
            boardWithFirstRow(
                ['red', 'red', 'blue', 'green', 'blue', 'green', 'blue', 'green'].map((color) => regular(color)),
            ),
        );
        sixLeft.humanPlayer.boardScore = 96;
        applyBlockClick(sixLeft, 'human', 0);
        const notifications = applyBlockClick(sixLeft, 'human', 0);
        expect(sixLeft.humanPlayer.boardScore).toBe(100);
        expect(notifications.some((n) => n.kind === 'cleanupBonus')).toBe(false);
    });

    it('counts the bonus toward the Gem goal', () => {
        const gameState = makeGameState(boardWithFirstRow([regular('red'), regular('red')]));
        gameState.gemGoalBoardScore = 140;
        gameState.humanPlayer.boardScore = 96; // 100 after the pair, 150 with the bonus: reaches the goal
        applyBlockClick(gameState, 'human', 0);
        applyBlockClick(gameState, 'human', 0);
        expect(gameState.gemGoalBoardScore).toBeGreaterThan(140);
    });

    it("applies to the computer player too, adding to the computer's Chips", () => {
        const gameState = makeGameState(boardWith(), boardWithFirstRow([regular('red'), regular('red')]));
        gameState.computerPlayer.boardScore = 96;
        applyBlockClick(gameState, 'computer', 0);
        applyBlockClick(gameState, 'computer', 0);
        expect(gameState.wallet.chips).toBe(4 + 50);
    });
});

describe('applyBlockClick with a refill block', () => {
    // Red, red, refill on the top row of an otherwise empty 10x10 board
    const refillBoardState = () => makeGameState(boardWithFirstRow([regular('red'), regular('red'), refill()]));

    it('fills every space on the board once the move is done, and says which spaces were filled', () => {
        const gameState = refillBoardState();
        applyBlockClick(gameState, 'human', 0);
        const [removal] = applyBlockClick(gameState, 'human', 0);

        expect(gameState.humanPlayer.board.blocks.some((block) => block.color === null && !block.special)).toBe(false);
        expect(removal.kind === 'blocksRemoved' && removal.added).toHaveLength(100);
    });

    it('never puts another refill block among the new blocks, but can bring other special blocks', () => {
        const gameState = refillBoardState();
        gameState.humanPlayer.augmentations = [REFILL_BLOCK, BOMB_BLOCK];
        // Very high chances, so the (scaled) chance of each is still over 100%
        gameState.humanPlayer.upgradeLevels = { [REFILL_CHANCE]: 1000, [BOMB_CHANCE]: 1000 };
        applyBlockClick(gameState, 'human', 0);
        applyBlockClick(gameState, 'human', 0);

        const specials = gameState.humanPlayer.board.blocks.map((block) => block.special);
        expect(specials).not.toContain('refill');
        expect(specials).toContain('bomb');
    });

    it('does not refill the board for a move without a refill block', () => {
        const gameState = makeGameState(boardWithFirstRow([regular('red'), regular('red'), regular('blue')]));
        applyBlockClick(gameState, 'human', 0);
        const [removal] = applyBlockClick(gameState, 'human', 0);
        expect(removal.kind === 'blocksRemoved' && removal.added).toEqual([]);
        expect(gameState.humanPlayer.board.blocks.filter((block) => block.color !== null)).toHaveLength(1);
    });
});
