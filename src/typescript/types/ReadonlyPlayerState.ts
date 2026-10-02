import type { DeepReadonly } from './DeepReadonly';
import type { PlayerState } from './PlayerState';

/**
 * Defines ReadonlyPlayerState, the read-only version of one player's state that the UI receives.
 */

/**
 * The read-only version of one player's state that the UI receives.
 */
export type ReadonlyPlayerState = DeepReadonly<PlayerState>;
