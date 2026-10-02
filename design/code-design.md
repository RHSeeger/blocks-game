## Folder Layout

```
src/typescript/
  index.ts      Startup: load the game state, set up the state store and the window alias,
                initialize the UI, start the game loop
  global.d.ts   Additions to global types (e.g. `window.gameState`)
  types/        Plain-data types only (GameState, PlayerState, Board, Block, Achievement,
                Augmentation, GameStatistics, DeepReadonly, ReadonlyGameState, ...)
  data/         Fixed definitions / constants (the list of achievements, the list of augmentations,
                board size, block colors, ...)
  gamelogic/    The Game Logic System (see below)
    gameStateStore.ts   Owns the game state
    persistence.ts      Saves/loads the game state to/from localStorage
    gameLoop.ts         Timer-driven behavior (the computer player's moves)
    actions/            Entry points: the functions the Bridge calls when something happens
    board/              Calculation-only functions about a board (moves, gravity, scoring, generation)
    *.ts (others)       Functions that change the game state passed to them (applyBlockClick, takeComputerTurn,
                        advanceToNextBoard, achievements, ...), and publishGameState (save + tell the Bridge)
  bridge/       The Bridge System (see below)
  ui/           The UI System (see below)
```

- Any code may import from `types/` and `data/`. Neither of them imports from `gamelogic/`, `bridge/` or `ui/`.
- Tests in `/tests` mirror this layout.


## Game State

- All of the game's state is stored in a single `GameState` object
- The game state is **plain data**: no classes, no methods. Behavior lives in functions in `gamelogic/`
    - This allows a read-only version of it to be handed to the UI (see `ReadonlyGameState`), and it can be saved and
      loaded with plain JSON
- The game state is owned by the **Game Logic System**, in `gamelogic/gameStateStore.ts` (`getGameState()` /
  `setGameState()`)
    - This is the one deliberate exception to "no module-level state"
- `window.gameState` is an alias to the state in the store (a getter/setter, set up at startup)
    - It exists **only** so the game state can be read and changed from the browser console (for debugging, cheating, etc)
    - Changes made from the console (to a single field, or replacing the whole object) are seen the next time game
      logic runs
    - No code reads or writes `window.gameState`
- Values that can be calculated from the game state (such as "is the board finished") are **not** stored in it.
  They are calculated by game logic each time they are needed, so a change made from the console can never leave
  them out of date
- The game logic saves the game state to localStorage after every change, so it is kept across page reloads
    - Saves have a version number. When the shape of the saved state changes, the version goes up, and
      `gamelogic/persistence.ts` upgrades older saves when they're loaded, so players don't lose their progress
- Each `Board` stores its own `width` and `height`. Code that works with a board takes its size from the board, never
  from a constant (`data/board.ts` only has the starting size)


## The Flow

When the user does something (for example, clicks on a block):

1. The **UI** calls the **Bridge** with what the user did (e.g. `onBlockClicked(index)`). It does not pass any game state
2. The **Bridge** calls the matching **Game Logic** entry point (in `gamelogic/actions/`)
3. The entry point reads the game state from the store, figures out what happens, and updates the game state
4. The entry point saves the game state to localStorage
5. The entry point calls the **Bridge** with a **read-only** version of the game state, plus any calculated values the UI
   needs, plus **notifications** for anything that just happened that the player should be told about (such as an
   achievement being accomplished)
6. The **Bridge** calls the **UI** with that read-only game state
7. The **UI** updates the display

Things that aren't triggered by the user (the computer player's timer) start at step 3, and work the same way from there.


## UI System
The code in `src/typescript/ui` is the **UI System**
- Its purpose is
  - Present the current game state to the user (draw the boards, stats, etc)
  - Accept the user's actions (clicking on a block, etc) and pass them to the **Bridge**
- The UI only ever receives a read-only version of the game state (`ReadonlyGameState`). It cannot change the game state
- The UI doesn't know anything about game behavior. It knows that a click happened, but not what the click means
- The UI does not save or load anything
- The UI imports from the **Bridge** (plus `types/` and `data/`), never from **Game Logic**

## Game Logic System
The code in `src/typescript/gamelogic` is the **Game Logic**
- It owns the game state, decides what happens, updates the game state, and saves it
- It doesn't know anything about the UI. In theory, the UI could be completely replaced and the game logic wouldn't
  have to change at all
- When the game state has changed, it tells the **Bridge** (which tells the UI)
- Game Logic imports from the **Bridge** (plus `types/` and `data/`), never from the **UI**
- No stored mutable values outside of the game state are ever needed to implement game logic or render the UI;
  everything else is code/logic/constants

## Bridge System
The code in `src/typescript/bridge` is the **Bridge System**
- It is the only code that imports from both the **UI** and **Game Logic**
- It contains no logic of its own. Each function just passes the call along
- **UI → Bridge → Game Logic:** the UI calls a limited set of Bridge functions that describe what the user did
  (`onBlockClicked(index)`, `onNextBoardClicked()`, `onResetGameClicked()`, `onResetHumanBoardClicked()`,
  `onDeselect()`). Each one calls the matching Game Logic entry point
- **Game Logic → Bridge → UI:** Game Logic calls a single Bridge function, `gameStateChanged(state, derived,
  notifications)`, with the read-only game state, any calculated values, and any notifications. The Bridge passes them
  to the UI to render

## Notifications
- A notification (`GameNotification`) tells the player that something just happened, such as an achievement being
  accomplished or an Augmentation being unlocked
- Notifications are **not** stored in the game state. The game-logic function that causes one returns it (e.g.
  `checkAchievementsAfterRemoval` → `applyBlockClick` → the entry point), and the entry point passes them to
  `publishGameState`, which sends them to the UI with the state
- The UI shows each one once, as a pop-up that fades out. If the page is reloaded before it fades, it is not shown again
- A change made from the browser console (such as adding an achievement) doesn't cause a notification
- This means there are circular imports (Bridge ↔ UI, Bridge ↔ Game Logic). That is accepted: the calls only happen
  while the game is running, never while the modules are loading. Game Logic tests mock the Bridge (`jest.mock`)


## General
- Do not store data on global variables (such as `window`) unless specifically told to or there is no other choice.
  When adding code to store data on a global variable, call it out in the chat
    - The one expected use is `window.gameState` (see "Game State" above)
- Only the Game Logic entry points (in `gamelogic/actions/` and `gamelogic/gameLoop.ts`) read the game state from the
  store. Everything they call has the game state, or the part of it that it needs, passed in
- Functions that calculate something from the game state, without changing it, take the part of the game state they
  need as a parameter (such as a single player's board) and return the result
    - This allows the calling code to make changes to the game state, call the calculation (passing in the changed
      state), and use the results
