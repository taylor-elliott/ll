import { useState, useEffect, useRef } from "react";
import { TS, CW, CH, REGION_NAMES } from "../../../lib/constants";
import { ENT } from "../../../lib/entities";

/**
 * PromptPanel — In-game command prompt overlay.
 *
 * Props:
 *   onClose()           — called when user dismisses (ESC or button)
 *   gsRef               — ref to game state (for /tp, /coords)
 *   buildEnts(region)   — rebuild entities for a region after /tp
 *   addXP(amount)       — grant XP
 *   bookmarks           — current bookmarks array
 *   setBookmarks        — setter for bookmarks
 *   questsDone          — Set of completed quest IDs
 *   hudRegion           — current region string
 *   setHudRegion        — setter for HUD region label
 *   setShowQuests       — setter to re-show quest tracker
 *   level               — current player level
 *   xp                  — current XP
 *   xpMax               — XP needed for next level
 *   bottomOffset        — pixels from bottom (for build palette)
 */

interface PromptMessage {
  type: "cmd" | "info" | "error" | "success";
  text: string;
}

interface PromptPanelProps {
  onClose: () => void;
  gsRef: React.MutableRefObject<any>;
  buildEnts: (region: string) => any[];
  addXP: (amount: number) => void;
  bookmarks: any[];
  setBookmarks: React.Dispatch<React.SetStateAction<any[]>>;
  questsDone: Set<string>;
  hudRegion: string;
  setHudRegion: (region: string) => void;
  setShowQuests: (show: boolean) => void;
  level: number;
  xp: number;
  xpMax: number;
  bottomOffset?: number;
}

const COL_MAP: Record<string, string> = {
  cmd: "#58a6ff",
  error: "#f85149",
  success: "#3fb950",
  info: "#8b949e",
};

export default function PromptPanel({
  onClose,
  gsRef,
  buildEnts,
  addXP,
  bookmarks,
  setBookmarks,
  questsDone,
  hudRegion,
  setHudRegion,
  setShowQuests,
  level,
  xp,
  xpMax,
  bottomOffset = 8,
}: PromptPanelProps) {
  const [text, setText] = useState("");
  const [log, setLog] = useState<PromptMessage[]>([]);
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll log to bottom
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log]);

  // Auto-focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function pushLog(...msgs: PromptMessage[]) {
    setLog((prev) => [...prev, ...msgs]);
  }

  function handleCommand(cmd: string) {
    pushLog({ type: "cmd", text: cmd });
    const lower = cmd.toLowerCase().trim();

    // /help
    if (lower === "/help" || lower === "help") {
      pushLog(
        {
          type: "info",
          text: "Commands: /tp <region>, /xp <amount>, /note <text>, /clear, /coords, /bookmark, /quests, /time, /level",
        },
        { type: "info", text: "Or type anything as a personal note." },
      );
      return;
    }

    // /tp <region>
    if (lower.startsWith("/tp ")) {
      const dest = lower.slice(4).trim().replace(/\s+/g, "_");
      const valid = [
        "hub",
        "process_plains",
        "memory_caverns",
        "archive_city",
        "sandbox",
      ];
      const match = valid.find((v) => v.includes(dest));
      if (match) {
        const g = gsRef.current;
        g.region = match;
        g.px = 10 * TS;
        g.py = 5 * TS;
        g.entities = buildEnts(match);
        g.portalCooldown = 60;
        g.camX = g.px + TS / 2 - CW / 2;
        g.camY = g.py + TS / 2 - CH / 2;
        setHudRegion(match);
        setShowQuests(true);
        pushLog({
          type: "success",
          text: `Teleported to ${REGION_NAMES[match] || match}`,
        });
      } else {
        pushLog({
          type: "error",
          text: "Unknown region. Try: hub, process, memory, archive, sandbox",
        });
      }
      return;
    }

    // /xp <amount>
    if (lower.startsWith("/xp ")) {
      const amt = parseInt(lower.slice(4));
      if (!isNaN(amt) && amt > 0) {
        addXP(amt);
        pushLog({ type: "success", text: `+${amt} XP granted` });
      } else {
        pushLog({ type: "error", text: "Usage: /xp <positive number>" });
      }
      return;
    }

    // /coords
    if (lower === "/coords") {
      const g = gsRef.current;
      pushLog({
        type: "info",
        text: `Region: ${REGION_NAMES[g.region] || g.region} | Tile: (${Math.floor(g.px / TS)}, ${Math.floor(g.py / TS)})`,
      });
      return;
    }

    // /clear
    if (lower === "/clear") {
      setLog([]);
      return;
    }

    // /bookmark(s)
    if (lower === "/bookmark" || lower === "/bookmarks") {
      if (bookmarks.length === 0) {
        pushLog({
          type: "info",
          text: "No bookmarks. Talk to NPCs and bookmark them!",
        });
      } else {
        pushLog(
          ...bookmarks.map((b: any) => ({
            type: "info" as const,
            text: `⭐ ${b.name} (${REGION_NAMES[b.region] || b.region})`,
          })),
        );
      }
      return;
    }

    // /quests
    if (lower === "/quests") {
      const allQ = Object.values(ENT)
        .flat()
        .filter((e: any) => e.quest);
      const done = [...questsDone];
      pushLog(
        ...allQ.map((e: any) => ({
          type: (done.includes(e.quest.id) ? "success" : "info") as
            | "success"
            | "info",
          text: `${done.includes(e.quest.id) ? "✅" : "⚔️"} ${e.quest.name} (${e.quest.xp} XP)`,
        })),
      );
      return;
    }

    // /time
    if (lower === "/time") {
      pushLog({
        type: "info",
        text: `Game time: ${gsRef.current.time.toFixed(1)}s | Level ${level} | ${xp}/${xpMax} XP`,
      });
      return;
    }

    // /level
    if (lower === "/level") {
      pushLog({
        type: "info",
        text: `Level ${level} | ${xp}/${xpMax} XP | ${Math.floor(((xpMax - xp) / xpMax) * 100)}% to next`,
      });
      return;
    }

    // /note <text>
    if (lower.startsWith("/note ")) {
      const note = cmd.slice(6).trim();
      if (!note) {
        pushLog({ type: "error", text: "Usage: /note <your text>" });
        return;
      }
      pushLog({ type: "success", text: `📝 Note saved: ${note}` });
      setBookmarks((b) => [
        ...b,
        {
          name: "📝 Note",
          em: "📝",
          col: "#8b949e",
          lines: [note],
          region: hudRegion,
        },
      ]);
      return;
    }

    // Unknown command
    if (lower.startsWith("/")) {
      pushLog({
        type: "error",
        text: `Unknown command: ${lower.split(" ")[0]}. Type /help for commands.`,
      });
      return;
    }

    // Plain text → personal note
    pushLog({ type: "info", text: `📝 ${cmd}` });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    // Stop native event from reaching the game's window.addEventListener handler
    e.nativeEvent.stopImmediatePropagation();

    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (text.trim()) {
        handleCommand(text.trim());
        setText("");
      } else {
        onClose();
        return;
      }
    }
  }

  return (
    <div
      style={{
        position: "absolute",
        bottom: bottomOffset,
        left: 8,
        right: 8,
        zIndex: 80,
      }}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.nativeEvent.stopImmediatePropagation()}
    >
      {/* Log */}
      {log.length > 0 && (
        <div
          ref={logRef}
          style={{
            background: "rgba(13,17,23,0.9)",
            borderRadius: "8px 8px 0 0",
            border: "1px solid #30363d",
            borderBottom: "none",
            padding: "6px 10px",
            maxHeight: 120,
            overflowY: "auto",
          }}
        >
          {log.slice(-12).map((msg, i) => (
            <div
              key={i}
              style={{
                fontSize: 10,
                padding: "2px 0",
                color: COL_MAP[msg.type] || "#8b949e",
              }}
            >
              {msg.type === "cmd" && (
                <span style={{ color: "#6e7681" }}>{">"} </span>
              )}
              {msg.text}
            </div>
          ))}
        </div>
      )}

      {/* Input bar */}
      <div
        style={{
          display: "flex",
          background: "rgba(13,17,23,0.95)",
          borderRadius: log.length > 0 ? "0 0 8px 8px" : "8px",
          border: "1px solid #30363d",
          overflow: "hidden",
        }}
      >
        <span
          style={{
            padding: "8px 6px 8px 10px",
            fontSize: 11,
            color: "#6e7681",
            flexShrink: 0,
          }}
        >
          {">"}
        </span>
        <input
          ref={inputRef}
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a command or note... (/help)"
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            color: "#e6edf3",
            fontSize: 11,
            fontFamily: "'Silkscreen','Courier New',monospace",
            padding: "8px 4px",
            outline: "none",
          }}
        />
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: "#484f58",
            cursor: "pointer",
            padding: "4px 10px",
            fontSize: 10,
            fontFamily: "inherit",
          }}
        >
          ESC
        </button>
      </div>
    </div>
  );
}
