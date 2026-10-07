**[Play Blocks in your browser](https://rhseeger.github.io/blocks-game/)**

This is a simple HTML game that involves clearing the blocks; done by clicking on blocks to remove all connected blocks of the same color.

There are two "boards", one for the human player and one for the computer player.

The human player selects groups of cubes on their board to remove.
The computer player acts automatically and does the same on their board.


## Technical Details
- The game itself will be written using TypeScript
- The game will be written with heavy use of AI to help generate the code
- **However**, the reason for this is to better understand how AI can be leveraged for application development.
  Generally, I use AI in a more limited fashion for code generation (intelligent auto-complete), but I want to
  extend my experience to better leverage what it can do.
- I'm not looking to create "AI slop" here... rather, I want to see how AI can be used to more effectively improve my own ability to develop software.


## AI disclosure

(The same text is on the game's About tab, in `src/index.html`; keep the two in step.)

The short summary is that the entire game was written by AI. It was based on a game I wrote in Tcl years (decades?)
ago, but all the code and most of the UI design were implemented by AI.

That being said, the longer explanation is that I wanted to see what I could do with AI. When I originally started
working on it, most of my use of AI was very simple - effectively smart auto-complete. I wanted to see what 
could be accomplished if I let the AI do _all_ the work - without me writing any code. 

I started with CoPilot - and it was horrible. CoPilot is great for code reviews and offering suggestions in the 
IDE. But having it write the code all by itself was an exercise in pain. Every change it made, it broke something
else. I had to fight with it to write tests and, even then, it broke things. Eventually, I just gave up and
put the game down.

A long while later, I purchased a subscription to Claude Code - and started using it the same way. The difference
was night and day; I can't even put into good words how much of an improvement it was. I told Claude what I
was looking to accomplish, and it did it. I told it when something didn't feel right, and it gave me options
to improve it. It was a pleasure instead, and very much different from CoPilot (note, the work with CoPilot was 
many months before the worth with Claude, so things may have changed since then).

For all real considerations, the code and the in-game text should be considered to have been written by Claude,
Anthropic's AI model, using Claude Code. It also had a lot of input into the design of the UI.

The game's direction is human - what to build. When decisions were made about _which_ design to use, that was 
human too. But everything else was Claude. And it was a wonderful experience.

I will note one thing, for anyone interested. There was no pre-existing code base. There is no need to 
support / maintain the code base later. As such, the quality of the code written,  the ability to stick
to common patterns, etc - none of that really mattered to me for this project. There's a certain amount of 
"freedom" in that - but I wouldn't do the same for any important/professional work.

There is no AI-generated art: the blocks and icons are drawn with plain CSS and simple shapes.


## Useful Notes

To build: `npm run build`

Publishing: every push to `master` is linted, tested, built and published to GitHub Pages by
`.github/workflows/deploy-pages.yml` (if the lint or tests fail, nothing is published). It can also be run by hand
from the Actions tab. One-time setup: Settings > Pages > Source: "GitHub Actions".