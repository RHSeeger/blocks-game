// Tests for createNextBoardButton in board.ts

import { createNextBoardButton } from '../../src/typescript/ui/PlayerComponent';
import { Cube } from '../../src/typescript/gamelogic/Cube';
import type { PlayerState } from '../../src/typescript/PlayerState';
import { BoardState } from '../../src/typescript/gamelogic/BoardState';

describe('createNextBoardButton', () => {
    let board: HTMLElement;
    let cubesArr: any[];
    let unlockedUnlocks: { internalName: string }[];
    let playerState: PlayerState;
    beforeEach(() => {
        document.body.innerHTML = '';
        board = document.createElement('div');
        board.id = 'human-board';
        document.body.appendChild(board);
        cubesArr = Array.from({ length: 100 }, () => new Cube('red'));
        unlockedUnlocks = [];
        playerState = {
            board: new BoardState(cubesArr),
            totalScore: 0,
            boardScore: 0,
            maxBoardScore: 0,
            boardNumber: 1,
        };
        // Mock window.gameState for updatePlayerComponent
        (window as any).gameState = {
            unlockedUnlocks,
            humanPlayer: { board: { cubes: cubesArr, applyGravity: jest.fn() } },
        };
    });

    it('creates a button element with correct text and attaches to DOM', () => {
        const onBoardAdvance = jest.fn();
        createNextBoardButton(board, cubesArr, unlockedUnlocks, playerState, onBoardAdvance);
        const btn = document.getElementById('next-board-btn');
        expect(btn).toBeInstanceOf(HTMLButtonElement);
        expect(btn?.textContent?.toLowerCase()).toContain('next board');
    });

    it('calls onBoardAdvance with new cubes and board number when clicked', () => {
        const onBoardAdvance = jest.fn();
        createNextBoardButton(board, cubesArr, unlockedUnlocks, playerState, onBoardAdvance);
        const btn = document.getElementById('next-board-btn') as HTMLButtonElement;
        btn.click();
        expect(onBoardAdvance).toHaveBeenCalledTimes(1);
        const [newCubes, newBoardNumber] = onBoardAdvance.mock.calls[0];
        expect(Array.isArray(newCubes)).toBe(true);
        expect(typeof newBoardNumber).toBe('number');
        expect(newBoardNumber).toBe(playerState.boardNumber + 1);
    });

    it('removes the button from DOM after click', () => {
        const onBoardAdvance = jest.fn();
        createNextBoardButton(board, cubesArr, unlockedUnlocks, playerState, onBoardAdvance);
        const btn = document.getElementById('next-board-btn') as HTMLButtonElement;
        btn.click();
        expect(document.getElementById('next-board-btn')).toBeNull();
    });
});
