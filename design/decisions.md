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

## 2026-10-02 — Big Group! unlocks the Greedy Augmentation for the computer player
**Decision:**
- New Augmentation, **Greedy** (computer only), unlocked by Big Group!.
- With Greedy, the computer checks 3 different groups, chosen at random, and removes the one worth the most points
  (the first one checked, if there's a tie). Without it, the computer still picks a random move.
- Its planned Upgrade raises the number of groups checked, for a few levels, until the last level checks all of them.
- Augmentation definitions now list which players they can be unlocked for (`players`). The Augmentations tab only
  shows a status for those players.
- The score of a move is calculated in one place (`getMoveScore` in `gamelogic/board/moves.ts`), used both when a
  group is removed and when the computer compares moves.

**Why:** Fits the achievement ("the computer saw you do it"), and follows the pattern of "No, not like that". It also
gives a natural Upgrade path: a smarter computer was already on the Upgrades list, and this makes it a series of
levels instead of a single switch. Considered and not chosen: x2 Blocks for the human, and a score preview.
**Affects:** game-design.md (Augmentations, Current Achievements, Upgrades); `data/augmentations.ts`,
`data/achievements.ts`, `types/Augmentation.ts`, `gamelogic/chooseComputerMove.ts`, `ui/AugmentationsComponent.ts`
**Status:** Active

## 2026-10-02 — Notifications are returned by game logic and passed to the UI, not stored in the game state
**Decision:**
- Accomplishing an achievement, or unlocking an Augmentation, shows a pop-up that fades out after a few seconds
  (clicking it dismisses it).
- Game-logic functions that award things return `GameNotification`s. The entry point passes them to `publishGameState`,
  and the bridge's one function becomes `gameStateChanged(state, derived, notifications)`.
- Notifications are not stored in the game state. A notification that is still showing when the page is reloaded is
  not shown again.

**Why:**
- The UI only received the current state, which says *what* has been earned but not *that it just happened*.
- The UI can't keep the previous state to compare against (the UI stores no state), and the game state shouldn't hold
  a queue of pop-ups: the UI would then need a way to mark them as seen, and a console edit could leave it wrong.
- Returning them from the function that caused them is explicit and easy to test. Only `gameStateChanged` gets a new
  parameter, so it is still the single Game Logic → UI function.

**Affects:** code-design.md (The Flow, Bridge System, Notifications); game-design.md (Notifications);
`types/GameNotification.ts`, `gamelogic/achievements.ts`, `applyBlockClick.ts`, `takeComputerTurn.ts`,
`publishGameState.ts`, `bridge/logicToUi.ts`, `ui/NotificationsComponent.ts`
**Status:** Active

## 2026-10-02 — "Spotless" and "Taste the Rainbow" achievements
**Decision:**
- **Spotless:** finish a board with no blocks left. A leftover special block (such as a +1 that never touched a valid
  group) counts as a block, so it prevents this achievement.
- **Taste the Rainbow:** finish a board with at least one block of every color still on it.
- Both are checked when the human player's board becomes finished, and neither unlocks anything yet.

**Why:** Both were on the to-do list. "No blocks left" was taken literally (special blocks included), since leftover
blocks are what the planned end-of-board penalty is based on. What these should unlock is still open (see todo.md).
**Affects:** game-design.md (Current Achievements); `data/achievements.ts`, `gamelogic/achievements.ts`
**Status:** Active

## 2026-10-02 — Game statistics count regular blocks removed, for the human player only
**Decision:** Each time the human player removes a group, the Stats tab's "largest group" and "groups removed by size"
are updated. A group's size is the number of regular blocks removed, including blocks a +1 added, but not the +1
itself. The computer player's moves are not counted.
**Why:** The statistics were shown but never updated. Using the same count as scoring and the Big Group! achievement
keeps "size" meaning one thing everywhere.
**Affects:** game-design.md (Board Behavior, Stats tab); `gamelogic/gameStats.ts`, `gamelogic/applyBlockClick.ts`
**Status:** Active

## 2026-10-02 — Each board stores its own size; saves are upgraded, not discarded
**Decision:**
- `Board` now has `width` and `height`. Board functions take the board (not a bare array of blocks), and get the size
  from it. `data/board.ts` only has the starting size (10x10).
- A new board is the same size as the player's current one.
- The UI sets the grid's columns and rows from the board, with the `--board-columns` / `--board-rows` CSS variables.
- The save format is now version 2. Version 1 saves (no board size) are upgraded to 10x10 boards when loaded, instead
  of being thrown away. Future save format changes should do the same.

**Why:** Board size is meant to become upgradeable for each player, and the size was hard-coded in the CSS and in
global constants. Throwing away old saves would have reset every player's progress.
**Affects:** code-design.md (Game State); game-design.md (Board Behavior); `types/Board.ts`, `data/board.ts`,
`gamelogic/board/*`, `gamelogic/persistence.ts`, `ui/BoardComponent.ts`, `styles.css`
**Status:** Active, except "a new board is the same size as the player's current one": superseded by 2026-10-02 —
Currencies (Coins, Chips, Gems) and Upgrades (a new board's size now comes from the Bigger Board Upgrade); and "the
starting size (10x10)": superseded by 2026-10-03 — Smaller starting board for the human player; each player has its
own board sizes

## 2026-10-02 — Currencies (Coins, Chips, Gems) and Upgrades
**Decision:**
- Three currencies, in one shared wallet:
  - **Coins** are earned 1:1 with the human's Score and buy everyday Upgrades for the computer.
  - **Chips** are earned 1:1 with the computer's score and buy everyday Upgrades for the human.
  - **Gems** buy game-changing Upgrades for either player.
- Score is never spent.
- Gems come from achievements (2 each), a board-score goal that rises each time it's reached (starts at 175, +20),
  every Spotless board (1), and computer milestones that double each time (10th, 20th, 40th, ... board).
- Upgrades have a tier (`everyday` / `gameChanging`) that decides the currency. They have levels, a cost that scales
  per level, and an optional highest level, and can require an Augmentation.
- First Upgrades: +1 Block Chance (both players), Greedier (computer), Faster Computer (computer), Bigger Board (Gems,
  both players).
- +1 chance starts at 100% when unlocked (as before), +25% per level. Each full 100% is a guaranteed +1 block, and the
  remainder is the chance of one more.
- The UI gets what it needs to show Upgrades (cost, currency, can it be bought) from game logic, as
  `DerivedGameInfo.upgradeOffers`. Buying goes through a new bridge call, `onBuyUpgradeClicked(upgrade, player)`.
- The computer's turn delay is recalculated after every turn (a `setTimeout` chain, not `setInterval`), so Faster
  Computer takes effect straight away.
- Save version 3; older saves are upgraded with an empty wallet, plus the Gems for achievements already earned.

**Why:**
- Each player funding the other makes both halves of the game matter.
- Keeping Score unspent keeps it as a record, and keeps Score 1000! working.
- Making only Gems buy game-changing Upgrades, and only from goals that get harder, stops the computer's idle earnings
  from buying unlimited power.
- Gems still have no cap.
- The starting numbers came from a simulation: about 166 points per 10x10 board, and the computer earns about 10,000
  Chips an hour at the starting speed. They are expected to change after playtesting.

Considered and not chosen:
- each player spends its own currency on itself
- one shared Coin pot plus Gems
- spending Score directly
- Gems only from achievements

**Affects:** game-design.md (Glossary, Overview, Board Behavior, Currencies, Upgrades); code-design.md (Folder Layout,
UI System, Bridge System); `types/` (CurrencyId, Wallet, Upgrade, UpgradeOffer, GameState, PlayerState, Achievement,
GameNotification, DerivedGameInfo); `data/upgrades.ts`, `data/gems.ts`; `gamelogic/upgrades.ts`, `gems.ts`,
`createNewBoard.ts`, `gameLoop.ts`, `persistence.ts`, `actions/buyUpgrade.ts`; `ui/UpgradesComponent.ts`
**Status:** Active, except "the board-score goal starts at 175": superseded by 2026-10-03 — Smaller starting board for the human player; each player has its own board sizes

## 2026-10-02 — More than one +1 touching a group reaches 2 spaces out
**Decision:**
- When 2 or more +1 blocks touch a move's same-color group, the move removes every regular block up to 2 spaces away
  from the group (counted in steps up, down, left or right, passing through any space), instead of only the blocks
  touching it.
- 3 or more +1 blocks still reach 2 spaces. The limit is `MAX_PLUS1_REACH` in `data/board.ts`.
- Only +1 blocks touching the same-color group count toward this, and only those are removed. A special block that is
  further away (even within reach) stays on the board.

**Why:** The developer asked for it: stacking +1 blocks should be rewarded with a bigger move. Capping the reach at 2
follows the request as given ("multiple" means +2); a bigger reach for 3 or more would be a one-line change.
**Affects:** game-design.md (Current Augmentations); how-the-game-works.md (Special blocks);
`data/board.ts`, `gamelogic/board/moves.ts` (`getMoveAt`), `types/SpecialBlockType.ts`
**Status:** Superseded by 2026-10-02 — +1 blocks add up: each one touching a group reaches 1 space further

## 2026-10-02 — +1 blocks add up: each one touching a group reaches 1 space further
**Decision:**
- A move reaches 1 space out from its same-color group for each +1 block touching that group: 1 +1 removes the
  regular blocks touching the group, 2 remove those up to 2 spaces away, 3 up to 3 spaces, and so on, with no limit.
- Spaces are counted in steps up, down, left or right, passing through any space.
- Only +1 blocks touching the same-color group count toward this, and only those are removed. A special block that is
  further away (even within reach) stays on the board.

**Why:** The developer clarified that +1 blocks are meant to be additive; the earlier cap at 2 was a misreading of
"multiple +1 blocks extend to +2". `MAX_PLUS1_REACH` was removed.
**Affects:** game-design.md (Current Augmentations); how-the-game-works.md (Special blocks);
`data/board.ts`, `gamelogic/board/moves.ts` (`getMoveAt`), `types/SpecialBlockType.ts`
**Status:** Active, except "only +1 blocks touching the same-color group count": superseded by 2026-10-02 — +1 blocks
chain

## 2026-10-02 — +1 blocks chain
**Decision:**
- A +1 is used by a move if it touches the area the move reaches: the group, plus every space within reach of it. To
  start with (reach 0), that is just the group, so the first +1s used are the ones touching it.
- Each +1 used adds 1 to the reach, which can bring more +1s into the area or next to it. This repeats until no new +1s
  are found. Every +1 used is removed.
- This covers both cases raised: a +1 that ends up inside the area is used (so it is never "wasted" or left behind in
  a cleared area), and a +1 that ends up touching the area is used too.
- The selection highlight shows the whole chain, since it uses the same calculation.

**Why:** Before, a +1 inside the area a move reached was skipped and left on the board, and a +1 next to that area did
nothing. "A +1 touching the selection counts" is the original rule ("a +1 touching the group counts") extended, so it
is one rule instead of two special cases. Considered and not chosen: keeping only +1s touching the group itself
(simpler, but +1s just outside the selection do nothing).
- Expected effects: bigger moves and higher scores once there are several +1s on a board (Spotless gets easier), and
  Greedy is worth more, since a move that sets off a chain scores much more than one that doesn't.

**Affects:** game-design.md (Current Augmentations); how-the-game-works.md (Special blocks);
`gamelogic/board/moves.ts` (`getMoveAt`, `getPlus1sUsed`)
**Status:** Active

## 2026-10-02 — In-game "How to Play" tab, written separately from the design docs
**Decision:**
- The game has a **How to Play** tab, explaining how to play for players.
- Its text is written directly in `src/index.html`, as static HTML. It is not generated from
  `design/how-the-game-works.md`, and no package is added to convert markdown.
- `design/how-the-game-works.md` stays, but is for people reading the source, not the text shown in the game.

**Why:** The developer's view: the files in `design/` are for people looking at the source (the developer, AI), and
the in-game explanation is for the person playing. They start out similar, but have different readers and may explain
different parts, or the same parts in different ways, so they shouldn't be tied together. Considered and not chosen:
showing the markdown file in the game (with the `marked` package), and making the HTML the only copy.
**Affects:** CLAUDE.md, overview.md, how-the-game-works.md (what each file is for); `src/index.html`,
`src/css/styles.css`
**Status:** Active

## 2026-10-02 — Each player's next Gem goal is shown on the Main tab
**Decision:**
- The human player's stats show the board score needed for the next Gem ("Gem at Board Score"). The UI reads it
  straight from the game state (`gemGoalBoardScore`).
- The computer player's stats show the board that earns its next milestone Gem ("Gem at Board #"). Working this out
  needs the milestone rule, so game logic calculates it (`getNextComputerMilestone` in `gamelogic/gems.ts`) and sends
  it as `DerivedGameInfo.nextComputerMilestoneBoard`.

**Why:** The goals rise each time they're reached, and nothing showed where they currently were, so players couldn't
tell how close they were to a Gem. Next to the scores is where the player is already looking when deciding whether to
keep going on a board.
**Affects:** game-design.md (Currencies); how-the-game-works.md; `types/DerivedGameInfo.ts`,
`gamelogic/gems.ts`, `gamelogic/calculateDerivedGameInfo.ts`, `ui/PlayerComponent.ts`, `ui/renderGame.ts`,
`src/index.html`, `src/css/styles.css`
**Status:** Active

## 2026-10-02 — Visual makeover: one style for the whole game, built on CSS tokens
**Decision:**
- The whole page was restyled with one consistent look:
  - a header bar with the title and the wallet (as colored "pills")
  - a tab bar with the current tab highlighted
  - "cards" for each player's area and for the items on the other tabs
  - stat tiles for the scores, with the Gem goal in the Gem color
  - a dark frame behind each board, rounded "glossy" blocks, and a white ring around the selected group
- Colors, sizes and shadows are tokens on `:root` in `styles.css`. Coins, Chips and Gems each have their own color,
  used everywhere that currency appears (wallet, Upgrades, achievements, Gem goals).
- Block colors are picked by the CSS: each block gets a `data-color` attribute, and the stylesheet has a shade for
  each color in `data/board.ts`. The raw color name is still set as `--block-color` as a fallback, so a new color
  shows up even before it gets its own shade.
- UI code uses classes instead of inline styles (Achievements, Augmentations and Stats tabs).
- A finished board's message is now drawn on the board's frame, so it isn't dimmed and blurred along with the blocks.
- No fonts or packages were added (it uses the system's font).

**Why:** The page was almost entirely unstyled (tabs looked like plain buttons, scores were plain text run together).
Keeping every color and size as a token gives one place to change the look later, and makes dark mode and smaller
screens easier to add.
**Affects:** code-design.md (UI System); `src/index.html`, `src/css/styles.css`, `src/css/next-board-btn.css`;
`ui/BoardComponent.ts`, `ui/AchievementsComponent.ts`, `ui/AugmentationsComponent.ts`, `ui/StatsComponent.ts`,
`ui/UpgradesComponent.ts`
**Status:** Active

## 2026-10-02 — Layouts for phone, tablet and desktop; blocks size themselves to fit
**Decision:**
- **Blocks size themselves to the space the board has.** Each player area is a CSS size container, and a block is
  `min(--block-max-size, the area's width / the board's columns)` (allowing for the frame and the gaps). This works
  for any screen and any board size (including Bigger Board), with no JavaScript. Desktop blocks are still 40px.
- **The human player's area gets more of the width** than the computer player's (3:2), so the board the player taps
  is the bigger one when space is short. On a wide screen both still reach full size.
- **Three layouts,** chosen by screen width:
  - **Desktop (1024px and up):** as before.
  - **Tablet (700px to 1023px):** boards side by side, with less space around them and smaller stat tiles.
  - **Phone (under 700px):** the boards stack, the human player's on top filling the width (about 31px blocks on a
    375px phone). The computer player's board is below, kept small (blocks up to 24px), since it is only watched. The
    tabs become one row that scrolls sideways, and the header, cards and stats are more compact.
- **Touch:** the board turns off double-tap-to-zoom (removing a group takes two taps), the tap highlight is off, and
  hover effects on blocks only apply on devices with a real pointer (on a touch screen they stick after a tap).

**Why:** On a phone the boards (a fixed 40px per block) didn't fit, and the page scrolled sideways. Sizing blocks from
the space available, rather than picking sizes for each screen, also covers bigger boards and in-between screen
sizes. Considered and not chosen: putting the computer player's board on its own tab on phones (it's part of the
game's appeal to watch it play alongside, and kept small it doesn't get in the way).
**Affects:** `src/css/styles.css`
**Status:** Active, except "the tabs become one row that scrolls sideways": superseded by 2026-10-02 — Phone fixes:
tabs wrap, score tiles 2 + 3, currency icons

## 2026-10-02 — Phone fixes: tabs wrap, score tiles 2 + 3, currency icons
**Decision:**
- **Tabs on phones wrap** onto as many rows as they need (two on most phones), each row stretched to fill the width,
  instead of one row that scrolls sideways.
- **Score tiles:** when a player area is too narrow for all five in one row, they're laid out as two wide tiles (Total
  Score, Board Score) above three narrower ones (Board #, Max Board Score, the Gem goal), instead of wrapping as 3 + 2.
  This is decided by the player area's own width (a container query), so it also applies to the narrower computer
  area on tablets.
- **Currency icons:** Coins, Chips and Gems each have an icon (a coin, a poker chip, a gemstone), drawn as inline SVG
  in `index.html`. On phones only the icon and the amount are shown, so the three fit on one row; the name is kept
  for screen readers, and wider screens show it as well.

**Why:** Reported from testing in Firefox's phone view:
- The scrolling tab row gave no sign that it scrolled, and couldn't be scrolled with a mouse, so some tabs couldn't
  be reached.
- The 3 + 2 tile wrap looked awkward. A 2 + 3 layout looks deliberate, and the two wide tiles leave room for the
  numbers that grow the most.
- The wallet wrapped onto two lines, and would get worse as the amounts grow.

Considered and not chosen:
- a "More" menu, or a bottom navigation bar, for the tabs (7 tabs is too many for a bottom bar, and a menu hides
  them)
- shorter tile labels with all five tiles in one row (too cramped for large numbers)
- shortening large amounts (12.3K): this may still be wanted later, but exact amounts matter when comparing them to
  Upgrade costs

**Affects:** `src/index.html`, `src/css/styles.css`
**Status:** Active, except "tabs on phones wrap": superseded by 2026-10-02 — Tabs on phones are a dropdown

## 2026-10-02 — Tabs on phones are a dropdown
**Decision:**
- On phones (under 700px), the tab bar is a single "tab" showing the current tab's name, with a dropdown arrow on the
  right. Tapping it opens a menu listing every tab; picking one shows that tab and closes the menu. A tap anywhere
  else, or Escape, also closes it. Tablets and desktops keep the row of tabs.
- The menu is made of the same tab buttons as the row (restyled as a list), so there is still one list of tabs in
  `index.html`.
- The tab code moved out of `ui/initializeUi.ts` into its own file, `ui/TabsComponent.ts`.

**Why:** The developer found the wrapped two-row tab bar still looked untidy on a phone, and suggested this. It takes
one line, always shows where you are, and has room for more tabs later. Considered: a native `<select>` (less code,
and the phone's own picker), but it can't be styled to look like the rest of the tabs.
**Affects:** `src/index.html`, `src/css/styles.css`, `ui/TabsComponent.ts`, `ui/initializeUi.ts`
**Status:** Active

## 2026-10-03 — No special handling for touch scrolling on the board
**Decision:** Nothing is done to stop the page scrolling when the board is touched on a phone (no `touch-action: none`,
no "sticky" scrolling, no board-only view for this reason).
**Why:** The developer played on a real phone and accidental scrolling wasn't a problem. Taps barely move the finger,
and a move is made of taps, never drags. The options considered (blocking swipes that start on the board, turning off
pull-to-refresh, fitting the whole board on screen, a board-only view, "sticky" scrolling) are there if it turns out to
be a problem later.
**Affects:** nothing (recorded so the question isn't reopened without new information)
**Status:** Active

## 2026-10-03 — The computer player is the focus of the game
**Decision:** The computer player's growing ability is the game's main progression. The human player plays in short
bursts, and what they play for is making the computer player better at playing. Features that follow from this are in
todo.md: a "You | Computer" switch to watch the computer's board on a phone, and progress while away.
**Why:** Someone who played the game found it boring. The developer's view is that the computer playing should be the
main thing, which is the usual shape of an idle game; the currencies already work this way (the human's Score buys
the computer's Upgrades). Considered and not chosen: a "screensaver" showing the computer's board after a while with
no input. It would mostly help on phones, where the computer's board is off screen, but there the phone's own screen
lock would usually come first.
**Affects:** game-design.md (Overview); todo.md
**Status:** Active

## 2026-10-03 — Smaller starting board for the human player; each player has its own board sizes
**Decision:**
- The human player's board starts at 8x8 (was 10x10) and Bigger Board takes it up to 12x12. The computer player's
  starts at 10x10 (as before) and goes up to 20x20. The sizes are in `data/board.ts` (`STARTING_BOARD_SIZE`,
  `LARGEST_BOARD_SIZE`); Bigger Board's highest level for each player is worked out from them.
- An Upgrade can have a different highest level for each player (`maxLevelByPlayer`, read by `getUpgradeMaxLevel`).
- The Gem goal starts at 110 (was 175), and still goes up by 20 each time it's reached.
- Save version 4: an older save's Gem goal is lowered by 65 (the difference between the old and new starting goals),
  so the goals already reached still count; it never goes below 110. Bigger Board levels are kept as they are, so a
  player's next board may be smaller than their current one; a level above the new highest is treated as the highest.

**Why:**
- A smaller board finishes sooner, so the first achievements (and the first +1 block) come sooner, which should help
  with the game feeling slow at the start. Boards bigger than 12x12 would be hard to tap on a phone.
- The computer's board is only watched, so it can grow further. 20x20 (400 blocks) is well within what the page can
  redraw after every computer move.
- 110 is about what a typical 8x8 board with a +1 block scores (a simulation: about 100 to 107 points per 8x8 board,
  and about 1.65 points per block on every size from 8x8 to 12x12), the same place 175 sat for a 10x10 board. Each
  Bigger Board level adds about 35 to 40 points to a typical board, so the +20 per goal is still about right.

**Affects:** game-design.md (Board Behavior, Currencies, Upgrades); how-the-game-works.md; `src/index.html` (How to
Play no longer names the starting goal); `data/board.ts`, `data/upgrades.ts`, `data/gems.ts`, `types/Upgrade.ts`;
`gamelogic/upgrades.ts`, `createNewBoard.ts`, `advanceToNextBoard.ts`, `createInitialGameState.ts`, `persistence.ts`,
`takeComputerTurn.ts`, `actions/nextBoard.ts`, `actions/resetHumanBoard.ts`
**Status:** Active
