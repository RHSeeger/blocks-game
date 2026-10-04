import { blockClicked } from '../../../src/typescript/gamelogic/actions/blockClicked';
import { setGameState } from '../../../src/typescript/gamelogic/gameStateStore';
import { loadGameState } from '../../../src/typescript/gamelogic/persistence';
import { gameStateChanged } from '../../../src/typescript/bridge/logicToUi';
import { FIRST_CLEAR, TIDY_BOARD } from '../../../src/typescript/data/achievements';
import { PLUS1_BLOCK, TIDY } from '../../../src/typescript/data/augmentations';
import { boardWithFirstRow, makeGameState, regular } from '../../helpers/testBoards';

/**
 * Tests for the blockClicked entry point: it changes the state, saves it, and sends it to the UI through the bridge.
 * The bridge is mocked, so these tests don't need the UI or the page (see design/code-design.md, "Bridge System").
 */

jest.mock('../../../src/typescript/bridge/logicToUi');

describe('blockClicked', () => {
    beforeEach(() => {
        localStorage.clear();
        jest.mocked(gameStateChanged).mockClear();
    });

    it('updates the game state in the store, saves it, and sends it to the UI', () => {
        const gameState = makeGameState(boardWithFirstRow([regular('red'), regular('red'), regular('blue')]));
        setGameState(gameState);

        blockClicked(0);

        expect(gameState.humanPlayer.selectedIndices).toHaveLength(2);
        expect(loadGameState()).toEqual(gameState);
        expect(gameStateChanged).toHaveBeenCalledTimes(1);
        expect(gameStateChanged).toHaveBeenCalledWith(
            gameState,
            expect.objectContaining({ boardFinished: { human: false, computer: true } }),
            [],
        );
    });

    it('sends what was just awarded to the UI', () => {
        setGameState(makeGameState(boardWithFirstRow([regular('red'), regular('red'), regular('blue')])));

        blockClicked(0);
        blockClicked(0); // finishes the board: First Board Clear, which unlocks +1 Blocks for the human

        // The move itself comes first (so the UI can show it), then what it awarded. The blue block at 2 falls to the
        // bottom row (92), then slides left to 90
        const cameFrom = Array.from({ length: 100 }, (_, index) => (index === 90 ? 2 : -1));
        expect(jest.mocked(gameStateChanged).mock.calls[1][2]).toEqual([
            { kind: 'blocksRemoved', player: 'human', clicked: 0, removed: [0, 1], score: 4, cameFrom, added: [] },
            // 1 block left (the blue) when the board ends: a 25% clean-up bonus on the board score of 4
            { kind: 'cleanupBonus', player: 'human', blocksLeft: 1, percent: 25, points: 1 },
            { kind: 'achievement', achievement: FIRST_CLEAR },
            { kind: 'augmentation', augmentation: PLUS1_BLOCK, player: 'human' },
            // Changed 2026-10-03: 1 block left also earns Tidy, which unlocks Tidy for the computer
            { kind: 'achievement', achievement: TIDY_BOARD },
            { kind: 'augmentation', augmentation: TIDY, player: 'computer' },
            // Changed 2026-10-03: a tidy board (1 block left) also earns the Tidy Gem
            { kind: 'gems', amount: 1, source: 'tidy', detail: 1 },
        ]);
    });

    it('reports the board as finished once the last group is removed', () => {
        setGameState(makeGameState(boardWithFirstRow([regular('red'), regular('red'), regular('blue')])));

        blockClicked(0);
        blockClicked(0);

        expect(jest.mocked(gameStateChanged).mock.calls[1][1].boardFinished).toEqual({ human: true, computer: true });
    });
});
