
### Other
- Do not store data on global variables (such as `window`) unless specifically told to or there is no other choice. When adding code to store data on a global variable, call it out in the chat
    - The one expected use of storing global data on the `window` object is the `GameState` object, which allows access (from the console) to all the state of the game. However, that `GameState` object should not be read by code; it should be passed around as needed. It's only stored on the `window` object so it is accessible from the console (for debugging, cheating, etc)

## Project Implementation / Architecture

- Store the "game state" in a single object and reference that object from `window.gameState`
- The value in `window.gameState` is the source of truth. Anything that modifies the game state must read it from there, 
  make it's changes, and write back to there

### UI System
The code in `src/typescript/ui` is the **UI System**
- It's purpose is 
  - Present the current game state to the user (draw the boards, stats, etc)
  - Allow the user to indicate what their next action is (by clicking on a block, etc)
  - Call to the **Game Logic** code to let it know when the user has clicked on a block or taken any other action that would change the game state
- The **UI Code** doesn't know anything about behavior, nor can it update the game state
- The ui knows that things happen based on interactions (clicks), but doesn't implement that logic. It handles accepting
    the click and then sends it off to the game-logic code to act on (which will then call back to the ui code if the game state
    changed)

### Game Logic System
The code in `src/typescript/gamelogic` is the **Game Logic**
- The game-logic code doesn't know anything about the ui, other than that it can call the ui code to render the game state (and
  possible specific portions of the game state). In theory, the ui code could be completely replaced and the game-logic code
  wouldn't have to change at all. 
- The game-logic code reads the `window.gameState`, makes changes, and writes back to `window.gameState`; then tells the ui to
  render the current state.
- No stored mutable values outside of `window.gameState` are ever needed to implement game logic; everything else is code/logic/constants.
- No stored mutable values outside of `window.gameState` are ever needed to render the ui; everything else is code/logic/constants.
- `window.gameState` **must** always be up to date before calling any methods that read from it (ex, `ui` methods)

### Bridge
The code in `src/typescript/bridge` is the **Bridge System**
- The bridge code
  - Knows of a specific, limited set of commands in the **Game Logic** code that it can call to tell the **Game Logic** code that the user has triggerred something
  - Knows of a specific, limited set of commands in the **UI System** code that it can call to tell the **UI System** that the game state has changed and the display needs to be updated
- The **Game Logic System** code 
  - Knows of a specific, limited set of commands in the **Bridge System** code that the user has triggerred something (which will cause the **Bridge System** code to call the **UI System**)
- The **UI System** code
  - Knows of a specific, limited set of commands in the **Bridge System** code that it can call to tell it that the game state has changed and the display needs to be updated (which will cause the **Bridge System** code to call the **Game Logic System**)

### General
- Typescript code that manipulates the Game State **must** read the state from `window.gameState` and, when done, `window.gameState` **must** be updated to reflect any changes
- Typescript code that calculates and returns something from some part of the Game State, but doesn't change anything about it, _should_ have the part of the Game State it needs (such as a specific BoardState) passed into it.
  - This allows the code that calls it to interact with the Game State (possibly, making changes to it), call the calculation method (passing in the changed Game State), and use the results... without needing to write to `window.gameState` in the middle of it's work
