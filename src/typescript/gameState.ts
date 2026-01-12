import type { PlayerState } from './PlayerState';
import type { Unlock } from './Unlock';
import type { Achievement } from './Achievement';
import type { GameStats } from './GameStats';

export type GameState = {
    humanPlayer: PlayerState;
    computerPlayer: PlayerState;
    unlockedUnlocks: Unlock[];
    accomplishedAchievements: Achievement[];
    gameStats: GameStats;
};
