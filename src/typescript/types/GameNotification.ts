import type { PlayerId } from './PlayerId';

/**
 * Defines the GameNotification type: something that just happened that the player should be told about.
 */

/**
 * Something that just happened that the player should be told about. Game logic returns these from the change that
 * caused them, and sends them to the UI along with the game state. They are not stored in the game state: once shown,
 * they are gone.
 * - `achievement`: the human player accomplished an achievement
 * - `augmentation`: a player unlocked an Augmentation
 */
export type GameNotification =
    | { kind: 'achievement'; achievement: string }
    | { kind: 'augmentation'; augmentation: string; player: PlayerId };
