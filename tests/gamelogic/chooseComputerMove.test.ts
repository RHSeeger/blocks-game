import { chooseComputerMove, choosePlannedMove } from '../../src/typescript/gamelogic/chooseComputerMove';
import { isValidMove } from '../../src/typescript/gamelogic/board/moves';
import { GREEDY } from '../../src/typescript/data/augmentations';
import type { Board } from '../../src/typescript/types/Board';
import { boardWith, boardWithFirstRow, makeGameState, plus1, regular } from '../helpers/testBoards';

/**
 * Tests for how the computer player chooses its moves, with and without the Greedy Augmentation.
 */

/** A computer player with the given board and Augmentations */
const computerWith = (board: Board, augmentations: string[] = []) => {
    const computer = makeGameState(boardWith(), board).computerPlayer;
    computer.augmentations = augmentations;
    return computer;
};

/** Four groups, in index order: three pairs (red, blue, green) in the first row, then 5 yellows in row 5 */
const fourGroups = () =>
    boardWith({
        0: regular('red'),
        1: regular('red'),
        3: regular('blue'),
        4: regular('blue'),
        6: regular('green'),
        7: regular('green'),
        50: regular('yellow'),
        51: regular('yellow'),
        52: regular('yellow'),
        53: regular('yellow'),
        54: regular('yellow'),
    });

afterEach(() => {
    jest.restoreAllMocks();
});

describe('chooseComputerMove', () => {
    it('returns undefined when there are no valid moves', () => {
        const board = boardWithFirstRow([regular('red'), regular('blue')]);
        expect(chooseComputerMove(computerWith(board))).toBeUndefined();
        expect(chooseComputerMove(computerWith(board, [GREEDY]))).toBeUndefined();
    });

    it('chooses a valid move without Greedy', () => {
        const board = fourGroups();
        const choice = chooseComputerMove(computerWith(board));
        expect(choice).toBeDefined();
        expect(isValidMove(board, choice as number)).toBe(true);
    });

    // Changed 2026-10-03: Greedy used to pick the group worth the most points. It now plans: it saves up the most
    // common color (see choosePlannedMove), since with size x size scoring big groups are worth far more
    it('with Greedy, saves the most common color: clears a group of another color instead', () => {
        // A red pair and a group of 4 blues: blue is the most common color, so Greedy clears the reds
        const board = boardWith({
            0: regular('red'),
            1: regular('red'),
            50: regular('blue'),
            51: regular('blue'),
            52: regular('blue'),
            53: regular('blue'),
        });
        for (let i = 0; i < 20; i++) {
            expect(chooseComputerMove(computerWith(board, [GREEDY]))).toBe(0);
        }
    });

    it('with Greedy, of the groups it checks, clears the smallest one not of the saved color', () => {
        // With Math.random() always 0.99, the groups checked are the last 3: the yellows (the saved color), then the
        // green and blue pairs. The pairs are the same size, so it takes the first one checked (green)
        jest.spyOn(Math, 'random').mockReturnValue(0.99);
        expect(chooseComputerMove(computerWith(fourGroups(), [GREEDY]))).toBe(6);
    });

    it('with Greedy, only checks 3 groups', () => {
        // With Math.random() always 0, the groups checked are the first 3 (the pairs), so the yellows are never seen
        jest.spyOn(Math, 'random').mockReturnValue(0);
        expect(chooseComputerMove(computerWith(fourGroups(), [GREEDY]))).toBe(0);
    });
});

describe('choosePlannedMove', () => {
    it("doesn't waste a special block on a small group: clears one that sets none off", () => {
        // Blue (4) is saved. The red pair touches a +1; the green pair doesn't, so green is cleared
        const board = boardWith({
            0: regular('red'),
            1: regular('red'),
            2: plus1(),
            5: regular('green'),
            6: regular('green'),
            50: regular('blue'),
            51: regular('blue'),
            52: regular('blue'),
            53: regular('blue'),
        });
        expect(choosePlannedMove(board, [0, 5, 50])).toBe(5);
    });

    it('makes the move worth the most points when every group is the saved color or would set off a special block', () => {
        // Blue (4) is saved; the red pair touches a +1, so it isn't cleared as a quiet move. Nothing else is in the +1's
        // reach, so the reds are worth 4 points
        const board = boardWith({
            0: regular('red'),
            1: regular('red'),
            2: plus1(),
            50: regular('blue'),
            51: regular('blue'),
            52: regular('blue'),
            53: regular('blue'),
        });
        // The blues (16 points) are worth more than the reds (4 points)
        expect(choosePlannedMove(board, [0, 50])).toBe(50);
    });

    it('returns undefined when there are no candidates', () => {
        expect(choosePlannedMove(boardWith(), [])).toBeUndefined();
    });
});
