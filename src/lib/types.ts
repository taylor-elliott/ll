// ═══════════════════════════════════════
// BOSS CONFIGURATIONS
// ═══════════════════════════════════════

export interface BossConfig {
  id: string;
  name: string;
  emoji: string;
  color: string;
  hp: number;
  timeLimit: number;
  questions: {
    prompt: string;
    options: string[];
    correct: number;
    explanation: string;
  }[];
}

export type BossTypes =
  | "boss_process"
  | "boss_memory"
  | "boss_archive"
  | "boss_survival";
