import type { PlayerState } from './playerState';
import type { Unlocks } from './unlocks';
import type { Achievement } from './achievement';
import type { GameStats } from './gameStats';

export type GameState = {
    humanPlayer: PlayerState;
    computerPlayer: PlayerState;
    unlockedUnlocks: Unlocks[];
    accomplishedAchievements: Achievement[];
    gameStats: GameStats;
};
