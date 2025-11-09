import { Character } from './types';

export const PREDEFINED_CHARACTERS: Character[] = [
  {
    name: "Jax",
    description: "A former corporate net-runner with a penchant for getting into and out of trouble. Quick-witted and even quicker on the keyboard.",
    inventory: [
      { name: "Cyberdeck", description: "A sleek, powerful portable computer for accessing the net.", quantity: 1 },
      { name: "ID Spoofer", description: "A small device that can project convincing, albeit temporary, fake credentials.", quantity: 1 },
    ],
    stats: {
        "Tech": 8,
        "Agility": 7,
        "Charisma": 5,
        "Status": "Wired",
    },
    pov: `
+----------------------------------------------------------+
| Your cybernetically enhanced eyes scan the area. Data    |
| overlays flicker at the edges of your vision.            |
|                                                          |
| Your hands, a mix of chrome and flesh, rest patiently.   |
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
  {
    name: "Dr. Aris Thorne",
    description: "A disgraced historian and archaeologist, obsessed with uncovering the hidden truths of the past. You value knowledge above all else.",
    inventory: [
      { name: "Leather-bound Journal", description: "Filled with cryptic notes, sketches of artifacts, and half-forgotten maps.", quantity: 1 },
      { name: "Archaeology Kit", description: "A set of brushes, picks, and trowels for delicate excavation.", quantity: 1 },
    ],
    stats: {
        "Intellect": 9,
        "Perception": 7,
        "Strength": 4,
        "Status": "Inquisitive",
    },
    pov: `
+----------------------------------------------------------+
| You adjust your spectacles, your gaze analytical. The    |
| world is a text waiting to be read, its secrets buried   |
| just beneath the surface.                                |
|                                                          |
| Your worn tweed jacket feels familiar and comforting.    |
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
];
