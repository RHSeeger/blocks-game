# To Do

Known work that still needs doing: fixes, cleanup, follow-ups, and planned features that haven't been designed or
built yet. Once a feature is designed, its description belongs in `game-design.md`; this list only tracks that it
still needs doing.

- Add an item when something is found that needs fixing but isn't being fixed right away.
- Remove an item when it's done (git history keeps the record). If finishing it involved a design decision, record that
  in `decisions.md`.

---

## Reported: tapping outside the selection seems to add to it (2026-10-03)
The developer selected an orange group next to a bomb (a 25-block chain: the bomb, the line above it, column 3, two
+1s), then tapped a yellow block outside the selection. Instead of the selection clearing, it seemed to grow.

Investigation (the board from the report was rebuilt and both moves worked out; they match the screenshots exactly):
the game did what its rules say. Tapping a valid block outside the selection selects *that* block's move (only an
invalid block, or a tap off the board, clears the selection). The yellow group's move is a 41-block chain: it touches
a +1, which reaches another +1, then the bomb, which sets off the line, so it covers nearly all of the orange move as
well. So it replaced the selection with a bigger one that overlaps it, which looks like adding.

The developer expected a tap outside the selection to clear it. Options to decide between:
- **Change the rule:** a tap outside the selection only clears it; another tap selects the new group. Simple and
  predictable, but switching from one group to another takes an extra tap.
- **Keep the rule, make the change visible:** e.g. briefly flash the new selection when it replaces another, or show
  the tapped group differently from the blocks special blocks pull in, so a new selection never looks like the old
  one grown.
- **Both:** clear on a tap outside, but only when the new move would overlap the current selection.

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
- **A light/dark switch (maybe).** Dark mode follows the device's setting. If players want to choose for themselves, a
  switch (System / Light / Dark) on the Settings tab would need the choice saved in the game state, and the dark
  tokens in `styles.css` also applied by a class or attribute, not only by the media query.

## Idle play
- **A Gem Upgrade for progress while away.** Time away is worth at most an hour of play (see game-design.md, "Progress
  while away"), so overnight is worth under an hour. A game-changing (Gem) Upgrade for the computer player would make
  time away worth more, so generous offline progress is something earned. Options for what each level does (to
  decide):
  - Add a step to the end of `AWAY_RATES` (16 to 32 hours at 1/128, and so on): each level adds 7.5 minutes of play,
    and lets longer absences count. Simple, but small.
  - Slow the halving (e.g. each step keeps 2/3 of the rate instead of 1/2): every absence is worth more, overnight
    most of all.
  - Lengthen the full-speed start (15 minutes, then 30, 60, ...): helps short breaks most.

  `getAwayPlayMs` would need the computer player's level, and the "While you were away" pop-up's "only the first 16
  hours count" would need to follow it.

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
- **Spotless still unlocks nothing.** It's rare, so it would suit something special.

## Rewarding a cleaner board (to discuss)
Leftover blocks aren't penalized (decided 2026-10-03). The clean-up bonus (see game-design.md) and Spotless reward
clearing more of a board. More ideas:
- **Greedy could aim for the clean-up bonus** (it plans for big groups, but not for few blocks left).
- **A Gem for a nearly clean board** (e.g. 3 or fewer left), a smaller version of the Spotless Gem.
- **Achievements:** "Tidy" (3 boards in a row with 5 or fewer left), "Spotless x5", and so on.
- **Stats tab:** fewest blocks left, and how many boards were spotless.
- **Spotless unlocking something** (see above).

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
