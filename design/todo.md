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
- **Give the game a visual makeover.** Most of the page is still unstyled, and it looks it. In particular:
  - the tabs look like plain buttons
  - the score and stats lines above each board are plain text run together
  - the page as a whole has no overall look (layout, spacing, colors, fonts)

  Aim for one consistent style across the whole game, rather than patching pieces one at a time.
- **Make the game playable directly from GitHub,** in a way that still lets other games (in other repos) be made
  playable the same way. Start by working out what's involved. GitHub Pages "project sites" are likely the answer:
  each repo is published at its own address (`<user>.github.io/<repo>`), so every game gets its own page. It would
  probably be built and published by a GitHub Actions workflow (the build output in `dist/` isn't committed).
- **Make it mobile friendly.** The main problem is the boards: on a phone, the human player's board probably needs to
  fill most of the screen so blocks are big enough to tap. Likely different layouts for desktop, phone (small screen)
  and tablet (medium screen), e.g. showing the computer's board smaller or on its own tab on a phone. The grid's
  columns/rows already come from the board (`--board-columns`/`--board-rows`), but each block is still a fixed 40px.

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

## Upgrades
- **"x2 Block Chance"**, once x2 Blocks exist: works like "+1 Block Chance" (add it to `data/upgrades.ts`, and have
  `createNewBoard` place them).
- **More game-changing (Gem) Upgrades,** such as more block colors. Decide each one's trade-off first: some make the
  game harder (more colors means smaller groups and more leftover blocks), so they need a reward, such as a score
  bonus for each extra color, or to be something the player can switch on for a bonus.
- **Greedy barely helps.** A simulation (2026-10-02) found picking the best-scoring group scores about the same as a
  random move (about 168 vs 166 per 10x10 board), because the biggest group *now* isn't the best move for the whole
  board. Consider making Greedy smarter (e.g. looking ahead), or changing what Greedy/Greedier do. Re-check this
  first: since +1 blocks now add up and chain, picking the move with the best score may be worth a lot more when a
  board has several +1s.
- **Balance the numbers.** Costs, the Gem goal and the computer's speed were picked from a quick simulation and are
  all in `data/upgrades.ts` and `data/gems.ts`. Adjust them after playing for a while.
