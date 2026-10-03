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
- **Come up with more achievements, Augmentations and Upgrades.**

## Special blocks
- **Color Blast blocks** (decided 2026-10-03, to build), replacing the planned x2 block.
  - **What it does:** when it goes off (by the usual rule), every block of the clicked group's color on the whole board
    is removed with the move, all counted as one group for the score (size x size). Special blocks inside the area it
    adds go off too, as usual.
  - **Why:** the developer wanted the replacement for x2 to feel like a refill: rare, but a big moment. A plain "double
    this move's score" doesn't: with size x size scoring, doubling a move is worth about the same as 40% more blocks
    in the group (a pair: 4 → 8, while 3 blocks is 9; 10 blocks: 100 → 200, while 14 blocks is 196). A Color Blast
    pays off most when a color has been saved up, so it rewards the planning the scoring encourages. Considered: "x2
    for the rest of the board", and "blocks count twice" (x4).
  - **Look:** a small rainbow ring.
  - **Unlocks:** Spotless unlocks it for the human player; a "You call that a blast? Let me show you" achievement (a
    group of 2 with a Color Blast) unlocks it for the computer.
  - **How often:** balanced by frequency, like refill (a low starting chance, decided from a simulation), with a
    "Color Blast Chance" Upgrade.
  - Replace the unused "x2 Blocks" Augmentation in `data/augmentations.ts`, and add its explanation pop-up (with a
    picture) and How to Play text.
- **Maybe later: a plain x2 block** (x2 for one move) as an everyday special block. Not decided: there may already be
  enough kinds of special block.

## Rewarding a cleaner board (to discuss)
Leftover blocks aren't penalized (decided 2026-10-03). The clean-up bonus (see game-design.md) and Spotless reward
clearing more of a board. More ideas:
- **Greedy could aim for the clean-up bonus** (it plans for big groups, but not for few blocks left).
- **A Gem for a nearly clean board** (e.g. 3 or fewer left), a smaller version of the Spotless Gem.
- **Achievements:** "Tidy" (3 boards in a row with 5 or fewer left), "Spotless x5", and so on.
- **Stats tab:** fewest blocks left, and how many boards were spotless.

## Upgrades
- **More game-changing (Gem) Upgrades,** such as more block colors. Decide each one's trade-off first: some make the
  game harder (more colors means smaller groups and more leftover blocks), so they need a reward, such as a score
  bonus for each extra color, or to be something the player can switch on for a bonus.
- **Balance the numbers.** Costs, the Gem goal and the computer's speed were picked from a quick simulation and are
  all in `data/upgrades.ts` and `data/gems.ts`. Adjust them after playing for a while.
  - Bigger Board doubles in cost each level, which was fine for 5 levels but makes the computer's 10 levels (to 20x20)
    very expensive: the last level costs 1,536 Gems. It may need a different cost scaling for the computer.
