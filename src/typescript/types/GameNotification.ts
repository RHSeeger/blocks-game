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
 * - `awayProgress`: the computer player caught up on time away. `awayMs` is the time counted (up to AWAY_MAX_MS, which
 *   `capped` says it hit), and `boards`, `score` and `gems` what the computer finished and earned in that time (its
 *   score is also the Chips earned)
 * - `blocksRemoved`: a player removed a group. This one isn't a pop-up: the UI uses it to show the move on the board
 *   (the removed blocks disappearing, the rest sliding into place, and the score floating up). `clicked` is the block
 *   that was clicked, `removed` every index that was removed, `score` the score earned, `cameFrom`, for each space
 *   on the settled board, the index its block was at before the move (-1 for an empty space), and `added` the spaces a
 *   refill block filled with new blocks after the board settled (empty if the move didn't set one off)
 */
export type GameNotification =
    | { kind: 'achievement'; achievement: string }
    | { kind: 'awayProgress'; awayMs: number; capped: boolean; boards: number; score: number; gems: number }
    | {
          kind: 'blocksRemoved';
          player: PlayerId;
          clicked: number;
          removed: number[];
          score: number;
          cameFrom: number[];
          added: number[];
      }
    | { kind: 'augmentation'; augmentation: string; player: PlayerId }
    | { kind: 'gems'; amount: number; source: 'boardGoal' | 'spotless' | 'computerMilestone'; detail: number };
