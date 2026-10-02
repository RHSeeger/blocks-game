import {
    getMoveAt,
    getMoveScore,
    getSameColorGroup,
    getValidGroupMoves,
    getValidMoves,
    isBoardFinished,
    isValidMove,
} from '../../../src/typescript/gamelogic/board/moves';
import { calculateGroupScore } from '../../../src/typescript/gamelogic/board/calculateGroupScore';
import { boardWith, boardWithFirstRow, plus1, regular } from '../../helpers/testBoards';

/**
 * Tests for the valid-move rules: which blocks form a group, what a move removes, and when a board is finished.
 */

const sorted = (indices: number[]) => [...indices].sort((a, b) => a - b);

describe('getSameColorGroup', () => {
    it('does not treat the end of one row and the start of the next as adjacent', () => {
        const blocks = boardWith({ 9: regular('red'), 10: regular('red') });
        expect(getSameColorGroup(blocks, 9)).toEqual([9]);
        expect(getSameColorGroup(blocks, 10)).toEqual([10]);
    });

    it("uses the board's own width to find neighbors", () => {
        // 3 columns: index 2 ends the first row, so 2 and 3 are not adjacent, but 2 and 5 (below it) are
        const board = boardWith({ 2: regular('red'), 3: regular('red'), 5: regular('red') }, 3, 3);
        expect(sorted(getSameColorGroup(board, 2))).toEqual([2, 5]);
        expect(getSameColorGroup(board, 3)).toEqual([3]);
    });

    it('includes vertically adjacent blocks', () => {
        const blocks = boardWith({ 35: regular('red'), 45: regular('red'), 55: regular('red') });
        expect(sorted(getSameColorGroup(blocks, 45))).toEqual([35, 45, 55]);
        expect(sorted(getSameColorGroup(blocks, 35))).toEqual([35, 45, 55]);
        expect(sorted(getSameColorGroup(blocks, 55))).toEqual([35, 45, 55]);
    });

    it('does not include blocks of another color, or blocks separated by another color', () => {
        const blocks = boardWithFirstRow([regular('red'), regular('red'), regular('blue'), regular('red')]);
        expect(sorted(getSameColorGroup(blocks, 1))).toEqual([0, 1]);
        expect(getSameColorGroup(blocks, 2)).toEqual([2]);
        expect(getSameColorGroup(blocks, 3)).toEqual([3]);
    });

    it('never includes special blocks', () => {
        const blocks = boardWith({ 44: regular('green'), 45: regular('green'), 54: plus1(), 34: regular('green') });
        expect(sorted(getSameColorGroup(blocks, 44))).toEqual([34, 44, 45]);
    });

    it('does not connect through a special block', () => {
        const blocks = boardWith({ 10: regular('yellow'), 11: plus1(), 20: plus1(), 21: regular('yellow') });
        expect(getSameColorGroup(blocks, 10)).toEqual([10]);
    });

    it('returns an empty array when starting on an empty space or a special block', () => {
        const blocks = boardWith({ 1: plus1() });
        expect(getSameColorGroup(blocks, 0)).toEqual([]);
        expect(getSameColorGroup(blocks, 1)).toEqual([]);
    });
});

describe('getMoveAt', () => {
    it('returns both blocks of a 2-block group', () => {
        const blocks = boardWithFirstRow([regular('red'), regular('red')]);
        expect(sorted(getMoveAt(blocks, 0))).toEqual([0, 1]);
    });

    it('returns nothing for a single block', () => {
        const blocks = boardWithFirstRow([regular('red'), regular('blue')]);
        expect(getMoveAt(blocks, 0)).toEqual([]);
    });

    it('returns nothing for an empty board', () => {
        expect(getMoveAt(boardWith(), 0)).toEqual([]);
    });

    it('adds a touching +1, and every regular block touching the group', () => {
        // B, G, G, R, R, +1, G, Y -- clicking R adds the +1, and the G touching the group (not the G touching only the +1)
        const blocks = boardWithFirstRow([
            regular('blue'),
            regular('green'),
            regular('green'),
            regular('red'),
            regular('red'),
            plus1(),
            regular('green'),
            regular('yellow'),
        ]);
        const move = getMoveAt(blocks, 3);
        expect(sorted(move)).toEqual([2, 3, 4, 5]);
        expect(move[0]).toBe(3); // the clicked block comes first
    });

    it('does not add empty spaces when a +1 expands the move', () => {
        const blocks = boardWithFirstRow([regular('red'), regular('red'), plus1()]);
        expect(sorted(getMoveAt(blocks, 0))).toEqual([0, 1, 2]);
    });

    it('is not a move when a single block touches a +1 (valid-move rule, 2026-10-01)', () => {
        // The board used to get stuck here: one check called this a move, another refused the click
        const blocks = boardWithFirstRow([regular('red'), plus1(), regular('blue')]);
        expect(getMoveAt(blocks, 0)).toEqual([]);
        expect(isValidMove(blocks, 0)).toBe(false);
    });
});

describe('isBoardFinished', () => {
    it('is finished when the board is empty', () => {
        expect(isBoardFinished(boardWith())).toBe(true);
    });

    it('is finished when only single blocks remain', () => {
        const blocks = boardWithFirstRow([regular('red'), regular('blue'), regular('green')]);
        expect(isBoardFinished(blocks)).toBe(true);
    });

    it('is not finished while a group of 2 exists', () => {
        const blocks = boardWithFirstRow([regular('red'), regular('red')]);
        expect(isBoardFinished(blocks)).toBe(false);
    });

    it('is finished when the only "move" is a single block touching a +1 (the old stuck board)', () => {
        const blocks = boardWithFirstRow([regular('red'), plus1(), regular('blue')]);
        expect(isBoardFinished(blocks)).toBe(true);
    });
});

describe('getValidGroupMoves', () => {
    it('returns one block from each valid group', () => {
        const blocks = boardWithFirstRow([
            regular('red'),
            regular('red'),
            regular('red'),
            regular('blue'),
            regular('green'),
            regular('green'),
        ]);
        expect(getValidGroupMoves(blocks)).toEqual([0, 4]);
    });

    it('returns nothing for a finished board', () => {
        expect(getValidGroupMoves(boardWithFirstRow([regular('red'), regular('blue')]))).toEqual([]);
    });
});

describe('getMoveScore', () => {
    it('scores the regular blocks the move removes', () => {
        const blocks = boardWithFirstRow([regular('red'), regular('red'), regular('red')]);
        expect(getMoveScore(blocks, 0)).toBe(calculateGroupScore(3));
    });

    it('counts the blocks a +1 adds, but not the +1 itself', () => {
        // The reds, plus the blue the +1 pulls in: 3 regular blocks
        const blocks = boardWithFirstRow([regular('blue'), regular('red'), regular('red'), plus1()]);
        expect(getMoveScore(blocks, 1)).toBe(calculateGroupScore(3));
    });

    it('is 0 for an invalid move', () => {
        expect(getMoveScore(boardWithFirstRow([regular('red'), regular('blue')]), 0)).toBe(0);
    });
});

describe('getValidMoves', () => {
    it('returns every block that is part of a valid move', () => {
        const blocks = boardWithFirstRow([regular('red'), regular('red'), regular('blue')]);
        expect(sorted(getValidMoves(blocks))).toEqual([0, 1]);
    });
});
