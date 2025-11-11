import { Character } from './types';

export const PREDEFINED_CHARACTERS: Character[] = [
  {
    name: "Jax 'Glitch' Riley",
    description: "A renegade netrunner who burned his corporate masters and now sells his skills to the highest bidder in the digital underworld. He's paranoid, exceptionally talented, and survives on a diet of stimulants and sheer nerve.",
    inventory: [
      { name: "Cyberdeck", description: "A sleek, powerful portable computer for accessing the net.", quantity: 1 },
      { name: "ID Spoofer", description: "A small device that can project convincing, albeit temporary, fake credentials.", quantity: 1 },
    ],
    stats: {
        "Tech": 8,
        "Agility": 7,
        "Charisma": 5,
        "Status": "Jittery",
    },
    pov: '', // This will be dynamically generated
  },
  {
    name: "Kaelen \"Kael\" Varr",
    description: "A disgraced xenolinguist, Kael now wanders the fringes of known space. She seeks a primordial language she believes is the universe's source code, a syntax that could rewrite reality itself. Her mind is a tapestry of forgotten dialects and dangerous cosmic truths.",
    inventory: [
      { name: "Acoustic Resonator", description: "A handheld device that translates and analyzes unknown sound patterns.", quantity: 1 },
      { name: "Star-charts", description: "A collection of holographic maps charting anomalous energy readings across the sector.", quantity: 1 },
    ],
    stats: {
        "Intellect": 9,
        "Willpower": 7,
        "Sanity": 4,
        "Status": "Unsettled",
    },
    pov: '', // This will be dynamically generated
  },
  {
    name: "The Wanderer",
    description: "Not born, but coalesced. A consciousness from the silent void, given form in a salvaged robotic chassis. It feels a profound, almost painful, curiosity about the tangible world and the strange, fleeting creatures called 'humans'. It has no concept of morality, only data and experience.",
    inventory: [
      { name: "Matter Sampler", description: "An instrument for analyzing the composition of any physical object it touches.", quantity: 1 },
    ],
    stats: {
        "Logic": 10,
        "Perception": 8,
        "Empathy": 1,
        "Status": "Observing",
    },
    pov: '', // This will be dynamically generated
  },
];
