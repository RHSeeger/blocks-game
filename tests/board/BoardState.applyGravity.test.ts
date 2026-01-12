import { BoardState } from '../../src/typescript/BoardState';
import type { Cube } from '../../src/typescript/Cube';

describe('BoardState.applyGravity', () => {
    /*
     * Before:
     *  0 | red      | 10 |         | 20 | blue     | 30 |         | 40 | green    | ...
     *  ... all other cells null ...
     *
     * After gravity:
     *  70 | red     | 80 | blue    | 90 | green    | ...
     *  ... all above null ...
     */
    it('shifts cubes down to fill empty spaces in each column', () => {
        // Arrange: column 0 has cubes at rows 0, 2, 4; rest null
        const cubes: Cube[] = Array(100)
            .fill(null)
            .map(() => ({ color: null }));
        cubes[0] = { color: 'red' };
        cubes[20] = { color: 'blue' };
        cubes[40] = { color: 'green' };
        const board = new BoardState(cubes);
        // Act
        board.applyGravity();
        // Assert: column 0 should have green at row 9, blue at 8, red at 7
        expect(board.cubes[90].color).toBe('green');
        expect(board.cubes[80].color).toBe('blue');
        expect(board.cubes[70].color).toBe('red');
        for (let row = 0; row < 7; row++) {
            expect(board.cubes[row * 10].color).toBeNull();
        }
    });

    /*
     * 0  | red/plus1  |  ->  | ..7 rows..  |
     * 10 | blue       |      | ..blank..   |
     *    | ..6 rows.. |      | ..6 rows..  |
     * 80 | ..blank..  |      | red/plus1   |
     * 90 | ..blank..  |      | bluie       |
     */
    it('preserves special property when shifting', () => {
        const cubes: Cube[] = Array(100)
            .fill(null)
            .map(() => ({ color: null }));
        cubes[0] = { color: 'red', special: 'plus1' };
        cubes[10] = { color: 'blue' };
        const board = new BoardState(cubes);
        board.applyGravity();
        // After gravity, blue should be at the bottom, red/plus1 above
        expect(board.cubes[80].color).toBe('red');
        expect(board.cubes[80].special).toBe('plus1');
        expect(board.cubes[90].color).toBe('blue');
        expect(board.cubes[90].special).toBeUndefined();
        // All above should be null
        for (let row = 0; row < 8; row++) {
            expect(board.cubes[row * 10].color).toBeNull();
            expect(board.cubes[row * 10].special).toBeUndefined();
        }
    });

    /*
     * Before:
     *  70 | green   | 80 | blue    | 90 | red
     *  ... all above null ...
     *
     * After gravity:
     *  70 | green   | 80 | blue    | 90 | red
     *  ... all above null ...
     * (no change)
     */
    it('does nothing if all cubes are already at the bottom', () => {
        const cubes: Cube[] = Array(100)
            .fill(null)
            .map(() => ({ color: null }));
        cubes[90] = { color: 'red' };
        cubes[80] = { color: 'blue' };
        cubes[70] = { color: 'green' };
        const board = new BoardState(cubes);
        const before = JSON.stringify(board.cubes);
        board.applyGravity();
        expect(JSON.stringify(board.cubes)).toBe(before);
    });

    /*
     * Before:
     *  90 | red     | 91 |         | 92 | blue
     *  ... all above null ...
     *
     * After gravity:
     *  90 | red     | 91 | blue    | 92 | (null)
     *  ... all above null ...
     */
    it('moves cubes left to fill empty columns', () => {
        // Arrange: column 0 and 2 have cubes at bottom, column 1 is empty
        const cubes: Cube[] = Array(100)
            .fill(null)
            .map(() => ({ color: null }));
        cubes[90] = { color: 'red' }; // col 0, row 9
        cubes[92] = { color: 'blue' }; // col 2, row 9
        const board = new BoardState(cubes);
        // Act
        board.applyGravity();
        // Assert: red should be at 90, blue should move left to 91
        expect(board.cubes[90].color).toBe('red');
        expect(board.cubes[91].color).toBe('blue');
        expect(board.cubes[92].color).toBeNull();
    });

    /*
     * Before:
     *  80 | red     | 81 |         | 82 |         | ...
     *  90 |         | 91 |         | 92 | blue    | ...
     *  ... all other cells null ...
     *
     * After gravity:
     *  90 | red     | 91 | blue    | 92 | (null)
     *  ... all above null ...
     */
    it('moves cubes left and down to fill empty spaces', () => {
        // Arrange: col 0, row 8; col 2, row 9; col 1 empty
        const cubes: Cube[] = Array(100)
            .fill(null)
            .map(() => ({ color: null }));
        cubes[80] = { color: 'red' }; // col 0, row 8
        cubes[92] = { color: 'blue' }; // col 2, row 9
        const board = new BoardState(cubes);
        // Act
        board.applyGravity();
        // Assert: red should move to 90 (col 0, row 9), blue to 91 (col 1, row 9)
        expect(board.cubes[90].color).toBe('red');
        expect(board.cubes[91].color).toBe('blue');
        expect(board.cubes[92].color).toBeNull();
        expect(board.cubes[80].color).toBeNull();
    });

    /*
     * Before:
     *  90 |         | 91 |         | 92 | green
     *  ... all above null ...
     *
     * After gravity:
     *  90 | green   | 91 | (null)  | 92 | (null)
     *  ... all above null ...
     */
    it('moves cubes left twice for full collapse', () => {
        // Arrange: col 0 empty, col 1 empty, col 2 has cube at bottom
        const cubes: Cube[] = Array(100)
            .fill(null)
            .map(() => ({ color: null }));
        cubes[92] = { color: 'green' }; // col 2, row 9
        const board = new BoardState(cubes);
        // Act
        board.applyGravity();
        // Assert: green should move to 90 (col 0, row 9)
        expect(board.cubes[90].color).toBe('green');
        expect(board.cubes[91].color).toBeNull();
        expect(board.cubes[92].color).toBeNull();
    });
});
