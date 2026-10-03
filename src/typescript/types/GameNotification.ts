import type { PlayerId } from './PlayerId';

/**
 * Defines the GameNotification type: something that just happened that the player should be told about.
 */

/**
 * Something that just happened that the player should be told about. Game logic returns these from the change that
 * caused them, and sends them to the UI along with the game state. They are not stored in the game state: once shown,
 * they are gone.
 * - `achievement`: the human player accomplished an achievement (any Gems it gives are part of this notification)
 * - `augmentation`: a player unlocked an Augmentation
 * - `gems`: Gems were earned from a goal (not from an achievement). `source` says which goal:
 *     - `boardGoal`: the human finished a board with a board score of at least `detail`
 *     - `spotless`: the human finished a board with no blocks left
 *     - `computerMilestone`: the computer finished its `detail`th board
 * - `blocksRemoved`: a player removed a group. This one isn't a pop-up: the UI uses it to show the move on the board
 *   (the removed blocks disappearing, the rest sliding into place, and the score floating up). `clicked` is the block
 *   that was clicked, `removed` every index that was removed, `score` the score earned, and `cameFrom`, for each space
 *   on the settled board, the index its block was at before the move (-1 for an empty space)
 */
export type GameNotification =
    | { kind: 'achievement'; achievement: string }
    | {
          kind: 'blocksRemoved';
          player: PlayerId;
          clicked: number;
          removed: number[];
          score: number;
          cameFrom: number[];
      }
    | { kind: 'augmentation'; augmentation: string; player: PlayerId }
    | { kind: 'gems'; amount: number; source: 'boardGoal' | 'spotless' | 'computerMilestone'; detail: number };
