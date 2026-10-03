This is a simple HTML game that involves clearing the blocks; done by clicking on blocks to remove all connected blocks of the same color.

There are two "boards", one for the human player and one for the computer player.

The human player selects groups of blocks on their board to remove.
The computer player acts automatically and does the same on their board.

A given board round is completed when there are no more groups of blocks that can be removed. When that happens, a new board is generated.
New functionality is unlocked as the game is played


## Glossary

These terms are used consistently in the design docs, the code, and the game's UI.

- **Block** - a single piece on the board. (Not "cube" or "brick")
- **Special block** - a block that modifies what happens when a group is removed, such as a "+1" block
- **Score** - points earned by removing blocks. Never spent; it's a record of progress
- **Coins** - a currency, earned by the human player's Score. Buys everyday Upgrades for the computer player
- **Chips** - a currency, earned by the computer player's score. Buys everyday Upgrades for the human player
- **Gems** - a currency, earned from achievements and goals. Buys game-changing Upgrades for either player
- **Achievement** - something the player accomplishes, such as clearing a board. Can unlock an Augmentation
- **Augmentation** - a new feature that gets unlocked, such as a new type of special block. Unlocked separately for the
  human player and the computer player
- **Upgrade** - a purchasable improvement, with levels. Bought separately for the human player and the computer player.
  Either **everyday** (bought with Coins or Chips) or **game-changing** (bought with Gems)
- **Unlock** - what an Achievement does to an Augmentation. It is a verb, not a separate kind of thing


## Overview

As the game is played
- Score is gained by removing blocks from the board.
- Achievements are accomplished, some (all?) of which unlock Augmentations
- Augmentations grant abilities/functionalities/etc - such as new special blocks
- Each player's play earns a currency that buys Upgrades for the *other* player, and Gems buy the bigger,
  game-changing Upgrades (see "Currencies")

Some more details include
- There will be special "modifier" blocks, such as "x2" (that doubles the score) and "+1" (that increases the radius of affected blocks)
- A board is completed when there are no more valid moves (no group of 2 or more connected blocks of the same color; see Board Behavior)
- There is a penalty if, at the end of a board, there are still blocks left (that cannot be removed)
- The definition of a penalty is currently undecided, but the general idea is that the player will have a limited number of "life points",
  and blocks left at the end of the board will subtract from the number of life points
- The current "round" (a series of boards) is completed when the penalties indicate it; such as there being no more life points
- The "game" itself can be played indefinitely; it can have multiple rounds
- There will be Upgrades that can be purchased... such as adding more (types/amounts) of special blocks, or other such behavior

It is also the plan that the game has an idle/incremental component.
- There will be a second tab/window/view/board that has the computer playing automatically
- The computer player's blocks/boards will be separate from the player's blocks/boards
- The computer player's Upgrades will include differences from the player's Upgrades (for example, being able to move more often, which makes no sense for the player)

The idea being that the player plays manually to earn Coins that make the computer player stronger, and the computer
player's idle play earns Chips that make the human player stronger.

**The computer player is the focus of the game.** The human player plays in short bursts, and what they play for is
making the computer player better at playing: the computer's growing ability is the game's main progression. (See
todo.md for the features this points to, such as progress while away.) On a phone, where only one board fits, a
**You | Computer** switch on the Main tab picks which board is shown, so the computer can be watched at full size.


## Board Behavior

- **Board size:** Each player's board has its own width and height. The human player's starts at 8x8 and the computer
  player's at 10x10. The "Bigger Board" Upgrade makes it bigger, starting with that player's next board (Next Board,
  or Reset Human Player Board); the board in play doesn't change size. The human player's board stops at 12x12 (bigger
  would be hard to tap on a phone); the computer player's, which is only watched, stops at 20x20.
- **Valid moves:** A move needs a group of 2 or more connected blocks of the same color. Special blocks only add to an
  already valid group; a single block touching a "+1" block is not a valid move.
- **Selecting and removing:** Clicking a block selects (highlights) everything its move would remove. Clicking any
  highlighted block removes them. Clicking a block that isn't a valid move, or clicking away from the board, clears the
  selection.
- **After a group is removed**, the board settles:
    1. Blocks fall down to fill gaps in each column
    2. Blocks in each row slide left to fill gaps in that row
    3. Blocks fall down again
- **Showing a move:** the removed blocks shrink away, the remaining blocks slide from their old spaces to their new
  ones (straight there, rather than step by step), and the score the move earned floats up from the block that was
  clicked (bigger, in gold, for 50 or more). Both players' moves are shown, when their board is on screen. With
  "reduce motion" turned on in the device's settings, only the score is shown, fading in place.
- **Finished board:** A board is finished when there are no valid moves left. Special blocks that never touched a valid
  group are left on the board.
- **Next Board:** The human player's "Next Board" button appears only once the board is finished.
- **Finished board display:** A finished board is dimmed (blocks still visible) with a "No more valid groups to remove"
  message on top of it.
- **Stats tab:** shows the largest group the human player has removed, and how many groups of each size they have
  removed. A group's size is the number of regular blocks it removed, including any a +1 added (the same count used for
  scoring and Big Group!). The computer player's moves aren't counted.
- **Reset Human Player Board** (Settings tab): gives the human player new blocks for their current board and sets the
  board score back to 0. The board number and total score don't change.


## Achievements, Augmentations and Upgrades

```
Achievement ──unlocks──▶ Augmentation (for the human player, or for the computer player)
                             │ e.g. "+1 Block"
                             ├── Upgrade: "+1 Blocks appear more often"
                             └── Upgrade: ...            (an Augmentation can have several Upgrades)

General Upgrades (not tied to an Augmentation): e.g. "computer moves faster"
```

### Achievements
The game has achievements, which are something the player accomplishes - such as clearing a board, or getting to a certain score, etc.
- An achievement can unlock an Augmentation, for a specific player (the human or the computer). For example, one
  achievement unlocks "+1 Blocks" for the human player, and a different one unlocks them for the computer player
- The plan is for all Augmentations to be unlocked by accomplishing an achievement, but that could change later

### Notifications
When the human player accomplishes an achievement, either player unlocks an Augmentation, or Gems are earned from a
goal, a pop-up appears in the top right corner naming it and saying what it does. It fades out after a few seconds, or
can be clicked to dismiss it.

### Augmentations
Augmentations are new features that get unlocked, such as new types of special blocks. They live on the `Augmentations` tab.
- Each Augmentation is defined once, but is unlocked separately for each player. The game state records which
  Augmentations each player has
- Once unlocked, an Augmentation takes effect for that player. For example, once "+1 Blocks" are unlocked for a player,
  they appear on that player's boards with a certain frequency
- Unlocking an Augmentation immediately allows buying its Upgrades for that player (if there's enough currency)
- Some Augmentations only make sense for one player (such as Greedy, for the computer player). Each Augmentation
  lists which players it can be unlocked for

How special blocks go off (the same rule for every kind): a move's **area** starts as its same-color group. A special
block inside the area, or touching it, is used (and removed), and grows the area in its own way. That can bring more
special blocks into the area or next to it, so they chain, until no more are found. Every regular block in the final
area is removed. A special block is never left behind inside the area a move clears.

Current Augmentations:
- **+1 Blocks** (both players): "+1" blocks can appear on new boards (one per board to start; see the "+1 Block
  Chance" Upgrade). Each +1 a move uses makes the area reach 1 space further out from the group: one removes every
  block touching the group, 2 every regular block up to 2 spaces (up, down, left or right) from the group, 3 up to 3
  spaces, and so on
- **Line Blocks** (both players): line blocks can appear on new boards (one per board to start; see the "Line Block
  Chance" Upgrade). Each one is horizontal or vertical, at random, and shown as a white bar pointing that way. A line
  block a move uses adds its whole row (horizontal) or column (vertical) to the area
- **Greedy** (computer player only): instead of a random move, the computer player checks 3 different groups, chosen
  at random, and removes the one worth the most points. The "Greedier" Upgrade raises how many it checks
- **+2 Blocks**, **x2 Blocks**: defined, but not yet implemented or unlocked by anything

Current Achievements:
- **First Board Clear** - finish a board. Unlocks +1 Blocks for the human player
- **No, not like that. Let me show you** - remove a group of 2 with a +1 block touching it. Unlocks +1 Blocks for the
  computer player
- **Big Group!** - remove a group of 20 or more blocks at once. Unlocks Greedy for the computer player
- **Score 1000!** - reach a total score of 1000. Unlocks Line Blocks for the human player
- **You call that a line? Let me show you** - remove a group of 2 with a line block touching it (or used by the move).
  Unlocks Line Blocks for the computer player
- **Spotless** - finish a board with no blocks left on it (a leftover special block counts as a block). Unlocks nothing
  (yet)
- **Taste the Rainbow** - finish a board with at least one block of every color left on it. Unlocks nothing (yet)

Every achievement also gives 2 Gems.

### Currencies
There are three currencies, shared in one wallet (shown above the tabs). The human decides what to buy for both players.

| Currency | Earned by | Buys |
|---|---|---|
| **Coins** | 1 Coin for each point of Score the human earns | Everyday Upgrades for the **computer** player |
| **Chips** | 1 Chip for each point of score the computer earns | Everyday Upgrades for the **human** player |
| **Gems** | Achievements and goals (below) | Game-changing Upgrades, for either player |

- Spending a currency never reduces Score; Score stays a record of progress
- Each player's play makes the *other* player stronger, so both halves of the game matter
- Everyday Upgrades get more expensive with each level, so the computer earning Chips while left idle buys a few more
  levels, not unlimited power. Game-changing Upgrades can only be bought with Gems, which idle play earns very slowly

Each player's next Gem goal is shown with their stats on the Main tab: the board score the human needs ("Gem at Board
Score"), and the board the computer earns its next milestone on ("Gem at Board #").

Ways to earn Gems (they can be earned without limit, but the goals get harder):
- **Achievements:** 2 Gems each, once
- **Board score goal:** finish a board with a board score of at least the goal (starts at 110) for 1 Gem. The goal
  then goes up by 20
- **Spotless boards:** 1 Gem every time the human finishes a board with no blocks left (on top of the achievement)
- **Computer milestones:** 1 Gem when the computer finishes its 10th board, then its 20th, 40th, 80th, ... (each
  milestone is twice as far away)

### Upgrades
Upgrades are improvements that are bought, in levels, on the `Upgrades` tab. Each level costs more than the one before
it (the cost is multiplied by the Upgrade's scaling factor each level). Some have a highest level.
- **Everyday** Upgrades improve a player bit by bit. For the human they cost Chips; for the computer they cost Coins
- **Game-changing** Upgrades change how the game plays. They cost Gems, for either player
- Some Upgrades belong to an Augmentation, and can only be bought once that Augmentation is unlocked for that player.
  Others are general
- Upgrades are bought separately for each player. The game state records each player's level for each Upgrade
- Each Upgrade is defined once (in `data/upgrades.ts`), with its name, description, tier, which players it's for, any
  Augmentation it needs, its base cost, its cost scaling, and its highest level (if any)

Current Upgrades:

| Upgrade | For | Tier | Needs | Each level | Cost (first level, then x per level) |
|---|---|---|---|---|---|
| **+1 Block Chance** | Both | Everyday | +1 Blocks | +25% chance of a +1 block per board (starts at 100%), up to level 12 | 100, x1.6 |
| **Line Block Chance** | Both | Everyday | Line Blocks | +25% chance of a line block per board (starts at 100%), up to level 12 | 100, x1.6 |
| **Greedier** | Computer | Everyday | Greedy | Greedy checks 3 → 5 → 8 → every group | 100, x2 |
| **Faster Computer** | Computer | Everyday | - | 20% less time between computer turns (starts at 1 second), up to level 8 | 30, x1.6 |
| **Bigger Board** | Both | Game-changing | - | +1 column and +1 row, from the next board on, up to 12x12 for the human (level 4) and 20x20 for the computer (level 10) | 3 Gems, x2 |

How a special block chance (+1 Block Chance, Line Block Chance) works: each full 100% is a guaranteed block, and
whatever is left over is the chance of one more. For example, 150% gives one block for sure, and a 50% chance of a
second one. Each kind of special block is rolled separately. How each kind gets onto boards (its Augmentation and its
chance Upgrade) is listed in `data/specialBlocks.ts`, so adding a kind that appears the same way is a new entry there.


## Open Questions

- **Score preview for a selected group:** Should the score a selected group would earn be shown before it is removed?
  This existed at one point but is not in the current code. Undecided; leave as-is (not shown) for now and come back to it.
- **Row-by-row left shift:** After removal, each row slides left independently (step 2 of Board Behavior). Is that
  intended, or should only fully-empty columns be removed (with whole columns shifting left, keeping columns intact)?
- **Penalties and life points:** How the end-of-board penalty and "life points" work (see Overview)
