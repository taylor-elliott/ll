import { useState, useEffect } from "react";
import { CW, CH } from "../../../lib/constants";
import type { SettingsPanelProps } from "./types";
import { tabs } from "./constants";

export default function SettingsPanel({
  binds,
  setBinds,
  gfx,
  setGfx,
  pname,
  onClose,
  onReset,
}: SettingsPanelProps) {
  const [tab, setTab] = useState("keys");
  const [editing, setEditing] = useState(null);
  useEffect(() => {
    if (!editing) return;
    const h = (e) => {
      e.preventDefault();
      setBinds((b) => ({ ...b, [editing]: e.key.toLowerCase() }));
      setEditing(null);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [editing]);
  return (
    <div className="absolute inset-0 z-20">
      <div
        style={{
          width: CW,
          height: CH,
          background: "#06080fee",
          display: "flex",
          flexDirection: "column",
          borderRadius: 10,
          border: "2px solid #1a1f30",
          fontFamily: "'Silkscreen','Courier New',monospace",
          color: "#e6edf3",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px 16px",
            borderBottom: "1px solid #21262d",
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 700 }}>⚙️ Settings</span>
          <button
            onClick={onClose}
            style={{
              background: "#21262d",
              border: "none",
              color: "#8b949e",
              borderRadius: 4,
              padding: "4px 12px",
              cursor: "pointer",
              fontSize: 11,
              fontFamily: "inherit",
            }}
          >
            ESC Close
          </button>
        </div>
        <div style={{ display: "flex", gap: 4, padding: "8px 16px" }}>
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                background: tab === t.id ? "#1f6feb" : "#161b22",
                border: "1px solid " + (tab === t.id ? "#1f6feb" : "#30363d"),
                color: tab === t.id ? "#fff" : "#8b949e",
                borderRadius: 6,
                padding: "6px 14px",
                cursor: "pointer",
                fontSize: 10,
                fontFamily: "inherit",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div style={{ flex: 1, padding: 16, overflowY: "auto" }}>
          {tab === "keys" && (
            <div>
              <div style={{ fontSize: 11, color: "#8b949e", marginBottom: 12 }}>
                Click a binding then press a new key
              </div>
              {[
                ["up", "Move Up"],
                ["down", "Move Down"],
                ["left", "Move Left"],
                ["right", "Move Right"],
                ["interact", "Interact"],
                ["dialog", "Next Dialog"],
                ["inventory", "Inventory"],
                ["build", "Build Mode"],
                ["map", "World Map"],
                ["settings", "Settings"],
              ].map(([k, l]) => (
                <div
                  key={k}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 0",
                    borderBottom: "1px solid #161b22",
                  }}
                >
                  <span style={{ fontSize: 11 }}>{l}</span>
                  <button
                    onClick={() => setEditing(k)}
                    style={{
                      background: editing === k ? "#f0883e" : "#21262d",
                      border:
                        "1px solid " + (editing === k ? "#f0883e" : "#30363d"),
                      color: "#e6edf3",
                      borderRadius: 4,
                      padding: "4px 16px",
                      cursor: "pointer",
                      fontSize: 12,
                      fontFamily: "monospace",
                      minWidth: 70,
                      textAlign: "center",
                    }}
                  >
                    {editing === k ? "Press key..." : binds[k]?.toUpperCase()}
                  </button>
                </div>
              ))}
            </div>
          )}
          {tab === "gfx" && (
            <div>
              {[
                ["particles", "Particles"],
                ["shadows", "Shadows"],
                ["screenShake", "Screen Shake"],
                ["showQuests", "Quest Tracker"],
              ].map(([k, l]) => (
                <div
                  key={k}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 0",
                    borderBottom: "1px solid #161b22",
                  }}
                >
                  <span style={{ fontSize: 11 }}>{l}</span>
                  <button
                    onClick={() => setGfx((g) => ({ ...g, [k]: !g[k] }))}
                    style={{
                      background: gfx[k] ? "#238636" : "#da3633",
                      border: "none",
                      color: "#fff",
                      borderRadius: 4,
                      padding: "4px 14px",
                      cursor: "pointer",
                      fontSize: 10,
                      fontWeight: 700,
                    }}
                  >
                    {gfx[k] ? "ON" : "OFF"}
                  </button>
                </div>
              ))}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 0",
                  borderBottom: "1px solid #161b22",
                }}
              >
                <span style={{ fontSize: 11 }}>Move Speed</span>
                <input
                  type="range"
                  min="80"
                  max="250"
                  value={gfx.speed || 150}
                  onChange={(e) =>
                    setGfx((g) => ({ ...g, speed: +e.target.value }))
                  }
                  style={{ width: 120 }}
                />
                <span
                  style={{
                    fontSize: 10,
                    color: "#8b949e",
                    width: 30,
                    textAlign: "right",
                  }}
                >
                  {gfx.speed || 150}
                </span>
              </div>
            </div>
          )}
          {tab === "audio" && (
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 0",
                  borderBottom: "1px solid #161b22",
                }}
              >
                <span style={{ fontSize: 11 }}>Mute All</span>
                <button
                  onClick={() =>
                    setGfx((g) => ({ ...g, audioMuted: !g.audioMuted }))
                  }
                  style={{
                    background: gfx.audioMuted ? "#da3633" : "#238636",
                    border: "none",
                    color: "#fff",
                    borderRadius: 4,
                    padding: "4px 14px",
                    cursor: "pointer",
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                >
                  {gfx.audioMuted ? "MUTED" : "ON"}
                </button>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 0",
                  borderBottom: "1px solid #161b22",
                }}
              >
                <span style={{ fontSize: 11 }}>Sound Effects</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={Math.round((gfx.sfxVolume ?? 0.5) * 100)}
                  onChange={(e) =>
                    setGfx((g) => ({ ...g, sfxVolume: +e.target.value / 100 }))
                  }
                  style={{ width: 120 }}
                />
                <span
                  style={{
                    fontSize: 10,
                    color: "#8b949e",
                    width: 30,
                    textAlign: "right",
                  }}
                >
                  {Math.round((gfx.sfxVolume ?? 0.5) * 100)}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 0",
                  borderBottom: "1px solid #161b22",
                }}
              >
                <span style={{ fontSize: 11 }}>Music</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={Math.round((gfx.musicVolume ?? 0.25) * 100)}
                  onChange={(e) =>
                    setGfx((g) => ({
                      ...g,
                      musicVolume: +e.target.value / 100,
                    }))
                  }
                  style={{ width: 120 }}
                />
                <span
                  style={{
                    fontSize: 10,
                    color: "#8b949e",
                    width: 30,
                    textAlign: "right",
                  }}
                >
                  {Math.round((gfx.musicVolume ?? 0.25) * 100)}
                </span>
              </div>
              <div style={{ fontSize: 9, color: "#484f58", marginTop: 12 }}>
                Audio is procedurally generated (chiptune style) — no downloads.
              </div>
            </div>
          )}
          {tab === "acct" && (
            <div>
              <div style={{ fontSize: 11, marginBottom: 8 }}>
                Player:{" "}
                <span style={{ color: "#58a6ff", fontWeight: 700 }}>
                  {pname}
                </span>
              </div>
              <div style={{ fontSize: 10, color: "#8b949e", marginBottom: 20 }}>
                Progress is saved automatically every 6 seconds.
              </div>
              <button
                onClick={onReset}
                style={{
                  background: "#da3633",
                  border: "none",
                  color: "#fff",
                  borderRadius: 6,
                  padding: "8px 20px",
                  cursor: "pointer",
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                🗑️ Reset All Progress
              </button>
              <div style={{ fontSize: 9, color: "#484f58", marginTop: 6 }}>
                This will erase all saves, inventory, and builds.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
