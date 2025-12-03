This is a simple HTML game that involves clearing the blocks; done by clicking on blocks to remove all connected blocks of the same color.

Some more details include
- There will be "modifier" cubes, such as "x2" (that doubles the score) and "+1" (that increases the radius of effected cubes)
- A board is completed when there are no more moves that would remove at least 2 cubes
- There is a penalty if, at the end of a board, there are still cubes left (that cannot be removed)
- The definition of a penalty is currently undecided, but the general idea is that the player will have a limited number of "life points",
  and cubes left at the end of the board will subtract from the number of life points
- The current "round" (a series of boards) is completed when the penalties indicate it; such as there being no more life points
- The "game" itself can be played indefinitely; it can have multiple rounds
- There will be some sort of powerups that can be purchased... such as adding more (types/amounts) of modifier cubes, or other such behavior

It is also the plan that the game as an idle/incremental component. 
- There will be a second tab/window/view/board that has the computer playing automatically
- The computer player's cubes/boards will be separate from the player's cubes/boards
- The computer player's power-ups will include differences from the player's power-ups (for example, being able to move more often, which makes no sense for the player)

The idea being that the player plays manually to get points to buy power-ups for both themself and for the computer player.
The computer player may earn points to buy power-ups also

Technical Details
- The game itself will be written using TypeScript
- The game will be written with heavy use of AI to help generate the code
- **However**, the reason for this is to better understand how AI can be leveraged for application development.
  Generally, I use AI in a more limited fashion for code generation (intelligent auto-complete), but I want to
  extend my experience to better leverage what it can do.
- I'm not looking to create "AI slop" here... rather, I want to see how AI can be used to more effectively improve my own ability to develop software.
