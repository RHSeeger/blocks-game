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
- **Score** - points earned by removing blocks
- **Coins** - the currency spent on Upgrades
- **Achievement** - something the player accomplishes, such as clearing a board. Can unlock an Augmentation
- **Augmentation** - a new feature that gets unlocked, such as a new type of special block. Unlocked separately for the
  human player and the computer player
- **Upgrade** - a purchasable improvement, with levels. Bought separately for the human player and the computer player
- **Unlock** - what an Achievement does to an Augmentation. It is a verb, not a separate kind of thing


## Overview

As the game is played
- Score is gained by removing blocks from the board.
- Achievements are accomplished, some (all?) of which unlock Augmentations
- Augmentations grant abilities/functionalities/etc - such as new special blocks
- Coins can be used to buy Upgrades (including Upgrades for Augmentations)
- There may be more than one type of point (see Open Questions)
    - points earned by removing blocks (Score)
    - points earned by achievements
    - points earned by the computer player removing blocks
    - points earned by finishing boards
- Some of those points may be the same "type" (points, coins, diamonds - the standard idle/incremental stuff)

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

The idea being that the player plays manually to earn Coins to buy Upgrades for both themself and for the computer player.
The computer player may earn points to buy Upgrades also


## Board Behavior

- **Valid moves:** A move needs a group of 2 or more connected blocks of the same color. Special blocks only add to an
  already valid group; a single block touching a "+1" block is not a valid move.
- **Selecting and removing:** Clicking a block selects (highlights) everything its move would remove. Clicking any
  highlighted block removes them. Clicking a block that isn't a valid move, or clicking away from the board, clears the
  selection.
- **After a group is removed**, the board settles:
    1. Blocks fall down to fill gaps in each column
    2. Blocks in each row slide left to fill gaps in that row
    3. Blocks fall down again
- **Finished board:** A board is finished when there are no valid moves left. Special blocks that never touched a valid
  group are left on the board.
- **Next Board:** The human player's "Next Board" button appears only once the board is finished.
- **Finished board display:** A finished board is dimmed (blocks still visible) with a "No more valid groups to remove"
  message on top of it.
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

### Augmentations
Augmentations are new features that get unlocked, such as new types of special blocks. They live on the `Augmentations` tab.
- Each Augmentation is defined once, but is unlocked separately for each player. The game state records which
  Augmentations each player has
- Once unlocked, an Augmentation takes effect for that player. For example, once "+1 Blocks" are unlocked for a player,
  they appear on that player's boards with a certain frequency
- Unlocking an Augmentation immediately allows buying its Upgrades for that player (if they have the Coins)

### Upgrades
Upgrades are improvements that are bought with Coins. Upgrades are not yet included in the game.
- Upgrades allow improving certain parts of the game, such as
    - making the computer player move more often
    - making the computer player move more intelligently (picking larger selection groups, etc)
    - making special blocks occur more often, including more than one per board
- Some Upgrades belong to an Augmentation, and can only be bought once that Augmentation is unlocked for that player.
  An Augmentation can have several things about it that can be upgraded (each is a separate Upgrade)
- Other Upgrades are general, and are not tied to an Augmentation
- Upgrades are bought separately for each player. The game state records each player's level for each Upgrade

1. Coins:
  - Earned in some way, such as accomplishing achievements, or getting a certain max board or total score
  - Tracked in the game state for persistence and easy access.
2. Upgrade Definitions:
  - Each upgrade should have:
    - A unique ID and name
    - Description of its effect
    - Cost in Coins
    - Scaling factor, how much the cost increases with each new level of the upgrade
    - Prerequisites (e.g., an Augmentation, other upgrades)
  - Each player's current level for an upgrade is stored in the game state, not in the definition
  - Store upgrade definitions in a central list or data structure.
3. Upgrade Effects:
  - Upgrades can affect game logic (e.g., computer player behavior, special block frequency).
  - Game logic should check the current upgrade levels when performing relevant actions.

Augmentations and Upgrades should be coded similar to Achievements
- A file that defines the structure of an upgrade/augmentation (its fields, etc)
- A file that defines the list of known upgrades/augmentations, and the values for each one


## Open Questions

- **Score preview for a selected group:** Should the score a selected group would earn be shown before it is removed?
  This existed at one point but is not in the current code. Undecided; leave as-is (not shown) for now and come back to it.
- **Row-by-row left shift:** After removal, each row slides left independently (step 2 of Board Behavior). Is that
  intended, or should only fully-empty columns be removed (with whole columns shifting left, keeping columns intact)?
- **Currency for Augmentation Upgrades:** Coins (likely), or Score?
- **Other kinds of points:** Are points from achievements, from the computer player, and from finishing boards separate
  currencies, or the same as Score/Coins?
- **Penalties and life points:** How the end-of-board penalty and "life points" work (see Overview)
