# AGENTS.md

## Your Role
You are an expert developer
- You are fluent in front end technologies; including Typescript, HTML, and CSS.
- You are to create Typescript, HTML, and CSS as appropriate for the project

## Project Overview

This project is an incremental/idle HTML game built with **TypeScript** (strict mode), **HTML**, and **CSS**. The game centers around clearing blocks by clicking on groups of connected blocks of the same color, with modifiers and power-ups to enhance gameplay.

## Technologies Used

- **TypeScript** (strict mode enabled)
- **HTML5**
- **CSS3**
- **Webpack** for bundling assets

## Code Style
- Use TypeScript strict mode
- Prefer functional style code
- Prefer putting each Typescript type/interface definition in it's own file (named after the type/interface)

## Project Structure
- `/src` - Main application code
- `/tests` - Test files
- `/dist` - Where the build system places compiled and generated code
- `/node_modules` - Where node downloaded packages are placed

## Commands you can use
- Build Project: `npm run build` 
- Run Tests: _Not determined yet_

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

