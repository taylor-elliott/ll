export const TS = 32,
  CW = 672,
  CH = 480,
  HB = 10;

export const TCOL = {
  ".": "#2e6b20",
  p: "#8a7050",
  W: "#15486a",
  "#": "#5a4a35",
  T: "#1b4d10",
  S: "#bfad78",
  c: "#38384a",
  X: "#28283a",
  L: "#a02800",
  B: "#7a6848",
  F: "#2e6b20",
  R: "#505062",
  "~": "#0e2a44",
  x: "#0c1a30",
  d: "#1c4216",
  D: "#6b5914",
  b_stone: "#6a6272",
  b_wood: "#8b6b42",
  b_glass: "#4a8a9a",
  b_metal: "#7a7a8a",
  b_red: "#9a3030",
  b_blue: "#305a9a",
  b_green: "#2a7a2a",
  b_gold: "#9a8a30",
  b_purple: "#6a3a8a",
  b_dark: "#2a2a3a",
  b_light: "#c8c0a8",
  b_lava: "#a02800",
  b_water: "#15486a",
  b_circuit: "#0c1a30",
  b_grass: "#2e6b20",
  b_sand: "#bfad78",
  b_path: "#8a7050",
  b_wall: "#5a4a35",
  b_erase: "ERASE",
  o_wall: "#5a4a35",
  o_tree: "#1b4d10",
  o_chest: "#8a7050",
  o_sign: "#8a7050",
  o_lootbox: "#9a8a30",
  o_npc: "#2e6b20",
  o_portal: "#4422aa",
  o_spawn: "#305a9a",
  o_hazard: "#a02800",
  o_quiz: "#6a3a8a",
  o_tip: "#2a7a2a",
  o_race: "#e74c3c",
  o_puzzle: "#58a6ff",
  o_boss: "#9a3030",
};

export const soNames = {
  o_chest: "Open Chest",
  o_lootbox: "Open Lootbox",
  o_sign: "Read Sign",
  o_tip: "Read Tip",
  o_npc: "Talk to NPC",
  o_quiz: "Start Quiz",
  o_race: "Start Race",
  o_puzzle: "Start Puzzle",
  o_boss: "Challenge Boss",
};

export const EMOJI = {
  o_chest: "📦",
  o_lootbox: "🎁",
  o_sign: "📜",
  o_tip: "💡",
  o_npc: "🧑",
  o_portal: "🌀",
  o_spawn: "📍",
  o_hazard: "⚠️",
  o_quiz: "❓",
  o_race: "🏎️",
  o_puzzle: "🧩",
  o_boss: "👹",
};

export const SOLID_SET = new Set([
  "#",
  "T",
  "W",
  "X",
  "L",
  "R",
  "b_stone",
  "b_wall",
  "b_metal",
  "b_dark",
  "o_wall",
  "o_tree",
]);

export const BUILD_CATEGORIES = [
  { id: "terrain", name: "Terrain", icon: "🌿" },
  { id: "walls", name: "Walls", icon: "🧱" },
  { id: "objects", name: "Objects", icon: "📦" },
  { id: "interactive", name: "Games", icon: "🎮" },
  { id: "tools", name: "Tools", icon: "🔧" },
];

export const BUILD_TILES = [
  // Terrain
  { id: "b_grass", name: "Grass", icon: "🌿", cat: "terrain" },
  { id: "b_sand", name: "Sand", icon: "🏖️", cat: "terrain" },
  { id: "b_path", name: "Path", icon: "🟤", cat: "terrain" },
  { id: "b_water", name: "Water", icon: "💧", cat: "terrain" },
  { id: "b_lava", name: "Lava", icon: "🔥", cat: "terrain" },
  { id: "b_circuit", name: "Circuit", icon: "💻", cat: "terrain" },
  { id: "b_wood", name: "Floor", icon: "🪵", cat: "terrain" },
  { id: "b_light", name: "Light", icon: "⬜", cat: "terrain" },
  // Walls
  { id: "o_wall", name: "Wall", icon: "🧱", cat: "walls" },
  { id: "b_stone", name: "Stone", icon: "🪨", cat: "walls" },
  { id: "b_metal", name: "Metal", icon: "⬜", cat: "walls" },
  { id: "b_dark", name: "Dark", icon: "⬛", cat: "walls" },
  { id: "o_tree", name: "Tree", icon: "🌲", cat: "walls" },
  { id: "b_glass", name: "Glass", icon: "🪟", cat: "walls" },
  { id: "b_red", name: "Red", icon: "🟥", cat: "walls" },
  { id: "b_blue", name: "Blue", icon: "🟦", cat: "walls" },
  { id: "b_green", name: "Green", icon: "🟩", cat: "walls" },
  { id: "b_gold", name: "Gold", icon: "🟨", cat: "walls" },
  { id: "b_purple", name: "Purple", icon: "🟪", cat: "walls" },
  // Objects
  { id: "o_chest", name: "Chest", icon: "📦", cat: "objects" },
  { id: "o_lootbox", name: "Lootbox", icon: "🎁", cat: "objects" },
  { id: "o_sign", name: "Sign", icon: "📜", cat: "objects" },
  { id: "o_tip", name: "Tip", icon: "💡", cat: "objects" },
  { id: "o_npc", name: "NPC", icon: "🧑", cat: "objects" },
  { id: "o_portal", name: "Portal", icon: "🌀", cat: "objects" },
  { id: "o_spawn", name: "Spawn", icon: "📍", cat: "objects" },
  { id: "o_hazard", name: "Hazard", icon: "⚠️", cat: "objects" },
  // Interactive / Games
  { id: "o_quiz", name: "Quiz", icon: "❓", cat: "interactive" },
  { id: "o_race", name: "Race", icon: "🏎️", cat: "interactive" },
  { id: "o_puzzle", name: "Puzzle", icon: "🧩", cat: "interactive" },
  { id: "o_boss", name: "Boss", icon: "👹", cat: "interactive" },
  // Tools
  { id: "b_erase", name: "Erase", icon: "🗑️", cat: "tools" },
];

export const MSG = {
  o_chest: ["You found a chest! Something shiny inside..."],
  o_lootbox: ["A mysterious lootbox! Who knows what's inside?"],
  o_sign: ["A sign you placed. It reads: 'Built in the Workshop!'"],
  o_tip: [
    "💡 TIP: OS concepts are all around you. Processes, memory, files, sync!",
  ],
  o_npc: ["An NPC stands here. In a full build, they'd have quests for you!"],
  o_quiz: ["❓ QUIZ MODE: Test your OS knowledge! (Coming with PDF content)"],
  o_race: ["🏎️ RACE: Speed-schedule processes before time runs out!"],
  o_puzzle: [
    "🧩 PUZZLE: Solve a deadlock, arrange memory, or fix permissions!",
  ],
  o_boss: ["👹 BOSS: A massive challenge awaits. Defeat it to prove mastery!"],
  o_hazard: ["⚠️ DANGER ZONE: Watch your step!"],
};

export const DEFAULT_XP_MAX = 150;

export const DEFAULT_SETTINGS = {
  up: "w",
  down: "s",
  left: "a",
  right: "d",
  interact: "e",
  inventory: "i",
  build: "b",
  map: "tab",
  settings: "escape",
  dialog: "f",
};

export const DEFAULT_GFX = {
  particles: true,
  shadows: true,
  screenShake: true,
  speed: 150,
  showQuests: true,
};

export const REGION_NAMES = {
  hub: "The Hub",
  process_plains: "Process Plains",
  memory_caverns: "Memory Caverns",
  archive_city: "Archive City",
  sandbox: "The Workshop",
};

export const INTERACTABLE = new Set([
  "o_chest",
  "o_lootbox",
  "o_sign",
  "o_tip",
  "o_npc",
  "o_quiz",
  "o_race",
  "o_puzzle",
  "o_boss",
]);
