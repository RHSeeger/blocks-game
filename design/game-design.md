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
- There are special blocks, such as "+1" (that increases the radius of affected blocks) and Color Blast (that removes a whole color)
- A board is completed when there are no more valid moves (no group of 2 or more connected blocks of the same color; see Board Behavior)
- There's no penalty for blocks left at the end of a board, and no "life points" or rounds (decided 2026-10-03): the
  game is played indefinitely, one board after another. Clearing more of a board is rewarded instead (such as the
  Spotless achievement and Gems)
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

**Progress while away:** the computer player keeps playing while the game isn't open. When the game is opened again
(or its tab is shown again, or the phone unlocked) after a minute or more away, the computer catches up on the turns
it missed, and a "While you were away" pop-up says how long, how much play that was worth, how many boards it
finished, and what it earned (score, Chips, and any milestone Gems).
- **It plays slower the longer it's away** (`AWAY_RATES` in `data/away.ts`): full speed for the first 15 minutes, then
  half speed up to 30 minutes, a quarter up to 1 hour, an eighth up to 2 hours, and so on, halving each time the time
  away doubles, up to 16 hours. Nothing after 16 hours counts. Each step after the first is worth the same 7.5
  minutes of play, so a short break loses little, coming back later always gives a bit more, and the most time away
  can be worth is an hour of play:

  | Away for | 15 min | 30 min | 1 hour | 2 hours | 4 hours | 8 hours | 16 hours or more |
  |---|---|---|---|---|---|---|---|
  | Worth | 15 min | 22.5 min | 30 min | 37.5 min | 45 min | 52.5 min | 1 hour |
- The turns are really played, as far as a 0.2-second time budget allows (so opening the game doesn't freeze); the
  rest are estimated from those, at the same rate. The board shown afterwards is where the played turns left off.
- While the game's tab is hidden, the computer doesn't play; the time is caught up on when it's shown again. (Browsers
  slow down or stop hidden pages by different amounts, so catching up is the only way to count the time fairly.)
- Only the computer player progresses while away. The human player's board waits.


## Board Behavior

- **Board size:** Each player's board has its own width and height. The human player's starts at 8x8 and the computer
  player's at 10x10. The "Bigger Board" Upgrade makes it bigger, starting with that player's next board (Next Board,
  or Reset Human Player Board); the board in play doesn't change size. The human player's board stops at 12x12 (bigger
  would be hard to tap on a phone); the computer player's, which is only watched, stops at 20x20.
- **Valid moves:** A move needs a group of 2 or more connected blocks of the same color. Special blocks only add to an
  already valid group; a single block touching a "+1" block is not a valid move.
- **Selecting and removing:** Clicking a block selects (highlights) everything its move would remove. Clicking any
  highlighted block removes them. While something is selected, clicking anything else (any block outside the
  selection, even one that's a valid move, or anywhere away from the board) only clears the selection; another click
  then selects the new group. With nothing selected, clicking a block that isn't a valid move does nothing.
- **Score preview:** while the human player has a group selected, what it would score is shown, small and muted, next
  to their Board Score (e.g. "+16"), so they can judge whether to take it now or wait for it to grow. It's worked out
  by game logic (`DerivedGameInfo.humanSelectionScore`). The computer player's board has no preview (its selections
  only last one turn).
- **After a group is removed**, the board settles:
    1. Blocks fall down to fill gaps in each column
    2. Blocks in each row slide left to fill gaps in that row (each row on its own, so columns don't stay together;
       this is intended, decided 2026-10-03)
    3. Blocks fall down again
- **Scoring:** a move scores the number of regular blocks it removes (including any special blocks add), times itself:
  2 blocks score 4, 10 score 100, 20 score 400. One big group is worth far more than the same blocks in small groups,
  so planning pays off (saving up a color, clearing the others first so it joins up). Special blocks removed don't
  count toward the size.
- **Showing a move:** the removed blocks shrink away, the remaining blocks slide from their old spaces to their new
  ones (straight there, rather than step by step), and the score the move earned floats up from the block that was
  clicked (bigger, in gold, for 100 or more). Both players' moves are shown, when their board is on screen. With
  "reduce motion" turned on in the device's settings, only the score is shown, fading in place.
- **Clean-up bonus:** when a board ends with no more blocks left than there are colors (special blocks count), the
  board score goes up by 5% for each step: with 5 colors, 5 left is +5%, 4 is +10%, 3 is +15%, 2 is +20%, 1 is +25%,
  and none is +30% plus 20% for the full clear, so +50%. It's tied to the number of colors, so if more colors are
  added (making a board harder to clear), it starts sooner and is worth more. It's added like any points (score,
  Coins or Chips, the Gem goal), applies to both players, and shows over the board as "+N clean-up bonus". The values
  are `CLEANUP_BONUS_PERCENT_PER_BLOCK` and `CLEANUP_BONUS_FULL_CLEAR_PERCENT` in `data/board.ts`. In a simulation,
  planned play on an 8x8 board earns it on about a quarter to a third of boards.
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
- **Dark mode:** the game follows the device's light or dark setting. In dark mode the page, cards, tabs and pop-ups
  are dark; the boards (already dark) get a little darker, and the blocks keep their colors.
- **Introduction:** when the game is first opened (and after Reset Game), a pop-up explains how to play, with small
  example boards: tapping a group to select it, tapping again to remove it (and how the blocks settle), size x size
  scoring (a pair against a group of 10, and the tip to save a color), that special blocks exist (each is explained
  when it's unlocked, not here), and the Computer Player. It stays until the player closes it with its button (or
  Escape); tapping outside it does nothing. Whether it has been seen is saved (`introSeen`). The How to Play tab has
  a "Show the introduction" button.
- **Special block explanations:** when the human player unlocks a special block (or buys the first level of +2 Block
  Chance or Big Bomb Chance, for the bigger versions), a pop-up explains what it does, with
  an example board showing a move selected (so it's clear what the block adds; refill shows the board before and
  after). It stays until closed with its button (or Escape). Which special blocks have been explained is saved
  (`specialBlocksExplained`), and game logic picks the next one to explain, so they're shown one at a time (after the
  introduction), and one that wasn't closed comes back after a reload. The computer player's unlocks still get only
  the usual fading notification.
- **Debug Tools** (Settings tab): for testing. Hidden until "Show Debug Tools" is clicked (and hidden again after a
  reload). Once shown, there are buttons to add Coins, Chips or Gems, and each achievement not yet accomplished has a
  Grant button on the Achievements tab. Granting an achievement works exactly as if it had been accomplished: its Gems,
  its unlock, and the pop-ups. Combined with Reset Human Player Board (to get a board with the newly unlocked special
  blocks), this lets a new feature be tried straight away.


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
- **Bomb Blocks** (both players): bomb blocks can appear on new boards (one per board to start; see the "Bomb Block
  Chance" Upgrade), shown as a white ring with a dot. A bomb block a move uses adds the 3x3 square around itself to
  the area (cut off at the board's edges). The size is `BOMB_RADIUS` in `data/specialBlocks.ts`
- **Bigger versions: +2 blocks and big bombs.** Once a player has +1 Blocks (or Bomb Blocks), the "+2 Block Chance"
  (or "Big Bomb Chance") Upgrade gives each +1 (or bomb) placed a chance to be the bigger version instead: 5% a level,
  up to 50% at level 10. This applies to refills' new blocks too. A +2 is a +1 that reaches 2 spaces (shown "+2"); a
  big bomb clears the 5x5 square around it (shown with two rings; `BIG_BOMB_RADIUS` in `data/specialBlocks.ts`). They
  chain like any special block, count as a +1 or a bomb for the "let me show you" achievements, and get their own
  explanation pop-up when the Upgrade is first bought
- **Refill Blocks** (both players): refill blocks can appear on new boards (a 40% chance per board to start, less
  often than the other special blocks since each one is worth more; see the "Refill Block Chance" Upgrade), shown as
  an arrow pointing down into a tray. A refill block goes off by the same rule as the
  others, but adds nothing to the area. Instead, once the board has settled, every empty space is filled with a new
  block, and the new blocks drop in from the top. Setting off more than one in a move still refills the board once.
  The new blocks never include a refill block (so a board can't refill forever), but can include the player's other
  special blocks, with their usual chances scaled by how much of the board is refilled (refilling 40% of the board
  gives 40% of each usual chance)
- **Greedy** (computer player only): instead of a random move, the computer player plans. It saves up the color with
  the most blocks on the board (so they merge into big groups), and checks 3 different groups, chosen at random: it
  clears the smallest of them that's another color and sets off no special blocks (so it doesn't waste them). If none
  of them is, it makes the move worth the most points. The "Greedier" Upgrade raises how many groups it checks. In a
  simulation (10x10 boards), Greedy scores about 25% more than random moves, and checking every group 35-70% more
  (the more special blocks, the more it gains)
- **Tidy** (computer player only): near the end of a board (once 30% of its spaces or fewer have blocks in them;
  `TIDY_ENDGAME_PERCENT` in `data/augmentations.ts`), the computer player looks ahead. For each group it checks (the
  same number Greedy checks, so Greedier helps here too), it plays the rest of the board out in its head with Greedy's
  plan, and makes the move that ends the board with the most points, counting the clean-up bonus. So it only gives up
  points from moves when a better clean-up bonus is worth more. Refill blocks are treated as adding nothing (what a
  refill brings can't be known ahead). It works without Greedy too (earlier in the board it then plays randomly, as
  usual). In a simulation (300 boards each, with Greedy), it earns the clean-up bonus on 45-60% of boards instead of
  8-26%, and adds 5-13% to the score on 10x10 and 14x14 boards, and about 40% on 20x20 ones (where Greedy alone
  almost never earns the bonus). Looking ahead costs a few milliseconds per move, even on a 20x20 board
- **Color Blast Blocks** (both players): Color Blast blocks can appear on new boards, but rarely (a 20% chance per
  board to start; see the "Color Blast Chance" Upgrade), shown as a small rainbow ring. A Color Blast a move uses adds
  every block on the board of the group's color to the area, so the whole color goes, scored as one group (size x
  size). Special blocks touching any of those blocks go off too, by the usual rule. It pays off most when a color has
  been saved up, so it rewards planning. A refill can bring one (it isn't excluded, like refill blocks are). It
  replaced the planned x2 block, which wasn't much of a moment with size x size scoring (doubling a move's score is
  worth about the same as 40% more blocks in the group)

Current Achievements:
- **First Board Clear** - finish a board. Unlocks +1 Blocks for the human player
- **No, not like that. Let me show you** - remove a group of 2 with a +1 block touching it. Unlocks +1 Blocks for the
  computer player
- **Big Group!** - remove a group of 20 or more blocks at once. Unlocks Greedy for the computer player
- **Score 2,500!** - reach a total score of 2,500. Unlocks Line Blocks for the human player (it was Score 1000!
  before scoring changed to size x size)
- **You call that a line? Let me show you** - remove a group of 2 with a line block touching it. Unlocks Line Blocks
  for the computer player
- **Spotless** - finish a board with no blocks left on it (a leftover special block counts as a block). Unlocks Color
  Blast Blocks for the human player
- **Taste the Rainbow** - finish a board with at least one block of every color left on it. Unlocks Bomb Blocks for the
  human player
- **You call that an explosion? Let me show you** - remove a group of 2 with a bomb block touching it. Unlocks Bomb
  Blocks for the computer player
- **Chain Reaction** - set off 3 or more special blocks in one move. Unlocks Refill Blocks for the human player
- **You call that a refill? Let me show you** - remove a group of 2 with a refill block touching it. Unlocks Refill
  Blocks for the computer player
- **You call that a blast? Let me show you** - remove a group of 2 with a Color Blast block touching it. Unlocks Color
  Blast Blocks for the computer player
- **Tidy** - finish a board with 2 or fewer blocks left on it (special blocks count; `TIDY_BLOCKS_LEFT` in
  `data/achievements.ts`). A Spotless board counts too. Unlocks Tidy for the computer player. In a simulation of 8x8
  boards, well-planned play leaves 2 or fewer blocks on about 12-18% of boards

For the "let me show you" achievements, the group of 2 is the pair of same-colored blocks tapped, not everything the
move removes (the special block can still remove more), and the special block must touch the pair itself: one set off
further away, in a chain, doesn't count. In a simulation, about 85% of boards with one of that kind of special block
offer such a pair at some point, so they come soon after the human player gets the block.

If an achievement is given an unlock after some players have already accomplished it, they get the unlock the next
time the game is loaded.

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
- **Board score goal:** finish a board with a board score of at least the goal (starts at 250) for 1 Gem. The goal
  then goes up by 50
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
| **+1 Block Chance** | Both | Everyday | +1 Blocks | +25% chance of a +1 block per board (starts at 100%), up to level 12 | 250, x1.6 |
| **Line Block Chance** | Both | Everyday | Line Blocks | +25% chance of a line block per board (starts at 100%), up to level 12 | 250, x1.6 |
| **Bomb Block Chance** | Both | Everyday | Bomb Blocks | +25% chance of a bomb block per board (starts at 100%), up to level 12 | 250, x1.6 |
| **+2 Block Chance** | Both | Everyday | +1 Blocks | +5% chance of each +1 block being a +2 instead, up to level 10 (50%) | 400, x1.6 |
| **Big Bomb Chance** | Both | Everyday | Bomb Blocks | +5% chance of each bomb being a big bomb (5x5) instead, up to level 10 (50%) | 400, x1.6 |
| **Refill Block Chance** | Both | Everyday | Refill Blocks | +10% chance of a refill block per board (starts at 40%), up to level 12 | 250, x1.6 |
| **Color Blast Chance** | Both | Everyday | Color Blast Blocks | +5% chance of a Color Blast block per board (starts at 20%), up to level 12 | 250, x1.6 |
| **Greedier** | Computer | Everyday | Greedy | Greedy checks 3 → 5 → 8 → every group | 250, x2 |
| **Faster Computer** | Computer | Everyday | - | 20% less time between computer turns (starts at 1 second), up to level 8 | 75, x1.6 |
| **Bigger Board** | Both | Game-changing | - | +1 column and +1 row, from the next board on, up to 12x12 for the human (level 4) and 20x20 for the computer (level 10) | 3 Gems, x2 |

Special blocks are balanced by how often they appear, not by changing what they do. A refill block is worth about 1.5
to 3 times as much as another special block when it appears (a simulation, 2026-10-03), so refill blocks appear at 40%
of the others' rate at every level (each kind's chances are in `data/specialBlocks.ts`). A Color Blast is worth about
3 to 4 times as much on an 8x8 board, and 8 to 14 times on a 12x12 one (a simulation, 2026-10-03), so Color Blast
blocks appear at 20% of the usual rate at every level. That makes one about as valuable on average as a bomb on an
8x8 board, and still a big moment when it appears on a bigger one.

How a special block chance (+1, Line, Bomb, Refill and Color Blast Chance) works: each full 100% is a guaranteed block, and
whatever is left over is the chance of one more. For example, 150% gives one block for sure, and a 50% chance of a
second one. Each kind of special block is rolled separately. How each kind gets onto boards (its Augmentation and its
chance Upgrade) is listed in `data/specialBlocks.ts`, so adding a kind that appears the same way is a new entry there.


## Open Questions

- **More rewards for clearing more of a board?** Leftover blocks aren't penalized; the clean-up bonus and Spotless
  reward clearing more, and there are more ideas in todo.md.
