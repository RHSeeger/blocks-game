import { takeComputerTurn } from '../../src/typescript/gamelogic/takeComputerTurn';
import { isValidMove } from '../../src/typescript/gamelogic/board/moves';
import { boardWith, boardWithFirstRow, makeGameState, regular } from '../helpers/testBoards';

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

    it('does not touch the human player', () => {
        const humanBlocks = boardWithFirstRow([regular('red'), regular('red')]);
        const gameState = makeGameState(humanBlocks, boardWithFirstRow([regular('red'), regular('red')]));
        takeComputerTurn(gameState);
        takeComputerTurn(gameState);
        expect(gameState.humanPlayer.board.blocks).toBe(humanBlocks);
        expect(gameState.humanPlayer.totalScore).toBe(0);
    });
});
