export const LOOT = [
  { name: "CPU Shard", icon: "🔹", rare: "common", xp: 25, desc: "+5% XP" },
  { name: "Page Token", icon: "📄", rare: "common", xp: 30, desc: "Memory +1" },
  { name: "Cache Ring", icon: "💍", rare: "common", xp: 20, desc: "Speed +5%" },
  {
    name: "Boot Sector Boots",
    icon: "👢",
    rare: "common",
    xp: 25,
    desc: "Walk faster",
  },
  {
    name: "Golden Frame",
    icon: "🟡",
    rare: "rare",
    xp: 65,
    desc: "Page hits +10%",
  },
  {
    name: "Interrupt Shield",
    icon: "🛡️",
    rare: "rare",
    xp: 55,
    desc: "Block one fault",
  },
  {
    name: "Mutex Amulet",
    icon: "🔮",
    rare: "epic",
    xp: 110,
    desc: "Sync mastery",
  },
  {
    name: "DMA Gauntlets",
    icon: "🧤",
    rare: "epic",
    xp: 95,
    desc: "Direct access",
  },
  {
    name: "Kernel Crown",
    icon: "👑",
    rare: "legendary",
    xp: 250,
    desc: "Supreme power",
  },
];
export function rollLoot() {
  const r = Math.random(),
    p =
      r < 0.03 ? "legendary" : r < 0.15 ? "epic" : r < 0.4 ? "rare" : "common";
  const l = LOOT.filter((x) => x.rare === p);
  return l[Math.floor(Math.random() * l.length)];
}
export const RC = {
  common: "#8b949e",
  rare: "#58a6ff",
  epic: "#a371f7",
  legendary: "#f0883e",
};
