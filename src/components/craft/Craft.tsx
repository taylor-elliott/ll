import { useState, useEffect, useRef, useCallback } from "react";

/**
 *CraftZone — A 2D top-down Minecraft-style survival/creative zone.
 *
 * Features:
 *   - WASD movement with smooth pixel motion
 *   - Left-click to break blocks (hold to mine)
 *   - Right-click to place blocks from hotbar
 *   - Number keys 1-9 to switch hotbar slot
 *   - Enemies that patrol, chase, and attack
 *   - Health + damage system
 *   - Resource drops from breaking blocks
 *   - Simple crafting (combine resources)
 *   - Day/night cycle
 *   - Saved to parent via onChange callback
 *
 * Props:
 *   onExit()          — return to hub
 *   onComplete()      — called when boss is defeated (optional)
 *   saveData          — persisted state (blocks, inventory, etc.)
 *   onChange(data)     — called to persist state
 *   playerName        — display name
 */

// ═══════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════
const TS = 28;
const CW = 672;
const CH = 480;
const COLS = 36;
const ROWS = 36;
const SPEED = 120;
const HB = 8;
const HOTBAR_SIZE = 9;

interface Block {
  id: string;
  name: string;
  color: string;
  solid: boolean;
  hp: number;
  drops?: string;
  emoji?: string;
  glow?: string;
}

const BLOCKS: Record<string, Block> = {
  air: { id: "air", name: "Air", color: "transparent", solid: false, hp: 0 },
  dirt: {
    id: "dirt",
    name: "Dirt",
    color: "#6b4226",
    solid: true,
    hp: 2,
    drops: "dirt",
  },
  grass: {
    id: "grass",
    name: "Grass",
    color: "#3a7d22",
    solid: true,
    hp: 2,
    drops: "dirt",
  },
  stone: {
    id: "stone",
    name: "Stone",
    color: "#7a7a8a",
    solid: true,
    hp: 4,
    drops: "cobble",
  },
  cobble: {
    id: "cobble",
    name: "Cobblestone",
    color: "#6a6a7a",
    solid: true,
    hp: 4,
    drops: "cobble",
  },
  wood: {
    id: "wood",
    name: "Wood",
    color: "#8b6b42",
    solid: true,
    hp: 3,
    drops: "plank",
  },
  plank: {
    id: "plank",
    name: "Plank",
    color: "#b8944a",
    solid: true,
    hp: 2,
    drops: "plank",
  },
  leaf: {
    id: "leaf",
    name: "Leaves",
    color: "#2a8a1a",
    solid: false,
    hp: 1,
    drops: "stick",
  },
  sand: {
    id: "sand",
    name: "Sand",
    color: "#c8b878",
    solid: true,
    hp: 1,
    drops: "sand",
  },
  water: {
    id: "water",
    name: "Water",
    color: "#2266aa",
    solid: false,
    hp: 999,
    glow: "rgba(40,120,220,0.15)",
  },
  lava: {
    id: "lava",
    name: "Lava",
    color: "#cc4400",
    solid: false,
    hp: 999,
    glow: "rgba(255,100,0,0.2)",
  },
  iron: {
    id: "iron",
    name: "Iron Ore",
    color: "#8a7a6a",
    solid: true,
    hp: 6,
    drops: "iron",
    emoji: "⛏",
  },
  gold: {
    id: "gold",
    name: "Gold Ore",
    color: "#8a8a3a",
    solid: true,
    hp: 8,
    drops: "gold_i",
    emoji: "✨",
  },
  diamond: {
    id: "diamond",
    name: "Diamond Ore",
    color: "#4a8a9a",
    solid: true,
    hp: 10,
    drops: "diamond_i",
    emoji: "💎",
  },
  brick: {
    id: "brick",
    name: "Brick",
    color: "#9a4a3a",
    solid: true,
    hp: 5,
    drops: "brick",
  },
  glass: { id: "glass", name: "Glass", color: "#8ac8d8", solid: true, hp: 1 },
  torch: {
    id: "torch",
    name: "Torch",
    color: "#3a3a2a",
    solid: false,
    hp: 1,
    emoji: "🔥",
    glow: "rgba(255,200,50,0.25)",
  },
  chest: {
    id: "chest",
    name: "Chest",
    color: "#8a6a3a",
    solid: true,
    hp: 3,
    emoji: "📦",
  },
  bedrock: {
    id: "bedrock",
    name: "Bedrock",
    color: "#2a2a2a",
    solid: true,
    hp: 9999,
  },
  portal: {
    id: "portal",
    name: "Exit Portal",
    color: "#5522aa",
    solid: false,
    hp: 9999,
    emoji: "🌀",
    glow: "rgba(120,60,255,0.3)",
  },
};

interface Item {
  id: string;
  name: string;
  icon: string;
  stackable: boolean;
  placeable?: string; // block ID it places
  damage?: number;
  mineSpeed?: number;
}

const ITEMS: Record<string, Item> = {
  dirt: {
    id: "dirt",
    name: "Dirt",
    icon: "🟫",
    stackable: true,
    placeable: "dirt",
  },
  cobble: {
    id: "cobble",
    name: "Cobblestone",
    icon: "🪨",
    stackable: true,
    placeable: "cobble",
  },
  plank: {
    id: "plank",
    name: "Plank",
    icon: "🪵",
    stackable: true,
    placeable: "plank",
  },
  stick: { id: "stick", name: "Stick", icon: "🥢", stackable: true },
  sand: {
    id: "sand",
    name: "Sand",
    icon: "🏖️",
    stackable: true,
    placeable: "sand",
  },
  iron: { id: "iron", name: "Iron Ingot", icon: "🔩", stackable: true },
  gold_i: { id: "gold_i", name: "Gold Ingot", icon: "🟡", stackable: true },
  diamond_i: { id: "diamond_i", name: "Diamond", icon: "💎", stackable: true },
  brick: {
    id: "brick",
    name: "Brick",
    icon: "🧱",
    stackable: true,
    placeable: "brick",
  },
  glass: {
    id: "glass",
    name: "Glass",
    icon: "🪟",
    stackable: true,
    placeable: "glass",
  },
  torch: {
    id: "torch",
    name: "Torch",
    icon: "🔥",
    stackable: true,
    placeable: "torch",
  },
  wood_pick: {
    id: "wood_pick",
    name: "Wood Pick",
    icon: "⛏",
    stackable: false,
    damage: 2,
    mineSpeed: 2,
  },
  stone_pick: {
    id: "stone_pick",
    name: "Stone Pick",
    icon: "⛏",
    stackable: false,
    damage: 3,
    mineSpeed: 3,
  },
  iron_pick: {
    id: "iron_pick",
    name: "Iron Pick",
    icon: "⛏",
    stackable: false,
    damage: 4,
    mineSpeed: 4,
  },
  wood_sword: {
    id: "wood_sword",
    name: "Wood Sword",
    icon: "🗡️",
    stackable: false,
    damage: 4,
  },
  stone_sword: {
    id: "stone_sword",
    name: "Stone Sword",
    icon: "🗡️",
    stackable: false,
    damage: 6,
  },
  iron_sword: {
    id: "iron_sword",
    name: "Iron Sword",
    icon: "🗡️",
    stackable: false,
    damage: 8,
  },
};

interface Recipe {
  result: string;
  count: number;
  ingredients: Record<string, number>;
}

const RECIPES: Recipe[] = [
  { result: "plank", count: 4, ingredients: { plank: 1 } }, // 1 log = 4 planks (simplified)
  { result: "stick", count: 4, ingredients: { plank: 2 } },
  { result: "wood_pick", count: 1, ingredients: { plank: 3, stick: 2 } },
  { result: "wood_sword", count: 1, ingredients: { plank: 2, stick: 1 } },
  { result: "stone_pick", count: 1, ingredients: { cobble: 3, stick: 2 } },
  { result: "stone_sword", count: 1, ingredients: { cobble: 2, stick: 1 } },
  { result: "iron_pick", count: 1, ingredients: { iron: 3, stick: 2 } },
  { result: "iron_sword", count: 1, ingredients: { iron: 2, stick: 1 } },
  { result: "torch", count: 4, ingredients: { stick: 1, cobble: 1 } },
  { result: "brick", count: 4, ingredients: { dirt: 4, cobble: 1 } },
  { result: "glass", count: 1, ingredients: { sand: 4 } },
];

interface Enemy {
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  type: string;
  emoji: string;
  speed: number;
  damage: number;
  xpReward: number;
  aggro: number; // tiles
  knockback: number;
  dir: number; // 0-3
  patrolTimer: number;
  attackCd: number;
  flashTimer: number;
}

const ENEMY_TYPES: Record<
  string,
  Omit<Enemy, "x" | "y" | "dir" | "patrolTimer" | "attackCd" | "flashTimer">
> = {
  zombie: {
    hp: 20,
    maxHp: 20,
    type: "zombie",
    emoji: "🧟",
    speed: 40,
    damage: 5,
    xpReward: 15,
    aggro: 6,
    knockback: 4,
  },
  spider: {
    hp: 14,
    maxHp: 14,
    type: "spider",
    emoji: "🕷️",
    speed: 65,
    damage: 4,
    xpReward: 12,
    aggro: 8,
    knockback: 3,
  },
  skeleton: {
    hp: 18,
    maxHp: 18,
    type: "skeleton",
    emoji: "💀",
    speed: 45,
    damage: 6,
    xpReward: 18,
    aggro: 10,
    knockback: 5,
  },
  creeper: {
    hp: 24,
    maxHp: 24,
    type: "creeper",
    emoji: "💥",
    speed: 35,
    damage: 15,
    xpReward: 25,
    aggro: 5,
    knockback: 6,
  },
  boss: {
    hp: 100,
    maxHp: 100,
    type: "boss",
    emoji: "👹",
    speed: 50,
    damage: 12,
    xpReward: 200,
    aggro: 20,
    knockback: 8,
  },
};

type InvSlot = { itemId: string; count: number } | null;

// ═══════════════════════════════════════
// MAP GENERATION
// ═══════════════════════════════════════
function generateMap(): string[][] {
  const map: string[][] = [];
  for (let r = 0; r < ROWS; r++) {
    const row: string[] = [];
    for (let c = 0; c < COLS; c++) {
      // Border = bedrock
      if (r === 0 || r === ROWS - 1 || c === 0 || c === COLS - 1) {
        row.push("bedrock");
        continue;
      }
      // Portal at top center
      if (r === 1 && c === Math.floor(COLS / 2)) {
        row.push("portal");
        continue;
      }
      // Random terrain
      const n = Math.random();
      if (n < 0.45) row.push("grass");
      else if (n < 0.55) row.push("dirt");
      else if (n < 0.58) row.push("sand");
      else if (n < 0.62) row.push("stone");
      else if (n < 0.64) row.push("iron");
      else if (n < 0.65) row.push("gold");
      else if (n < 0.655) row.push("diamond");
      else if (n < 0.7) row.push("wood");
      else if (n < 0.73) row.push("leaf");
      else if (n < 0.75) row.push("water");
      else row.push("air");
    }
    map.push(row);
  }
  // Clear spawn area
  const sc = Math.floor(COLS / 2),
    sr = Math.floor(ROWS / 2);
  for (let dr = -2; dr <= 2; dr++)
    for (let dc = -2; dc <= 2; dc++) {
      const r = sr + dr,
        c = sc + dc;
      if (r > 0 && r < ROWS - 1 && c > 0 && c < COLS - 1) map[r][c] = "air";
    }
  return map;
}

function spawnEnemies(): Enemy[] {
  const enemies: Enemy[] = [];
  const types = ["zombie", "zombie", "spider", "spider", "skeleton", "creeper"];
  for (let i = 0; i < 8; i++) {
    const t = types[i % types.length];
    const et = ENEMY_TYPES[t];
    enemies.push({
      ...et,
      x: (3 + Math.random() * (COLS - 6)) * TS,
      y: (3 + Math.random() * (ROWS - 6)) * TS,
      dir: Math.floor(Math.random() * 4),
      patrolTimer: Math.random() * 3,
      attackCd: 0,
      flashTimer: 0,
    });
  }
  // Boss in corner
  enemies.push({
    ...ENEMY_TYPES.boss,
    x: (COLS - 4) * TS,
    y: (ROWS - 4) * TS,
    dir: 0,
    patrolTimer: 0,
    attackCd: 0,
    flashTimer: 0,
  });
  return enemies;
}

// ═══════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════
interface MinecraftZoneProps {
  onExit: () => void;
  onComplete?: () => void;
  saveData?: any;
  onChange?: (data: any) => void;
  playerName?: string;
}

export default function MinecraftZone({
  onExit,
  onComplete,
  saveData,
  onChange,
  playerName = "Player",
}: MinecraftZoneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gsRef = useRef({
    px: Math.floor(COLS / 2) * TS,
    py: Math.floor(ROWS / 2) * TS,
    camX: 0,
    camY: 0,
    time: 0,
    keys: new Set<string>(),
    mouseX: 0,
    mouseY: 0,
    mouseDown: false,
    mouseRight: false,
    mouseIn: false,
    miningTarget: null as { r: number; c: number; progress: number } | null,
    pendingHit: false,
    hitCooldown: 0,
    map: saveData?.map || generateMap(),
    enemies: saveData?.enemies || spawnEnemies(),
    hp: saveData?.hp ?? 100,
    maxHp: 100,
    inv: (saveData?.inv || [
      { itemId: "wood_pick", count: 1 },
      { itemId: "wood_sword", count: 1 },
      null,
      null,
      null,
      null,
      null,
      null,
      null,
    ]) as InvSlot[],
    hotbarSlot: 0,
    xpGained: 0,
    damageFlash: 0,
    particles: [] as any[],
    bossDefeated: saveData?.bossDefeated || false,
    dayTime: 0,
  });

  const [hp, setHp] = useState(gsRef.current.hp);
  const [hotbarSlot, setHotbarSlot] = useState(0);
  const [invState, setInvState] = useState<InvSlot[]>(gsRef.current.inv);
  const [showCraft, setShowCraft] = useState(false);
  const [xpGained, setXpGained] = useState(0);
  const [dead, setDead] = useState(false);
  const [bossMsg, setBossMsg] = useState<string | null>(null);
  const [mode, setMode] = useState<"survival" | "creative">("survival");

  // Sync inv back to ref
  const invRef = useRef(invState);
  invRef.current = invState;

  // Autosave
  useEffect(() => {
    if (!onChange) return;
    const iv = setInterval(() => {
      const g = gsRef.current;
      onChange({
        map: g.map,
        enemies: g.enemies,
        inv: invRef.current,
        hp: g.hp,
        bossDefeated: g.bossDefeated,
      });
    }, 5000);
    return () => clearInterval(iv);
  }, [onChange]);

  // Inventory helpers
  function addToInv(itemId: string, count: number = 1) {
    setInvState((prev) => {
      const inv = [...prev];
      const item = ITEMS[itemId];
      if (!item) return inv;
      // Stack into existing slot
      if (item.stackable) {
        const existing = inv.findIndex((s) => s && s.itemId === itemId);
        if (existing >= 0) {
          inv[existing] = { itemId, count: inv[existing]!.count + count };
          return inv;
        }
      }
      // Find empty slot
      const empty = inv.findIndex((s) => s === null);
      if (empty >= 0) {
        inv[empty] = { itemId, count };
        return inv;
      }
      return inv; // Full
    });
  }

  function removeFromInv(itemId: string, count: number = 1): boolean {
    let removed = false;
    setInvState((prev) => {
      const inv = [...prev];
      const idx = inv.findIndex(
        (s) => s && s.itemId === itemId && s.count >= count,
      );
      if (idx < 0) return prev;
      removed = true;
      inv[idx] =
        inv[idx]!.count > count
          ? { itemId, count: inv[idx]!.count - count }
          : null;
      return inv;
    });
    return removed;
  }

  function hasItems(ingredients: Record<string, number>): boolean {
    const counts: Record<string, number> = {};
    invRef.current.forEach((s) => {
      if (s) counts[s.itemId] = (counts[s.itemId] || 0) + s.count;
    });
    return Object.entries(ingredients).every(
      ([id, need]) => (counts[id] || 0) >= need,
    );
  }

  function craft(recipe: Recipe) {
    if (!hasItems(recipe.ingredients)) return;
    // Remove ingredients
    setInvState((prev) => {
      const inv = [...prev];
      const toRemove = { ...recipe.ingredients };
      for (
        let i = 0;
        i < inv.length && Object.values(toRemove).some((v) => v > 0);
        i++
      ) {
        const s = inv[i];
        if (!s || !toRemove[s.itemId]) continue;
        const take = Math.min(s.count, toRemove[s.itemId]);
        toRemove[s.itemId] -= take;
        inv[i] = s.count > take ? { ...s, count: s.count - take } : null;
      }
      // Add result
      const item = ITEMS[recipe.result];
      if (item?.stackable) {
        const existing = inv.findIndex((s) => s && s.itemId === recipe.result);
        if (existing >= 0) {
          inv[existing] = {
            itemId: recipe.result,
            count: inv[existing]!.count + recipe.count,
          };
          return inv;
        }
      }
      const empty = inv.findIndex((s) => s === null);
      if (empty >= 0)
        inv[empty] = { itemId: recipe.result, count: recipe.count };
      return inv;
    });
  }

  // ═══════════════════════════════════════
  // GAME LOOP
  // ═══════════════════════════════════════
  useEffect(() => {
    if (dead) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = CW;
    canvas.height = CH;
    let af: number,
      lastT = 0;

    function loop(t: number) {
      const dt = Math.min(0.05, (t - (lastT || t)) / 1000);
      lastT = t;
      const g = gsRef.current;
      g.time += dt;
      g.dayTime = (g.dayTime + dt * 0.02) % 1;
      if (g.damageFlash > 0) g.damageFlash -= dt;

      // ── Movement ──
      let dx = 0,
        dy = 0;
      if (g.keys.has("w") || g.keys.has("arrowup")) dy = -1;
      if (g.keys.has("s") || g.keys.has("arrowdown")) dy = 1;
      if (g.keys.has("a") || g.keys.has("arrowleft")) dx = -1;
      if (g.keys.has("d") || g.keys.has("arrowright")) dx = 1;
      if (dx && dy) {
        dx *= 0.707;
        dy *= 0.707;
      }
      const spd = SPEED * dt;
      const nx = g.px + dx * spd,
        ny = g.py + dy * spd;
      const check = (px: number, py: number) => {
        const cx = px + TS / 2,
          cy = py + TS / 2;
        for (const [ox, oy] of [
          [cx - HB, cy - HB],
          [cx + HB, cy - HB],
          [cx - HB, cy + HB],
          [cx + HB, cy + HB],
        ]) {
          const tc = Math.floor(ox / TS),
            tr = Math.floor(oy / TS);
          if (tc < 0 || tc >= COLS || tr < 0 || tr >= ROWS) return false;
          const b = BLOCKS[g.map[tr][tc]];
          if (b && b.solid) return false;
        }
        return true;
      };
      if (check(nx, g.py)) g.px = nx;
      if (check(g.px, ny)) g.py = ny;

      // Lava damage
      const ptc = Math.floor((g.px + TS / 2) / TS),
        ptr = Math.floor((g.py + TS / 2) / TS);
      if (g.map[ptr]?.[ptc] === "lava") {
        g.hp -= 15 * dt;
        g.damageFlash = 0.2;
      }

      // Camera
      const tcx = g.px + TS / 2 - CW / 2,
        tcy = g.py + TS / 2 - CH / 2;
      g.camX += (tcx - g.camX) * 6 * dt;
      g.camY += (tcy - g.camY) * 6 * dt;
      g.camX = Math.max(0, Math.min(COLS * TS - CW, g.camX));
      g.camY = Math.max(0, Math.min(ROWS * TS - CH, g.camY));

      // ── Mining (click-to-break) ──
      if (g.hitCooldown > 0) g.hitCooldown -= dt;

      if (g.pendingHit && !g.mouseRight && g.mouseIn && g.hitCooldown <= 0) {
        g.pendingHit = false;
        g.hitCooldown = 0.18;

        const mc = Math.floor((g.mouseX + g.camX) / TS);
        const mr = Math.floor((g.mouseY + g.camY) / TS);
        if (mc >= 0 && mc < COLS && mr >= 0 && mr < ROWS) {
          const blockId = g.map[mr][mc];
          const block = BLOCKS[blockId];
          if (
            block &&
            blockId !== "air" &&
            blockId !== "bedrock" &&
            blockId !== "portal"
          ) {
            const dist = Math.sqrt(
              (g.px + TS / 2 - (mc * TS + TS / 2)) ** 2 +
                (g.py + TS / 2 - (mr * TS + TS / 2)) ** 2,
            );
            if (dist < TS * 4) {
              if (
                !g.miningTarget ||
                g.miningTarget.r !== mr ||
                g.miningTarget.c !== mc
              ) {
                g.miningTarget = { r: mr, c: mc, progress: 0 };
              }
              const held = invRef.current[g.hotbarSlot];
              const tool = held ? ITEMS[held.itemId] : null;
              const hitDmg = tool?.mineSpeed || 1;
              g.miningTarget.progress += hitDmg;
              // Hit particles
              for (let i = 0; i < 3; i++) {
                g.particles.push({
                  x: mc * TS + TS / 2 + (Math.random() - 0.5) * TS,
                  y: mr * TS + TS / 2 + (Math.random() - 0.5) * TS,
                  vx: (Math.random() - 0.5) * 60,
                  vy: (Math.random() - 0.5) * 60 - 20,
                  life: 0.3,
                  color: block.color,
                  size: 2 + Math.random() * 2,
                });
              }
              if (g.miningTarget.progress >= block.hp) {
                g.map[mr][mc] = "air";
                if (block.drops) addToInv(block.drops);
                for (let i = 0; i < 8; i++) {
                  g.particles.push({
                    x: mc * TS + TS / 2,
                    y: mr * TS + TS / 2,
                    vx: (Math.random() - 0.5) * 100,
                    vy: (Math.random() - 0.5) * 100,
                    life: 0.6,
                    color: block.color,
                    size: 3 + Math.random() * 3,
                  });
                }
                g.miningTarget = null;
              }
            }
          }
        }
      }
      if (!g.mouseDown) g.pendingHit = false;
      // Reset mining if player moves too far
      if (g.miningTarget) {
        const dist = Math.sqrt(
          (g.px + TS / 2 - (g.miningTarget.c * TS + TS / 2)) ** 2 +
            (g.py + TS / 2 - (g.miningTarget.r * TS + TS / 2)) ** 2,
        );
        if (dist >= TS * 5) g.miningTarget = null;
      }

      // ── Place block (right click) ──
      if (g.mouseDown && g.mouseRight && g.mouseIn) {
        const mc = Math.floor((g.mouseX + g.camX) / TS);
        const mr = Math.floor((g.mouseY + g.camY) / TS);
        if (
          mc >= 0 &&
          mc < COLS &&
          mr >= 0 &&
          mr < ROWS &&
          g.map[mr][mc] === "air"
        ) {
          const held = invRef.current[g.hotbarSlot];
          if (held) {
            const item = ITEMS[held.itemId];
            if (item?.placeable) {
              g.map[mr][mc] = item.placeable;
              setInvState((prev) => {
                const inv = [...prev];
                const s = inv[g.hotbarSlot];
                if (s && s.count > 1)
                  inv[g.hotbarSlot] = { ...s, count: s.count - 1 };
                else inv[g.hotbarSlot] = null;
                return inv;
              });
              g.mouseDown = false; // One place per click
            }
          }
        }
      }

      // ── Enemies ──
      const pcx = g.px + TS / 2,
        pcy = g.py + TS / 2;
      g.enemies.forEach((e: Enemy) => {
        if (e.hp <= 0) return;
        if (e.flashTimer > 0) e.flashTimer -= dt;
        if (e.attackCd > 0) e.attackCd -= dt;
        const ex = e.x + TS / 2,
          ey = e.y + TS / 2;
        const dist = Math.sqrt((pcx - ex) ** 2 + (pcy - ey) ** 2);

        if (dist < e.aggro * TS) {
          // Chase player
          const angle = Math.atan2(pcy - ey, pcx - ex);
          const nx = e.x + Math.cos(angle) * e.speed * dt;
          const ny = e.y + Math.sin(angle) * e.speed * dt;
          // Simple collision check for enemies
          const ec = Math.floor((nx + TS / 2) / TS),
            er = Math.floor((ny + TS / 2) / TS);
          if (
            ec >= 0 &&
            ec < COLS &&
            er >= 0 &&
            er < ROWS &&
            !BLOCKS[g.map[er][ec]]?.solid
          ) {
            e.x = nx;
            e.y = ny;
          }
          // Attack player
          if (dist < TS * 1.2 && e.attackCd <= 0) {
            g.hp -= e.damage;
            g.damageFlash = 0.3;
            e.attackCd = 1.0;
            // Knockback player
            g.px += Math.cos(angle) * -e.knockback;
            g.py += Math.sin(angle) * -e.knockback;
          }
        } else {
          // Patrol
          e.patrolTimer -= dt;
          if (e.patrolTimer <= 0) {
            e.dir = Math.floor(Math.random() * 4);
            e.patrolTimer = 1 + Math.random() * 2;
          }
          const dirs = [
            [0, -1],
            [0, 1],
            [-1, 0],
            [1, 0],
          ];
          const [ddx, ddy] = dirs[e.dir];
          e.x += ddx * e.speed * 0.3 * dt;
          e.y += ddy * e.speed * 0.3 * dt;
          e.x = Math.max(TS, Math.min((COLS - 2) * TS, e.x));
          e.y = Math.max(TS, Math.min((ROWS - 2) * TS, e.y));
        }
      });

      // ── Attack enemy (click near enemy) ──
      if (g.pendingHit && !g.mouseRight && g.mouseIn) {
        const mx = g.mouseX + g.camX,
          my = g.mouseY + g.camY;
        g.enemies.forEach((e: Enemy) => {
          if (e.hp <= 0) return;
          const dist = Math.sqrt(
            (mx - e.x - TS / 2) ** 2 + (my - e.y - TS / 2) ** 2,
          );
          if (dist < TS * 1.5 && e.flashTimer <= 0) {
            const held = invRef.current[g.hotbarSlot];
            const tool = held ? ITEMS[held.itemId] : null;
            const dmg = tool?.damage || 1;
            e.hp -= dmg;
            e.flashTimer = 0.2;
            // Knockback enemy
            const angle = Math.atan2(e.y + TS / 2 - pcy, e.x + TS / 2 - pcx);
            e.x += Math.cos(angle) * 10;
            e.y += Math.sin(angle) * 10;
            if (e.hp <= 0) {
              g.xpGained += e.xpReward;
              setXpGained(g.xpGained);
              for (let i = 0; i < 8; i++) {
                g.particles.push({
                  x: e.x + TS / 2,
                  y: e.y + TS / 2,
                  vx: (Math.random() - 0.5) * 100,
                  vy: (Math.random() - 0.5) * 100,
                  life: 0.8,
                  color: "#ff4444",
                  size: 4,
                });
              }
              // Boss defeated
              if (e.type === "boss" && !g.bossDefeated) {
                g.bossDefeated = true;
                setBossMsg("👹 BOSS DEFEATED! The zone is cleared!");
                setTimeout(() => {
                  setBossMsg(null);
                  onComplete?.();
                }, 3000);
              }
            }
          }
        });
      }

      // HP sync
      if (g.hp <= 0 && !dead) {
        g.hp = 0;
        setDead(true);
      }
      setHp(Math.max(0, Math.floor(g.hp)));

      // Portal exit
      if (g.map[ptr]?.[ptc] === "portal") {
        onExit();
        return;
      }

      // Particles
      g.particles.forEach((p: any) => {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt;
        p.vy += 100 * dt;
      });
      g.particles = g.particles.filter((p: any) => p.life > 0);

      // ═══════ RENDER ═══════
      ctx.clearRect(0, 0, CW, CH);
      // Background
      ctx.fillStyle = "#1a1a2e";
      ctx.fillRect(0, 0, CW, CH);

      // Tiles
      const sc = Math.floor(g.camX / TS) - 1,
        sr2 = Math.floor(g.camY / TS) - 1;
      const ec = sc + Math.ceil(CW / TS) + 3,
        er2 = sr2 + Math.ceil(CH / TS) + 3;
      for (let r = Math.max(0, sr2); r < Math.min(ROWS, er2); r++) {
        for (let c = Math.max(0, sc); c < Math.min(COLS, ec); c++) {
          const blockId = g.map[r][c];
          const block = BLOCKS[blockId];
          if (!block || blockId === "air") continue;
          const bx = c * TS - g.camX,
            by = r * TS - g.camY;
          ctx.fillStyle = block.color;
          ctx.fillRect(bx, by, TS, TS);
          // Texture details
          if (blockId === "grass") {
            ctx.fillStyle = "rgba(0,0,0,0.1)";
            ctx.fillRect(bx, by + TS - 4, TS, 4);
          }
          if (blockId === "stone" || blockId === "cobble") {
            ctx.strokeStyle = "rgba(0,0,0,0.15)";
            ctx.lineWidth = 1;
            ctx.strokeRect(bx + 4, by + 4, TS - 8, TS - 8);
          }
          if (blockId === "wood") {
            ctx.strokeStyle = "rgba(0,0,0,0.1)";
            for (let lx = 4; lx < TS; lx += 6) {
              ctx.beginPath();
              ctx.moveTo(bx + lx, by);
              ctx.lineTo(bx + lx, by + TS);
              ctx.stroke();
            }
          }
          if (block.glow) {
            ctx.fillStyle = block.glow;
            ctx.fillRect(bx - 4, by - 4, TS + 8, TS + 8);
          }
          if (block.emoji) {
            ctx.font = `${TS - 6}px serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(block.emoji, bx + TS / 2, by + TS / 2);
          }
          // Grid
          ctx.strokeStyle = "rgba(0,0,0,0.08)";
          ctx.strokeRect(bx, by, TS, TS);
        }
      }

      // Mining progress — crack overlay + HP bar
      if (g.miningTarget) {
        const { r, c, progress } = g.miningTarget;
        const blockId = g.map[r]?.[c];
        const block = blockId ? BLOCKS[blockId] : null;
        if (block && block.hp > 0) {
          const bx = c * TS - g.camX,
            by = r * TS - g.camY;
          const pct = Math.min(1, progress / block.hp);
          // Darkening
          ctx.fillStyle = `rgba(0,0,0,${0.05 + pct * 0.4})`;
          ctx.fillRect(bx, by, TS, TS);
          // Deterministic crack lines
          ctx.strokeStyle = `rgba(255,255,255,${0.2 + pct * 0.5})`;
          ctx.lineWidth = 1.5;
          const crackCount = Math.ceil(pct * 5);
          const seed = r * 100 + c;
          for (let i = 0; i < crackCount; i++) {
            const angle = ((seed + i * 73) % 360) * (Math.PI / 180);
            const len = TS * 0.3 + pct * TS * 0.2;
            ctx.beginPath();
            ctx.moveTo(bx + TS / 2, by + TS / 2);
            ctx.lineTo(
              bx + TS / 2 + Math.cos(angle) * len,
              by + TS / 2 + Math.sin(angle) * len,
            );
            ctx.stroke();
          }
          // HP bar above block
          const barW = TS * 0.8;
          ctx.fillStyle = "rgba(0,0,0,0.6)";
          ctx.fillRect(bx + (TS - barW) / 2, by - 6, barW, 4);
          ctx.fillStyle =
            pct > 0.7 ? "#f85149" : pct > 0.4 ? "#f0883e" : "#3fb950";
          ctx.fillRect(bx + (TS - barW) / 2, by - 6, barW * (1 - pct), 4);
        }
      }

      // Enemies
      g.enemies.forEach((e: Enemy) => {
        if (e.hp <= 0) return;
        const ex = e.x - g.camX,
          ey = e.y - g.camY;
        if (
          ex < -TS * 2 ||
          ex > CW + TS * 2 ||
          ey < -TS * 2 ||
          ey > CH + TS * 2
        )
          return;
        // Shadow
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.beginPath();
        ctx.ellipse(ex + TS / 2, ey + TS - 2, TS * 0.35, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        // Flash on hit
        if (e.flashTimer > 0) {
          ctx.fillStyle = "rgba(255,50,50,0.4)";
          ctx.fillRect(ex, ey, TS, TS);
        }
        // Emoji
        ctx.font = `${TS + 2}px serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(e.emoji, ex + TS / 2, ey + TS / 2);
        // HP bar
        if (e.hp < e.maxHp) {
          const bw = TS * 0.8,
            bh = 3;
          ctx.fillStyle = "#333";
          ctx.fillRect(ex + (TS - bw) / 2, ey - 6, bw, bh);
          ctx.fillStyle = e.type === "boss" ? "#a040ff" : "#e44";
          ctx.fillRect(ex + (TS - bw) / 2, ey - 6, bw * (e.hp / e.maxHp), bh);
        }
        // Boss label
        if (e.type === "boss") {
          ctx.font = "bold 8px monospace";
          ctx.fillStyle = "#a040ff";
          ctx.fillText("BOSS", ex + TS / 2, ey - 12);
        }
      });

      // Player
      const ppx = g.px - g.camX,
        ppy = g.py - g.camY;
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.beginPath();
      ctx.ellipse(ppx + TS / 2, ppy + TS - 2, 10, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      if (g.damageFlash > 0) {
        ctx.fillStyle = "rgba(255,0,0,0.3)";
        ctx.fillRect(ppx - 2, ppy - 2, TS + 4, TS + 4);
      }
      ctx.font = `${TS + 4}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("🧑‍💻", ppx + TS / 2, ppy + TS / 2 - 2);

      // Particles
      g.particles.forEach((p: any) => {
        ctx.globalAlpha = Math.max(0, p.life * 2);
        ctx.fillStyle = p.color;
        ctx.fillRect(
          p.x - g.camX - p.size / 2,
          p.y - g.camY - p.size / 2,
          p.size,
          p.size,
        );
      });
      ctx.globalAlpha = 1;

      // Day/night overlay
      const nightAlpha = Math.max(
        0,
        Math.sin(g.dayTime * Math.PI * 2 - Math.PI / 2) * 0.25,
      );
      if (nightAlpha > 0.01) {
        ctx.fillStyle = `rgba(10,10,40,${nightAlpha})`;
        ctx.fillRect(0, 0, CW, CH);
      }

      // Damage flash overlay
      if (g.damageFlash > 0) {
        ctx.fillStyle = `rgba(255,0,0,${g.damageFlash * 0.3})`;
        ctx.fillRect(0, 0, CW, CH);
      }

      // Mouse crosshair in mining range
      if (g.mouseIn) {
        const mc = Math.floor((g.mouseX + g.camX) / TS);
        const mr = Math.floor((g.mouseY + g.camY) / TS);
        const bx = mc * TS - g.camX,
          by2 = mr * TS - g.camY;
        ctx.strokeStyle = "rgba(255,255,255,0.3)";
        ctx.lineWidth = 1;
        ctx.strokeRect(bx, by2, TS, TS);
      }

      af = requestAnimationFrame(loop);
    }

    af = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(af);
  }, [dead]);

  // ── Input ──
  useEffect(() => {
    if (dead) return;
    const kd = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (showCraft && k === "escape") {
        e.preventDefault();
        setShowCraft(false);
        return;
      }
      if (k === "c") {
        e.preventDefault();
        setShowCraft((v) => !v);
        return;
      }
      if (k === "escape") {
        e.preventDefault();
        onExit();
        return;
      }
      if (k >= "1" && k <= "9") {
        const slot = parseInt(k) - 1;
        gsRef.current.hotbarSlot = slot;
        setHotbarSlot(slot);
        return;
      }
      gsRef.current.keys.add(k);
    };
    const ku = (e: KeyboardEvent) =>
      gsRef.current.keys.delete(e.key.toLowerCase());
    const canvas = canvasRef.current;
    const mm = (e: MouseEvent) => {
      if (!canvas) return;
      const r = canvas.getBoundingClientRect();
      gsRef.current.mouseX = (e.clientX - r.left) * (CW / r.width);
      gsRef.current.mouseY = (e.clientY - r.top) * (CH / r.height);
      gsRef.current.mouseIn = true;
    };
    const md = (e: MouseEvent) => {
      gsRef.current.mouseDown = true;
      gsRef.current.mouseRight = e.button === 2;
      if (e.button === 0) gsRef.current.pendingHit = true;
    };
    const mu = () => {
      gsRef.current.mouseDown = false;
      gsRef.current.mouseRight = false;
    };
    const ml = () => {
      gsRef.current.mouseIn = false;
      gsRef.current.mouseDown = false;
    };
    const cm = (e: Event) => e.preventDefault();
    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);
    if (canvas) {
      canvas.addEventListener("mousemove", mm);
      canvas.addEventListener("mousedown", md);
      canvas.addEventListener("mouseup", mu);
      canvas.addEventListener("mouseleave", ml);
      canvas.addEventListener("contextmenu", cm);
    }
    return () => {
      window.removeEventListener("keydown", kd);
      window.removeEventListener("keyup", ku);
      if (canvas) {
        canvas.removeEventListener("mousemove", mm);
        canvas.removeEventListener("mousedown", md);
        canvas.removeEventListener("mouseup", mu);
        canvas.removeEventListener("mouseleave", ml);
        canvas.removeEventListener("contextmenu", cm);
      }
      gsRef.current.keys.clear();
    };
  }, [dead, showCraft]);

  // ═══════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════
  const ff = "'Silkscreen','Courier New',monospace";
  const heldItem = invState[hotbarSlot];
  const heldInfo = heldItem ? ITEMS[heldItem.itemId] : null;

  if (dead)
    return (
      <div
        style={{
          width: CW,
          height: CH,
          background: "#0a0a0a",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 10,
          border: "2px solid #1a1f30",
          fontFamily: ff,
          color: "#e6edf3",
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 12 }}>💀</div>
        <div
          style={{
            fontSize: 20,
            fontWeight: 900,
            color: "#f85149",
            marginBottom: 8,
          }}
        >
          YOU DIED
        </div>
        <div style={{ fontSize: 11, color: "#8b949e", marginBottom: 20 }}>
          XP earned: {xpGained}
        </div>
        <button
          onClick={onExit}
          style={{
            background: "#238636",
            border: "none",
            color: "#fff",
            borderRadius: 8,
            padding: "10px 28px",
            fontSize: 12,
            cursor: "pointer",
            fontFamily: ff,
            fontWeight: 700,
          }}
        >
          Return to Hub
        </button>
      </div>
    );

  return (
    <div
      style={{
        width: CW,
        height: CH,
        position: "relative",
        borderRadius: 10,
        border: "2px solid #1a1f30",
        overflow: "hidden",
        fontFamily: ff,
        background: "#0a0a0a",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ display: "block", width: CW, height: CH }}
      />

      {/* HP Bar */}
      <div
        style={{
          position: "absolute",
          top: 8,
          left: 8,
          zIndex: 50,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 4,
          }}
        >
          <span style={{ fontSize: 12 }}>❤️</span>
          <div
            style={{
              width: 100,
              height: 8,
              background: "#21262d",
              borderRadius: 4,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${(hp / 100) * 100}%`,
                height: "100%",
                background: hp > 30 ? "#e44" : "#ff2222",
                borderRadius: 4,
                transition: "width 0.3s",
              }}
            />
          </div>
          <span style={{ fontSize: 9, color: "#e6edf3" }}>{hp}/100</span>
        </div>
        <div style={{ fontSize: 8, color: "#8b949e" }}>⭐ {xpGained} XP</div>
      </div>

      {/* Held item info */}
      <div
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          zIndex: 50,
          pointerEvents: "none",
          textAlign: "right",
        }}
      >
        <div style={{ fontSize: 9, color: "#8b949e" }}>
          {heldInfo ? `${heldInfo.icon} ${heldInfo.name}` : "Empty hand"}
        </div>
        {heldInfo?.damage && (
          <div style={{ fontSize: 8, color: "#f85149" }}>
            ⚔ {heldInfo.damage} dmg
          </div>
        )}
        {heldInfo?.mineSpeed && (
          <div style={{ fontSize: 8, color: "#58a6ff" }}>
            ⛏ {heldInfo.mineSpeed}x speed
          </div>
        )}
      </div>

      {/* Hotbar */}
      <div
        style={{
          position: "absolute",
          bottom: 8,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 2,
          zIndex: 50,
        }}
      >
        {invState.slice(0, HOTBAR_SIZE).map((slot, i) => (
          <div
            key={i}
            onClick={() => {
              gsRef.current.hotbarSlot = i;
              setHotbarSlot(i);
            }}
            style={{
              width: 36,
              height: 36,
              borderRadius: 6,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              background:
                i === hotbarSlot
                  ? "rgba(88,166,255,0.25)"
                  : "rgba(13,17,23,0.85)",
              border:
                i === hotbarSlot ? "2px solid #58a6ff" : "2px solid #30363d",
              cursor: "pointer",
              position: "relative",
            }}
          >
            {slot && (
              <span style={{ fontSize: 16 }}>
                {ITEMS[slot.itemId]?.icon || "?"}
              </span>
            )}
            {slot && slot.count > 1 && (
              <span
                style={{
                  position: "absolute",
                  bottom: 1,
                  right: 3,
                  fontSize: 7,
                  color: "#e6edf3",
                  fontWeight: 700,
                }}
              >
                {slot.count}
              </span>
            )}
            <span
              style={{
                position: "absolute",
                top: -1,
                left: 2,
                fontSize: 6,
                color: "#484f58",
              }}
            >
              {i + 1}
            </span>
          </div>
        ))}
      </div>

      {/* Controls hint */}
      <div
        style={{
          position: "absolute",
          bottom: 48,
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: 7,
          color: "#484f5860",
          zIndex: 40,
          pointerEvents: "none",
          whiteSpace: "nowrap",
        }}
      >
        WASD move · Click to mine/attack · Right-click place · C craft · 1-9
        hotbar · ESC exit
      </div>

      {/* Crafting panel */}
      {showCraft && (
        <div
          style={{
            position: "absolute",
            top: 40,
            right: 8,
            background: "rgba(13,17,23,0.95)",
            borderRadius: 10,
            padding: 12,
            zIndex: 80,
            border: "1px solid #30363d",
            maxWidth: 240,
            maxHeight: CH - 80,
            overflowY: "auto",
          }}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.nativeEvent.stopImmediatePropagation()}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 700, color: "#e6edf3" }}>
              🔨 Crafting
            </span>
            <button
              onClick={() => setShowCraft(false)}
              style={{
                background: "none",
                border: "none",
                color: "#6e7681",
                cursor: "pointer",
                fontSize: 10,
              }}
            >
              ✕
            </button>
          </div>
          {RECIPES.map((recipe, i) => {
            const canCraft = hasItems(recipe.ingredients);
            const resultItem = ITEMS[recipe.result];
            return (
              <div
                key={i}
                onClick={() => canCraft && craft(recipe)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 4px",
                  borderBottom: "1px solid #161b22",
                  cursor: canCraft ? "pointer" : "default",
                  opacity: canCraft ? 1 : 0.4,
                  background: canCraft ? "rgba(35,134,54,0.08)" : "transparent",
                  borderRadius: 4,
                }}
              >
                <span style={{ fontSize: 16 }}>{resultItem?.icon || "?"}</span>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      color: canCraft ? "#3fb950" : "#6e7681",
                    }}
                  >
                    {resultItem?.name} ×{recipe.count}
                  </div>
                  <div style={{ fontSize: 7, color: "#484f58" }}>
                    {Object.entries(recipe.ingredients)
                      .map(([id, n]) => `${ITEMS[id]?.icon || id}×${n}`)
                      .join(" + ")}
                  </div>
                </div>
                {canCraft && (
                  <span
                    style={{ fontSize: 8, color: "#3fb950", fontWeight: 700 }}
                  >
                    CRAFT
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Boss message */}
      {bossMsg && (
        <div
          style={{
            position: "absolute",
            top: "30%",
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: 18,
            fontWeight: 900,
            color: "#a040ff",
            textShadow: "0 2px 20px rgba(0,0,0,0.9)",
            zIndex: 90,
            pointerEvents: "none",
            whiteSpace: "nowrap",
          }}
        >
          {bossMsg}
        </div>
      )}

      {/* Exit button */}
      <button
        onClick={onExit}
        style={{
          position: "absolute",
          top: 8,
          left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(22,27,34,0.8)",
          border: "1px solid #30363d",
          borderRadius: 4,
          padding: "2px 10px",
          cursor: "pointer",
          fontSize: 8,
          color: "#8b949e",
          zIndex: 50,
          fontFamily: ff,
        }}
      >
        🌀 Exit Zone (ESC)
      </button>
    </div>
  );
}
