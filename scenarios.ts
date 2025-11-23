
import { Scenario } from './types';

export const BUILT_IN_SCENARIOS: Scenario[] = [
  {
    name: "Tutorial",
    description: "The White Room. A void outside time. The Observer waits to calibrate your S.O.U.L.",
    initialState: {
      player: { 
        name: "Neophyte",
        description: "New arrival.",
        inventory: [],
        stats: {},
        pov: ""
      },
      location: {
        name: "The Construct",
        description: "A sterile, infinite white expanse. A single entity, 'The Observer', sits in a leather armchair. This is the calibration zone.",
        asciiMap: `
+----------------------------------------------------------+
|                                                          |
|                                                          |
|                                                          |
|                      @                                   |
|                                                          |
|                       (Armchair)                         |
|                          O                               |
|                                                          |
|                                                          |
|                                                          |
+----------------------------------------------------------+
`,
      },
      npcs: [{
        name: "The Observer",
        knownAs: "The Observer",
        isNameKnown: true,
        description: "A meta-physical entity resembling a man in a black coat. He seems aware he is in a simulation.",
        faceDescription: "Reflective glasses mirroring the void.",
        clothingDescription: "A textureless black suit.",
        notes: ["He is the guide to the HOLE."],
      }],
      log: [
        "The Observer nods. 'Welcome to the Construct. We need to calibrate your perception.'",
        "'Look above. That is your POV. No text allowed there, only pure vision.'",
        "'Type a command or use the buttons below.'"
      ],
      suggestedActions: ["look around", "talk to Observer", "check stats"],
      turn: 1,
      factionBalance: 0,
      chaosLevel: 0,
      contextualWindows: [],
      metaDataLog: [],
      scenario: {
        name: "Tutorial",
        description: "The White Room. Calibration."
      }
    }
  },
  {
    name: "Modern 2025",
    description: "Post-Soviet Concrete Dystopia. The Ontological Trap. Find a way to 'Ascend' or 'Rebel'.",
    initialState: {
      player: {} as any,
      location: {
        name: "Sector 4 Checkpoint",
        description: "Grey sky. Rain. Neon signs reflecting in dirty puddles. The bureaucracy is suffocating.",
        asciiMap: `
+----------------------------------------------------------+
|  [BLOCK 1]       [BLOCK 2]                               |
|   |||||           |||||                                  |
|                                         (NEON SIGN)      |
|                                            "HOPE"        |
|      @                                                   |
|                                                          |
|   [Checkpoint]------[Gate]--------------------           |
|      (G)uard                                             |
|                                                          |
|                                                          |
+----------------------------------------------------------+
`,
      },
      npcs: [{
        name: "Guard",
        knownAs: "Checkpoint Guard",
        isNameKnown: false,
        description: "Apathy in uniform. He just wants his shift to end.",
        faceDescription: "Tired eyes, stubble.",
        clothingDescription: "Worn tactical gear, damp from rain.",
        notes: [],
      }],
      log: [
        "The year is 2025. The air tastes like copper and lost data.",
        "You are stuck at the Sector 4 Checkpoint. You need to Ascend or Rebel.",
      ],
      suggestedActions: ["show ID", "bribe guard", "look at neon sign"],
      turn: 1,
      factionBalance: 0,
      chaosLevel: 2,
      contextualWindows: [],
      scenario: {
        name: "Modern 2025",
        description: "The Trap of Reality."
      }
    }
  },
  {
    name: "Learning Hub",
    description: "The Archive. An infinite library in a black hole. Consuming items grants permanent stat buffs.",
    initialState: {
        player: {} as any,
        location: {
            name: "The Event Horizon Library",
            description: "Shelves spiraling into infinity. Gravity is heavy here. Knowledge is physical.",
            asciiMap: `
+----------------------------------------------------------+
|   | | | | | |  BOOKS  | | | | | |                        |
|   | | | | | |         | | | | | |                        |
|                                                          |
|        @                                                 |
|                                                          |
|      [Pedestal]                                          |
|         (B)ook                                           |
|                                                          |
|    ~ ~ ~ ~ SINGULARITY ~ ~ ~ ~                           |
+----------------------------------------------------------+
            `
        },
        npcs: [],
        log: [
            "You stand in the Archive. Here, concepts are items.",
            "Consuming knowledge alters your S.O.U.L.",
        ],
        suggestedActions: ["read book", "approach singularity"],
        turn: 1,
        factionBalance: 0,
        chaosLevel: 0,
        contextualWindows: [],
        scenario: {
            name: "Learning Hub",
            description: "The Archive."
        }
    }
  }
];

export const RANDOM_SCENARIO_TEMPLATE: Scenario = {
  name: "The Glitch",
  description: "A broken reality where genres mix. Medieval knights fighting cyborgs. High Randomness.",
  initialState: {} as any, 
};
