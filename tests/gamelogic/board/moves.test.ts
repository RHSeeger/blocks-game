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
import { bigBomb, boardWith, boardWithFirstRow, bomb, line, plus1, plus2, regular } from '../../helpers/testBoards';

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

    it('reaches 2 spaces out when more than one +1 touches the group', () => {
        // Reds at 44/45, +1s at 46 and 54. 43 is 1 space away, 42 and 47 are 2 away, 41 is 3 away
        const blocks = boardWith({
            41: regular('blue'),
            42: regular('blue'),
            43: regular('green'),
            44: regular('red'),
            45: regular('red'),
            46: plus1(),
            47: regular('yellow'),
            54: plus1(),
        });
        expect(sorted(getMoveAt(blocks, 44))).toEqual([42, 43, 44, 45, 46, 47, 54]);
    });

    it('reaches 1 more space for each +1 touching the group: 3 reach 3 spaces out', () => {
        // Reds at 44/45, +1s at 46, 54 and 55. 41 is 3 spaces away, 40 is 4 away
        const blocks = boardWith({
            40: regular('blue'),
            41: regular('blue'),
            42: regular('blue'),
            43: regular('green'),
            44: regular('red'),
            45: regular('red'),
            46: plus1(),
            54: plus1(),
            55: plus1(),
        });
        expect(sorted(getMoveAt(blocks, 44))).toEqual([41, 42, 43, 44, 45, 46, 54, 55]);
    });

    it('reaches 2 spaces out on a board reported from play, with +1s touching different parts of the group', () => {
        // YBRBGGG
        // GOGRGOB
        // RG+RRBG
        // BGGRYYY
        // OB+RYRG
        // YYOBBOO
        const colors: Record<string, string> = { Y: 'yellow', B: 'blue', R: 'red', G: 'green', O: 'orange' };
        const rows = ['YBRBGGG', 'GOGRGOB', 'RG+RRBG', 'BGGRYYY', 'OB+RYRG', 'YYOBBOO'];
        const placements = Object.fromEntries(
            rows.flatMap((row, r) => [...row].map((ch, c) => [r * 10 + c, ch === '+' ? plus1() : regular(colors[ch])])),
        );
        const move = getMoveAt(boardWith(placements), 23);
        // Row 2: the G at column 1 and the G at column 6 are both 2 spaces from the red group
        expect(move).toEqual(expect.arrayContaining([21, 22, 23, 24, 25, 26]));
        expect(move).not.toContain(20); // 3 spaces from the group
    });

    it('reaches only 1 space out when a single +1 touches the group', () => {
        const blocks = boardWith({
            42: regular('blue'),
            43: regular('green'),
            44: regular('red'),
            45: regular('red'),
            46: plus1(),
            47: regular('yellow'),
        });
        expect(sorted(getMoveAt(blocks, 44))).toEqual([43, 44, 45, 46]);
    });

    it('uses a +1 that touches the area the move reaches, which adds 1 more to the reach (chain reaction)', () => {
        // Changed 2026-10-02: this +1 used to be ignored, because it doesn't touch the group itself. +1s now chain.
        // The +1 at 46 gives a reach of 1. The +1 at 25 is 2 spaces away, so it touches that area: reach becomes 2,
        // which adds the blue at 42. The blue at 41 is 3 spaces away
        const blocks = boardWith({
            25: plus1(),
            41: regular('blue'),
            42: regular('blue'),
            43: regular('green'),
            44: regular('red'),
            45: regular('red'),
            46: plus1(),
        });
        expect(sorted(getMoveAt(blocks, 44))).toEqual([25, 42, 43, 44, 45, 46]);
    });

    it('uses a +1 that falls inside the area the move reaches, instead of leaving it behind', () => {
        // + R R + + G G: the first two +1s touch the group (reach 2), which covers the third +1 (reach 3), which
        // covers the first G. The second G is 4 spaces away
        const blocks = boardWithFirstRow([
            plus1(),
            regular('red'),
            regular('red'),
            plus1(),
            plus1(),
            regular('green'),
            regular('green'),
        ]);
        expect(sorted(getMoveAt(blocks, 1))).toEqual([0, 1, 2, 3, 4, 5]);
    });

    it('keeps chaining while each new reach finds another +1', () => {
        // R R + + + + B: only the first +1 touches the group, but each one used brings the next into touch, so all four
        // are used (reach 4). The blue is 5 spaces from the group
        const blocks = boardWithFirstRow([
            regular('red'),
            regular('red'),
            plus1(),
            plus1(),
            plus1(),
            plus1(),
            regular('blue'),
        ]);
        expect(sorted(getMoveAt(blocks, 0))).toEqual([0, 1, 2, 3, 4, 5]);
    });

    it('does not use a +1 that is out of reach, even after chaining', () => {
        const blocks = boardWithFirstRow([regular('red'), regular('red'), plus1(), regular('blue'), plus1()]);
        // The +1 at 2 gives a reach of 1; the +1 at 4 is 3 spaces from the group
        expect(sorted(getMoveAt(blocks, 0))).toEqual([0, 1, 2]);
    });

    it('is not a move when a single block touches a +1 (valid-move rule, 2026-10-01)', () => {
        // The board used to get stuck here: one check called this a move, another refused the click
        const blocks = boardWithFirstRow([regular('red'), plus1(), regular('blue')]);
        expect(getMoveAt(blocks, 0)).toEqual([]);
        expect(isValidMove(blocks, 0)).toBe(false);
    });
});

describe('getMoveAt with line blocks', () => {
    // A 10x10 board: index = row * 10 + column. The group is the red pair at 44 and 45 (row 4)

    it('uses a horizontal line block touching the group, removing every block in its row', () => {
        const blocks = boardWith({
            44: regular('red'),
            45: regular('red'),
            46: line('horizontal'),
            40: regular('blue'),
            49: regular('green'),
            36: regular('yellow'), // touching the line block, but not in its row: stays
        });
        expect(sorted(getMoveAt(blocks, 44))).toEqual([40, 44, 45, 46, 49]);
    });

    it('uses a vertical line block touching the group, removing every block in its column', () => {
        const blocks = boardWith({
            44: regular('red'),
            45: regular('red'),
            54: line('vertical'),
            4: regular('blue'),
            94: regular('green'),
            55: regular('yellow'), // touching the group, but there's no +1, so it stays
        });
        expect(sorted(getMoveAt(blocks, 44))).toEqual([4, 44, 45, 54, 94]);
    });

    it('does not use a line block that does not touch the group', () => {
        const blocks = boardWith({
            44: regular('red'),
            45: regular('red'),
            47: line('horizontal'),
            40: regular('blue'),
        });
        expect(sorted(getMoveAt(blocks, 44))).toEqual([44, 45]);
    });

    it("chains into a +1 touching the line's row, which then reaches 1 space out from the group", () => {
        const blocks = boardWith({
            44: regular('red'),
            45: regular('red'),
            46: line('horizontal'),
            30: plus1(), // above 40, which is in the line's row
            34: regular('blue'), // touching the group: removed by the +1's reach
            40: regular('green'), // in the line's row
            20: regular('yellow'), // touching the +1, but not within reach of the group: stays
        });
        expect(sorted(getMoveAt(blocks, 44))).toEqual([30, 34, 40, 44, 45, 46]);
    });

    it("chains into another line block in the first one's line", () => {
        const blocks = boardWith({
            44: regular('red'),
            45: regular('red'),
            46: line('horizontal'),
            48: line('vertical'), // in row 4, so it's used, and removes column 8
            8: regular('blue'),
            98: regular('green'),
        });
        expect(sorted(getMoveAt(blocks, 44))).toEqual([8, 44, 45, 46, 48, 98]);
    });

    it('chains from a +1 into a line block within its reach', () => {
        const blocks = boardWith({
            44: regular('red'),
            45: regular('red'),
            43: plus1(), // touching the group: reach 1
            53: line('vertical'), // touching the +1, inside the reach: used, and removes column 3
            3: regular('blue'),
        });
        expect(sorted(getMoveAt(blocks, 44))).toEqual([3, 43, 44, 45, 53]);
    });

    it('scores the blocks in the line, but not the line block itself', () => {
        const blocks = boardWith({
            44: regular('red'),
            45: regular('red'),
            46: line('horizontal'),
            40: regular('blue'),
            49: regular('green'),
        });
        expect(getMoveScore(blocks, 44)).toBe(calculateGroupScore(4));
    });
});

describe('getMoveAt with bomb blocks', () => {
    // A 10x10 board: index = row * 10 + column. The group is the red pair at 44 and 45 (row 4)

    it('uses a bomb block touching the group, removing every block in the 3x3 square around it', () => {
        const blocks = boardWith({
            44: regular('red'),
            45: regular('red'),
            46: bomb(),
            // The bomb's square is rows 3-5, columns 5-7
            37: regular('blue'),
            57: regular('green'),
            56: regular('yellow'),
            38: regular('blue'), // just outside the square: stays
            48: regular('orange'), // just outside the square: stays
        });
        expect(sorted(getMoveAt(blocks, 44))).toEqual([37, 44, 45, 46, 56, 57]);
    });

    it("cuts the square off at the board's edge", () => {
        // The bomb is in the top-right corner (9): its square is rows 0-1, columns 8-9
        const blocks = boardWith({
            7: regular('red'),
            8: regular('red'),
            9: bomb(),
            19: regular('blue'),
            10: regular('green'),
        });
        expect(sorted(getMoveAt(blocks, 7))).toEqual([7, 8, 9, 19]);
    });

    it('does not use a bomb block that does not touch the group', () => {
        const blocks = boardWith({ 44: regular('red'), 45: regular('red'), 47: bomb(), 48: regular('blue') });
        expect(sorted(getMoveAt(blocks, 44))).toEqual([44, 45]);
    });

    it('chains into a line block inside its square', () => {
        const blocks = boardWith({
            44: regular('red'),
            45: regular('red'),
            46: bomb(),
            57: line('vertical'), // inside the bomb's square: used, and removes column 7
            97: regular('blue'),
        });
        expect(sorted(getMoveAt(blocks, 44))).toEqual([44, 45, 46, 57, 97]);
    });
});

describe('getMoveAt with +2 blocks and big bombs', () => {
    it('reaches 2 spaces out from the group with a +2', () => {
        // Red pair at 0 and 1; a +2 at 2. Blue at 3 is 2 spaces from the group (reached); green at 4 is 3 (not)
        const blocks = boardWithFirstRow([regular('red'), regular('red'), plus2(), regular('blue'), regular('green')]);
        expect(sorted(getMoveAt(blocks, 0))).toEqual([0, 1, 2, 3]);
    });

    it('adds up a +1 and a +2 to a reach of 3', () => {
        // Red pair at 0 and 1, a +1 at 10 (under 0) and a +2 at 2: 3 spaces, so the green at 4 is reached
        const blocks = boardWith({
            0: regular('red'),
            1: regular('red'),
            2: plus2(),
            10: plus1(),
            4: regular('green'),
            5: regular('yellow'), // 4 spaces away: not reached
        });
        expect(getMoveAt(blocks, 0)).toContain(4);
        expect(getMoveAt(blocks, 0)).not.toContain(5);
    });

    it('clears the 5x5 square around a big bomb', () => {
        // Red pair at 44 and 45 (row 4); a big bomb at 46: its square is rows 2-6, columns 4-8
        const blocks = boardWith({
            44: regular('red'),
            45: regular('red'),
            46: bigBomb(),
            24: regular('blue'), // the square's top-left corner
            68: regular('green'), // its bottom-right corner
            23: regular('yellow'), // just outside it: stays
            79: regular('orange'), // just outside it: stays
        });
        expect(sorted(getMoveAt(blocks, 44))).toEqual([24, 44, 45, 46, 68]);
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
