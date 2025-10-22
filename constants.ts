
import { GameState } from './types';

export const MAP_WIDTH = 60;
export const MAP_HEIGHT = 18;

export const INITIAL_GAME_STATE: GameState = {
  player: {
    name: "Astra",
    description: "A wanderer with a keen eye and a mysterious past.",
    inventory: [
      { name: "Worn Map Fragment", description: "A piece of an old map, its edges frayed. The ink is faded but shows a path leading east.", quantity: 1 },
      { name: "Wooden Locket", description: "A simple locket carved from dark wood. It feels warm to the touch.", quantity: 1 },
    ],
    stats: {
        "Health": "Optimal",
        "Stamina": "Rested",
        "Status": "Normal",
    },
    pov: `
+----------------------------------------------------------+
| You see your hands resting on your knees. They are       |
| covered in a fine layer of dust from the road.           |
|                                                          |
| Ahead, the glade unfolds, peaceful and quiet.            |
|                                                          |
|                                                          |
|                                                          |
|                                                          |
|                                                          |
|                                                          |
|                                                          |
|                                                          |
|                                                          |
|                                                          |
|                                                          |
|                                                          |
+----------------------------------------------------------+
`
  },
  location: {
    name: "The Whispering Glade",
    description: "You are standing in a quiet glade. Sunlight filters through the canopy of ancient trees. A path winds to the east.",
    asciiMap: `
+----------------------------------------------------------+
| T      ~ ~ ~ ~ ~          T          T        T          |
|   T   ~ ~ ~ ~ ~ ~     T                              T   |
|      ~ ~ ~ river ~ ~          T                         |
| T     ~ ~ ~ ~ ~ ~      T                 T               |
|        ~ ~ ~ ~        T     @             T   T          |
|   T                                                      |
|          T           T                T                  |
|                                                          |
| T               T          T                             |
|                                        T          T      |
|                                                          |
|  T     T                T      T                         |
|                                                          |
|                T                      T                  |
|      T                                                   |
|          T           T         T                    E==> |
|   T                                 T                    |
+----------------------------------------------------------+
`,
  },
  npcs: [],
  log: [
    "Welcome to the Gemini RPG Engine.",
    "You find yourself in The Whispering Glade. A sense of ancient calm pervades the air.",
    "What do you do?",
  ],
  suggestedActions: ["go east", "look at trees", "check inventory", "examine locket"],
  turn: 1,
  contextualWindows: []
};