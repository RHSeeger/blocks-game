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
 */
export type GameNotification =
    | { kind: 'achievement'; achievement: string }
    | { kind: 'augmentation'; augmentation: string; player: PlayerId }
    | { kind: 'gems'; amount: number; source: 'boardGoal' | 'spotless' | 'computerMilestone'; detail: number };
