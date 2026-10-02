import type { DeepReadonly } from './DeepReadonly';
import type { GameState } from './GameState';

/**
 * Defines ReadonlyGameState, the read-only version of the game state that the UI receives.
 */

/**
 * The read-only version of the game state that the UI receives.
 */
export type ReadonlyGameState = DeepReadonly<GameState>;
