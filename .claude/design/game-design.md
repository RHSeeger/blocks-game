This is a simple HTML game that involves clearing the blocks; done by clicking on blocks to remove all connected blocks of the same color.

There are two "boards", one for the human player and one for the computer player.

The human player selects groups of cubes on their board to remove.
The computer player acts automatically and does the same on their board.

A given board round is completed when there are no more groups of cubes that can be removed. When that happens, a new board is generated.
New functionality is unlocked as the game is played

As the game is played
- Points are gained by removing cubes from the board. 
- Achievements are accomplished, some (all?) of which unlock "Unlocks" (yes, it needs a better name)
- The Unlocks grant abilities/functionalities/etc - such as new bonus cubes
- Points can be used to upgrade ... things (Unlocks, possibly other things)
- There may be more than one type of point
    - points earned by removing cubes
    - points earned by achievements
    - points earned by the computer player removing cubes
    - points earned by finishing boards
- Some of those points may be the same "type" (points, coins, diamonds - the standard idle/incremental stuff)

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


## Design Details

The game has achievements, which are something the player accomplishes - such as clearing a board, or getting to a certain score, etc.

The game also has things that can be unlocked. The plan is for all things that can be unlocked to be unlocked by accomplishing an achievement, but that coulld change later

The game will also have "Upgrades", things that the player can spend <some type of points> on.
- The points are earned in some way, such as
    - accomplishing achievements
    - getting a certain max board or total score
- Upgrades are not yet included in the game
- Upgrades allow improving certain parts of the game, such as
    - making the computer player move more often
    - making the computer player more more intelligently (picking larger selection groups, etc)
    - making special bricks occur more often, including more than one per board
- Unlocking something that can be upgraded (such as a special brick) will immediately allow the player to purchase upgrades for it (if they have the points)

1. Upgrade Points System:
  - Define a new currency (e.g., “Upgrade Points” or “Stars”) earned through achievements, high scores, or other milestones.
  - Track points in the game state for persistence and easy access.
2. Upgrade Definitions:
  - Each upgrade should have:
    - A unique ID and name
    - Description of its effect
    - Cost in points
    - Scaling factor, how much the cost increases with each new level of the upgrade
    - Prerequisites (e.g., unlocks, other upgrades)
    - Current level (if upgradable multiple times)
  - Store upgrade definitions in a central list or data structure.
3. Unlocking Upgrades:
  - Some upgrades are only available after unlocking related features (e.g., special bricks).
  - When a feature is unlocked, its upgrades become available for purchase.
4. Upgrade Effects:
  - Upgrades can affect game logic (e.g., computer player behavior, special brick frequency).
  - Game logic should check the current upgrade levels when performing relevant actions.

Upgrades should be coded similar to Achievements
- A file/class that defines the structure of an upgrade (it's fields, etc)
- A file/class that defines the list of known upgrades, and the values for each one


The "points" that will be used to purchase Upgrades will be `Coins`

Things like new brick types (that are unlocked) will be called `Augmentations` and will live on the `Augmentations` tab

