# To Do

Known work that still needs doing: fixes, cleanup, and follow-ups. New features belong in `game-design.md`; this list
is for things that are known to be missing or wrong.

- Add an item when something is found that needs fixing but isn't being fixed right away.
- Remove an item when it's done (git history keeps the record). If finishing it involved a design decision, record that
  in `decisions.md`.

---

## Board size is hard-coded in the CSS
`styles.css` sets the board grid to `repeat(10, 40px)`, while the TypeScript uses the `BOARD_WIDTH`/`BOARD_HEIGHT`
constants in `data/board.ts`. Board size is meant to become upgradeable for each player (see the Upgrades list in
`game-design.md`), so the fix is more than moving the number:
- Store `width`/`height` on each `Board` in the game state. The constants become the starting size.
- Have the board functions (`getNeighborIndices`, `applyGravity`, `generateBlocks`, ...) take the size from the board
  instead of the constants.
- Have the UI set the grid size from the board (e.g. a `--board-columns` CSS variable), instead of the CSS hard-coding 10.
- Bump the save version in `gamelogic/persistence.ts`, since the saved board shape changes.

## Game statistics are never updated
`gameStats` (largest group removed, count of groups removed by size) is shown on the Stats tab but never changes. Update
it each time the human player removes a group.

## Old localStorage keys are left behind
Saves from before the 2026-10-01 restructure used the keys `blocksPlayerStats`, `blocksAchievements` and `blocksUnlocks`.
Nothing reads them any more. They're harmless, but could be removed from the browser's storage at startup.

## Bring older code in line with the style rules
Code written before 2026-10-01 may not follow the CLAUDE.md style rules (file-header order, TSDoc on every function,
one type per file). Fix these as files are touched.
