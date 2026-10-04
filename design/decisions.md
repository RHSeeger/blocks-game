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
**Status:** Active, except "removes the one worth the most points": superseded by 2026-10-03 — Size x size scoring;
Greedy plans; numbers rescaled

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
**Status:** Active, except "rounded 'glossy' blocks": superseded by 2026-10-03 — Candy block colors, drawn flat

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
tabs wrap, score tiles 2 + 3, currency icons; and "the boards stack ... the computer player's board is below, kept
small": superseded by 2026-10-03 — "You | Computer" switch on phones

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
**Status:** Active, except "the Gem goal starts at 110, +20": superseded by 2026-10-03 — Size x size scoring; Greedy
plans; numbers rescaled

## 2026-10-03 — "You | Computer" switch on phones
**Decision:**
- On phones (under 700px), the Main tab shows one board at a time, at full width, with a **You | Computer** switch
  above it to pick which. It starts on the human player's board (and goes back to it when the game is reset). The
  Computer button has a small pulsing dot, as a reminder that the computer is always playing. Tablets and desktops
  hide the switch and show both boards, as before.
- Which board is shown is kept on the page (a `data-showing` attribute on the boards' wrapper, which the CSS reads),
  not in the game state, the same way the current tab is: it's how the page is being viewed, not part of the game.
  The code is in `ui/BoardSwitchComponent.ts`.

**Why:** The computer player is now the focus of the game (2026-10-03), but on a phone its board was squeezed below
the human player's, off screen while playing, with blocks capped at 24px. Showing one board at a time gives each the
full width, and the human player's board no longer has anything below it to scroll to. It also covers the "board
only" view suggested in the touch-scrolling discussion. Considered and not chosen: a swipe between boards (hard to
discover, and could get mixed up with scrolling), and the computer's board on its own tab (the tab menu is a step
further away than a switch on the Main tab).
**Affects:** game-design.md; how-the-game-works.md; `src/index.html` (switch, How to Play), `src/css/styles.css`,
`ui/BoardSwitchComponent.ts`, `ui/initializeUi.ts`
**Status:** Active

## 2026-10-03 — Line blocks; one rule for every special block; a general special block chance
**Decision:**
- **Line blocks:** a new special block, horizontal or vertical. When one goes off, its whole row (horizontal) or
  column (vertical) is added to the move's area. Shown as a white bar pointing the way of its line.
- **One rule for every special block:** a move's area starts as its same-color group. A special block inside the area,
  or touching it, goes off and grows the area in its own way (+1: 1 more space of reach from the group; line: its row
  or column). Special blocks chain, with each other and across kinds, until no more are found. Every regular block in
  the final area is removed. For +1 blocks this is exactly the old rule (all the existing tests still pass).
- **Unlocks:** the "Line Blocks" Augmentation (both players, one Augmentation for both directions, each block picked
  at random). Score 1000! (which unlocked nothing) unlocks it for the human player. A new achievement, "You call that a
  line? Let me show you" (remove a group of 2 with a line block), unlocks it for the computer player, like the +1 one.
- **A general special block chance:** "+1 Block Chance" and the new "Line Block Chance" work the same way (100% once
  unlocked, +25% a level, the same costs). How each kind gets onto boards is an entry in `data/specialBlocks.ts` (its
  Augmentation, its chance Upgrade, and its block types), and each kind is rolled separately.
- **Save version 5:** each achievement already accomplished has its unlock applied when a save is loaded, if the player
  doesn't have it yet. Otherwise anyone who already had Score 1000! would never get Line Blocks.

**Why:** Line blocks were the first of the new special blocks planned on 2026-10-03, to make the game more interesting.
One rule keeps the game easy to explain and makes any mix of special blocks work, instead of a special case for each
pair. Score 1000! comes several boards after First Board Clear, so new special blocks keep arriving after the first.
Making the chance general first means the planned Bomb and Refill blocks are mostly new data entries. Considered and
not chosen: separate Augmentations for horizontal and vertical lines (two unlocks for one idea), and line blocks going
off only when touching the group itself (simpler, but then a +1's reach couldn't set one off).
**Affects:** game-design.md (Augmentations, Achievements, Upgrades); how-the-game-works.md; `src/index.html` (How to
Play); `types/SpecialBlockType.ts`, `types/SpecialBlockSpawn.ts`; `data/augmentations.ts`, `data/achievements.ts`,
`data/upgrades.ts`, `data/specialBlocks.ts`; `gamelogic/board/moves.ts`, `gamelogic/board/generateBoard.ts`,
`gamelogic/createNewBoard.ts`, `gamelogic/upgrades.ts`, `gamelogic/achievements.ts`, `gamelogic/persistence.ts`;
`ui/BoardComponent.ts`, `src/css/styles.css`
**Status:** Active, except "save version 5 applies the unlocks": superseded by 2026-10-03 — Bomb blocks; missing unlocks
are applied on every load

## 2026-10-03 — Moves are shown on the board: blocks shrink away, slide into place, and the score floats up
**Decision:**
- When a group is removed (by either player), the removed blocks shrink away, the remaining blocks slide from their old
  spaces straight to their new ones, and the move's score floats up from the clicked block (bigger and gold for 50 or
  more). Nothing is shown for a board that isn't on screen. With "reduce motion" on, only the score is shown.
- Game logic describes the move in a new kind of notification, `blocksRemoved` (the clicked block, the removed
  blocks, the score, and where each remaining block came from). Where each block came from is worked out by
  `settleBoard`, which settles the board the same way as before while keeping track of each block.
- `blocksRemoved` is not shown as a pop-up; `ui/BoardAnimations.ts` shows it on the board, using the browser's Web
  Animations API (`element.animate`). The copies of removed blocks, and the score, are put in the board's frame, not
  the board's grid, and remove themselves when done.

**Why:** The game was found boring, and part of that was that moves had no feedback: blocks vanished and the rest
jumped. Notifications are already the way game logic tells the UI "this just happened", so no new bridge function was
needed, and the UI still stores nothing. The UI couldn't work out where blocks moved by itself without remembering the
previous state, which it doesn't keep. Sliding straight to the new space (instead of falling, then sliding left, then
falling again) is simpler, and quick enough that the difference doesn't show. Considered and not chosen: CSS-only
transitions (they can't start a block from a different space without extra steps the Web Animations API does in one
call).
**Affects:** code-design.md (Notifications); game-design.md (Board Behavior); how-the-game-works.md;
`types/GameNotification.ts`, `gamelogic/board/applyGravity.ts` (`settleBoard`), `gamelogic/applyBlockClick.ts`;
`ui/BoardAnimations.ts`, `ui/renderGame.ts`, `ui/NotificationsComponent.ts`, `src/css/styles.css`
**Status:** Active

## 2026-10-03 — Bomb blocks; missing unlocks are applied on every load
**Decision:**
- **Bomb blocks:** a new special block. When one goes off (by the same rule as the others), the 3x3 square around it
  is added to the move's area, cut off at the board's edges. Shown as a white ring with a dot.
- **Unlocks:** Taste the Rainbow (which unlocked nothing) unlocks Bomb Blocks for the human player. A new achievement,
  "You call that an explosion? Let me show you" (remove a group of 2 with a bomb block), unlocks them for the computer.
  "Bomb Block Chance" works like the other chance Upgrades.
- **Missing unlocks are applied on every load,** instead of by a save version upgrade: when a save is loaded, each
  achievement already accomplished has its unlock applied, if the player doesn't have it. The version 5 save upgrade
  (2026-10-03, line blocks) did this once; it now does nothing, since every load does it.
- A 5x5 "bigger bombs" Upgrade was left for later (todo.md).

**Why:** The bomb was the next planned special block. A square makes it feel different from a +1 (which reaches out
from the whole group, in a diamond). Taste the Rainbow comes up fairly often, so bombs arrive early, alongside +1s and
before lines. Applying missing unlocks on every load means giving an existing achievement an unlock never needs a new
save version again (this was the second time in a day). The cost: an Augmentation removed from the console comes back
on the next load, if an accomplished achievement unlocks it.
**Affects:** game-design.md (Augmentations, Achievements, Upgrades); how-the-game-works.md; `src/index.html` (How to
Play); `types/SpecialBlockType.ts`; `data/augmentations.ts`, `data/achievements.ts`, `data/upgrades.ts`,
`data/specialBlocks.ts`; `gamelogic/board/moves.ts`, `gamelogic/achievements.ts`, `gamelogic/persistence.ts`;
`ui/BoardComponent.ts`, `src/css/styles.css`
**Status:** Active

## 2026-10-03 — Debug tools on the Settings tab: grant achievements, add currency
**Decision:**
- The Settings tab has a "Debug Tools" section. Its "Show Debug Tools" button reveals buttons to add Coins, Chips or
  Gems (1,000 or 100,000 Coins/Chips; 10 or 1,000 Gems), and a Grant button on each achievement not yet accomplished.
- Granting an achievement goes through the same code as earning it (`awardAchievement`), so it gives the Gems, the
  unlock, and the pop-ups.
- They go through the bridge like any other action (`onGrantAchievementClicked`, `onGrantCurrencyClicked`), to new
  entry points (`actions/grantAchievement.ts`, `actions/grantCurrency.ts`).
- Whether they're shown is kept on the page (a `debug-mode` class on the body), not saved, so they're hidden again
  after a reload. They are available to anyone playing; they're not hidden behind a build setting.

**Why:** The developer found new features hard to test because getting to them meant earning them first. The
console (`window.gameState`) can already do this, but not easily, and not on a phone. Going through the same code as
earning an achievement means what's tested is what players get. Considered and not chosen: only in development builds
(the developer tests the built game, on their phone too), and remembering that they're shown (the UI saves nothing).
**Affects:** code-design.md (Bridge System); game-design.md (Board Behavior); `src/index.html`, `src/css/styles.css`;
`bridge/uiToLogic.ts`; `gamelogic/achievements.ts` (`awardAchievement` exported), `gamelogic/actions/grantAchievement.ts`,
`gamelogic/actions/grantCurrency.ts`; `ui/DebugToolsComponent.ts`, `ui/AchievementsComponent.ts`, `ui/initializeUi.ts`
**Status:** Active

## 2026-10-03 — The built page loads the script with a ?hash, so browsers don't run an old copy
**Decision:** `webpack.config.js` turns on HtmlWebpackPlugin's `hash` option: the page loads `app.bundle.js?<hash>`,
and the hash changes whenever the script does.
**Why:** The developer didn't see the new debug tools after a build, though the build had them. The script's address
never changed, so a browser could keep using a cached copy of the old script with the new page. A query string is the
smallest change that fixes this (the file keeps its name, so nothing else that refers to it changes).
**Affects:** `webpack.config.js`
**Status:** Active

## 2026-10-03 — Refill blocks
**Decision:**
- **Refill blocks:** a new special block. It goes off by the same rule as the others (inside or touching the move's
  area), but adds nothing to the area. Instead, once the board has settled, every empty space is filled with a new
  block. More than one refill in a move refills the board once.
- **What a refill brings:** never another refill block. It can bring the player's other special blocks, with their
  usual chances multiplied by the share of the board being refilled (`rollSpecialBlocks(playerState, share,
  exclude)`), so special blocks are about as common as on a new board.
- **Shown:** an arrow pointing down into a tray. The new blocks drop in from the top of the board, after the others
  have slid into place: the move's `blocksRemoved` notification lists them in a new `added` field.
- **Unlocks:** a new achievement, Chain Reaction (set off 3 or more special blocks in one move), unlocks it for the
  human player. "You call that a refill? Let me show you" (a group of 2 with a refill block) unlocks it for the
  computer. "Refill Block Chance" works like the other chance Upgrades.

**Why:** It was the last of the special blocks planned on 2026-10-03, and makes a board last longer. Excluding refill
blocks from a refill was the developer's rule (so it can't go on forever); other special blocks were allowed. Scaling
the chances by the share refilled stops a refill of a nearly-empty board from bringing a whole new board's worth of
special blocks. Chain Reaction needs the earlier special blocks, so the refill comes last, as a reward for using them
together; Spotless (the only achievement left unlocking nothing) is too rare. Considered and not chosen: a refill that
only fills the columns or rows it touched (harder to explain).
**Affects:** game-design.md (Augmentations, Achievements, Upgrades); how-the-game-works.md; `src/index.html` (How to
Play); `types/SpecialBlockType.ts`, `types/GameNotification.ts`; `data/augmentations.ts`, `data/achievements.ts`,
`data/upgrades.ts`, `data/specialBlocks.ts`; `gamelogic/board/generateBoard.ts` (`refillBoard`),
`gamelogic/createNewBoard.ts` (`rollSpecialBlocks`), `gamelogic/applyBlockClick.ts`, `gamelogic/achievements.ts`;
`ui/BoardAnimations.ts`, `ui/BoardComponent.ts`, `src/css/styles.css`
**Status:** Active

## 2026-10-03 — Progress while away: the computer catches up on missed turns
**Decision:**
- The game state records when the computer player last took a turn (`computerLastTurnAt`; save version 6, older saves
  get the time they're loaded).
- On each computer tick, a gap of a minute or more since then counts as time away (up to 8 hours). The computer
  catches up first: it plays the missed turns (time away divided by its time between turns) for as long as a 0.2-second
  budget allows, and estimates the rest at the rate of the ones played (score and Chips, boards finished, and a Gem for
  each milestone board passed). A `awayProgress` notification sums it up in a "While you were away" pop-up.
- While the page is hidden, the computer doesn't play at all (the game loop checks `document.visibilityState`), so
  that time is caught up on when the page is shown again, the same way as time with the page closed.
- Only the computer player progresses; time away counts at its full speed.

**Why:** The computer player is the focus of the game (2026-10-03), and idle games are expected to keep going while
closed. Playing the turns for real gives exactly what the computer would have done, with all its Augmentations and
Upgrades; estimating the rest keeps opening the game quick. Pausing while hidden replaces the browsers' different
slowdowns of background tabs (from 1 turn a minute to none at all) with one rule, and shows one summary on return
instead of a pop-up every minute while hidden. Considered and not chosen: estimating everything from an average score
per board (simpler, but wouldn't reflect special blocks, Greedy or bigger boards without its own model of them), and
a reduced rate while away (left to decide after playing; see todo.md).
**Affects:** code-design.md (Folder Layout: gameLoop.ts); game-design.md (Overview); how-the-game-works.md;
`src/index.html` (How to Play); `types/GameState.ts`, `types/GameNotification.ts`; `data/away.ts`;
`gamelogic/gameLoop.ts`, `gamelogic/playWhileAway.ts`, `gamelogic/persistence.ts`, `gamelogic/createInitialGameState.ts`;
`ui/NotificationsComponent.ts`
**Status:** Active, except "up to 8 hours" and "time away counts at its full speed": superseded by 2026-10-03 — Time
away counts at a slowing rate, worth an hour of play at most

## 2026-10-03 — Size x size scoring; Greedy plans; numbers rescaled
**Decision:**
- **Scoring:** a move scores its size (regular blocks removed) times itself. It used to grow by 1 point per block each
  time the size doubled (2: 3, 10: 29, 20: 74); now 2: 4, 10: 100, 20: 400.
- **Greedy plans:** it saves up the most common color on the board. Of the groups it checks (3, then more with
  Greedier), it clears the smallest one that's another color and sets off no special blocks; if there's none, it makes
  the move worth the most points. (It used to make the move worth the most points of the groups it checked.)
- **Numbers rescaled** for scores about 2.5 times bigger (from a simulation of the new scoring):
  - The Gem goal starts at 250 (was 110) and goes up by 50 (was 20)
  - Everyday Upgrade costs x2.5 (100 → 250, Faster Computer 30 → 75); Bigger Board (Gems) is unchanged
  - Score 1000! becomes Score 2,500! (its internalName stays `score_1000`, since it's in saves)
  - The big score pop-up is for 100 or more (was 50)
- **Save version 7:** the Gem goal is converted (keeping the goals reached) and Coins and Chips are multiplied by 2.5.
  Score records are left as they were. (While doing this, the version 3 → 4 upgrade was fixed to use the version 4
  goal values, instead of whatever the current ones are.)

**Why:** A simulation found that with the old scoring, how a board was played barely mattered: the best strategy
tried scored under 10% more than random moves. That made Greedy nearly useless, and may be part of why the game felt
boring (choices didn't matter). With size x size scoring (as in the classic game SameGame), planning pays off: saving
a color scores about 45% more than random play with no special blocks. The old Greedy (the most points now) gained
little even with the new scoring, and saving a color on its own did worse once special blocks were around (clearing
small groups set them off early), so Greedy also avoids setting off special blocks on small groups. The new Greedy
scores about 25% more than random moves, and checking every group 35-70% more, so Greedier levels are worth buying.
Considered and not chosen: (size - 1) x (size - 1) (pairs would score only 1), and looking ahead one move (slower, and
the planning rule did better in testing).
**Affects:** game-design.md (Board Behavior, Augmentations, Achievements, Currencies, Upgrades, Open Questions);
how-the-game-works.md; `src/index.html` (How to Play); `gamelogic/board/calculateGroupScore.ts`,
`gamelogic/chooseComputerMove.ts`, `gamelogic/achievements.ts`, `gamelogic/persistence.ts`; `data/augmentations.ts`,
`data/achievements.ts`, `data/upgrades.ts`, `data/gems.ts`; `ui/BoardAnimations.ts`
**Status:** Active

## 2026-10-03 — Special blocks are balanced by how often they appear; refill blocks appear at 40% of the rate
**Decision:**
- Special blocks are balanced by how often they appear, not by changing what they do (they're meant to feel
  different, and don't need to be equally strong).
- Each kind of special block now has its own chances (`baseChance` and `chancePerLevel` on each entry in
  `data/specialBlocks.ts`, instead of one shared pair). +1, line and bomb blocks are unchanged (100%, +25% a level).
- Refill blocks start at 40% and go up 10% a level (up to 160% at level 12): 40% of the others' rate at every level.

**Why:** In a simulation (size x size scoring, playing the best-scoring move), one refill per board added +72 to an
8x8 board and +190 to a 12x12 one on its own, against +50 to +60 for a +1, line or bomb (+120 for a line on 12x12).
Alongside the other three, it added +130 and +289, since a refilled board brings more special blocks into play.
This is already with a refill never bringing another refill block. At 40% of the rate, a refill on its own adds about
+32 (8x8) and +62 (12x12), and alongside the others +78 and +127, in line with the others. The developer agreed with
balancing by frequency rather than by impact. Keeping the same ratio at every level means buying "Refill Block
Chance" never makes refills too common.
**Affects:** game-design.md (Augmentations, Upgrades); how-the-game-works.md; `types/SpecialBlockSpawn.ts`,
`data/specialBlocks.ts`, `data/upgrades.ts`, `gamelogic/upgrades.ts` (`getSpecialBlockChance`)
**Status:** Active

## 2026-10-03 — An introduction pop-up when the game is first opened
**Decision:**
- When the game is first opened (and after Reset Game), a pop-up explains how to play: select a group, remove it,
  how the board settles, size x size scoring and saving a color, that special blocks exist (not what each does), and
  the Computer Player. It stays until closed with its button or Escape (not by tapping outside it).
- Its pictures are small example boards (`.mini-board`) made of the game's own blocks and styles, written into
  `index.html`, so they always match how the game looks and need no image files.
- Whether it has been seen is in the game state (`introSeen`; save version 8, older saves start with it not seen).
  Closing it, or "Show the introduction" on the How to Play tab, goes through the bridge (`onIntroClosed`,
  `onShowIntroClicked`) to one entry point, `setIntroSeen`.

**Why:** The developer asked for it, so new players know how to play without finding the How to Play tab. Keeping
"seen" in the game state follows the rule that the UI saves nothing, and means Reset Game shows it again. Existing
saves see it once, which lets the developer check it on their own game.
**Affects:** code-design.md (Bridge System); game-design.md (Board Behavior); `src/index.html`, `src/css/styles.css`;
`types/GameState.ts`; `gamelogic/actions/setIntroSeen.ts`, `gamelogic/createInitialGameState.ts`,
`gamelogic/persistence.ts`; `bridge/uiToLogic.ts`; `ui/IntroComponent.ts`, `ui/renderGame.ts`, `ui/initializeUi.ts`
**Status:** Active

## 2026-10-03 — A pop-up explains each special block when the human player unlocks it
**Decision:**
- When the human player unlocks a special block, a pop-up explains what it does, with an example board showing a move
  selected (refill shows the board before and after). It stays until closed with its button or Escape.
- The game state records which special blocks have been explained (`specialBlocksExplained`; save version 9, older
  saves start with none). Game logic works out which one to explain now (`getSpecialBlockToExplain`, sent as
  `DerivedGameInfo.specialBlockToExplain`): the first unlocked and not yet explained, and none until the introduction
  has been seen. Closing it goes through the bridge (`onSpecialBlockExplanationClosed`).
- The text and pictures are UI data (`ui/specialBlockExplanations.ts`), written for players. Pictures are written as
  rows of short cell codes and built into `.mini-board`s (`ui/MiniBoard.ts`), the same example boards as the
  introduction's.
- The computer player's unlocks keep only the usual fading notification.

**Why:** The developer asked for it: a new special block should be explained when it arrives, since the introduction
only says they exist. Working out what to explain from the state (rather than from the unlock's notification) means it
survives a reload, appears one at a time if several arrive together, and also covers unlocks from the debug tools or
the console. Showing a selected move is the clearest picture of what a block adds. Existing saves see each explanation
once, like the introduction.
**Affects:** code-design.md (Bridge System); game-design.md (Board Behavior); `src/index.html`, `src/css/styles.css`;
`types/GameState.ts`, `types/DerivedGameInfo.ts`, `types/SpecialBlockExplanation.ts`;
`gamelogic/specialBlockExplanations.ts`, `gamelogic/actions/closeSpecialBlockExplanation.ts`,
`gamelogic/calculateDerivedGameInfo.ts`, `gamelogic/createInitialGameState.ts`, `gamelogic/persistence.ts`;
`bridge/uiToLogic.ts`; `ui/SpecialBlockPopupComponent.ts`, `ui/specialBlockExplanations.ts`, `ui/MiniBoard.ts`,
`ui/renderGame.ts`, `ui/initializeUi.ts`
**Status:** Active

## 2026-10-03 — Dark mode, following the device's setting
**Decision:**
- The game has a dark theme, used when the device is set to dark mode (`prefers-color-scheme: dark`). It's a second
  set of values for the color tokens in `styles.css`; nothing else changes. `color-scheme` is set too, so the
  browser's own parts (such as scrollbars) match.
- The boards are already dark, so they only get a little darker (to stand out from the dark page); the blocks keep
  their colors, so they look the same in both.
- The two light-only colors left in the stylesheet (the Reset Game card's border and warning) became tokens
  (`--danger-border`, `--danger-soft`). Any new color must be a token with a value in both themes.
- There's no switch to choose a theme; it follows the device. A switch is in todo.md, if wanted.

**Why:** It was on the to-do list, and the tokens made it mostly a second set of values. Following the device is what
most people expect, and needs nothing saved (the UI saves nothing; a switch would need the choice in the game state).
**Affects:** code-design.md (UI System); game-design.md (Board Behavior); `src/css/styles.css`
**Status:** Active

## 2026-10-03 — Time away counts at a slowing rate, worth an hour of play at most
**Decision:**
- The computer plays at full speed for the first 15 minutes away, then half speed up to 30 minutes, a quarter up to 1
  hour, and so on, halving each time the time away doubles, up to 16 hours. Nothing after 16 hours counts. The steps
  are a table (`AWAY_RATES` in `data/away.ts`), and `getAwayPlayMs` works out how much play the time away is worth.
- The "While you were away" pop-up says how long the player was away and, when it's less, how much play that was
  worth ("8 hours, worth 53 minutes of play").

**Why:** The developer's design: a player can put the game down and come back without losing out, but can't come
back after a week to a huge windfall (before this, 8 hours away counted in full, which was 34,000 Chips in a test).
Each step after the first is worth the same 7.5 minutes of play, so coming back later always gives a little more,
and the most is an hour. Considered: a longer full-speed start (the halving already makes 30 minutes worth 75%). If
an hour at most feels stingy, an Upgrade could add steps (todo.md).
**Affects:** game-design.md (Overview); how-the-game-works.md; `src/index.html` (How to Play); `data/away.ts`;
`gamelogic/playWhileAway.ts`; `types/GameNotification.ts`; `ui/NotificationsComponent.ts`
**Status:** Active

## 2026-10-03 — Score preview for the selected group
**Decision:** While the human player has a group selected, what it would score is shown next to their Board Score,
small and muted ("+16"). Game logic works it out (`DerivedGameInfo.humanSelectionScore`, from `getMoveScore`). The
computer player's board has no preview.
**Why:** With size x size scoring, whether to take a group now or let it grow matters, so seeing its score helps. The
developer asked for it not to be intrusive: next to the Board Score is where the player already looks for the score,
and nothing covers the board. The computer selects and removes on consecutive turns, so a preview there would only
flicker. Considered and not chosen: a number floating over the selected group (covers the board).
**Affects:** game-design.md (Board Behavior, Open Questions); how-the-game-works.md; `src/index.html`,
`src/css/styles.css`; `types/DerivedGameInfo.ts`, `gamelogic/calculateDerivedGameInfo.ts`; `ui/PlayerComponent.ts`,
`ui/renderGame.ts`
**Status:** Active

## 2026-10-03 — Rows slide left on their own (kept); no penalties or life points
**Decision:**
- After a group is removed, each row still slides left on its own (columns don't stay together). The alternative,
  closing up only fully empty columns, isn't used.
- There is no penalty for blocks left at the end of a board, and no "life points" or rounds; the game goes on board
  after board. Clearing more of a board is rewarded instead (Spotless, and possibly more; see todo.md).

**Why:** The developer's decisions, settling two open questions from the original design. Row-by-row is how the game
has always played. Penalties had already been decided against; this records it, and removes them from the design.
**Affects:** game-design.md (Overview, Board Behavior, Open Questions)
**Status:** Active

## 2026-10-03 — A clean-up bonus for few blocks left at the end of a board
**Decision:**
- When a board ends with no more blocks left than there are colors (special blocks count), the board score goes up
  by 5% per step, counting from the number of colors: with 5 colors, 5 left is +5% ... 1 left is +25%, and none is
  +30% plus 20% for the full clear (+50%).
- It's tied to the number of colors, so adding colors later (a harder board to clear) makes it start sooner and be
  worth more.
- It's added like any points (score, Coins or Chips, max board score), before achievements and the Gem goal are
  checked, so it counts toward them. It applies to both players.
- A `cleanupBonus` notification shows it over the board ("+40 clean-up bonus"), after the last move's score.

**Why:** The developer's design, to reward a cleaner board on most boards rather than only the rare spotless one,
since leftover blocks aren't penalized. A share of the board score keeps it in proportion to how well the board went.
In a simulation, planned play on 8x8 boards earns it on 23-36% of boards (15-22% for just taking the best move each
time), so it's seen often and rewards planning. The developer's first numbers weren't quite even; the even steps of
5% keep their two ends (+5% at the number of colors, +50% for a full clear).
**Affects:** game-design.md (Board Behavior, Open Questions); how-the-game-works.md; `src/index.html` (How to Play);
`data/board.ts`; `types/GameNotification.ts`; `gamelogic/board/cleanupBonus.ts`, `gamelogic/applyBlockClick.ts`;
`ui/BoardAnimations.ts`, `ui/NotificationsComponent.ts`, `src/css/styles.css`
**Status:** Active

## 2026-10-03 — A tap outside the selection always clears it
**Decision:** While a group is selected, clicking any block outside the selection (even one that's a valid move) only
clears the selection; another click then selects the new group. (Before, clicking a valid block outside the selection
selected its move straight away.)
**Why:** Reported by the developer: they tapped a block outside a selection expecting it to clear, and the selection
seemed to grow instead. Investigating (the board was rebuilt and both moves worked out) showed the game had followed
its rule: it selected the new block's move, a chain reaction that overlapped most of the old one, so it looked like
an addition. The developer chose the simplest fix: a tap outside always clears. It's predictable, and switching
groups costs one extra tap. Considered and not chosen: keeping the rule but flashing a new selection so the change is
visible, and clearing only when the new move would overlap the old one.
**Affects:** game-design.md (Board Behavior); how-the-game-works.md; `src/index.html` (How to Play);
`gamelogic/applyBlockClick.ts`
**Status:** Active

## 2026-10-03 — Planned: +2 blocks, big bombs, and Color Blast (instead of x2)
**Decision:** (designed, not built yet; the details are in todo.md)
- **+2 blocks and big bombs** come from a second Upgrade for +1 and bomb blocks: each +1 (or bomb) placed has a chance
  to be the bigger version instead (+2: adds 2 to the reach; big bomb: clears 5x5). The Upgrade's level raises the
  chance, up to 50%.
- **Color Blast** replaces the planned x2 block: it removes every block of the clicked group's color on the whole
  board, as part of the move. Shown as a small rainbow ring. Spotless unlocks it for the human player.
- A plain x2 block might come later, or not (there may be enough kinds of special block already).

**Why:** The developer's design. The "bigger version" Upgrades give +1 and bomb blocks a second way to improve, and
are balanced by a cap rather than by impact. A plain x2 isn't much of a moment with size x size scoring (doubling a
move is worth about 40% more blocks); a Color Blast is, and it rewards saving up a color. Spotless is rare but
achievable, which suits a big unlock.
**Affects:** todo.md (to build)
**Status:** Active (built: see 2026-10-03 — +2 blocks and big bombs, built; and 2026-10-03 — Color Blast blocks,
built)

## 2026-10-03 — +2 blocks and big bombs, built
**Decision:**
- Two new special block types, `plus2` (reach 2) and `bigBomb` (5x5, `BIG_BOMB_RADIUS`), placed by the "bigger
  version" Upgrades: "+2 Block Chance" (needs +1 Blocks) and "Big Bomb Chance" (needs Bomb Blocks). Everyday Upgrades,
  +5% a level, 10 levels (50% at most), 400 to start, x1.6 a level.
- A kind of special block that has a bigger version says so in `data/specialBlocks.ts` (`bigger`: its type and
  Upgrade). Each +1 or bomb rolled (on a new board or in a refill) is the bigger version with that chance.
- A +2 counts as a +1, and a big bomb as a bomb, for the "let me show you" achievements.
- Their explanation pop-ups appear when the human player first buys the Upgrade (that's when they can start to
  appear). The explained list holds the Upgrade's internalName for these.
- The unused "+2 Blocks" Augmentation was removed.

**Why:** The developer's design (see the planned entry above). Separate block types keep the move rules working only
from the board. Explaining them when the Upgrade is bought, rather than when one first appears, tells the player what
they just bought. Costs start higher than the first chance Upgrades, since they come later.
**Affects:** game-design.md (Augmentations, Upgrades, Board Behavior); how-the-game-works.md; `src/index.html`;
`types/SpecialBlockType.ts`, `types/SpecialBlockSpawn.ts`; `data/specialBlocks.ts`, `data/upgrades.ts`,
`data/augmentations.ts`; `gamelogic/board/moves.ts`, `gamelogic/createNewBoard.ts`, `gamelogic/upgrades.ts`,
`gamelogic/achievements.ts`, `gamelogic/specialBlockExplanations.ts`; `ui/BoardComponent.ts`, `ui/MiniBoard.ts`,
`ui/specialBlockExplanations.ts`, `src/css/styles.css`
**Status:** Active

## 2026-10-03 — Color Blast blocks, built
**Decision:**
- A new special block, `colorBlast`, shown as a small rainbow ring. When a move uses one (by the usual rule), every
  regular block on the board of the group's color is added to the area, scored as one group. Special blocks touching
  those blocks go off too, by the usual rule. A refill can bring one.
- **Unlocks:** Spotless (which unlocked nothing) unlocks the "Color Blast Blocks" Augmentation for the human player. A
  new achievement, "You call that a blast? Let me show you" (a group of 2 with a Color Blast), unlocks it for the
  computer. Players who already have Spotless get it on their next load (missing unlocks are applied on every load).
- **How often:** 20% per board to start, +5% a level ("Color Blast Chance", 250, x1.6, up to level 12): 20% of the
  usual rate at every level, the way refill blocks are 40%.
- It has an explanation pop-up, and is in How to Play and the introduction's row of special blocks.
- The unused "x2 Blocks" Augmentation was removed.

**Why:** The developer's design (see 2026-10-03 — Planned: +2 blocks, big bombs, and Color Blast). The chance came
from a simulation (best-scoring moves, and Greedy's plan, 300 boards each). One Color Blast per board added +145 to
+213 to an 8x8 board and +640 to +1,060 to a 12x12 one, against +40 to +115 for a +1 or a bomb. At 20%, it adds +34
to +38 on 8x8 (about a bomb's worth) and +120 to +220 on 12x12. It's worth more on a bigger board, which has more of
each color; that was accepted, since it's meant to be a rare big moment, and bigger boards are a late, Gem-bought
Upgrade.
**Affects:** game-design.md (Overview, Augmentations, Achievements, Upgrades); how-the-game-works.md; todo.md;
`src/index.html` (How to Play, introduction); `types/SpecialBlockType.ts`; `data/augmentations.ts`,
`data/achievements.ts`, `data/upgrades.ts`, `data/specialBlocks.ts`; `gamelogic/board/moves.ts`,
`gamelogic/achievements.ts`; `ui/BoardComponent.ts`, `ui/MiniBoard.ts`, `ui/specialBlockExplanations.ts`,
`src/css/styles.css`
**Status:** Active

## 2026-10-03 — "Let me show you" achievements: only a special block touching the pair counts; clearer wording
**Decision:**
- The five "let me show you" achievements (+1, line, bomb, refill, Color Blast) need a group of 2 (the pair of
  same-colored blocks tapped) with that kind of special block touching the pair itself. A special block the move sets
  off further away, in a chain, no longer counts (it used to: any special block the move removed counted).
- Their in-game descriptions now say "Set off a ... with a pair: a group of just 2 blocks of one color, touching the
  ... (it can still remove more)", instead of "Remove a group of 2 blocks with a ... connected".
- Their difficulty is unchanged.

**Why:** The developer thought they were being awarded for groups bigger than 2, and that they'd be nearly impossible
with line or bomb blocks. Checking showed they worked as written: the "group of 2" is the tapped pair, and the
selection shows everything the move removes, so it looked like a bigger group. The old wording ("a group of 2 ...
connected") read as "the move removes only 2 blocks", which a line or bomb never does. Chains also gave surprise
awards (a pair touching a +1 whose reach set off a bomb also earned the bomb's achievement). A simulation (400 boards
each, 8x8 and 12x12) found them easy, not hard: 82-93% of boards with one of the special block offer a pair for it at
some point, and planned play earns it without trying on 12-43%. Counting only blocks touching the pair keeps about
70-90% of boards offering one. They're meant to come soon after the human gets a block, so the computer follows, so
they weren't made harder.
**Affects:** game-design.md (Current Achievements); `data/achievements.ts`; `gamelogic/achievements.ts`,
`gamelogic/applyBlockClick.ts`, `gamelogic/board/moves.ts` (`getSpecialsTouchingGroup`)
**Status:** Active

## 2026-10-03 — Pastel block colors and a softer board background
**Decision:**
- The block colors are soft pastels instead of bright primaries: rose (red), mint (green), periwinkle (blue), butter
  (yellow) and peach (orange). The color names in `data/board.ts` (and in saves) are unchanged; only their shades in
  `styles.css` changed.
- The board's background is a dusky slate-indigo (`#3e4259`) instead of near-black, and a little darker in dark mode
  (`#2c2f41`, was `#0b0e14`).
- The Color Blast block's rainbow ring uses the block colors' shades (plus a pastel purple, `--block-purple`, which
  isn't a block color), so it matches.

**Why:** A player found the colors too childish (all primary colors) and preferred the pastel look of the mobile game
Mewdoku; the near-black board felt harsh. Several pastel sets were compared on several backgrounds. Pastels on a
light (cream or lavender) board were the closest to Mewdoku, but the blocks stood out less from the board, and the
white selection ring and white special-block symbols would have needed redoing; a mid-dark, slightly blue board keeps
those working while being softer than black. The five shades were chosen to stay easy to tell apart (rose and peach
are the closest pair).
**Affects:** `src/css/styles.css` (block color tokens, `--board-bg`, Color Blast ring)
**Status:** Superseded: the block colors by 2026-10-03 — Candy block colors, drawn flat; the board's background by
2026-10-03 — The board background goes back to near-black

## 2026-10-03 — The board background goes back to near-black
**Decision:** The board's background is back to `#262c3a` (`#0b0e14` in dark mode), as it was before the pastel
change. The pastel block colors stay.
**Why:** The developer found the slate background, together with the pastel blocks, made the whole board look washed
out. The dark background gives the pastels the contrast they need.
**Affects:** `src/css/styles.css` (`--board-bg`)
**Status:** Superseded by 2026-10-03 — A darker board background

## 2026-10-03 — A darker board background
**Decision:** The board's background is darker: `#161a23` (was `#262c3a`), and `#06080c` in dark mode (was
`#0b0e14`). The blocks are unchanged.
**Why:** The developer asked for it: a darker board gives the pastel blocks more contrast.
**Affects:** `src/css/styles.css` (`--board-bg`)
**Status:** Active

## 2026-10-03 — Pastel block colors a little darker
**Decision:** The pastel block shades are a little deeper (about 6-8% darker, slightly more saturated): rose `#e97f8e`,
mint `#7fc699`, periwinkle `#7ea1e7`, butter `#efcd6b`, peach `#f1a06f` (and the Color Blast ring's purple
`#b998e4`). They're still pastels.
**Why:** The developer found them a bit washed out on a computer screen, though not on their phone, so they were
darkened only slightly.
**Affects:** `src/css/styles.css` (block color tokens)
**Status:** Superseded by 2026-10-03 — Candy block colors, drawn flat

## 2026-10-03 — Published on GitHub Pages by a GitHub Actions workflow
**Decision:**
- The game is published at https://rhseeger.github.io/blocks-game/ (a GitHub Pages "project site").
- `.github/workflows/deploy-pages.yml` runs on every push to `master` (and by hand, from the Actions tab): `npm ci`,
  lint, tests, build, then publishes `dist/`. If the lint or tests fail, nothing is published, and the site keeps the
  last good version. `dist/` is still not committed.
- The published build is the same as the local one (development mode, with source maps), so what's played online is
  what's tested locally.
- The lint scripts' file patterns are quoted, so ESLint expands them itself. Unquoted, the Linux shell on GitHub's
  runner expands `**` like `*`, and most files would have been skipped.
- The repository settings need "Pages > Source" set to "GitHub Actions" (done once, by hand).

**Why:** The developer wanted the game playable from GitHub, in a way other games in other repos can copy. A project
site gives each repo its own address (`rhseeger.github.io/<repo>`), and the workflow file can be copied as is (only
the branch name might differ). It's all free for public repositories. Building in a workflow keeps build output out
of the repo. Running the lint and tests first stops a broken build from replacing a working one. For other games:
all project sites share one origin (`rhseeger.github.io`), so they share localStorage; each game needs its own save
key (this one uses `blocksGameState`). Considered and not chosen: committing `dist/` to a `gh-pages` branch (build
output in git, and a manual step on every change), and a production build (smaller, but different from what's tested
locally; it could be added later).
**Affects:** `.github/workflows/deploy-pages.yml`, `package.json` (lint scripts), README.md, todo.md
**Status:** Active

## 2026-10-03 — Candy block colors, drawn flat
**Decision:**
- The block colors are soft "candy" colors: rose `#ef6a82`, mint `#52c085`, periwinkle `#6690f0`, sunflower
  `#f5c443` and tangerine `#f6894f` (special blocks `#7a81a3`, and the Color Blast ring's purple `#a97fe8`). They're
  clearly colored, but lighter and softer than the original primary colors.
- Blocks are drawn flat: the white gloss over the top (and the thin white highlight) is gone, and the bottom edge is a
  darker version of the block's own color (`color-mix`, 72% of the color with black) instead of a grey shadow. Bomb
  and big bomb blocks lost their gloss too. Special blocks keep their white inner ring.

**Why:** The pastels still looked washed out to the developer after being darkened. Darkening pastels mostly makes
them muddy; the washed-out look came largely from the white gloss (a milky film over pale colors) and low saturation.
Seven options were compared side by side on a temporary page (`src/color-options.html`): the current pastels, the
same colors without the gloss, two levels of more saturated colors, muted/dusty colors, colors of varied lightness, and
a light cream board. The developer picked the more saturated "candy" colors without the gloss.
**Affects:** `src/css/styles.css` (block color tokens, `.block`, bomb and big bomb blocks)
**Status:** Active

## 2026-10-03 — A favicon: the block logo, as an inline SVG
**Decision:** The page has a tab icon: the header's 2x2 block logo (rose, periwinkle, sunflower, mint), as an SVG written
straight into a `<link rel="icon">` in `index.html` (a `data:` address), not an image file. Its colors are a copy of
the block color tokens in `styles.css`, so they need changing in both places if the block colors change (a comment in
each says so). The temporary color comparison page (`src/color-options.html`) was removed now that the colors are
chosen.
**Why:** It was on the to-do list: the tab showed a blank icon. An inline SVG needs no file for webpack to copy, stays
sharp at any size, and works on GitHub Pages and from `file://` alike. A CSS variable can't be used in a favicon, so
the colors have to be copied.
**Affects:** `src/index.html`, `src/css/styles.css` (comment), `webpack.config.js` (comparison page removed), todo.md
**Status:** Active

## 2026-10-03 — Tidy: the computer looks ahead at the end of a board, unlocked by a "Tidy" achievement
**Decision:**
- **Tidy Augmentation** (computer only): once 30% of the board's spaces or fewer have blocks in them
  (`TIDY_ENDGAME_PERCENT`), the computer tries each group it checks (the same number Greedy checks), plays the rest
  of the board out with Greedy's plan (checking every group), and makes the move that ends with the most points:
  the board score so far, plus the move, plus the rest, with the clean-up bonus on top. Ties go to the first one
  checked. Refill blocks are treated as adding nothing in the look-ahead. Without Greedy, Tidy still looks ahead at
  the end (earlier, the computer plays randomly as usual).
- **Tidy achievement** (human): finish a board with 2 or fewer blocks left (`TIDY_BLOCKS_LEFT`; special blocks
  count, and a Spotless board counts). It unlocks Tidy for the computer. It needs nothing new in the game state.
- The code is `chooseTidyMove`, `isEndgame` and `playOut` in `gamelogic/chooseComputerMove.ts`.

**Why:** Greedy planned for big groups but ignored the clean-up bonus, and on bigger boards almost never earned it.
Instead of a fixed trade-off ("give up X% of points for a cleaner board"), the look-ahead compares real totals, so
there's nothing to tune, and it only gives up points from moves when the bonus is worth more. In a simulation (300
boards each; Greedy checking 3 groups, 8, or every group): it earned the clean-up bonus on 39-61% of boards instead
of 5-26%, and the total score went up 3-13% on 10x10 and 14x14 boards, and 9-43% on 20x20 ones; the score from moves
alone stayed about the same or rose (looking ahead is also better planning). It took up to about 300 ms per 20x20
board in all, a few milliseconds per move. Considered and not chosen: starting at 50% of the board (a little more
gain on 10x10, but 3-4 times the cost on big boards), and a cheap rule (pick the move leaving the fewest blocks with
no neighbor of their color), which gained about half as much and sometimes scored less. The developer chose to make
it earned rather than free, so the computer keeps improving through play; a human achievement for a clean board
fits it. 2 or fewer blocks left came from a simulation of 8x8 boards: well-planned play gets it on about 12-18% of
boards (3 or fewer: 18-26%; Spotless: 2-3%), so it's harder than the clean-up bonus but easier than Spotless.
**Affects:** game-design.md (Augmentations, Achievements); todo.md; `data/augmentations.ts`, `data/achievements.ts`;
`gamelogic/chooseComputerMove.ts`, `gamelogic/achievements.ts`
**Status:** Active
