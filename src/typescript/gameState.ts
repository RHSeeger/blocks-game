import type { PlayerState } from './gamelogic/PlayerState';
import type { Unlock } from './gamelogic/Unlock';
import type { Achievement } from './Achievement';
import type { GameStatistics } from './gamelogic/GameStatistics';

export type GameState = {
    humanPlayer: PlayerState;
    computerPlayer: PlayerState;
    unlockedUnlocks: Unlock[];
    accomplishedAchievements: Achievement[];
    gameStats: GameStatistics;
};
