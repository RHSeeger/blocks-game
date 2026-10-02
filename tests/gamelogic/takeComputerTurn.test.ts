import { takeComputerTurn } from '../../src/typescript/gamelogic/takeComputerTurn';
import { isValidMove } from '../../src/typescript/gamelogic/board/moves';
import { isEmptyBlock } from '../../src/typescript/gamelogic/board/blocks';
import { applyBlockClick } from '../../src/typescript/gamelogic/applyBlockClick';
import { PLUS1_BLOCK } from '../../src/typescript/data/augmentations';
import { NO_NOT_LIKE_THAT } from '../../src/typescript/data/achievements';
import { boardWith, boardWithFirstRow, makeGameState, plus1, regular } from '../helpers/testBoards';

/**
 * Tests for the computer player's turns.
 */

describe('takeComputerTurn', () => {
    it('selects a valid move when nothing is selected', () => {
        const gameState = makeGameState(boardWith(), boardWithFirstRow([regular('red'), regular('red')]));
        takeComputerTurn(gameState);
        const { selectedIndices, board } = gameState.computerPlayer;
        expect(selectedIndices.length).toBeGreaterThan(0);
        expect(isValidMove(board.blocks, selectedIndices[0])).toBe(true);
    });

    it('removes the selected group on the next turn', () => {
        const gameState = makeGameState(boardWith(), boardWithFirstRow([regular('red'), regular('red')]));
        takeComputerTurn(gameState);
        takeComputerTurn(gameState);
        expect(gameState.computerPlayer.selectedIndices).toEqual([]);
        expect(gameState.computerPlayer.totalScore).toBeGreaterThan(0);
    });

    it('moves on to the next board when the board is finished', () => {
        const gameState = makeGameState(boardWith(), boardWithFirstRow([regular('red'), regular('blue')]));
        gameState.computerPlayer.boardScore = 7;
        takeComputerTurn(gameState);
        expect(gameState.computerPlayer.boardNumber).toBe(2);
        expect(gameState.computerPlayer.boardScore).toBe(0);
        expect(gameState.computerPlayer.board.blocks.every((block) => block.color !== null)).toBe(true);
    });

    it('puts a +1 block on its next board once it has the +1 Blocks Augmentation', () => {
        const gameState = makeGameState(boardWith(), boardWithFirstRow([regular('red'), regular('blue')]));
        gameState.computerPlayer.augmentations = [PLUS1_BLOCK];
        takeComputerTurn(gameState);
        expect(gameState.computerPlayer.board.blocks.filter((block) => block.special === 'plus1')).toHaveLength(1);
    });

    it('uses +1 blocks: removing a group touching a +1 also removes the blocks touching that group', () => {
        // The only valid move is the two reds. The +1 next to them also removes the blue block under the first red
        const gameState = makeGameState(
            boardWith(),
            boardWith({ 0: regular('red'), 1: regular('red'), 2: plus1(), 10: regular('blue') }),
        );
        takeComputerTurn(gameState);
        takeComputerTurn(gameState);
        expect(gameState.computerPlayer.board.blocks.every(isEmptyBlock)).toBe(true);
    });

    it('gets +1 blocks after the human earns "No, not like that" (end to end)', () => {
        // Human: two reds next to a +1, plus another pair so the board isn't finished (no First Board Clear)
        const humanBlocks = boardWith({
            0: regular('red'),
            1: regular('red'),
            2: plus1(),
            90: regular('green'),
            91: regular('green'),
        });
        const gameState = makeGameState(humanBlocks, boardWithFirstRow([regular('red'), regular('blue')]));
        applyBlockClick(gameState, 'human', 0);
        applyBlockClick(gameState, 'human', 0);
        expect(gameState.accomplishedAchievements).toEqual([NO_NOT_LIKE_THAT]);

        takeComputerTurn(gameState);
        expect(gameState.computerPlayer.board.blocks.filter((block) => block.special === 'plus1')).toHaveLength(1);
    });

    it('does not touch the human player', () => {
        const humanBlocks = boardWithFirstRow([regular('red'), regular('red')]);
        const gameState = makeGameState(humanBlocks, boardWithFirstRow([regular('red'), regular('red')]));
        takeComputerTurn(gameState);
        takeComputerTurn(gameState);
        expect(gameState.humanPlayer.board.blocks).toBe(humanBlocks);
        expect(gameState.humanPlayer.totalScore).toBe(0);
    });
});
