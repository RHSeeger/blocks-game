# To Do

Known work that still needs doing: fixes, cleanup, follow-ups, and planned features that haven't been designed or
built yet. Once a feature is designed, its description belongs in `game-design.md`; this list only tracks that it
still needs doing.

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

---

# Planned features

## Achievements
- **Decide which achievement unlocks x2 Blocks.** x2 Blocks is defined in `data/augmentations.ts`, but nothing unlocks
  it, and the block itself isn't implemented yet.
- **A "No, not like that" for x2 Blocks:** an achievement, earned by the human using an x2 block badly, that unlocks
  x2 Blocks for the computer player (like the +1 version). The exact condition is still to be decided.
- **"Finished a board with at least one block of every color"** (left on the board when it's finished).
- **"Cleared a board":** finished a board with 0 blocks left.
- **Come up with more achievements, Augmentations and Upgrades.**

## Notifications
- **Tell the player when they accomplish an achievement.** Today the only sign is a change on the Achievements tab.
- **Tell the player when an Augmentation is unlocked** (for either player). Today the only sign is a change on the
  Augmentations tab.

Probably one shared notification (e.g. a pop-up that fades out, naming the achievement and what it unlocked). Since
values derived from the state aren't stored in it, game logic will need a way to tell the UI that something was just
awarded. Decide how when this is designed.

## Upgrades
- **+1 Blocks and x2 Blocks appear more often.** Probably a chance per board that goes up with each level. Above 100%,
  more than one can appear (e.g. 150% = one for sure, plus a 50% chance of a second).
- **The computer player moves more often,** followed by an "even more often" Upgrade. Still to decide: what unlocks
  it.
- **Greedy checks more groups** (already planned; see Greedy in `game-design.md`).
