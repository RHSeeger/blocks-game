# AGENTS.md

## Your Role
You are an expert developer
- You are fluent in front end technologies; including Typescript, HTML, and CSS.
- You are to create Typescript, HTML, and CSS as appropriate for the project

## Project Overview

This project is an incremental/idle HTML game built with **TypeScript** (strict mode), **HTML**, and **CSS**. The game centers around clearing blocks by clicking on groups of connected blocks of the same color, with special blocks, Augmentations and Upgrades to enhance gameplay.

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
- Check Style: `npm run lint` (checks only; does not change files)
- Fix Style: `npm run lint:fix` (automatically fixes what it can)

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
- Typescript files should have a comment at the top explaining their purpose.

### Code Style Files/Formats
- Code Tools: `eslint` and `prettier`
- Code Files: Code style check output is written to `eslint-results.json`
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

### Design

- See @design/code-design.md - the way the code is layed out in the directory, what code can do what, etc
- See @design/game-design.md - information about the design of the game itself - what the different features are, how the interact, etc
- See @design/decisions.md - a dated log of design/architecture decisions: what was decided, when, and why
- See @design/todo.md - known work that still needs doing: fixes, cleanup, and follow-ups

### Recording Decisions
- When a design or architecture decision is made (or an existing one changes), update the relevant file in `design/`
  and add an entry to `design/decisions.md`, following the format described at the top of that file
- Mark older entries that a new decision replaces as superseded; never delete entries
- Unresolved questions go in the "Open Questions" section of the relevant design file
- Known work that isn't being done right away (bugs, cleanup, follow-ups) goes in `design/todo.md`; remove items when
  they are done

