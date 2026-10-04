import {
    chooseComputerMove,
    choosePlannedMove,
    chooseTidyMove,
    isEndgame,
} from '../../src/typescript/gamelogic/chooseComputerMove';
import { isValidMove } from '../../src/typescript/gamelogic/board/moves';
import { GREEDY, TIDY } from '../../src/typescript/data/augmentations';
import type { Board } from '../../src/typescript/types/Board';
import { boardWith, boardWithFirstRow, makeGameState, plus1, regular } from '../helpers/testBoards';

/**
 * Tests for how the computer player chooses its moves, with and without the Greedy and Tidy Augmentations.
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

/**
 * A row where looking ahead pays off: red, blue, red, red, blue, blue (from the given index). Red and blue tie for most
 * common, so Greedy saves red (the first found) and clears the blue pair: then the reds join, leaving red and blue (2
 * left; 4 + 4 points, +20%: 9.6). Clearing the red pair first joins the 3 blues instead, leaving 1 red (4 + 9 points,
 * +25%: 16.25)
 */
const lookAheadRow = (start: number) => ({
    [start]: regular('red'),
    [start + 1]: regular('blue'),
    [start + 2]: regular('red'),
    [start + 3]: regular('red'),
    [start + 4]: regular('blue'),
    [start + 5]: regular('blue'),
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

    it('with Tidy, near the end of a board, looks ahead instead of following Greedy', () => {
        // The look-ahead row along the bottom of a 10x10 board: 6 blocks, so it's near the end
        const board = boardWith(lookAheadRow(90));
        for (let i = 0; i < 10; i++) {
            expect(chooseComputerMove(computerWith(board, [GREEDY]))).toBe(94);
            expect(chooseComputerMove(computerWith(board, [GREEDY, TIDY]))).toBe(92);
            // Tidy works without Greedy too
            expect(chooseComputerMove(computerWith(board, [TIDY]))).toBe(92);
        }
    });
});

describe('isEndgame', () => {
    /** A 10x10 board with blocks in the first `count` spaces (alternating colors) */
    const boardWithBlocks = (count: number) =>
        boardWith(Object.fromEntries(Array.from({ length: count }, (_, i) => [i, regular(i % 2 ? 'red' : 'blue')])));

    it('is true once 30% of the spaces or fewer have blocks', () => {
        expect(isEndgame(boardWithBlocks(30))).toBe(true);
        expect(isEndgame(boardWithBlocks(5))).toBe(true);
    });

    it('is false while more than 30% of the spaces have blocks', () => {
        expect(isEndgame(boardWithBlocks(31))).toBe(false);
    });
});

describe('chooseTidyMove', () => {
    const row = () => boardWith(lookAheadRow(0), 6, 1);

    it('makes the move that ends the board with the most points, counting the clean-up bonus', () => {
        // Greedy would clear the blue pair (index 4); looking ahead, clearing the red pair (index 2) ends better
        expect(choosePlannedMove(row(), [2, 4])).toBe(4);
        expect(chooseTidyMove(row(), [2, 4], 0)).toBe(2);
        expect(chooseTidyMove(row(), [4, 2], 0)).toBe(2);
    });

    it('only chooses from the candidates it is given', () => {
        expect(chooseTidyMove(row(), [4], 0)).toBe(4);
    });

    it('returns undefined when there are no candidates', () => {
        expect(chooseTidyMove(row(), [], 0)).toBeUndefined();
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
