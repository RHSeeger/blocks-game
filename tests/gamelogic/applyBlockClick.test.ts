import { applyBlockClick } from '../../src/typescript/gamelogic/applyBlockClick';
import { calculateGroupScore } from '../../src/typescript/gamelogic/board/calculateGroupScore';
import { NO_NOT_LIKE_THAT } from '../../src/typescript/data/achievements';
import { boardWith, boardWithFirstRow, makeGameState, plus1, regular, rowColors } from '../helpers/testBoards';

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
        const blocks = gameState.humanPlayer.board.blocks;
        expect(gameState.humanPlayer.selectedIndices).toEqual([]);
        expect(rowColors(blocks, 0)).toEqual([null, null, null, null, null, null, null, null, null, null]);
        expect(rowColors(blocks, 9)).toEqual(['blue', 'green', 'green', 'yellow', null, null, null, null, null, null]);
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
        expect(rowColors(gameState.humanPlayer.board.blocks, 0).slice(0, 2)).toEqual(['red', 'blue']);
    });

    it.each([2, 3, 5, 10])('scores a removed group of %i blocks using calculateGroupScore', (size) => {
        const gameState = makeGameState(boardWithFirstRow(Array.from({ length: size }, () => regular('red'))));
        applyBlockClick(gameState, 'human', 0);
        applyBlockClick(gameState, 'human', 0);
        expect(gameState.humanPlayer.totalScore).toBe(calculateGroupScore(size));
        expect(gameState.humanPlayer.boardScore).toBe(calculateGroupScore(size));
        expect(gameState.humanPlayer.maxBoardScore).toBe(calculateGroupScore(size));
    });

    it('does not count special blocks toward the score', () => {
        // Three reds and a +1; nothing else on the board for the +1 to add
        const gameState = makeGameState(boardWithFirstRow([regular('red'), regular('red'), regular('red'), plus1()]));
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
