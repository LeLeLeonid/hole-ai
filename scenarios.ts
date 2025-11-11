import { Scenario } from './types';

export const BUILT_IN_SCENARIOS: Scenario[] = [
  {
    name: "Tutorial",
    description: "A blank void. One guide. Learn the secrets of HOLE AI.",
    initialState: {
      player: { // This is a template, the chosen character's data will be merged in.
        name: "Neophyte",
        description: "Someone new to this reality.",
        inventory: [],
        stats: { "Clarity": 10 },
        pov: `
............................................................
............................................................
..........Morpheus, in reflective glasses, stands...........
...............before a black leather armchair...............
................in an endless white expanse.................
............................................................
............................................................
............................................................
............................................................
............................................................
............................................................
............................................................
............................................................
............................................................
............................................................
............................................................
............................................................
............................................................
`
      },
      location: {
        name: "The Construct",
        description: "You are in a vast, empty white space. The floor is a grid of faint, glowing lines extending to an infinite horizon. A single black leather armchair stands in the center. The man who calls himself Morpheus is waiting for you.",
        asciiMap: `
+----------------------------------------------------------+
|                                                          |
|                                                          |
|                                                          |
|                                                          |
|                                                          |
|                                                          |
|                      @                                   |
|                                                          |
|                                                          |
|                       (Armchair)                         |
|                           M                              |
|                                                          |
|                                                          |
|                                                          |
|                                                          |
|                                                          |
|                                                          |
+----------------------------------------------------------+
`,
      },
      npcs: [{
        name: "Morpheus",
        knownAs: "Morpheus",
        isNameKnown: true,
        description: "A wise and enigmatic man, dressed in a long black coat. He carries an aura of quiet authority and deep knowledge.",
        faceDescription: "He has a calm, knowing expression, with reflective pince-nez glasses perched on his nose.",
        clothingDescription: "A tailored, floor-length black coat made of a material that seems to absorb light.",
        notes: ["He is here to teach you the basics of this reality."],
      }],
      log: [
        "Morpheus looks at you. 'Welcome to the Construct. This is a training program.'",
        "'The text feed you are reading is the LOG. The image above is your Point of View, or POV.'",
        "'This is your first lesson. Use the suggested actions below to interact with the world.'",
        "To begin, click or type 'look around'."
      ],
      suggestedActions: ["look around", "examine armchair", "see Morpheus", "ask Morpheus about the Gemini Master"],
      turn: 1,
      contextualWindows: [],
      scenario: {
        name: "Tutorial",
        description: "A blank void. One guide. Learn the secrets of HOLE AI."
      }
    }
  },
  {
    name: "Modern",
    description: "Year 2025. Politics in turmoil, wars erupt, hope flickers.",
    initialState: {
      player: {} as any, // Player will be chosen by the user
      location: {
        name: "A Disputed Border Crossing",
        description: "You stand before a makeshift checkpoint. The air is tense. A mix of aid workers, displaced families, and nervous-looking guards populate the area. The world beyond this gate is uncertain, but it's the only way forward.",
        asciiMap: `
+----------------------------------------------------------+
|~~~~~~~~~~~~~ FENCE ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~|
|......                                                    |
|......          | |                                       |
|......          | | GATE                                  |
|......         G| |G                                      |
|......          | |                                       |
|......                                              TENT  |
|..@...                                             /....\\ |
|......                                            /______\\|
|......                                                    |
|......                                                    |
|......      JEEP                                          |
|......    /--O--\\                                         |
|......                                                    |
|                                                           |
|                                                           |
| ROAD ................................................... |
+----------------------------------------------------------+
`,
      },
      npcs: [{
        name: "Guard",
        knownAs: "A Border Guard",
        isNameKnown: false,
        description: "A soldier in worn fatigues, their face a mask of weary professionalism. They watch everyone who approaches the gate with a hawk's intensity.",
        faceDescription: "Sun-weathered skin, sharp eyes that miss nothing, and a grim set to their jaw.",
        clothingDescription: "Standard issue fatigues, dusty and faded. A heavy-looking rifle is slung over their shoulder.",
        notes: ["Appears to be in charge of the checkpoint."],
      }],
      log: [
        "The year is 2025. The world is a tapestry of conflict and connection, woven by threads of political strife and digital innovation.",
        "You've arrived at a border, a flashpoint of tension and a beacon for those seeking new beginnings.",
        "Your choices here may ripple across this fragile world.",
        "What do you do?"
      ],
      suggestedActions: ["approach the guards", "talk to an aid worker", "check your documents", "observe the families"],
      turn: 1,
      contextualWindows: [],
      scenario: {
        name: "Modern World",
        description: "Year 2025. Politics in turmoil, wars erupt, hope flickers."
      }
    }
  },
];

export const RANDOM_SCENARIO_TEMPLATE: Scenario = {
  name: "Random",
  description: "Anywhere, anytime, anyone. Total unpredictability.",
  initialState: {} as any, // Will be filled by AI
};