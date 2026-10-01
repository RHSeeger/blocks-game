# Decision Log

A record of design and architecture decisions: what was decided, when, and why.

- `game-design.md` and `code-design.md` describe how things are **now**. This file records **how they got that way**.
- When a decision is made or changed, update the relevant design file **and** add an entry here.
- Entries are only ever added, never deleted. When a decision is replaced, change the old entry's **Status** to
  `Superseded by <date> — <title>` and add a new entry.
- Entries are in chronological order (newest at the bottom).

Entry format:

```markdown
## YYYY-MM-DD — Short title
**Decision:** What was decided.
**Why:** The reasoning behind it.
**Affects:** Which design files / areas of the code this touches.
**Status:** Active | Superseded by <date> — <title>
```

---

## 2025-12-09 — "Next Board" button only appears when the board is finished
**Decision:** The human player's "Next Board" button is shown only once the board has no removable groups left.
**Why:** The player should finish the board before moving on (leftover blocks are what the planned penalty is based on).
**Affects:** game-design.md (Board Behavior)
**Status:** Active
_(Carried over from the old CoPilot memory bank.)_

## 2025-12-09 — Finished boards are dimmed with a message on top
**Decision:** When a board is finished, it is dimmed (blocks still visible) and shows a "No more valid groups to
remove" message on top of it.
**Why:** Makes it obvious the board is done, while still letting the player see what was left.
**Affects:** game-design.md (Board Behavior); `src/css/styles.css` (`.inactive`)
**Status:** Active (currently not working in the code — the CSS exists but nothing applies it)
_(Carried over from the old CoPilot memory bank.)_

## 2026-10-01 — Retire the CoPilot memory bank; use the design docs and this log instead
**Decision:** The `memory-bank/` files are no longer used. Still-relevant content was moved into `game-design.md`
and this file. From now on, decisions are recorded here and the design docs are kept current.
**Why:** The memory bank was CoPilot-specific, never loaded reliably, and had become stale and inaccurate (it described
files that no longer exist and features that were never implemented). Files in `design/` are visible to both the
developer and the AI, and their history can be tracked in git.
**Affects:** CLAUDE.md; `design/`; `memory-bank/` and `.github/instructions/` (removed)
**Status:** Active
