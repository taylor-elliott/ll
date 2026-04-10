import { useState, useEffect, useRef } from "react";

interface BossQuestion {
  prompt: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface BossEncounterProps {
  bossId: string;
  bossName: string;
  bossEmoji: string;
  bossColor: string;
  bossHp?: number;
  questions: BossQuestion[];
  timeLimit?: number;
  onVictory: () => void;
  onDefeat: () => void;
  onExit: () => void;
  playerName?: string;
}

const CW = 672,
  CH = 480;

export default function BossEncounter({
  bossId,
  bossName,
  bossEmoji,
  bossColor,
  bossHp: initialHp = 100,
  questions,
  timeLimit = 15,
  onVictory,
  onDefeat,
  onExit,
  playerName = "Player",
}: BossEncounterProps) {
  const [phase, setPhase] = useState<"intro" | "fight" | "victory" | "defeat">(
    "intro",
  );
  const [bossHp, setBossHp] = useState(initialHp);
  const [playerHp, setPlayerHp] = useState(100);
  const [qIdx, setQIdx] = useState(0);
  const [timer, setTimer] = useState(timeLimit);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [streak, setStreak] = useState(0);
  const [shakeScreen, setShakeScreen] = useState(false);
  const [bossShake, setBossShake] = useState(false);
  const [particles, setParticles] = useState<any[]>([]);
  const [combo, setCombo] = useState(0);
  const [resultMsg, setResultMsg] = useState<{
    correct: boolean;
    explanation: string;
  } | null>(null);
  const timerRef = useRef<any>(null);
  // Track values for stale closure in setTimeout
  const bossHpRef = useRef(bossHp);
  bossHpRef.current = bossHp;
  const playerHpRef = useRef(playerHp);
  playerHpRef.current = playerHp;

  const ff = "'Silkscreen','Courier New',monospace";
  const q = questions[qIdx % questions.length];
  const bossHpPct = (bossHp / initialHp) * 100;
  const playerHpPct = (playerHp / 100) * 100;

  useEffect(() => {
    if (phase !== "fight" || showResult) return;
    setTimer(timeLimit);
    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAnswer(-1);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase, qIdx, showResult]);

  function handleAnswer(idx: number) {
    if (showResult) return;
    clearInterval(timerRef.current);
    setSelected(idx);
    setShowResult(true);

    const correct = idx === q.correct;
    setResultMsg({ correct, explanation: q.explanation });

    if (correct) {
      const baseDmg = 20,
        comboDmg = Math.min(combo * 5, 20);
      setBossHp((prev) => {
        const next = Math.max(0, prev - baseDmg - comboDmg);
        if (next <= 0) setTimeout(() => setPhase("victory"), 1500);
        return next;
      });
      setBossShake(true);
      setTimeout(() => setBossShake(false), 300);
      setStreak((s) => s + 1);
      setCombo((c) => c + 1);
      spawnParticles(bossColor, CW * 0.7, CH * 0.25);
    } else {
      const dmg = 20 + Math.floor(Math.random() * 10);
      setPlayerHp((prev) => {
        const next = Math.max(0, prev - dmg);
        if (next <= 0) setTimeout(() => setPhase("defeat"), 1500);
        return next;
      });
      setShakeScreen(true);
      setTimeout(() => setShakeScreen(false), 300);
      setCombo(0);
      spawnParticles("#f85149", CW * 0.3, CH * 0.25);
    }

    setTimeout(() => {
      setShowResult(false);
      setSelected(null);
      setResultMsg(null);
      if (bossHpRef.current > 0 && playerHpRef.current > 0)
        setQIdx((i) => i + 1);
    }, 2500);
  }

  function spawnParticles(color: string, x: number, y: number) {
    const p = Array.from({ length: 12 }, () => ({
      id: Math.random(),
      x,
      y,
      vx: (Math.random() - 0.5) * 200,
      vy: (Math.random() - 0.5) * 200 - 50,
      life: 1,
      color,
    }));
    setParticles((prev) => [...prev, ...p]);
    setTimeout(
      () => setParticles((prev) => prev.filter((pp) => !p.includes(pp))),
      1200,
    );
  }

  const containerStyle = {
    width: CW,
    height: CH,
    fontFamily: ff,
    color: "#e6edf3",
    borderRadius: 10,
    position: "relative" as const,
    overflow: "hidden",
  };

  // ═══════ INTRO ═══════
  if (phase === "intro")
    return (
      <div
        style={{
          ...containerStyle,
          background: "#06080f",
          display: "flex",
          flexDirection: "column" as const,
          alignItems: "center",
          justifyContent: "center",
          border: `2px solid ${bossColor}40`,
        }}
      >
        <div
          style={{
            fontSize: 64,
            marginBottom: 16,
            filter: "drop-shadow(0 0 20px rgba(0,0,0,0.8))",
          }}
        >
          {bossEmoji}
        </div>
        <div
          style={{
            fontSize: 10,
            color: "#6e7681",
            letterSpacing: 4,
            marginBottom: 4,
          }}
        >
          BOSS ENCOUNTER
        </div>
        <div
          style={{
            fontSize: 24,
            fontWeight: 900,
            color: bossColor,
            marginBottom: 8,
            textShadow: `0 0 20px ${bossColor}40`,
          }}
        >
          {bossName}
        </div>
        <div
          style={{
            fontSize: 11,
            color: "#8b949e",
            marginBottom: 24,
            maxWidth: 400,
            textAlign: "center" as const,
            lineHeight: 1.6,
          }}
        >
          Answer OS questions to deal damage. Wrong answers or timeouts hurt
          you. Combos increase your damage!
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={() => setPhase("fight")}
            style={{
              background: bossColor,
              border: "none",
              color: "#fff",
              borderRadius: 8,
              padding: "10px 28px",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: ff,
            }}
          >
            ⚔ FIGHT
          </button>
          <button
            onClick={onExit}
            style={{
              background: "#21262d",
              border: "1px solid #30363d",
              color: "#8b949e",
              borderRadius: 8,
              padding: "10px 28px",
              fontSize: 12,
              cursor: "pointer",
              fontFamily: ff,
            }}
          >
            Retreat
          </button>
        </div>
      </div>
    );

  // ═══════ VICTORY ═══════
  if (phase === "victory")
    return (
      <div
        style={{
          ...containerStyle,
          background: "#06080f",
          display: "flex",
          flexDirection: "column" as const,
          alignItems: "center",
          justifyContent: "center",
          border: "2px solid #3fb950",
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 12 }}>🏆</div>
        <div
          style={{
            fontSize: 22,
            fontWeight: 900,
            color: "#3fb950",
            marginBottom: 6,
          }}
        >
          VICTORY!
        </div>
        <div style={{ fontSize: 13, color: "#8b949e", marginBottom: 4 }}>
          {bossName} has been defeated!
        </div>
        <div style={{ fontSize: 11, color: "#f0883e", marginBottom: 20 }}>
          Best streak: {streak} | Remaining HP: {playerHp}
        </div>
        <button
          onClick={onVictory}
          style={{
            background: "#238636",
            border: "none",
            color: "#fff",
            borderRadius: 8,
            padding: "10px 32px",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: ff,
          }}
        >
          Claim Victory 🎉
        </button>
      </div>
    );

  // ═══════ DEFEAT ═══════
  if (phase === "defeat")
    return (
      <div
        style={{
          ...containerStyle,
          background: "#06080f",
          display: "flex",
          flexDirection: "column" as const,
          alignItems: "center",
          justifyContent: "center",
          border: "2px solid #f85149",
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 12 }}>💀</div>
        <div
          style={{
            fontSize: 22,
            fontWeight: 900,
            color: "#f85149",
            marginBottom: 6,
          }}
        >
          DEFEATED
        </div>
        <div style={{ fontSize: 13, color: "#8b949e", marginBottom: 20 }}>
          {bossName} was too strong. Study more and try again!
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={() => {
              setBossHp(initialHp);
              setPlayerHp(100);
              setQIdx(0);
              setStreak(0);
              setCombo(0);
              setResultMsg(null);
              setPhase("fight");
            }}
            style={{
              background: "#f0883e",
              border: "none",
              color: "#fff",
              borderRadius: 8,
              padding: "10px 24px",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: ff,
            }}
          >
            Retry ⚔
          </button>
          <button
            onClick={onDefeat}
            style={{
              background: "#21262d",
              border: "1px solid #30363d",
              color: "#8b949e",
              borderRadius: 8,
              padding: "10px 24px",
              fontSize: 12,
              cursor: "pointer",
              fontFamily: ff,
            }}
          >
            Leave
          </button>
        </div>
      </div>
    );

  // ═══════ FIGHT — FIXED LAYOUT ═══════
  return (
    <div
      style={{
        ...containerStyle,
        background: "#06080f",
        border: `2px solid ${bossColor}40`,
        display: "flex",
        flexDirection: "column" as const,
        transform: shakeScreen ? "translateX(4px)" : "none",
        transition: "transform 0.05s",
      }}
    >
      {/* Particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          style={
            {
              position: "absolute",
              left: p.x,
              top: p.y,
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: p.color,
              pointerEvents: "none",
              zIndex: 100,
              animation: "particleFly 1s ease-out forwards",
              "--vx": `${p.vx}px`,
              "--vy": `${p.vy}px`,
            } as any
          }
        />
      ))}
      <style>{`@keyframes particleFly{0%{transform:translate(0,0);opacity:1}100%{transform:translate(var(--vx),var(--vy));opacity:0}}`}</style>

      {/* ── TOP: HP bars (fixed height) ── */}
      <div
        style={{
          height: 70,
          padding: "12px 20px 0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexShrink: 0,
        }}
      >
        <div style={{ width: 200 }}>
          <div style={{ fontSize: 9, color: "#8b949e", marginBottom: 4 }}>
            🧑‍💻 {playerName}
          </div>
          <div
            style={{
              height: 10,
              background: "#21262d",
              borderRadius: 5,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${playerHpPct}%`,
                height: "100%",
                background: playerHpPct > 30 ? "#3fb950" : "#f85149",
                borderRadius: 5,
                transition: "width 0.3s",
              }}
            />
          </div>
          <div style={{ fontSize: 8, color: "#6e7681", marginTop: 2 }}>
            {playerHp}/100 HP
          </div>
        </div>
        {/* Combo — fixed width so it doesn't shift layout */}
        <div style={{ width: 60, textAlign: "center" as const }}>
          {combo > 1 ? (
            <>
              <div style={{ fontSize: 16, fontWeight: 900, color: "#f0883e" }}>
                🔥 x{combo}
              </div>
              <div style={{ fontSize: 7, color: "#8b949e" }}>COMBO</div>
            </>
          ) : (
            <div style={{ height: 28 }} />
          )}
        </div>
        <div style={{ width: 200, textAlign: "right" as const }}>
          <div style={{ fontSize: 9, color: bossColor, marginBottom: 4 }}>
            {bossEmoji} {bossName}
          </div>
          <div
            style={{
              height: 10,
              background: "#21262d",
              borderRadius: 5,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${bossHpPct}%`,
                height: "100%",
                background: bossColor,
                borderRadius: 5,
                transition: "width 0.3s",
              }}
            />
          </div>
          <div style={{ fontSize: 8, color: "#6e7681", marginTop: 2 }}>
            {bossHp}/{initialHp} HP
          </div>
        </div>
      </div>

      {/* ── BOSS EMOJI (fixed height) ── */}
      <div
        style={{
          height: 70,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          transform: bossShake ? "translateX(-6px) scale(1.05)" : "none",
          transition: "transform 0.05s",
        }}
      >
        <span
          style={{
            fontSize: 56,
            filter: `drop-shadow(0 0 15px ${bossColor}40)`,
          }}
        >
          {bossEmoji}
        </span>
      </div>

      {/* ── TIMER (fixed height) ── */}
      <div style={{ height: 20, padding: "0 20px", flexShrink: 0 }}>
        <div
          style={{
            height: 4,
            background: "#21262d",
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${(timer / timeLimit) * 100}%`,
              height: "100%",
              background: timer < 5 ? "#f85149" : "#58a6ff",
              borderRadius: 2,
              transition: "width 1s linear",
            }}
          />
        </div>
        <div
          style={{
            fontSize: 8,
            color: timer < 5 ? "#f85149" : "#6e7681",
            textAlign: "right" as const,
            marginTop: 2,
          }}
        >
          {timer}s
        </div>
      </div>

      {/* ── QUESTION (fixed height) ── */}
      <div
        style={{
          height: 44,
          padding: "4px 20px",
          flexShrink: 0,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "#e6edf3",
            lineHeight: 1.5,
          }}
        >
          {q.prompt}
        </div>
      </div>

      {/* ── OPTIONS (fixed height, 4 buttons) ── */}
      <div
        style={{
          height: 176,
          padding: "0 20px",
          display: "flex",
          flexDirection: "column" as const,
          gap: 4,
          flexShrink: 0,
        }}
      >
        {q.options.map((opt, i) => {
          let bg = "#161b22",
            border = "#30363d",
            color = "#e6edf3";
          if (showResult) {
            if (i === q.correct) {
              bg = "rgba(63,185,80,0.15)";
              border = "#3fb950";
              color = "#3fb950";
            } else if (i === selected) {
              bg = "rgba(248,81,73,0.15)";
              border = "#f85149";
              color = "#f85149";
            }
          }
          return (
            <button
              key={i}
              onClick={() => !showResult && handleAnswer(i)}
              disabled={showResult}
              style={{
                height: 40,
                background: bg,
                border: `2px solid ${border}`,
                color,
                borderRadius: 8,
                padding: "0 14px",
                fontSize: 11,
                fontWeight: 600,
                cursor: showResult ? "default" : "pointer",
                fontFamily: ff,
                textAlign: "left" as const,
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                flexShrink: 0,
              }}
            >
              <span style={{ color: "#484f58", marginRight: 8, flexShrink: 0 }}>
                {String.fromCharCode(65 + i)}.
              </span>
              <span
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap" as const,
                }}
              >
                {opt}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── EXPLANATION (ALWAYS rendered, fixed height — no layout shift) ── */}
      <div
        style={{
          height: 80,
          padding: "8px 20px",
          flexShrink: 0,
          overflow: "hidden",
        }}
      >
        {resultMsg ? (
          <div
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              fontSize: 10,
              lineHeight: 1.5,
              background: resultMsg.correct
                ? "rgba(63,185,80,0.08)"
                : "rgba(248,81,73,0.08)",
              border: `1px solid ${resultMsg.correct ? "#3fb95030" : "#f8514930"}`,
              color: "#8b949e",
            }}
          >
            <span
              style={{
                fontWeight: 700,
                color: resultMsg.correct ? "#3fb950" : "#f85149",
              }}
            >
              {resultMsg.correct ? "✅ Correct! " : "❌ Wrong! "}
            </span>
            {resultMsg.explanation}
          </div>
        ) : (
          <div
            style={{
              padding: "8px 12px",
              fontSize: 10,
              color: "#30363d",
              textAlign: "center" as const,
            }}
          >
            Select an answer above...
          </div>
        )}
      </div>
    </div>
  );
}
