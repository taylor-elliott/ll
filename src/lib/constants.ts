import type { BossConfig, BossTypes } from "./types";

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
  sfxVolume: 0.5,
  musicVolume: 0.25,
  audioMuted: false,
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

export const BOSS_CONFIGS: Record<BossTypes, BossConfig> = {
  boss_process: {
    id: "boss_process",
    name: "The Scheduler Overlord",
    emoji: "🤖",
    color: "#e74c3c",
    hp: 100,
    timeLimit: 15,
    questions: [
      {
        prompt:
          "In Round Robin scheduling, what happens when a process's time quantum expires?",
        options: [
          "Process is terminated",
          "Process moves to the back of the ready queue",
          "Process enters blocked state",
          "Process gets double the quantum next time",
        ],
        correct: 1,
        explanation:
          "In Round Robin, when a quantum expires the process is preempted and placed at the end of the ready queue.",
      },
      {
        prompt: "What information does a Process Control Block (PCB) contain?",
        options: [
          "Only the PID",
          "Source code of the process",
          "Process state, PC, registers, scheduling info",
          "Only memory allocation data",
        ],
        correct: 2,
        explanation:
          "The PCB stores the process state, program counter, CPU registers, scheduling priority, memory management info, and more.",
      },
      {
        prompt: "What does fork() return to the child process?",
        options: [
          "The parent's PID",
          "A negative number",
          "Zero",
          "The child's own PID",
        ],
        correct: 2,
        explanation:
          "fork() returns 0 to the child process and the child's PID to the parent process.",
      },
      {
        prompt: "A zombie process is one that has:",
        options: [
          "Been killed by a signal",
          "Exceeded its memory allocation",
          "Terminated but its parent hasn't called wait()",
          "Been stuck in an infinite loop",
        ],
        correct: 2,
        explanation:
          "A zombie process has finished execution but still has an entry in the process table because its parent hasn't read its exit status via wait().",
      },
      {
        prompt: "Which scheduling algorithm can suffer from the convoy effect?",
        options: [
          "Round Robin",
          "First-Come, First-Served (FCFS)",
          "Shortest Job First",
          "Priority Scheduling",
        ],
        correct: 1,
        explanation:
          "FCFS can cause the convoy effect: a long CPU-bound process delays all shorter processes behind it.",
      },
      {
        prompt: "During a context switch, the OS must:",
        options: [
          "Restart the CPU",
          "Save the state of the old process and load the state of the new one",
          "Delete the old process",
          "Allocate new memory for both processes",
        ],
        correct: 1,
        explanation:
          "A context switch saves the running process's state (registers, PC) to its PCB and loads the next process's state.",
      },
    ],
  },

  boss_memory: {
    id: "boss_memory",
    name: "The Page Fault Dragon",
    emoji: "🐉",
    color: "#58a6ff",
    hp: 120,
    timeLimit: 14,
    questions: [
      {
        prompt: "What is a TLB (Translation Lookaside Buffer)?",
        options: [
          "A type of RAM",
          "A cache for page table entries",
          "A CPU scheduling queue",
          "A disk buffer",
        ],
        correct: 1,
        explanation:
          "The TLB is a fast hardware cache that stores recent virtual-to-physical page translations to avoid slow page table lookups.",
      },
      {
        prompt: "In LRU page replacement, which page gets evicted?",
        options: [
          "The newest page",
          "The smallest page",
          "The page not accessed for the longest time",
          "A random page",
        ],
        correct: 2,
        explanation:
          "LRU (Least Recently Used) evicts the page that hasn't been accessed for the longest period.",
      },
      {
        prompt: "What is Belady's anomaly?",
        options: [
          "TLB always misses",
          "More page frames can lead to MORE page faults with FIFO",
          "Virtual memory runs out",
          "Pages get corrupted",
        ],
        correct: 1,
        explanation:
          "Belady's anomaly is the counterintuitive situation where increasing the number of page frames can increase page faults with FIFO replacement.",
      },
      {
        prompt: "A page fault occurs when:",
        options: [
          "The CPU overheats",
          "A referenced page is not in physical memory",
          "The disk is full",
          "A process crashes",
        ],
        correct: 1,
        explanation:
          "A page fault happens when a process accesses a page that is not currently loaded in physical memory, requiring it to be fetched from disk.",
      },
      {
        prompt:
          "What does the valid/invalid bit in a page table entry indicate?",
        options: [
          "Whether the data is encrypted",
          "Whether the page is in physical memory",
          "The page's priority level",
          "Whether the page can be written to",
        ],
        correct: 1,
        explanation:
          "The valid bit indicates whether the page is currently loaded in a physical frame. Invalid means a page fault will occur.",
      },
    ],
  },

  boss_archive: {
    id: "boss_archive",
    name: "The Inode Golem",
    emoji: "🗿",
    color: "#f39c12",
    hp: 140,
    timeLimit: 14,
    questions: [
      {
        prompt: "An inode stores all of the following EXCEPT:",
        options: [
          "File size",
          "File name",
          "Permissions",
          "Data block pointers",
        ],
        correct: 1,
        explanation:
          "Inodes do NOT store the filename. Filenames are stored in directory entries that map names to inode numbers.",
      },
      {
        prompt: "What is a hard link?",
        options: [
          "A shortcut on the desktop",
          "A second directory entry pointing to the same inode",
          "An encrypted file connection",
          "A network file share",
        ],
        correct: 1,
        explanation:
          "A hard link is an additional directory entry pointing to the same inode. The file data is shared; deleting one link doesn't delete the data until all links are removed.",
      },
      {
        prompt: "What does journaling protect against?",
        options: [
          "Viruses",
          "Data corruption from crashes during writes",
          "Unauthorized access",
          "Disk fragmentation",
        ],
        correct: 1,
        explanation:
          "Journaling writes intended changes to a log before applying them to disk. If a crash occurs mid-write, the journal is replayed to restore consistency.",
      },
      {
        prompt: "In Unix permissions, what does chmod 644 mean?",
        options: [
          "Owner: rwx, Group: rw, Other: r",
          "Owner: rw, Group: r, Other: r",
          "Everyone gets full access",
          "Owner: r, Group: rw, Other: rwx",
        ],
        correct: 1,
        explanation:
          "644 = Owner: rw- (6=4+2), Group: r-- (4), Other: r-- (4). Owner can read and write; everyone else can only read.",
      },
      {
        prompt:
          "Which file allocation method uses a linked list of disk blocks?",
        options: [
          "Contiguous allocation",
          "Linked allocation",
          "Indexed allocation",
          "Hash allocation",
        ],
        correct: 1,
        explanation:
          "Linked allocation chains blocks together via pointers. Each block points to the next. Simple but poor for random access.",
      },
      {
        prompt: "What is the purpose of a mutex?",
        options: [
          "Speed up processes",
          "Ensure only one thread enters a critical section at a time",
          "Compress data",
          "Schedule I/O operations",
        ],
        correct: 1,
        explanation:
          "A mutex (mutual exclusion lock) ensures only one thread can enter a critical section at a time, preventing race conditions.",
      },
    ],
  },

  boss_survival: {
    id: "boss_survival",
    name: "The Kernel Titan",
    emoji: "👹",
    color: "#2ecc71",
    hp: 160,
    timeLimit: 12,
    questions: [
      {
        prompt: "What are the four conditions required for deadlock?",
        options: [
          "Speed, memory, disk, network",
          "Mutual exclusion, hold and wait, no preemption, circular wait",
          "Fork, exec, wait, exit",
          "Read, write, execute, delete",
        ],
        correct: 1,
        explanation:
          "Deadlock requires all four Coffman conditions: mutual exclusion, hold and wait, no preemption, and circular wait.",
      },
      {
        prompt: "What is thrashing in an operating system?",
        options: [
          "CPU running too fast",
          "Excessive paging where the system spends more time swapping than executing",
          "Disk formatting",
          "Memory leak",
        ],
        correct: 1,
        explanation:
          "Thrashing occurs when the system spends most of its time swapping pages in and out of memory, causing severe performance degradation.",
      },
      {
        prompt: "What is the difference between a process and a thread?",
        options: [
          "They are the same thing",
          "Threads share the same address space within a process; processes have separate spaces",
          "Processes are faster than threads",
          "Threads can only run on one CPU",
        ],
        correct: 1,
        explanation:
          "Threads within the same process share code, data, and file descriptors but have their own stack and registers. Processes have fully separate address spaces.",
      },
      {
        prompt: "What is DMA (Direct Memory Access)?",
        options: [
          "A CPU instruction set",
          "Allows I/O devices to transfer data to memory without CPU intervention",
          "A type of virtual memory",
          "A scheduling algorithm",
        ],
        correct: 1,
        explanation:
          "DMA allows hardware devices to transfer data directly to/from main memory without involving the CPU for every byte, freeing the CPU for other work.",
      },
    ],
  },
};
