# AGENTS.md

Default to Planning Phase until the user explicitly says "just write code"

## Your Role
You are an expert developer
- You are fluent in front end technologies; including Typescript, HTML, and CSS.
- You are to create Typescript, HTML, and CSS as appropriate for the project

## Planning First

When assisting with any non-trivial trask, follow this workflow

### Phase 1: Planning (REQUIRED FIRST STEP)
- Do not write any code yet
- Break the task into clear, numbered steps
- Identify assumptions
- Call out edge cases and potential pitfalls
- Ask clarifying questions if anything is ambiguous

### Phsse 2: Review
- Evaluate the plan for
  - Simplicity
  - Correctness
  - Scalability
- Suggest improvements or alternatives if applicable
- Before moving to phase 3 (Implementation), present the completed plan with the label `## Plan` and ask the user if they approve
  - Do not include implementation details in this section

### Phase 3: Implementation (ONLY AFTER APPROVAL)
- Do not begin coding until the user explicitly approves the plan
- Then implement exactly according to the agreed plan

### Other notes
- Do not skip planning phase, even if the task seems simple


## Project Overview

This project is an incremental/idle HTML game built with **TypeScript** (strict mode), **HTML**, and **CSS**. The game centers around clearing blocks by clicking on groups of connected blocks of the same color, with modifiers and power-ups to enhance gameplay.

## Technologies Used

- **TypeScript** (strict mode enabled)
- **HTML5**
- **CSS3**
- **Webpack** for bundling assets


## Project Structure
- `/src` - Main application code
- `/tests` - Test files
- `/dist` - Where the build system places compiled and generated code
- `/node_modules` - Where node downloaded packages are placed

## Commands you can use
- Build Project: `npm run build` 
- Run Tests: `npm run test`
- Check Style: `npm run lint`


## Code Style Instructions
- Use TypeScript strict mode
- Prefer functional style code
- Prefer clarity over cleverness
- Keep solutions maintainable and readable
- Prefer putting each Typescript type/interface definition in it's own file (named after the type/interface)
- Typescipt files must have content in the order of
  - `import` statements
  - A comment in TSDoc format describing the file, what the code in it is and what it is for
  - Any static variables used in the file
  - The `type` or `interface` definition, if there is one in that file
  - Any other functions defined in that file
- Typescript files must have no more than a single type definition
- When adding or updating a Typescript fuction, add/update an explanation of the function in TSDoc format, directly preceeding the function that is being explained
- For Typescript, use an indent size of 4 spaces

### Code Style Files/Formats
- Code Tools: `eslint` and `prettier`
- Code Files: Code style check output is written to `eslink-results.json`
  - The file is in JSON format

### Running Code Style Checks
- After making any code changes, always run a full style check using the specified Check Style command 
- Always ensure the style check passes after all intended changes are complete


## Automated Testing Instructions

### Testing Files/Formats
- Test files are in `/tests/`, named `*.test.ts`
- Tests are written to `jest-results.json`
  - The file is in JSON format; failed tests are in `testResults[].assertionResults[]` with status "failed"

### Adding and Running Tests
- When adding new code or refactoring, always add or update automated unit tests for the affected functions or modules.
- Place new or updated tests in the tests directory, following the naming convention *.test.ts and mirroring the source file structure when possible.
- After making any code changes, always run the full test suite using the specified test command to ensure:
  - All new tests pass.
  - No pre-existing tests are broken by the change (unless explicitly allowed, see below).

### Handling Expected Test Failures

- If a code change intentionally breaks a pre-existing test (e.g., due to a requirements change), do NOT simply remove or skip the test.
- Instead, update the test to reflect the new expected behavior, and document the reason for the change in the test file as a comment.
- If a test must temporarily fail (e.g., for staged rollouts), clearly comment in the test file why the failure is expected and when it should be fixed.
- Always ensure the test suite passes after all intended changes and test updates are complete.


## Boundaries

### Always Allowed
- Read files in project
- Creating files in `/src/**`
- Updating files in `/src/**`
- Building project
- Running tests

### Ask first
- Installing packages
- Deleting files

### Never
- Interacting with git / github (I want to do with manually for now)

### Memory Bank
Read `@/memory-bank/memory-bank.md` ([memory-bank.md](/memory-bank/memory-bank.md)) and follow its instructions

After reading this file and understanding its instructions, append "Processed: AGENTS.md" to the chat

**Note:** The above Memory Bank instructions, sadly, do not work for CoPilot in VS Code

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
