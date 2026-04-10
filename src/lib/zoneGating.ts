/**
 * zoneGating.ts — Zone unlock rules, boss configurations, and progression logic.
 *
 * Zone unlock chain:
 *   hub (always open)
 *   → process_plains (open from start)
 *   → memory_caverns (requires process_plains boss defeated)
 *   → archive_city (requires memory_caverns boss defeated)
 *   → sandbox / workshop (always open)
 *   → minecraft_zone (requires at least 2 bosses defeated)
 *
 * Each zone has:
 *   - prerequisite quests or boss clears
 *   - a boss that unlocks after ALL zone quests are complete
 *   - boss fight with OS-themed questions
 */

// ═══════════════════════════════════════
// ZONE DEFINITIONS
// ═══════════════════════════════════════

export interface ZoneConfig {
  id: string;
  name: string;
  icon: string;
  color: string;
  requiresBossDefeated?: string[]; // boss IDs that must be cleared
  requiresQuests?: string[]; // quest IDs that must be done
  questIds: string[]; // quests IN this zone
  bossId: string;
  bossUnlocksAfterQuests: string[]; // quests needed before boss appears
}

export const ZONES: Record<string, ZoneConfig> = {
  hub: {
    id: "hub",
    name: "The Hub",
    icon: "🏠",
    color: "#58a6ff",
    questIds: [],
    bossId: "",
    bossUnlocksAfterQuests: [],
  },
  process_plains: {
    id: "process_plains",
    name: "Process Plains",
    icon: "⚙️",
    color: "#e74c3c",
    questIds: ["q_sched", "q_kill"],
    bossId: "boss_process",
    bossUnlocksAfterQuests: ["q_sched", "q_kill"],
  },
  memory_caverns: {
    id: "memory_caverns",
    name: "Memory Caverns",
    icon: "🧠",
    color: "#58a6ff",
    requiresBossDefeated: ["boss_process"],
    questIds: ["q_page"],
    bossId: "boss_memory",
    bossUnlocksAfterQuests: ["q_page"],
  },
  archive_city: {
    id: "archive_city",
    name: "Archive City",
    icon: "🏛️",
    color: "#f39c12",
    requiresBossDefeated: ["boss_memory"],
    questIds: ["q_perm", "q_mutex"],
    bossId: "boss_archive",
    bossUnlocksAfterQuests: ["q_perm", "q_mutex"],
  },
  sandbox: {
    id: "sandbox",
    name: "The Workshop",
    icon: "🔨",
    color: "#f0883e",
    questIds: [],
    bossId: "",
    bossUnlocksAfterQuests: [],
  },
  minecraft_zone: {
    id: "minecraft_zone",
    name: "The Survival Zone",
    icon: "⛏",
    color: "#2ecc71",
    requiresBossDefeated: [],
    // requiresBossDefeated: ["boss_process", "boss_memory"],
    questIds: [],
    bossId: "boss_survival",
    bossUnlocksAfterQuests: [],
  },
};

// ═══════════════════════════════════════
// GATING FUNCTIONS
// ═══════════════════════════════════════

/**
 * Check if a zone is unlocked.
 */
export function isZoneUnlocked(
  zoneId: string,
  bossesDefeated: Set<string>,
  questsDone: Set<string>,
): boolean {
  const zone = ZONES[zoneId];
  if (!zone) return false;
  if (zoneId === "hub" || zoneId === "sandbox") return true;

  if (zone.requiresBossDefeated) {
    for (const bossId of zone.requiresBossDefeated) {
      if (!bossesDefeated.has(bossId)) return false;
    }
  }
  if (zone.requiresQuests) {
    for (const qId of zone.requiresQuests) {
      if (!questsDone.has(qId)) return false;
    }
  }
  return true;
}

/**
 * Check if a zone's boss is available (all quests in zone done).
 */
export function isBossAvailable(
  zoneId: string,
  questsDone: Set<string>,
  bossesDefeated: Set<string>,
): boolean {
  const zone = ZONES[zoneId];
  if (!zone || !zone.bossId) return false;
  if (bossesDefeated.has(zone.bossId)) return false; // already beaten
  return zone.bossUnlocksAfterQuests.every((qId) => questsDone.has(qId));
}

/**
 * Get lock reason for a zone (for UI display).
 */
export function getZoneLockReason(
  zoneId: string,
  bossesDefeated: Set<string>,
): string | null {
  const zone = ZONES[zoneId];
  if (!zone) return "Unknown zone";
  if (isZoneUnlocked(zoneId, bossesDefeated, new Set())) return null;

  if (zone.requiresBossDefeated) {
    const missing = zone.requiresBossDefeated.filter(
      (b) => !bossesDefeated.has(b),
    );
    if (missing.length > 0) {
      const bossNames = missing.map((b) => BOSS_CONFIGS[b]?.name || b);
      return `Defeat ${bossNames.join(", ")} first`;
    }
  }
  return "Complete prerequisites first";
}

/**
 * Get completion percentage for a zone.
 */
export function getZoneProgress(
  zoneId: string,
  questsDone: Set<string>,
  bossesDefeated: Set<string>,
): number {
  const zone = ZONES[zoneId];
  if (!zone) return 0;
  const total = zone.questIds.length + (zone.bossId ? 1 : 0);
  if (total === 0) return 100;
  let done = zone.questIds.filter((q) => questsDone.has(q)).length;
  if (zone.bossId && bossesDefeated.has(zone.bossId)) done++;
  return Math.floor((done / total) * 100);
}
