# Decision Log

A record of design and architecture decisions: what was decided, when, and why.

- `game-design.md` and `code-design.md` describe how things are **now**. This file records **how they got that way**.
- When a decision is made or changed, update the relevant design file **and** add an entry here.
- Entries are only ever added, never deleted. When a decision is replaced, change the old entry's **Status** to
  `Superseded by <date> — <title>` and add a new entry.
- Entries are in chronological order (newest at the bottom).

Entry format:

```markdown
## YYYY-MM-DD — Short title
**Decision:** What was decided.
**Why:** The reasoning behind it.
**Affects:** Which design files / areas of the code this touches.
**Status:** Active | Superseded by <date> — <title>
```

---

## 2025-12-09 — "Next Board" button only appears when the board is finished
**Decision:** The human player's "Next Board" button is shown only once the board has no removable groups left.
**Why:** The player should finish the board before moving on (leftover blocks are what the planned penalty is based on).
**Affects:** game-design.md (Board Behavior)
**Status:** Active
_(Carried over from the old CoPilot memory bank.)_

## 2025-12-09 — Finished boards are dimmed with a message on top
**Decision:** When a board is finished, it is dimmed (blocks still visible) and shows a "No more valid groups to
remove" message on top of it.
**Why:** Makes it obvious the board is done, while still letting the player see what was left.
**Affects:** game-design.md (Board Behavior); `src/css/styles.css` (`.inactive`)
**Status:** Active (was not working from some point until 2026-10-01; restored in the Phase 3 restructure)
_(Carried over from the old CoPilot memory bank.)_

## 2026-10-01 — Retire the CoPilot memory bank; use the design docs and this log instead
**Decision:** The `memory-bank/` files are no longer used. Still-relevant content was moved into `game-design.md`
and this file. From now on, decisions are recorded here and the design docs are kept current.
**Why:** The memory bank was CoPilot-specific, never loaded reliably, and had become stale and inaccurate (it described
files that no longer exist and features that were never implemented). Files in `design/` are visible to both the
developer and the AI, and their history can be tracked in git.
**Affects:** CLAUDE.md; `design/`; `memory-bank/` and `.github/instructions/` (removed)
**Status:** Active

## 2026-10-01 — Game logic owns the game state; the UI gets a read-only version; `window.gameState` is for the console only
**Decision:**
- The game state is owned by game logic, in `gamelogic/gameStateStore.ts`.
- Each game-logic entry point reads the state from the store, updates it, saves it to localStorage, then sends a
  read-only version (`DeepReadonly<GameState>`) through the bridge to the UI.
- `window.gameState` is a getter/setter alias onto the store. It exists only so the state can be read and changed from
  the browser console. No code reads it.
- The game state is plain data (no classes or methods).
- Values that can be calculated from the state (such as "is the board finished") are not stored in it.

**Why:**
- The old design said both "always read `window.gameState`" and "never read it; pass it in."
- Having game logic own the state, and pass a read-only copy out, makes the data flow explicit and stops the UI from
  changing state.
- The alias keeps the ability to cheat or debug from the console. Changing one field and replacing the whole object
  both work.
- Plain data is needed because `DeepReadonly` can't stop methods from changing an object, and because it makes saving
  and loading plain JSON.
- Calculated values aren't stored, so a console edit can never leave them out of date.

**Affects:** code-design.md (Game State, The Flow, all System sections)
**Status:** Active

## 2026-10-01 — Read-only state is typed with `DeepReadonly`, replacing the `*View` interfaces
**Decision:** The UI receives `ReadonlyGameState = DeepReadonly<GameState>`. The hand-written `bridge/*View.ts` interfaces
are removed.
**Why:** The hand-written views had to be kept in sync with the mutable types by hand, and they had drifted:
- there was no view for the game state as a whole
- one view exposed a mutable board
- several places bypassed them with `as any`

A generic type always matches `GameState`.
**Affects:** code-design.md (Game State, UI System); `types/`
**Status:** Active

## 2026-10-01 — Bridge rules
**Decision:**
- The UI and Game Logic each import only the Bridge. The Bridge is the only code that imports both.
- The Bridge contains no logic.
- UI → Bridge functions describe what the user did (`onBlockClicked(index)`, ...).
- Game Logic → Bridge is a single function, `gameStateChanged(state, derived)`.
- One way of communicating (function calls); no `window` CustomEvents.
- The resulting circular imports are accepted.

**Why:** The old Bridge section had its directions swapped, and contradicted the Game Logic section. The code mixed
direct calls with `window` events, and game logic lived in `bridge/`.
**Affects:** code-design.md (Bridge System, UI System, Game Logic System)
**Status:** Active

## 2026-10-01 — Folder layout
**Decision:** `src/typescript/` is organized as:
- `index.ts` (startup)
- `types/` (plain-data types)
- `data/` (fixed definitions)
- `gamelogic/`, containing `gameStateStore.ts`, `persistence.ts`, `gameLoop.ts`, `actions/` and `board/`
- `bridge/`
- `ui/`

Any code may import `types/` and `data/`. Tests mirror this layout.
**Why:** Save/load, startup, the game loop, data definitions and shared types had no designated home. They ended up
loose at the top of `src/typescript/`, or in the wrong system.
**Affects:** code-design.md (Folder Layout)
**Status:** Active

## 2026-10-01 — Terminology: Block, Score, Coins, Augmentation, Upgrade
**Decision:**
- The pieces on the board are **Blocks** (not cubes or bricks).
- **Score** is earned by removing blocks.
- **Coins** are spent on Upgrades.
- "Power-ups" is dropped: every description of power-ups matched Upgrades.
- "Unlock" is a verb, not a type; the things that get unlocked are **Augmentations**.

These terms are used in the docs, the code and the UI.
**Why:** The docs and code used several names for the same things (cube/block/brick, power-ups/Upgrades,
Unlocks/Augmentations, Upgrade Points/Stars/Coins).
**Affects:** game-design.md (Glossary and throughout); code naming (`Cube` → `Block`, `Unlock` → `Augmentation`, ...)
**Status:** Active

## 2026-10-01 — Achievements unlock Augmentations; Augmentations and Upgrades are per player
**Decision:**
- An Achievement can unlock an Augmentation for a specific player (human or computer).
- An Augmentation can have several Upgrades, which can only be bought once it is unlocked for that player.
- Some Upgrades are general, not tied to an Augmentation.
- Each Augmentation and Upgrade is defined once. Each player's state records which Augmentations they have and their
  level for each Upgrade.

**Why:**
- The human and the computer need to be able to have, and upgrade, things independently.
- Defining things once avoids duplicate definitions like `plus1Bricks` / `plus1Bricks_computer`.
- Matches the existing plan that unlocking a special block allows buying upgrades for it.

**Affects:** game-design.md (Achievements, Augmentations and Upgrades); `types/PlayerState`, `data/`
**Status:** Active

## 2026-10-01 — A valid move needs 2+ same-colored blocks; special blocks only add to a valid group
**Decision:**
- A move requires a group of 2 or more connected blocks of the same color. A single block touching a "+1" block is
  not a move.
- A board is finished when no valid move exists.
- One shared function decides this. Clicking, the computer player, and the board-finished check all use it.

**Why:** The code used three different checks that disagreed. The board could be "not finished" with no legal click,
which left the human board stuck. Rule A matches the existing click behavior and the "No, not like that" achievement.
**Affects:** game-design.md (Board Behavior); `gamelogic/board/`
**Status:** Active

## 2026-10-01 — Compile to ES2020
**Decision:** `tsconfig.json` targets ES2020 (was ES2016).
**Why:** ES2016 was missing commonly used features (`Array.flatMap`, `Object.entries`, `Object.fromEntries`, ...), so
the code needed workarounds. Every current browser supports ES2020.
**Affects:** `tsconfig.json`
**Status:** Active

## 2026-10-01 — "First Board Clear" means finishing a board, not removing every block
**Decision:** The First Board Clear achievement is earned when the human player finishes a board (no valid moves
left), even if blocks remain.
**Why:** Removing every block is rare with 5 colors on a 10x10 board. Requiring it would make the +1 Block
Augmentation (which this achievement unlocks) almost unreachable.
**Affects:** `data/achievements.ts` (description), `gamelogic/achievements.ts`
**Status:** Active
