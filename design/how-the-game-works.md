# How the Game Works

A plain-language explanation of *how* the game works, as a player experiences it, for people reading the source
(developers, AI). Keep it up to date when features change. The reasons behind the design are in `game-design.md` and
`decisions.md`, not here.

This is **not** the text shown in the game. The in-game **How to Play** tab (in `src/index.html`) is written separately,
for players. Both explain the same game, but they have different readers and can cover different things in different
ways. When a feature players would notice changes, check both.

---

## Playing a board

- Click a block to select it, along with every block of the same color connected to it. Blocks connect up, down, left
  and right (not diagonally).
- Click any of the selected blocks again to remove them. While a group is selected, what it would score is shown next to
  your Board Score.
- Clicking anywhere else (even another group) just clears the selection. Click again to select something new.
- You need at least 2 connected blocks of the same color to remove them.
- When blocks are removed, the blocks above fall down to fill the gaps, then blocks slide left to fill gaps in each row.
  The score the move earned floats up from where you clicked.
- The board is finished when there are no groups of 2 or more left. Click **Next Board** to start a new one.

The Computer Player plays its own board at the same time, all by itself. On a phone only one board is shown at a time;
the **You | Computer** switch above it picks which one.

Your board starts at 8x8 (8 columns and 8 rows), and the Computer Player's at 10x10. The Bigger Board Upgrade makes
them bigger: yours up to 12x12, and the Computer Player's up to 20x20.

## Score

You earn Score for every group you remove: the group's size times itself (counting every regular block the move
removes, including those special blocks add). So one big group is worth far more than the same blocks in small
groups: a group of 10 is 100 points, but five pairs are 20. The best way to play is to pick a color to save, clear the
other colors around it so its blocks join up, and then remove it in one go.

| Group size | Score |
|---|---|
| 2 | 4 |
| 3 | 9 |
| 4 | 16 |
| 5 | 25 |
| 8 | 64 |
| 10 | 100 |
| 20 | 400 |

**Clean-up bonus:** when a board ends with only a few blocks left, your board score goes up. With 5 colors, 5 left is
+5%, and each block fewer adds another 5%, up to +25% for 1 left. Clearing the board completely is +50%. (The more
colors there are, the sooner it starts.)

Score is never spent. It's a record of how well you've done.

## Special blocks

Special blocks go off when the area you're removing touches them (to start with, that's just your group). Each one
makes the area bigger, and the extra blocks, whatever their color, count toward your score.

- **+1 block:** removes every block touching your group.
  - +1 blocks add up. Each +1 reaches 1 space further: with two, every block up to 2 spaces away from your group is
    removed; with three, up to 3 spaces away; and so on.
- **Line block** (a white bar): removes every block in its row, if the bar is horizontal, or its column, if it's
  vertical.
- **Bomb block** (a white ring): removes every block in the 3x3 square around it.
- **Bigger versions:** with the "+2 Block Chance" and "Big Bomb Chance" Upgrades, some +1 blocks become **+2 blocks**
  (they reach 2 spaces) and some bombs become **big bombs** (two rings; they clear a 5x5 square). Each level makes them
  5% more likely, up to 50%.
- **Refill block** (an arrow pointing down into a tray): doesn't remove anything extra. Instead, once the blocks have
  settled, every empty space on the board is filled with a new block, dropping in from the top. The new blocks can
  include other special blocks, but never another refill block.
- **Color Blast block** (a small rainbow ring): removes every block on the whole board of the same color as your
  group, all counted as one group for the score. They're rare, so they're worth most when you've saved up a color.
- Special blocks chain. If the area being removed reaches or touches another special block, that one goes off too. A
  line block can set off a +1 next to its row, a +1's reach can set off a line block, and so on, until no more are
  reached.
- A special block can't be removed on its own, and a single block touching one isn't enough: the group still needs at
  least 2 blocks of the same color.

## Currencies

There are three currencies. You can see how much of each you have at the top of the screen.

- **Coins:** You earn 1 Coin for every point of Score you earn. Coins buy Upgrades for the **Computer Player**.
- **Chips:** The Computer Player earns 1 Chip for every point of score it earns. Chips buy Upgrades for **you**.
- **Gems:** Gems are rarer. They buy the biggest Upgrades, for either player. You earn Gems by:
  - **Achievements:** 2 Gems for each one (Spotless x5, for 5 boards with no blocks left, gives 10).
  - **Board score goals:** Finish a board with a high enough board score to earn 1 Gem. The first goal is 250, and it
    goes up by 50 each time you reach it.
  - **Tidy boards:** 1 Gem every time you finish a board with 2 or fewer blocks left on it.
  - **Spotless boards:** 1 more Gem every time you finish a board with no blocks left on it (2 in all, with the Tidy
    Gem).
  - **Computer milestones:** 1 Gem when the Computer Player finishes its 10th board, then its 20th, 40th, 80th, and so
    on.

  The next goal for each player is shown with their scores, above their board.

So playing yourself makes the Computer Player stronger, and letting the Computer Player play makes you stronger.

The Computer Player keeps playing while the game is closed (or in a background tab). It plays at full speed for the
first 15 minutes, then at half speed, then a quarter, and so on, halving each time the time away doubles, up to 16
hours: an hour away is worth 30 minutes of play, 8 hours about 52 minutes, and the most is an hour. The **Better
While Away** Upgrade (Gems) makes it slow down less, so a long time away is worth more: at its last level, 8 hours is
worth 2.7 hours of play, and 16 hours 4.1 hours. When you come back, it catches up on the time, and a pop-up tells you
what it did while you were away.

## Achievements

Achievements are things you accomplish while playing, like finishing your first board. Each one gives Gems, and some
also unlock an **Augmentation**: a new feature for you or for the Computer Player. See the **Achievements** tab for the
full list, and the **Augmentations** tab for what each player has unlocked.

## Upgrades

Upgrades are bought on the **Upgrades** tab, one level at a time. Each level costs more than the one before.

- **Everyday Upgrades** improve a player a little at a time. Upgrades for you cost Chips; Upgrades for the Computer
  Player cost Coins.
- **Game-changing Upgrades** cost Gems, and can be bought for either player.
- Some Upgrades need an Augmentation to be unlocked first. The Upgrades tab shows what's needed.

| Upgrade | For | Costs | What each level does |
|---|---|---|---|
| **+1 Block Chance** | You, or the Computer Player | Chips for you, Coins for the Computer Player | +25% chance of a +1 block on each new board |
| **Line Block Chance** | You, or the Computer Player | Chips for you, Coins for the Computer Player | +25% chance of a line block on each new board |
| **Bomb Block Chance** | You, or the Computer Player | Chips for you, Coins for the Computer Player | +25% chance of a bomb block on each new board |
| **+2 Block Chance** | You, or the Computer Player | Chips for you, Coins for the Computer Player | +5% chance of each +1 block being a +2 instead (up to 50%) |
| **Big Bomb Chance** | You, or the Computer Player | Chips for you, Coins for the Computer Player | +5% chance of each bomb being a big bomb instead (up to 50%) |
| **Refill Block Chance** | You, or the Computer Player | Chips for you, Coins for the Computer Player | +10% chance of a refill block on each new board |
| **Color Blast Chance** | You, or the Computer Player | Chips for you, Coins for the Computer Player | +5% chance of a Color Blast block on each new board |
| **Greedier** | Computer Player | Coins | Greedy looks at more groups before choosing (3, then 5, then 8, then all of them) |
| **Faster Computer** | Computer Player | Coins | The Computer Player takes its turns 20% faster |
| **Bigger Board** | You or the Computer Player | Gems | The board gets 1 column and 1 row bigger, starting with the next board (up to 12x12 for you, 20x20 for the Computer Player) |
| **Better While Away** | Computer Player | Gems | Time away is worth more: the Computer Player slows down less the longer you're away (5 levels) |

**How the special block chances work:** once a kind of special block is unlocked, there's a 100% chance of one on
each new board, and each Upgrade level adds 25%. Refill blocks are rarer, since each one is worth more: they start at
40%, and each level adds 10%. Color Blast blocks are rarer still: they start at 20%, and each level adds 5%. Every
full 100% is a guaranteed block, and anything left over is the chance of one more.
For example, at 150% you always get one, and half the time you get a second one.
