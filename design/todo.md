# To Do

Known work that still needs doing: fixes, cleanup, follow-ups, and planned features that haven't been designed or
built yet. Once a feature is designed, its description belongs in `game-design.md`; this list only tracks that it
still needs doing.

- Add an item when something is found that needs fixing but isn't being fixed right away.
- Remove an item when it's done (git history keeps the record). If finishing it involved a design decision, record that
  in `decisions.md`.

---

## Old localStorage keys are left behind
Saves from before the 2026-10-01 restructure used the keys `blocksPlayerStats`, `blocksAchievements` and `blocksUnlocks`.
Nothing reads them any more. They're harmless, but could be removed from the browser's storage at startup.

## Bring older code in line with the style rules
Code written before 2026-10-01 may not follow the CLAUDE.md style rules (file-header order, TSDoc on every function,
one type per file). Fix these as files are touched.

---

# Planned features

## Display and platforms
- **Make the game playable directly from GitHub,** in a way that still lets other games (in other repos) be made
  playable the same way. Start by working out what's involved. GitHub Pages "project sites" are likely the answer:
  each repo is published at its own address (`<user>.github.io/<repo>`), so every game gets its own page. It would
  probably be built and published by a GitHub Actions workflow (the build output in `dist/` isn't committed).
- **Check the phone layout on a real phone with a Bigger Board:** blocks shrink to fit, so the human player's largest
  board (12x12) has blocks about 28px across on a phone. Check that's still easy to tap. (Touch scrolling was checked
  on a real phone on 2026-10-03 and isn't a problem.)
- **Dark mode.** Every color in `styles.css` is a token on `:root`, so a dark theme is mostly a second set of values
  (under `prefers-color-scheme: dark`, maybe with a switch on the Settings tab).

## Idle play
- **Balance progress while away.** It counts at the computer's full speed, for up to 8 hours: a test of 2 hours 15
  minutes (with Greedy and three special blocks) gave 180 boards, about 34,000 Chips and 5 milestone Gems. Many idle
  games count time away at a reduced rate (say 50%), or make the 8 hours an Upgrade. Decide after playing with it.

## Achievements
- **Decide which achievement unlocks x2 Blocks.** x2 Blocks is defined in `data/augmentations.ts`, but nothing unlocks
  it, and the block itself isn't implemented yet.
- **A "No, not like that" for x2 Blocks:** an achievement, earned by the human using an x2 block badly, that unlocks
  x2 Blocks for the computer player (like the +1 version). The exact condition is still to be decided.
- **Come up with more achievements, Augmentations and Upgrades.**

## Special blocks
- **Decide how +2 Blocks get into the game,** so that both +1 and +2 blocks can appear on a board. +2 Blocks is
  defined in `data/augmentations.ts`, but nothing unlocks it and the block isn't implemented. Options:
  - Unlocked by an achievement, the same way +1 Blocks is.
  - A game-changing (Gem) Upgrade to "+1 Blocks" that turns it into "Up to +2 Blocks".

  Decided so far:
  - **How a +2 works:** like a +1, but it adds 2 to the reach instead of 1. It chains the same way (a +2 touching the
    area a move reaches is used, and grows the area by 2).

  Still to decide:
  - **How often a +2 appears.** Current idea: the +1s are placed on the board first, then each one has a chance to
    become a +2. Each one that does lowers the chance for the next one, so a board with several +2s is rare (similar to
    how +1 Block Chance works, where each extra +1 is less likely than the one before). What the starting chance is,
    how much it drops, and whether an Upgrade raises it are all still open.
- **Bigger bombs (5x5).** A possible Upgrade for Bomb Blocks. The move rules (`gamelogic/board/moves.ts`) only see the
  board, so a per-player bomb size would need passing in to `getMoveAt` and everything that calls it (or stored on
  each bomb block when it's placed, which is simpler: a "big bomb" block type).
- **Refill blocks are much stronger than the others.** With size x size scoring (simulation, 2026-10-03, playing the
  best-scoring move), a typical board (median) scores:

  | Board | No special blocks | +1 | +1, line, bomb, refill |
  |---|---|---|---|
  | 8x8 | 201 | 240 | 566 |
  | 10x10 | 347 | 401 | 814 |
  | 12x12 | 538 | 590 | 1136 |

  Before the scoring change, +1, line and bomb added 5-10% each and a refill about 40% on its own. That may be fine
  (it's the last one unlocked, as a reward), or its starting chance could be lower (e.g. 50%).
- **Spotless still unlocks nothing.** It's rare, so it would suit something special.

## Upgrades
- **"x2 Block Chance"**, once x2 Blocks exist: works like "+1 Block Chance" (add it to `data/upgrades.ts` and
  `data/specialBlocks.ts`).
- **More game-changing (Gem) Upgrades,** such as more block colors. Decide each one's trade-off first: some make the
  game harder (more colors means smaller groups and more leftover blocks), so they need a reward, such as a score
  bonus for each extra color, or to be something the player can switch on for a bonus.
- **Balance the numbers.** Costs, the Gem goal and the computer's speed were picked from a quick simulation and are
  all in `data/upgrades.ts` and `data/gems.ts`. Adjust them after playing for a while.
  - Bigger Board doubles in cost each level, which was fine for 5 levels but makes the computer's 10 levels (to 20x20)
    very expensive: the last level costs 1,536 Gems. It may need a different cost scaling for the computer.
