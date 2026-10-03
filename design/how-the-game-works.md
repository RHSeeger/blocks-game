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
- Click any of the selected blocks again to remove them.
- You need at least 2 connected blocks of the same color to remove them.
- When blocks are removed, the blocks above fall down to fill the gaps, then blocks slide left to fill gaps in each row.
  The score the move earned floats up from where you clicked.
- The board is finished when there are no groups of 2 or more left. Click **Next Board** to start a new one.

The Computer Player plays its own board at the same time, all by itself. On a phone only one board is shown at a time;
the **You | Computer** switch above it picks which one.

Your board starts at 8x8 (8 columns and 8 rows), and the Computer Player's at 10x10. The Bigger Board Upgrade makes
them bigger: yours up to 12x12, and the Computer Player's up to 20x20.

## Score

You earn Score for every group you remove. Bigger groups are worth a lot more: each block in a group is worth more than
the one before it.

| Group size | Score |
|---|---|
| 2 | 3 |
| 3 | 5 |
| 4 | 8 |
| 5 | 11 |
| 8 | 21 |
| 10 | 29 |
| 20 | 74 |

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
- **Refill block** (an arrow pointing down into a tray): doesn't remove anything extra. Instead, once the blocks have
  settled, every empty space on the board is filled with a new block, dropping in from the top. The new blocks can
  include other special blocks, but never another refill block.
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
  - **Achievements:** 2 Gems for each one.
  - **Board score goals:** Finish a board with a high enough board score to earn 1 Gem. The first goal is 110, and it
    goes up by 20 each time you reach it.
  - **Spotless boards:** 1 Gem every time you finish a board with no blocks left on it.
  - **Computer milestones:** 1 Gem when the Computer Player finishes its 10th board, then its 20th, 40th, 80th, and so
    on.

  The next goal for each player is shown with their scores, above their board.

So playing yourself makes the Computer Player stronger, and letting the Computer Player play makes you stronger.

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
| **Refill Block Chance** | You, or the Computer Player | Chips for you, Coins for the Computer Player | +25% chance of a refill block on each new board |
| **Greedier** | Computer Player | Coins | Greedy looks at more groups before choosing (3, then 5, then 8, then all of them) |
| **Faster Computer** | Computer Player | Coins | The Computer Player takes its turns 20% faster |
| **Bigger Board** | You or the Computer Player | Gems | The board gets 1 column and 1 row bigger, starting with the next board (up to 12x12 for you, 20x20 for the Computer Player) |

**How the special block chances work** (the same for every kind of special block): once a kind of special block is
unlocked, there's a 100% chance of one on each new board. Each Upgrade level adds 25%. Every full 100% is a guaranteed
block, and anything left over is the chance of one more. For example, at 150% you always get one, and half the time
you get a second one.
