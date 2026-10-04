# To Do

Known work that still needs doing: fixes, cleanup, follow-ups, and planned features that haven't been designed or
built yet. Once a feature is designed, its description belongs in `game-design.md`; this list only tracks that it
still needs doing.

- Add an item when something is found that needs fixing but isn't being fixed right away.
- Remove an item when it's done (git history keeps the record). If finishing it involved a design decision, record that
  in `decisions.md`.

---

# Planned features

## Display and platforms
- **A light/dark switch (maybe).** Dark mode follows the device's setting. If players want to choose for themselves, a
  switch (System / Light / Dark) on the Settings tab would need the choice saved in the game state, and the dark
  tokens in `styles.css` also applied by a class or attribute, not only by the media query.

## Achievements
- **Come up with more achievements, Augmentations and Upgrades.**

## Special blocks
- **Maybe later: a plain x2 block** (x2 for one move) as an everyday special block. Not decided: there may already be
  enough kinds of special block.

## Rewarding a cleaner board (to discuss)
Leftover blocks aren't penalized (decided 2026-10-03). The clean-up bonus, the Tidy and Spotless Gems and
achievements, and Spotless x5 (see game-design.md) reward clearing more of a board. More ideas:
- **Achievements:** "Tidy x3" (3 boards in a row with 2 or fewer left; would need the game state to count boards in a
  row), and so on.

## Upgrades
- **More game-changing (Gem) Upgrades,** such as more block colors. Decide each one's trade-off first: some make the
  game harder (more colors means smaller groups and more leftover blocks), so they need a reward, such as a score
  bonus for each extra color, or to be something the player can switch on for a bonus.
- **Balance the numbers.** Costs, the Gem goal and the computer's speed were picked from a quick simulation and are
  all in `data/upgrades.ts` and `data/gems.ts`. Adjust them after playing for a while.
  - The computer's Bigger Board costs 340 Gems for all 10 levels (x1.5 a level). If Gems turn out to come in too
    slowly for that, x1.35 (163 in all) was the fallback considered.
