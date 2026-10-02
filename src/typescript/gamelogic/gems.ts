import type { GameNotification } from '../types/GameNotification';
import type { GameState } from '../types/GameState';
import type { PlayerId } from '../types/PlayerId';
import {
    COMPUTER_MILESTONE_FIRST_BOARD,
    COMPUTER_MILESTONE_GEMS,
    GEM_GOAL_INCREASE,
    SPOTLESS_GEMS,
} from '../data/gems';
import { isEmptyBlock } from './board/blocks';
import { getPlayerState } from './getPlayerState';

/**
 * Awards Gems for the goals that earn them when a board is finished (achievement Gems are awarded with the
 * achievement). Each goal can be earned again and again, but the board score goal and the computer's milestones get
 * further away each time.
 */

/**
 * Awards the Gems earned by finishing a board. Call this when a player's board has just become finished.
 * - Human: a Gem if the board score reached the goal (the goal then goes up), and a Gem if no blocks are left
 * - Computer: a Gem when it finishes its 10th board, then its 20th, 40th, 80th, ...
 *
 * @param gameState - The game state (updated in place)
 * @param player - The player whose board was just finished
 * @returns Notifications for the Gems earned (empty if none)
 */
export function awardBoardFinishedGems(gameState: GameState, player: PlayerId): GameNotification[] {
    const playerState = getPlayerState(gameState, player);
    const notifications: GameNotification[] = [];
    const award = (amount: number, source: 'boardGoal' | 'spotless' | 'computerMilestone', detail: number) => {
        gameState.wallet.gems += amount;
        notifications.push({ kind: 'gems', amount, source, detail });
    };

    if (player === 'human') {
        const goal = gameState.gemGoalBoardScore;
        if (playerState.boardScore >= goal) {
            award(1, 'boardGoal', goal);
            gameState.gemGoalBoardScore = goal + GEM_GOAL_INCREASE;
        }
        if (playerState.board.blocks.every(isEmptyBlock)) {
            award(SPOTLESS_GEMS, 'spotless', 0);
        }
    } else if (isComputerMilestone(playerState.boardNumber)) {
        award(COMPUTER_MILESTONE_GEMS, 'computerMilestone', playerState.boardNumber);
    }
    return notifications;
}

/**
 * Determines whether finishing this many boards is one of the computer player's milestones: the first milestone, or
 * that number doubled any number of times (10, 20, 40, 80, ...).
 *
 * @param boardsFinished - How many boards the computer player has finished
 * @returns True if it is a milestone
 */
export function isComputerMilestone(boardsFinished: number): boolean {
    let milestone = COMPUTER_MILESTONE_FIRST_BOARD;
    while (milestone < boardsFinished) milestone *= 2;
    return milestone === boardsFinished;
}
