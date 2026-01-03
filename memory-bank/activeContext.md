Current Focus:
 Refactored board.ts to remove all module-level state; all state now managed in GameState/PlayerState/BoardState. Persistence and testability validated (build, lint, test all pass).
Recent Changes:
 - Removed all module-level variables from board.ts
 - Updated all usages to use GameState/PlayerState/BoardState
 - Ensured all state changes are persisted and testable
Open Questions:
