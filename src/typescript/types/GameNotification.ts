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
 *     - `tidy`: the human finished a board with `detail` blocks left, few enough to be tidy (see TIDY_BLOCKS_LEFT)
 *     - `spotless`: the human finished a board with no blocks left
 *     - `computerMilestone`: the computer finished its `detail`th board
 * - `awayProgress`: the computer player caught up on time away. `awayMs` is how long it was away, `playMs` how much
 *   full-speed play that was worth (it plays slower the longer it's away; see getAwayPlayMs), `capped` whether the time
 *   away went past the most that counts (AWAY_MAX_MS), and `boards`, `score` and `gems` what the computer finished and
 *   earned (its score is also the Chips earned)
 * - `cleanupBonus`: a player's board just ended with few enough blocks left to earn the clean-up bonus: `points` were
 *   added to their score, `percent` of their board score, for `blocksLeft` blocks left. Like `blocksRemoved`, it's
 *   shown on the board rather than as a pop-up
 * - `blocksRemoved`: a player removed a group. This one isn't a pop-up: the UI uses it to show the move on the board
 *   (the removed blocks disappearing, the rest sliding into place, and the score floating up). `clicked` is the block
 *   that was clicked, `removed` every index that was removed, `score` the score earned, `cameFrom`, for each space
 *   on the settled board, the index its block was at before the move (-1 for an empty space), and `added` the spaces a
 *   refill block filled with new blocks after the board settled (empty if the move didn't set one off)
 */
export type GameNotification =
    | { kind: 'achievement'; achievement: string }
    | { kind: 'cleanupBonus'; player: PlayerId; blocksLeft: number; percent: number; points: number }
    | {
          kind: 'awayProgress';
          awayMs: number;
          playMs: number;
          capped: boolean;
          boards: number;
          score: number;
          gems: number;
      }
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
    | { kind: 'gems'; amount: number; source: 'boardGoal' | 'tidy' | 'spotless' | 'computerMilestone'; detail: number };
