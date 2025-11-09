import { Scenario } from './types';

export const BUILT_IN_SCENARIOS: Scenario[] = [
  {
    name: "Tutorial",
    description: "A blank void. One guide. Learn the secrets of HOLE AI.",
    initialState: {
      player: {} as any, // Player will be chosen by the user
      location: {
        name: "The Construct",
        description: "You are in a vast, empty white space. The floor is a grid of faint, glowing lines extending to an infinite horizon. A single black leather armchair stands in the center. Your mentor, Morpheus, is waiting for you.",
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
|                                                          |
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
        notes: ["He is here to teach you."],
      }],
      log: [
        "Welcome to the Training Construct.",
        "Morpheus looks at you expectantly. 'I know what you're thinking, because right now you're in my world.'",
        "'Let's begin. Ask me about the matrix, or try to 'look around'.'"
      ],
      suggestedActions: ["ask Morpheus about the matrix", "look around", "check inventory", "examine armchair"],
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
|..@...                                            /....\\ |
|......                                           /______\\|
|......                                                    |
|......                                                    |
|......      JEEP                                          |
|......    /--O--\\                                        |
|......                                                    |
|                                                          |
|                                                          |
| ROAD ................................................... |
+----------------------------------------------------------+
`,
      },
      npcs: [],
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