import { useState } from "react";
import { CW, CH } from "../../lib/constants";
import { regions, connections } from "./constants";
import type { WorldMapProps } from "./types";

export default function WorldMap({
  currentRegion,
  questsDone,
  onClose,
}: WorldMapProps) {
  const [sel, setSel] = useState(null);
  const selR = sel ? regions.find((r) => r.id === sel) : null;
  return (
    <div className="absolute inset-0 z-20">
      <div
        style={{
          width: CW,
          height: CH,
          background: "#06080fee",
          borderRadius: 10,
          border: "2px solid #1a1f30",
          fontFamily: "'Silkscreen','Courier New',monospace",
          color: "#e6edf3",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "10px 16px",
            borderBottom: "1px solid #21262d",
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 700 }}>🗺️ World Map</span>
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
            ✕ Close
          </button>
        </div>
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {/* Map area */}
          <div style={{ flex: 1, position: "relative" }}>
            <svg
              viewBox="0 0 100 100"
              style={{ width: "100%", height: "100%" }}
              onClick={() => setSel(null)}
            >
              {connections.map(([a, b], i) => {
                const ra = regions.find((r) => r.id === a),
                  rb = regions.find((r) => r.id === b);
                return (
                  <line
                    key={i}
                    x1={ra.x}
                    y1={ra.y}
                    x2={rb.x}
                    y2={rb.y}
                    stroke={sel === a || sel === b ? "#30363d" : "#21262d"}
                    strokeWidth={sel === a || sel === b ? 1.2 : 0.8}
                    strokeDasharray="2,2"
                  />
                );
              })}
              {regions.map((r) => {
                const qTotal = (r.quests || []).length;
                const qDone = (r.quests || []).filter((q) =>
                  questsDone.has(q),
                ).length;
                const isCurrent = currentRegion === r.id;
                const isSel = sel === r.id;
                const pct = qTotal > 0 ? (qDone / qTotal) * 100 : 100;
                return (
                  <g
                    key={r.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSel(r.id);
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    {/* Pulse for current */}
                    {isCurrent && (
                      <circle
                        cx={r.x}
                        cy={r.y}
                        r={8}
                        fill="none"
                        stroke="#58a6ff"
                        strokeWidth=".4"
                        opacity={0.4}
                      >
                        <animate
                          attributeName="r"
                          values="7;10;7"
                          dur="2s"
                          repeatCount="indefinite"
                        />
                      </circle>
                    )}
                    {/* Selection ring */}
                    {isSel && (
                      <circle
                        cx={r.x}
                        cy={r.y}
                        r={9}
                        fill="none"
                        stroke={r.col}
                        strokeWidth=".6"
                        opacity={0.7}
                      />
                    )}
                    {/* Background circle */}
                    <circle
                      cx={r.x}
                      cy={r.y}
                      r={6}
                      fill={isSel ? "#1a1f30" : "#161b22"}
                      stroke={
                        isCurrent
                          ? "#58a6ff"
                          : pct >= 100 && qTotal > 0
                            ? "#3fb950"
                            : r.col
                      }
                      strokeWidth={isSel ? 1.2 : 0.6}
                    />
                    {/* Progress arc */}
                    {qTotal > 0 && (
                      <circle
                        cx={r.x}
                        cy={r.y}
                        r={6}
                        fill="none"
                        stroke={pct >= 100 ? "#3fb950" : "#f0883e"}
                        strokeWidth=".8"
                        strokeDasharray={`${pct * 0.377} 37.7`}
                        strokeLinecap="round"
                        transform={`rotate(-90 ${r.x} ${r.y})`}
                      />
                    )}
                    {/* Icon */}
                    <text
                      x={r.x}
                      y={r.y + 2}
                      textAnchor="middle"
                      fontSize="5.5"
                      fill="#fff"
                    >
                      {r.icon}
                    </text>
                    {/* Label */}
                    <text
                      x={r.x}
                      y={r.y + 12}
                      textAnchor="middle"
                      fontSize="2.8"
                      fill={
                        isCurrent ? "#58a6ff" : isSel ? "#e6edf3" : "#8b949e"
                      }
                      fontWeight={isCurrent || isSel ? 700 : 400}
                    >
                      {r.name}
                    </text>
                    {qTotal > 0 && (
                      <text
                        x={r.x}
                        y={r.y + 15.5}
                        textAnchor="middle"
                        fontSize="2.2"
                        fill={pct >= 100 ? "#3fb950" : "#6e7681"}
                      >
                        {qDone}/{qTotal}
                      </text>
                    )}
                    {isCurrent && (
                      <text
                        x={r.x}
                        y={r.y - 9}
                        textAnchor="middle"
                        fontSize="2.2"
                        fill="#58a6ff"
                        fontWeight="700"
                      >
                        📍 YOU
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
          {/* Detail panel */}
          <div
            style={{
              width: 220,
              borderLeft: "1px solid #21262d",
              padding: 14,
              overflowY: "auto",
              flexShrink: 0,
              background: "#0d1117",
            }}
          >
            {selR ? (
              <>
                <div style={{ fontSize: 24, marginBottom: 6 }}>{selR.icon}</div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: selR.col,
                    marginBottom: 4,
                  }}
                >
                  {selR.name}
                </div>
                {currentRegion === selR.id && (
                  <div
                    style={{
                      background: "#58a6ff20",
                      color: "#58a6ff",
                      borderRadius: 4,
                      padding: "2px 8px",
                      fontSize: 8,
                      fontWeight: 700,
                      display: "inline-block",
                      marginBottom: 8,
                    }}
                  >
                    📍 Current Location
                  </div>
                )}
                <div
                  style={{
                    fontSize: 10,
                    color: "#8b949e",
                    lineHeight: 1.6,
                    marginBottom: 12,
                  }}
                >
                  {selR.desc}
                </div>
                {(selR.quests || []).length > 0 && (
                  <>
                    <div
                      style={{
                        fontSize: 9,
                        color: "#6e7681",
                        fontWeight: 700,
                        marginBottom: 6,
                        textTransform: "uppercase",
                        letterSpacing: 1,
                      }}
                    >
                      Quests
                    </div>
                    {selR.quests.map((qid) => {
                      const done = questsDone.has(qid);
                      const names = {
                        q_sched: "Scheduling Trial",
                        q_kill: "Rogue Process Hunt",
                        q_page: "Page Fault Crisis",
                        q_perm: "Permission Lockdown",
                        q_mutex: "Race Condition",
                      };
                      return (
                        <div
                          key={qid}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "4px 0",
                            borderBottom: "1px solid #161b22",
                          }}
                        >
                          <span style={{ fontSize: 12 }}>
                            {done ? "✅" : "⚔️"}
                          </span>
                          <span
                            style={{
                              fontSize: 10,
                              color: done ? "#3fb950" : "#e6edf3",
                            }}
                          >
                            {names[qid] || qid}
                          </span>
                        </div>
                      );
                    })}
                  </>
                )}
                {(selR.npcs || []).length > 0 && (
                  <>
                    <div
                      style={{
                        fontSize: 9,
                        color: "#6e7681",
                        fontWeight: 700,
                        marginTop: 12,
                        marginBottom: 6,
                        textTransform: "uppercase",
                        letterSpacing: 1,
                      }}
                    >
                      NPCs
                    </div>
                    {selR.npcs.map((n) => (
                      <div
                        key={n}
                        style={{
                          fontSize: 10,
                          color: "#8b949e",
                          padding: "2px 0",
                        }}
                      >
                        💬 {n}
                      </div>
                    ))}
                  </>
                )}
              </>
            ) : (
              <div
                style={{
                  color: "#484f58",
                  fontSize: 10,
                  marginTop: 40,
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 24, marginBottom: 8 }}>👆</div>
                Click a region on the map to see details, quests, and NPCs.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
