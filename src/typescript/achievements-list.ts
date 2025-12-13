import type { Achievement } from "./achievement";

// Example achievements. Add more as needed.
export const ALL_ACHIEVEMENTS: Achievement[] = [
  {
    internalName: "score_1000",
    displayName: "Score 1000!",
    description: "Reach a total score of 1000 points."
  },
  {
    internalName: "group_20",
    displayName: "Big Group!",
    description: "Remove a group of 20 or more cubes at once."
  },
  {
    internalName: "first_clear",
    displayName: "First Board Clear",
    description: "Clear your first board.",
    unlocks: "plus1Bricks"
  }
];
