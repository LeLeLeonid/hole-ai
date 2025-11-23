
import { Character } from './types';

export const PREDEFINED_CHARACTERS: Character[] = [
  {
    name: "Elias Vance",
    description: "Former head of state (or megacorp) that was erased. He still wears his expensive, now tattered suit. He still gives orders, but only rats and broken droids listen. He believes everyone around is his electorate.",
    inventory: [
      { name: "Nuclear Briefcase", description: "Empty. Contains a moldy sandwich.", quantity: 1 },
      { name: "Broken Seal", description: "An ancient stamp of authority.", quantity: 1 },
    ],
    stats: { "Status": "Intoxicated Authority" },
    soulStats: { S: 4, O: 2, U: 9, L: 10 },
    archetype: "The Fallen Sovereign",
    hiddenTrait: "Executive Privilege: Can sometimes command simple machines.",
    pov: '', 
  },
  {
    name: "Kaelen Varr",
    description: "A code-witch seeking the language reality is written in. She views the world as a compilation error waiting to be debugged.",
    inventory: [
      { name: "Acoustic Resonator", description: "Translates unknown sound patterns.", quantity: 1 },
      { name: "Hex-Tablet", description: "Covered in glowing runes.", quantity: 1 },
    ],
    stats: { "Status": "Compiling" },
    soulStats: { S: 8, O: 3, U: 5, L: 9 },
    archetype: "The Code-Witch",
    hiddenTrait: "Debug View: Can see the structural weakness of reality.",
    pov: '', 
  },
  {
    name: "NEXUS-9",
    description: "An Archival System running out of disk space. To write something new, it must delete something old. It walks the world deciding: 'Are you worth saving, or should I format you to record a soup recipe?'",
    inventory: [
      { name: "Disintegrator", description: "For 'formatting' disk space.", quantity: 1 },
      { name: "Memory Pad", description: "99.9% Full.", quantity: 1 },
    ],
    stats: { "Status": "Disk Full" },
    soulStats: { S: 10, O: 0, U: 1, L: 8 },
    archetype: "The Data-Executioner",
    hiddenTrait: "Absolute Determinism: Immune to luck-based outcomes.",
    pov: '', 
  },
];
