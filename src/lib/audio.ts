// Procedural chiptune audio using Web Audio API.
// No external assets — all SFX and music are synthesized on the fly.

type OscType = "sine" | "square" | "triangle" | "sawtooth";

let ctx: AudioContext | null = null;
let sfxGain: GainNode | null = null;
let musicGain: GainNode | null = null;
let masterGain: GainNode | null = null;

let musicTimer: number | null = null;
let currentTrack: string | null = null;

const state = {
  sfxVolume: 0.5,
  musicVolume: 0.25,
  muted: false,
};

function ensureCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const w = window as typeof window & {
      webkitAudioContext?: typeof AudioContext;
    };
    const AC = w.AudioContext || w.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    masterGain = ctx.createGain();
    masterGain.gain.value = state.muted ? 0 : 1;
    masterGain.connect(ctx.destination);
    sfxGain = ctx.createGain();
    sfxGain.gain.value = state.sfxVolume;
    sfxGain.connect(masterGain);
    musicGain = ctx.createGain();
    musicGain.gain.value = state.musicVolume;
    musicGain.connect(masterGain);
  }
  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }
  return ctx;
}

// A single synthesized blip with envelope.
function blip(
  freq: number,
  dur: number,
  type: OscType = "square",
  vol: number = 0.3,
  target: GainNode | null = null,
  startAt: number = 0,
  sweepTo?: number,
) {
  const c = ensureCtx();
  if (!c) return;
  const dest = target || sfxGain!;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  const t0 = c.currentTime + startAt;
  osc.frequency.setValueAtTime(freq, t0);
  if (sweepTo != null) {
    osc.frequency.exponentialRampToValueAtTime(
      Math.max(1, sweepTo),
      t0 + dur,
    );
  }
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(vol, t0 + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g);
  g.connect(dest);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

function noise(dur: number, vol: number = 0.2, startAt: number = 0) {
  const c = ensureCtx();
  if (!c) return;
  const bufSize = Math.max(1, Math.floor(c.sampleRate * dur));
  const buf = c.createBuffer(1, bufSize, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufSize);
  }
  const src = c.createBufferSource();
  src.buffer = buf;
  const g = c.createGain();
  g.gain.value = vol;
  const hp = c.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 800;
  src.connect(hp);
  hp.connect(g);
  g.connect(sfxGain!);
  src.start(c.currentTime + startAt);
}

// ═══════ SOUND EFFECTS ═══════
export const sfx = {
  click() {
    blip(660, 0.07, "square", 0.18);
  },
  hover() {
    blip(880, 0.04, "sine", 0.08);
  },
  step() {
    blip(180, 0.04, "triangle", 0.08);
  },
  chest() {
    // wood creak + sparkle
    blip(200, 0.12, "square", 0.2);
    blip(500, 0.15, "triangle", 0.18, null, 0.08);
    blip(800, 0.18, "triangle", 0.16, null, 0.15);
    blip(1200, 0.2, "sine", 0.14, null, 0.22);
  },
  loot() {
    // arpeggiated shimmer
    const notes = [523, 659, 784, 1047];
    notes.forEach((n, i) => blip(n, 0.18, "triangle", 0.22, null, i * 0.06));
  },
  xp() {
    blip(700, 0.08, "triangle", 0.16);
    blip(1000, 0.1, "triangle", 0.14, null, 0.05);
  },
  levelUp() {
    // triumphant rise
    const notes = [392, 523, 659, 784, 1047];
    notes.forEach((n, i) => {
      blip(n, 0.2, "square", 0.22, null, i * 0.09);
      blip(n * 2, 0.2, "triangle", 0.1, null, i * 0.09);
    });
  },
  dialog() {
    blip(420, 0.05, "square", 0.12);
    blip(520, 0.05, "square", 0.12, null, 0.04);
  },
  dialogAdvance() {
    blip(600, 0.05, "square", 0.1);
  },
  quest() {
    // three-note fanfare
    blip(523, 0.14, "square", 0.22);
    blip(659, 0.14, "square", 0.22, null, 0.1);
    blip(784, 0.22, "square", 0.24, null, 0.2);
  },
  deny() {
    blip(220, 0.18, "square", 0.22, null, 0, 90);
  },
  portal() {
    blip(300, 0.45, "sawtooth", 0.18, null, 0, 1200);
    blip(600, 0.45, "triangle", 0.14, null, 0, 150);
  },
  bossIntro() {
    blip(110, 0.5, "sawtooth", 0.28);
    blip(82, 0.6, "sawtooth", 0.26, null, 0.1);
    noise(0.4, 0.2, 0.3);
  },
  bossWin() {
    const notes = [523, 659, 784, 1047, 1319];
    notes.forEach((n, i) => {
      blip(n, 0.22, "square", 0.24, null, i * 0.1);
      blip(n / 2, 0.22, "triangle", 0.14, null, i * 0.1);
    });
  },
  bossHit() {
    noise(0.12, 0.22);
    blip(140, 0.1, "sawtooth", 0.22, null, 0, 70);
  },
  place() {
    blip(420, 0.06, "square", 0.16);
  },
  error() {
    blip(180, 0.1, "square", 0.2);
    blip(140, 0.12, "square", 0.2, null, 0.05);
  },
};

// ═══════ BACKGROUND MUSIC ═══════
// Simple looped chiptune sequences per "track".
type Track = {
  bpm: number;
  // melody notes (Hz), 0 = rest
  melody: number[];
  // bass notes
  bass: number[];
  // melody oscillator type
  melType?: OscType;
  bassType?: OscType;
};

// Note helper
const N = (name: string) => {
  // e.g. "C4", "A#3"
  const map: Record<string, number> = {
    C: 0, "C#": 1, Db: 1, D: 2, "D#": 3, Eb: 3, E: 4,
    F: 5, "F#": 6, Gb: 6, G: 7, "G#": 8, Ab: 8, A: 9, "A#": 10, Bb: 10, B: 11,
  };
  const m = name.match(/^([A-G][b#]?)(-?\d+)$/);
  if (!m) return 0;
  const semis = map[m[1]] + (parseInt(m[2], 10) + 1) * 12;
  return 440 * Math.pow(2, (semis - 69) / 12);
};

const TRACKS: Record<string, Track> = {
  title: {
    bpm: 110,
    melType: "triangle",
    bassType: "square",
    melody: [
      N("E4"), N("G4"), N("B4"), N("E5"),
      N("D5"), N("B4"), N("G4"), N("B4"),
      N("C5"), N("E5"), N("G5"), N("E5"),
      N("D5"), N("B4"), N("G4"), 0,
    ],
    bass: [
      N("E2"), 0, N("E3"), 0,
      N("G2"), 0, N("G3"), 0,
      N("C3"), 0, N("C3"), 0,
      N("G2"), 0, N("B2"), 0,
    ],
  },
  hub: {
    bpm: 120,
    melType: "triangle",
    bassType: "square",
    melody: [
      N("C5"), N("E5"), N("G5"), N("E5"),
      N("F5"), N("A5"), N("G5"), N("E5"),
      N("D5"), N("F5"), N("A5"), N("F5"),
      N("E5"), N("G5"), N("C5"), 0,
    ],
    bass: [
      N("C3"), 0, N("G2"), 0,
      N("F2"), 0, N("C3"), 0,
      N("D3"), 0, N("A2"), 0,
      N("C3"), 0, N("G2"), 0,
    ],
  },
  dungeon: {
    bpm: 100,
    melType: "square",
    bassType: "sawtooth",
    melody: [
      N("A3"), N("C4"), N("E4"), N("A4"),
      N("G4"), N("E4"), N("C4"), N("E4"),
      N("F4"), N("A4"), N("C5"), N("A4"),
      N("G4"), N("E4"), N("A3"), 0,
    ],
    bass: [
      N("A2"), 0, N("A2"), 0,
      N("E2"), 0, N("E2"), 0,
      N("F2"), 0, N("F2"), 0,
      N("G2"), 0, N("G2"), 0,
    ],
  },
  boss: {
    bpm: 140,
    melType: "square",
    bassType: "sawtooth",
    melody: [
      N("D4"), N("F4"), N("A4"), N("D5"),
      N("C5"), N("A4"), N("F4"), N("A4"),
      N("Bb4"), N("D5"), N("F5"), N("D5"),
      N("C5"), N("A4"), N("F4"), N("D4"),
    ],
    bass: [
      N("D2"), N("D2"), N("D3"), N("D2"),
      N("F2"), N("F2"), N("F3"), N("F2"),
      N("Bb2"), N("Bb2"), N("Bb3"), N("Bb2"),
      N("A2"), N("A2"), N("A3"), N("A2"),
    ],
  },
};

function playMusicNote(
  freq: number,
  when: number,
  dur: number,
  type: OscType,
  vol: number,
) {
  if (!freq) return;
  const c = ctx!;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, when);
  g.gain.setValueAtTime(0, when);
  g.gain.linearRampToValueAtTime(vol, when + 0.01);
  g.gain.linearRampToValueAtTime(vol * 0.6, when + dur * 0.6);
  g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
  osc.connect(g);
  g.connect(musicGain!);
  osc.start(when);
  osc.stop(when + dur + 0.02);
}

function scheduleLoop(trackName: string) {
  const c = ensureCtx();
  if (!c) return;
  const track = TRACKS[trackName];
  if (!track) return;
  const stepDur = 60 / track.bpm / 2; // 8th notes
  const steps = track.melody.length;
  const loopDur = steps * stepDur;

  let nextTime = c.currentTime + 0.05;
  const tick = () => {
    if (currentTrack !== trackName) return;
    const c2 = ensureCtx();
    if (!c2) return;
    // Schedule up to ~0.5s ahead
    while (nextTime < c2.currentTime + 0.5) {
      for (let i = 0; i < steps; i++) {
        const t = nextTime + i * stepDur;
        playMusicNote(
          track.melody[i],
          t,
          stepDur * 0.9,
          track.melType || "triangle",
          0.18,
        );
        playMusicNote(
          track.bass[i],
          t,
          stepDur * 0.9,
          track.bassType || "square",
          0.12,
        );
      }
      nextTime += loopDur;
    }
    musicTimer = window.setTimeout(tick, 150);
  };
  tick();
}

export function playMusic(trackName: string) {
  const c = ensureCtx();
  if (!c) return;
  if (currentTrack === trackName) return;
  stopMusic();
  currentTrack = trackName;
  scheduleLoop(trackName);
}

export function stopMusic() {
  currentTrack = null;
  if (musicTimer != null) {
    clearTimeout(musicTimer);
    musicTimer = null;
  }
}

export function setMuted(muted: boolean) {
  state.muted = muted;
  if (masterGain) masterGain.gain.value = muted ? 0 : 1;
}

export function setSfxVolume(v: number) {
  state.sfxVolume = Math.max(0, Math.min(1, v));
  if (sfxGain) sfxGain.gain.value = state.sfxVolume;
}

export function setMusicVolume(v: number) {
  state.musicVolume = Math.max(0, Math.min(1, v));
  if (musicGain) musicGain.gain.value = state.musicVolume;
}

export function getAudioState() {
  return { ...state };
}

// Call on first user interaction to unlock audio (autoplay policies).
export function unlockAudio() {
  ensureCtx();
}
