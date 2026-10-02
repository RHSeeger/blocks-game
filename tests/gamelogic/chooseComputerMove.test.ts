import { chooseComputerMove } from '../../src/typescript/gamelogic/chooseComputerMove';
import { isValidMove } from '../../src/typescript/gamelogic/board/moves';
import { GREEDY } from '../../src/typescript/data/augmentations';
import type { Block } from '../../src/typescript/types/Block';
import { boardWith, boardWithFirstRow, makeGameState, regular } from '../helpers/testBoards';

/**
 * Tests for how the computer player chooses its moves, with and without the Greedy Augmentation.
 */

/** A computer player with the given board and Augmentations */
const computerWith = (blocks: Block[], augmentations: string[] = []) => {
    const computer = makeGameState(boardWith(), blocks).computerPlayer;
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
        const blocks = boardWithFirstRow([regular('red'), regular('blue')]);
        expect(chooseComputerMove(computerWith(blocks))).toBeUndefined();
        expect(chooseComputerMove(computerWith(blocks, [GREEDY]))).toBeUndefined();
    });

    it('chooses a valid move without Greedy', () => {
        const blocks = fourGroups();
        const choice = chooseComputerMove(computerWith(blocks));
        expect(choice).toBeDefined();
        expect(isValidMove(blocks, choice as number)).toBe(true);
    });

    it('with Greedy, always picks the best group when there are no more groups than it checks', () => {
        // A red pair and a group of 4 blues: Greedy checks both, so it always picks the blues
        const blocks = boardWith({
            0: regular('red'),
            1: regular('red'),
            50: regular('blue'),
            51: regular('blue'),
            52: regular('blue'),
            53: regular('blue'),
        });
        for (let i = 0; i < 20; i++) {
            expect([50, 51, 52, 53]).toContain(chooseComputerMove(computerWith(blocks, [GREEDY])));
        }
    });

    it('with Greedy, only checks 3 groups', () => {
        // With Math.random() always 0, the groups checked are the first 3 (the pairs), so the yellows are never seen
        jest.spyOn(Math, 'random').mockReturnValue(0);
        expect(chooseComputerMove(computerWith(fourGroups(), [GREEDY]))).toBe(0);
    });

    it('with Greedy, picks the best of the groups it checks', () => {
        // With Math.random() always 0.99, the groups checked are the last 3: yellows, then green and blue pairs
        jest.spyOn(Math, 'random').mockReturnValue(0.99);
        expect(chooseComputerMove(computerWith(fourGroups(), [GREEDY]))).toBe(50);
    });
});
