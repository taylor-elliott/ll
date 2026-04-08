import { useState, useEffect, useRef, useCallback } from "react";
import { MAPS } from "./lib/maps";
import { ENT } from "./lib/entities";
import { SIMS } from "./lib/sims";
import {
  CW,
  CH,
  TS,
  BUILD_TILES,
  HB,
  SOLID_SET,
  BUILD_CATEGORIES,
  MSG,
  DEFAULT_SETTINGS,
  DEFAULT_GFX,
  DEFAULT_XP_MAX,
  REGION_NAMES,
  INTERACTABLE,
} from "./lib/constants";
import drawWorld from "./lib/world";
import SettingsPanel from "./components/features/settings/Settings";
import WorldMap from "./pages/worldmap/WorldMap";
import { rollLoot, RC } from "./lib/loot";
import { PromptPanel } from "./components/features/prompt";

export default function OSQuest() {
  const canvasRef = useRef(null);
  const gsRef = useRef({
    px: 10 * TS,
    py: 5 * TS,
    region: "hub",
    camX: 0,
    camY: 0,
    time: 0,
    keys: new Set(),
    nearObj: null,
    entities: [],
    particles: [],
    portalCooldown: 0,
    buildMode: false,
    sandboxTiles: {},
    mouseX: undefined,
    mouseY: undefined,
    mouseDown: false,
    mouseRight: false,
    mouseIn: false,
  });

  const [screen, setScreen] = useState("title");
  const [nameIn, setNameIn] = useState("");
  const [pname, setPname] = useState("");
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [xpMax, setXpMax] = useState(DEFAULT_XP_MAX);
  const [inv, setInv] = useState([]);
  const [opened, setOpened] = useState(new Set());
  const [questsDone, setQuestsDone] = useState(new Set());
  const [dlg, setDlg] = useState(null);
  const [dlgI, setDlgI] = useState(0);
  const [sim, setSim] = useState(null);
  const [simQ, setSimQ] = useState(null);
  const [loot, setLoot] = useState(null);
  const [xpPop, setXpPop] = useState(null);
  const [banner, setBanner] = useState(null);
  const [hudRegion, setHudRegion] = useState("hub");
  const [showInv, setShowInv] = useState(false);
  const [focused, setFocused] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showQuests, setShowQuests] = useState(true);
  const [showReview, setShowReview] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);
  const [buildPalette, setBuildPalette] = useState(false);
  const [selTile, setSelTile] = useState("b_grass");
  const [buildCat, setBuildCat] = useState("terrain");
  const [binds, setBinds] = useState(DEFAULT_SETTINGS);
  const [gfx, setGfx] = useState(DEFAULT_GFX);

  const [showPrompt, setShowPrompt] = useState(false);
  const [promptText, setPromptText] = useState("");
  const [promptLog, setPromptLog] = useState([]);
  const showPromptRef = useRef(false);
  showPromptRef.current = showPrompt;

  const openedRef = useRef(opened);
  const questsDoneRef = useRef(questsDone);
  const selTileRef = useRef(selTile);
  const interactRef = useRef(null);
  const showSettingsRef = useRef(false);
  const showMapRef = useRef(false);

  openedRef.current = opened;
  questsDoneRef.current = questsDone;
  selTileRef.current = selTile;
  showSettingsRef.current = showSettings;
  showMapRef.current = showMap;

  function buildEnts(reg) {
    return (ENT[reg] || []).map((e) => {
      const ent = { ...e };
      if (e.t === "chest") ent.opened = openedRef.current.has(e.id);
      if (e.t === "npc" && e.quest)
        ent.questDone = questsDoneRef.current.has(e.quest.id);
      if (e.t === "npc" && e.wan) {
        ent.rx = e.x;
        ent.ry = e.y;
        ent.wt = Math.random() * 100;
      }
      return ent;
    });
  }

  // Save/Load
  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage.get("osq_v9");
        if (r?.value) {
          const d = JSON.parse(r.value);
          if (d.pname) {
            setPname(d.pname);
            setLevel(d.level || 1);
            setXp(d.xp || 0);
            setXpMax(d.xpMax || 150);
            setInv(d.inv || []);
            setOpened(new Set(d.opened || []));
            setQuestsDone(new Set(d.done || []));
            setBookmarks(d.bookmarks || []);
            if (d.binds) setBinds(d.binds);
            if (d.gfx) setGfx(d.gfx);
            const g = gsRef.current;
            g.px = d.gpx ?? 10 * TS;
            g.py = d.gpy ?? 5 * TS;
            g.region = d.region || "hub";
            if (d.sandboxTiles) g.sandboxTiles = d.sandboxTiles;
          }
        }
      } catch {}
    })();
  }, []);
  const save = useCallback(async () => {
    const g = gsRef.current;
    try {
      await window.storage.set(
        "osq_v9",
        JSON.stringify({
          pname,
          level,
          xp,
          xpMax,
          inv,
          opened: [...opened],
          done: [...questsDone],
          bookmarks,
          gpx: g.px,
          gpy: g.py,
          region: g.region,
          sandboxTiles: g.sandboxTiles,
          binds,
          gfx,
        }),
      );
    } catch {}
  }, [pname, level, xp, xpMax, inv, opened, questsDone, bookmarks, binds, gfx]);
  useEffect(() => {
    if (screen === "game") {
      const iv = setInterval(save, 6000);
      return () => clearInterval(iv);
    }
  }, [screen, save]);

  function addXP(amt) {
    setXpPop({ amt, k: Date.now() });
    setTimeout(() => setXpPop(null), 1800);
    setXp((prev) => {
      let nx = prev + amt,
        nl = level,
        nm = xpMax;
      while (nx >= nm) {
        nx -= nm;
        nl++;
        nm = Math.floor(150 * Math.pow(1.3, nl - 1));
      }
      if (nl !== level) {
        setLevel(nl);
        setXpMax(nm);
        setBanner(`🎉 LEVEL UP! Level ${nl}`);
        setTimeout(() => setBanner(null), 2800);
      }
      return nx;
    });
  }

  interactRef.current = (obj) => {
    if (obj.t === "npc") {
      setDlg(obj);
      setDlgI(0);
      setScreen("dialog");
    } else if (obj.t === "sign") {
      setDlg({ name: "Sign", em: "📜", col: "#f0883e", lines: [obj.text] });
      setDlgI(0);
      setScreen("dialog");
    } else if (obj.t === "chest" && !opened.has(obj.id)) {
      const lt = rollLoot();
      setLoot(lt);
      setOpened((p) => new Set([...p, obj.id]));
      setInv((p) => [...p, lt]);
      addXP(lt.xp);
      setScreen("loot");
    } else if (obj.t === "sandbox_obj") {
      if (obj.tile === "o_chest" || obj.tile === "o_lootbox") {
        const lt = rollLoot();
        setLoot(lt);
        setInv((p) => [...p, lt]);
        addXP(lt.xp);
        setScreen("loot");
      } else {
        const lines = MSG[obj.tile] || ["You interact with the object."];
        setDlg({
          name: BUILD_TILES.find((b) => b.id === obj.tile)?.name || "Object",
          em: BUILD_TILES.find((b) => b.id === obj.tile)?.icon || "❔",
          col: "#f0883e",
          lines,
        });
        setDlgI(0);
        setScreen("dialog");
      }
    }
  };

  function advDlg() {
    if (dlgI + 1 < dlg.lines.length) {
      setDlgI(dlgI + 1);
    } else {
      addXP(8);
      if (dlg.quest && !questsDone.has(dlg.quest.id)) {
        if (dlg.quest.sim) {
          setSimQ(dlg.quest);
          setSim(dlg.quest.sim);
          setScreen("sim");
        } else {
          setQuestsDone((p) => new Set([...p, dlg.quest.id]));
          addXP(dlg.quest.xp);
          setScreen("game");
        }
      } else {
        setScreen("game");
      }
      setDlg(null);
    }
  }
  const advDlgRef = useRef(advDlg);
  advDlgRef.current = advDlg;
  useEffect(() => {
    if (screen !== "dialog") return;
    const h = (e) => {
      const k = e.key.toLowerCase();
      if (
        k === binds.dialog ||
        k === binds.interact ||
        k === " " ||
        k === "enter"
      ) {
        e.preventDefault();
        advDlgRef.current();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [screen, binds]);

  function simDone(won) {
    if (won && simQ) {
      setQuestsDone((p) => new Set([...p, simQ.id]));
      addXP(simQ.xp);
      const lt = rollLoot();
      setInv((p) => [...p, lt]);
      setLoot(lt);
      setTimeout(() => {
        setSim(null);
        setScreen("loot");
      }, 1200);
    } else {
      setTimeout(() => {
        setSim(null);
        setSimQ(null);
        setScreen("game");
      }, 1800);
    }
  }

  function startGame() {
    if (!nameIn.trim()) return;
    setPname(nameIn.trim());
    const g = gsRef.current;
    g.region = "hub";
    g.px = 10 * TS;
    g.py = 5 * TS;
    g.entities = buildEnts("hub");
    g.portalCooldown = 0;
    g.sandboxTiles = {};
    setLevel(1);
    setXp(0);
    setXpMax(150);
    setInv([]);
    setOpened(new Set());
    setQuestsDone(new Set());
    setHudRegion("hub");
    setScreen("game");
  }

  function contGame() {
    const g = gsRef.current;
    g.entities = buildEnts(g.region);
    g.portalCooldown = 60;
    setHudRegion(g.region);
    setScreen("game");
  }

  function resetAll() {
    gsRef.current.sandboxTiles = {};
    setInv([]);
    setOpened(new Set());
    setQuestsDone(new Set());
    setBookmarks([]);
    setLevel(1);
    setXp(0);
    setXpMax(150);
    const g = gsRef.current;
    g.px = 10 * TS;
    g.py = 5 * TS;
    g.region = "hub";
    g.entities = buildEnts("hub");
    setHudRegion("hub");
    setShowSettings(false);
    setShowPrompt(false);
    setScreen("game");
    try {
      window.storage.delete("osq_v9");
    } catch {}
  }

  // ═══════ GAME LOOP ═══════
  useEffect(() => {
    if (screen !== "game") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = CW;
    canvas.height = CH;
    let af,
      lastT = 0;
    function loop(t) {
      const dt = Math.min(0.05, (t - (lastT || t)) / 1000);
      lastT = t;
      const g = gsRef.current;
      g.time += dt;
      g.interactKey = binds.interact;
      const map = MAPS[g.region];
      if (!map) {
        af = requestAnimationFrame(loop);
        return;
      }
      const mh = map.length,
        mw = map[0].length;
      if (g.portalCooldown > 0) g.portalCooldown--;
      const spd = (gfx.speed || 150) * dt;
      // Movement
      let dx = 0,
        dy = 0;
      if (g.keys.has(binds.up) || g.keys.has("arrowup")) dy = -1;
      if (g.keys.has(binds.down) || g.keys.has("arrowdown")) dy = 1;
      if (g.keys.has(binds.left) || g.keys.has("arrowleft")) dx = -1;
      if (g.keys.has(binds.right) || g.keys.has("arrowright")) dx = 1;
      if (dx && dy) {
        dx *= 0.707;
        dy *= 0.707;
      }
      let nx = g.px + dx * spd,
        ny = g.py + dy * spd;
      // Collision
      let effMap = map;
      if (g.region === "sandbox" && g.sandboxTiles) {
        effMap = map.map((row, r) =>
          row.map((t, c) => g.sandboxTiles[`${r},${c}`] || t),
        );
      }
      const check = (px2, py2) => {
        const cx = px2 + TS / 2,
          cy = py2 + TS / 2;
        for (const [ox, oy] of [
          [cx - HB, cy - HB],
          [cx + HB, cy - HB],
          [cx - HB, cy + HB],
          [cx + HB, cy + HB],
        ]) {
          const tc = Math.floor(ox / TS),
            tr = Math.floor(oy / TS);
          if (tc < 0 || tc >= mw || tr < 0 || tr >= mh) return false;
          if (SOLID_SET.has(effMap[tr]?.[tc])) return false;
        }
        return true;
      };
      if (check(nx, g.py)) g.px = nx;
      if (check(g.px, ny)) g.py = ny;
      g.px = Math.max(0, Math.min((mw - 1) * TS, g.px));
      g.py = Math.max(0, Math.min((mh - 1) * TS, g.py));
      const tcx = g.px + TS / 2 - CW / 2,
        tcy = g.py + TS / 2 - CH / 2;
      g.camX += (tcx - g.camX) * 6 * dt;
      g.camY += (tcy - g.camY) * 6 * dt;
      g.camX = Math.max(0, Math.min(mw * TS - CW, g.camX));
      g.camY = Math.max(0, Math.min(mh * TS - CH, g.camY));
      // NPC wander
      g.entities.forEach((e) => {
        if (e.t !== "npc" || !e.wan) return;
        e.wt = (e.wt || 0) - dt;
        if (e.wt <= 0) {
          e.wt = 1.5 + Math.random() * 2;
          const dirs = [
            [0, 0],
            [0, 0],
            [1, 0],
            [-1, 0],
            [0, 1],
            [0, -1],
          ];
          const [ddx, ddy] = dirs[Math.floor(Math.random() * dirs.length)];
          const nnx = (e.rx || e.x) + ddx,
            nny = (e.ry || e.y) + ddy;
          if (
            Math.abs(nnx - e.x) + Math.abs(nny - e.y) <= (e.wr || 3) &&
            nnx > 0 &&
            nnx < mw - 1 &&
            nny > 0 &&
            nny < mh - 1 &&
            !SOLID_SET.has(map[nny]?.[nnx])
          ) {
            e.rx = nnx;
            e.ry = nny;
          }
        }
      });
      g.entities.forEach((e) => {
        if (e.t === "chest") e.opened = openedRef.current.has(e.id);
        if (e.t === "npc" && e.quest)
          e.questDone = questsDoneRef.current.has(e.quest.id);
      });
      // Nearest interactable
      const ptx = g.px + TS / 2,
        pty = g.py + TS / 2;
      let near = null,
        nearD = 999;
      g.entities.forEach((e) => {
        if (e.t === "chest" && e.opened) return;
        if (e.t === "portal") return;
        const ex = (e.rx ?? e.x) * TS + TS / 2,
          ey = (e.ry ?? e.y) * TS + TS / 2;
        const d = Math.sqrt((ptx - ex) ** 2 + (pty - ey) ** 2);
        if (d < TS * 1.8 && d < nearD) {
          nearD = d;
          near = e;
        }
      });
      // Also check sandbox tiles for interactable objects
      if (!near && g.region === "sandbox" && g.sandboxTiles && !g.buildMode) {
        const pc = Math.floor(ptx / TS),
          pr = Math.floor(pty / TS);
        for (let dr = -1; dr <= 1; dr++)
          for (let dc = -1; dc <= 1; dc++) {
            const tr = pr + dr,
              tc = pc + dc;
            const tile = g.sandboxTiles[`${tr},${tc}`];
            if (tile && INTERACTABLE.has(tile)) {
              const ex = tc * TS + TS / 2,
                ey = tr * TS + TS / 2;
              const d = Math.sqrt((ptx - ex) ** 2 + (pty - ey) ** 2);
              if (d < TS * 1.6 && d < nearD) {
                nearD = d;
                near = { t: "sandbox_obj", tile, x: tc, y: tr };
              }
            }
          }
      }
      g.nearObj = near;
      // Portal auto-enter
      if (g.portalCooldown <= 0) {
        for (const e of g.entities) {
          if (e.t !== "portal") continue;
          const ex = e.x * TS + TS / 2,
            ey = e.y * TS + TS / 2;
          if (Math.abs(ptx - ex) < TS * 0.7 && Math.abs(pty - ey) < TS * 0.7) {
            g.region = e.to;
            g.px = e.tx * TS;
            g.py = e.ty * TS;
            g.entities = buildEnts(e.to);
            g.portalCooldown = 60;
            g.camX = g.px + TS / 2 - CW / 2;
            g.camY = g.py + TS / 2 - CH / 2;
            g.buildMode = false;
            setBuildPalette(false);
            setHudRegion(e.to);
            setShowQuests(true);
            setBanner(e.label);
            setTimeout(() => setBanner(null), 2500);
            break;
          }
        }
      }
      // Build mode: place tiles on mouse hold
      if (
        g.buildMode &&
        g.region === "sandbox" &&
        g.mouseDown &&
        g.mouseIn &&
        g.mouseX !== undefined
      ) {
        const mc = Math.floor((g.mouseX + g.camX) / TS),
          mr = Math.floor((g.mouseY + g.camY) / TS);
        if (mc >= 0 && mc < mw && mr >= 0 && mr < mh) {
          if (g.mouseRight || selTileRef.current === "b_erase") {
            const st = { ...g.sandboxTiles };
            delete st[`${mr},${mc}`];
            g.sandboxTiles = st;
          } else {
            g.sandboxTiles = {
              ...g.sandboxTiles,
              [`${mr},${mc}`]: selTileRef.current,
            };
          }
        }
      }
      // Particles
      if (gfx.particles && Math.random() < 0.1) {
        const px2 = g.camX + Math.random() * CW,
          py2 = g.camY + Math.random() * CH;
        const col =
          g.region === "memory_caverns"
            ? "#58a6ff"
            : g.region === "process_plains"
              ? "#3fb950"
              : g.region === "archive_city"
                ? "#f39c12"
                : g.region === "sandbox"
                  ? "#f0883e"
                  : "#9dff44";
        g.particles.push({
          x: px2,
          y: py2,
          vx: (Math.random() - 0.5) * 0.3,
          vy: -0.2 - Math.random() * 0.3,
          s: 1.5 + Math.random() * 1.5,
          a: 0,
          ma: 0.35 + Math.random() * 0.25,
          life: 120 + Math.random() * 120,
          col,
        });
      }
      g.particles.forEach((p) => {
        p.x += p.vx + Math.sin(g.time * 2 + p.x * 0.01) * 0.15;
        p.y += p.vy;
        p.life--;
        p.a =
          p.life > 100
            ? Math.min(p.ma, (120 - p.life + Math.abs(p.life - 120)) * 0.02)
            : p.life * 0.004;
      });
      g.particles = g.particles.filter((p) => p.life > 0);
      drawWorld(ctx, g);
      af = requestAnimationFrame(loop);
    }
    af = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(af);
  }, [screen, binds, gfx]);

  useEffect(() => {
    if (screen !== "game") return;
    const kd = (e) => {
      const k = e.key.toLowerCase();
      // Toggle overlays regardless
      if (k === binds.map || k === "tab") {
        e.preventDefault();
        setShowMap((v) => {
          if (!v) gsRef.current.keys.clear();
          return !v;
        });
        return;
      }
      if (k === binds.settings || k === "escape") {
        e.preventDefault();
        setShowSettings((v) => {
          if (!v) gsRef.current.keys.clear();
          return !v;
        });
        setShowMap(false);
        return;
      }
      if (k === binds.settings || k === "enter") {
        e.preventDefault();
        setShowPrompt((v) => {
          if (!v) gsRef.current.keys.clear();
          return !v;
        });
        setShowMap(false);
        return;
      }

      if (
        showSettingsRef.current ||
        showMapRef.current ||
        showPromptRef.current
      ) {
        return;
      }
      if (k === "enter") {
        e.preventDefault();
        setShowPrompt(true);
        gsRef.current.keys.clear();
        return;
      }

      gsRef.current.keys.add(k);
      if (k === binds.interact || k === " ") {
        e.preventDefault();
        const n = gsRef.current.nearObj;
        if (n && interactRef.current) interactRef.current(n);
      }
      if (k === binds.inventory) {
        e.preventDefault();
        setShowInv((v) => !v);
      }
      if (k === binds.build) {
        e.preventDefault();
        if (gsRef.current.region === "sandbox") {
          gsRef.current.buildMode = !gsRef.current.buildMode;
          setBuildPalette((v) => !v);
        } else {
          setBanner("🔨 Build mode only in Workshop!");
          setTimeout(() => setBanner(null), 2000);
        }
      }
    };
    const ku = (e) => {
      gsRef.current.keys.delete(e.key.toLowerCase());
    };
    const canvas = canvasRef.current;
    const mm = (e) => {
      if (!canvas) return;
      const r = canvas.getBoundingClientRect();
      gsRef.current.mouseX = (e.clientX - r.left) * (CW / r.width);
      gsRef.current.mouseY = (e.clientY - r.top) * (CH / r.height);
      gsRef.current.mouseIn = true;
    };
    const md = (e) => {
      gsRef.current.mouseDown = true;
      gsRef.current.mouseRight = e.button === 2;
    };
    const mu = () => {
      gsRef.current.mouseDown = false;
      gsRef.current.mouseRight = false;
    };
    const cm = (e) => e.preventDefault();
    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);
    const ml = () => {
      gsRef.current.mouseIn = false;
      gsRef.current.mouseDown = false;
    };
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
  }, [screen, binds]);

  const xpPct = (xp / xpMax) * 100;
  const CSS = `@import url('https://fonts.googleapis.com/css2?family=Silkscreen&display=swap');@keyframes xpFloat{0%{opacity:1;transform:translateX(-50%) translateY(0)}100%{opacity:0;transform:translateX(-50%) translateY(-50px)}}@keyframes bannerAnim{0%{opacity:0;transform:translate(-50%,12px)}12%{opacity:1;transform:translate(-50%,0)}85%{opacity:1}100%{opacity:0;transform:translate(-50%,-12px)}}@keyframes pop{0%{transform:scale(0)}60%{transform:scale(1.08)}100%{transform:scale(1)}}@keyframes fadeIn{0%{opacity:0}100%{opacity:1}}*{box-sizing:border-box}`;
  const ff = "'Silkscreen','Courier New',monospace";

  // TITLE
  if (screen === "title")
    return (
      <div
        style={{
          width: CW,
          height: CH,
          background: "linear-gradient(180deg,#06080f,#0c1020)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 10,
          border: "2px solid #1a1f30",
          position: "relative",
          overflow: "hidden",
          fontFamily: ff,
          color: "#e6edf3",
        }}
      >
        <style>{CSS}</style>
        <div
          style={{
            fontSize: 9,
            letterSpacing: 6,
            color: "#484f58",
            marginBottom: 10,
          }}
        >
          AN OPERATING SYSTEMS RPG
        </div>
        <h1
          style={{
            fontSize: 42,
            fontWeight: 900,
            margin: 0,
            color: "#58a6ff",
            textShadow: "0 0 40px rgba(88,166,255,0.25)",
            letterSpacing: 4,
          }}
        >
          OS QUEST
        </h1>
        <div style={{ fontSize: 11, color: "#30363d", margin: "8px 0 36px" }}>
          Explore · Learn · Build · Level Up
        </div>
        <input
          value={nameIn}
          onChange={(e) => setNameIn(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && startGame()}
          placeholder="Enter your name..."
          autoFocus
          style={{
            background: "#161b22",
            border: "1px solid #30363d",
            borderRadius: 8,
            padding: "10px 20px",
            color: "#e6edf3",
            fontSize: 14,
            fontFamily: ff,
            textAlign: "center",
            width: 220,
            outline: "none",
            marginBottom: 12,
          }}
        />
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={startGame}
            disabled={!nameIn.trim()}
            style={{
              background: nameIn.trim() ? "#238636" : "#21262d",
              border: "none",
              color: "#fff",
              borderRadius: 8,
              padding: "10px 28px",
              fontSize: 12,
              fontWeight: 700,
              cursor: nameIn.trim() ? "pointer" : "default",
              opacity: nameIn.trim() ? 1 : 0.4,
              fontFamily: ff,
            }}
          >
            New Game
          </button>
          {pname && (
            <button
              onClick={contGame}
              style={{
                background: "#161b22",
                border: "1px solid #30363d",
                color: "#e6edf3",
                borderRadius: 8,
                padding: "10px 28px",
                fontSize: 12,
                cursor: "pointer",
                fontFamily: ff,
              }}
            >
              Continue
            </button>
          )}
        </div>
        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 36,
            fontSize: 9,
            color: "#30363d",
          }}
        >
          <span>🎮 WASD</span>
          <span>💬 E</span>
          <span>🎒 I</span>
          <span>🗺️ TAB</span>
          <span>⚙️ ESC</span>
          <span>🔨 B</span>
        </div>
      </div>
    );

  // DIALOG
  const isBookmarked = dlg && bookmarks.some((b) => b.name === dlg.name);
  const toggleBookmark = () => {
    if (!dlg) return;
    if (isBookmarked) {
      setBookmarks((b) => b.filter((x) => x.name !== dlg.name));
    } else {
      setBookmarks((b) => [
        ...b,
        {
          name: dlg.name,
          em: dlg.em,
          col: dlg.col || "#e6edf3",
          lines: [...dlg.lines],
          region: hudRegion,
        },
      ]);
    }
  };
  if (screen === "dialog" && dlg)
    return (
      <div
        style={{
          width: CW,
          height: CH,
          background: "#06080f",
          borderRadius: 10,
          border: "2px solid #1a1f30",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          fontFamily: ff,
        }}
      >
        <style>{CSS}</style>
        <div style={{ flex: 1, opacity: 0.3, background: "#0d1117" }} />
        <div style={{ padding: 16, animation: "fadeIn .3s" }}>
          <div
            style={{
              background: "#161b22",
              border: "1px solid #30363d",
              borderRadius: 12,
              padding: 18,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 12,
              }}
            >
              <span style={{ fontSize: 30 }}>{dlg.em}</span>
              <span style={{ fontWeight: 700, fontSize: 14, color: dlg.col }}>
                {dlg.name}
              </span>
              {dlg.quest && !questsDone.has(dlg.quest?.id) && (
                <span
                  style={{
                    background: "#f0883e20",
                    color: "#f0883e",
                    borderRadius: 4,
                    padding: "2px 8px",
                    fontSize: 9,
                    fontWeight: 700,
                  }}
                >
                  QUEST
                </span>
              )}
              <span
                style={{ marginLeft: "auto", fontSize: 9, color: "#484f58" }}
              >
                {dlgI + 1}/{dlg.lines.length}
              </span>
            </div>
            <div
              style={{
                color: "#e6edf3",
                fontSize: 12,
                lineHeight: 1.8,
                minHeight: 40,
              }}
            >
              {dlg.lines[dlgI]}
            </div>
            <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
              {dlg.lines.map((_, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: 3,
                    borderRadius: 2,
                    background: i <= dlgI ? "#58a6ff" : "#21262d",
                  }}
                />
              ))}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 12,
              }}
            >
              {dlg.name !== "Sign" ? (
                <button
                  onClick={toggleBookmark}
                  style={{
                    background: isBookmarked ? "#f0883e20" : "#161b22",
                    border: `1px solid ${isBookmarked ? "#f0883e" : "#30363d"}`,
                    color: isBookmarked ? "#f0883e" : "#6e7681",
                    borderRadius: 6,
                    padding: "6px 12px",
                    cursor: "pointer",
                    fontSize: 10,
                    fontFamily: ff,
                  }}
                >
                  {isBookmarked ? "⭐ Bookmarked" : "☆ Bookmark for Review"}
                </button>
              ) : (
                <div />
              )}
              <button
                onClick={advDlg}
                style={{
                  background: "#1f6feb",
                  border: "none",
                  color: "#fff",
                  borderRadius: 8,
                  padding: "8px 24px",
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: ff,
                }}
              >
                {dlgI + 1 < dlg.lines.length
                  ? `Next [${binds.dialog.toUpperCase()}] →`
                  : dlg.quest && !questsDone.has(dlg.quest?.id)
                    ? `⚔ Accept [${binds.dialog.toUpperCase()}]`
                    : `Done [${binds.dialog.toUpperCase()}]`}
              </button>
            </div>
          </div>
        </div>
      </div>
    );

  // LOOT
  if (screen === "loot" && loot)
    return (
      <div
        style={{
          width: CW,
          height: CH,
          background: "#06080f",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 10,
          border: "2px solid #1a1f30",
          fontFamily: ff,
        }}
      >
        <style>{CSS}</style>
        <div
          style={{
            background: "#161b22",
            borderRadius: 14,
            padding: 36,
            textAlign: "center",
            animation: "pop .4s",
            border: `2px solid ${RC[loot.rare]}50`,
            maxWidth: 300,
          }}
        >
          <div style={{ fontSize: 52, marginBottom: 8 }}>{loot.icon}</div>
          <div
            style={{
              fontSize: 9,
              color: "#484f58",
              textTransform: "uppercase",
              letterSpacing: 4,
            }}
          >
            {loot.rare}
          </div>
          <div
            style={{
              fontSize: 17,
              fontWeight: 700,
              color: RC[loot.rare],
              margin: "6px 0 2px",
            }}
          >
            {loot.name}
          </div>
          <div style={{ fontSize: 10, color: "#8b949e", marginBottom: 4 }}>
            {loot.desc}
          </div>
          <div
            style={{
              fontSize: 14,
              color: "#f0883e",
              fontWeight: 700,
              marginBottom: 20,
            }}
          >
            +{loot.xp} XP
          </div>
          <button
            onClick={() => {
              setScreen("game");
              setLoot(null);
              setSimQ(null);
            }}
            style={{
              background: "#238636",
              border: "none",
              color: "#fff",
              borderRadius: 8,
              padding: "10px 32px",
              fontSize: 12,
              cursor: "pointer",
              fontFamily: ff,
              fontWeight: 700,
            }}
          >
            Claim!
          </button>
        </div>
      </div>
    );

  // SIM
  if (screen === "sim" && sim) {
    const SC = SIMS[sim];
    return (
      <div
        style={{
          width: CW,
          height: CH,
          background: "#06080f",
          display: "flex",
          flexDirection: "column",
          borderRadius: 10,
          border: "2px solid #1a1f30",
          fontFamily: ff,
          overflow: "hidden",
        }}
      >
        <style>{CSS}</style>
        <div
          style={{
            padding: "10px 16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #21262d",
            background: "#0d1117",
          }}
        >
          <span style={{ fontSize: 13, color: "#f0883e", fontWeight: 700 }}>
            ⚔ {simQ?.name}
          </span>
          <button
            onClick={() => {
              setSim(null);
              setSimQ(null);
              setScreen("game");
            }}
            style={{
              background: "#21262d",
              border: "none",
              color: "#8b949e",
              cursor: "pointer",
              fontSize: 10,
              fontFamily: ff,
              borderRadius: 4,
              padding: "4px 10px",
            }}
          >
            ✕ Retreat
          </button>
        </div>
        <div
          style={{
            flex: 1,
            padding: 16,
            overflow: "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ width: "100%", maxWidth: 500 }}>
            {SC && <SC onDone={simDone} />}
          </div>
        </div>
      </div>
    );
  }

  // ═══════ GAME SCREEN ═══════
  const activeQuests = (ENT[gsRef.current.region] || []).filter(
    (e) => e.t === "npc" && e.quest && !questsDone.has(e.quest.id),
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
        background: "#06080f",
      }}
      onClick={() => setFocused(true)}
      tabIndex={0}
      ref={(el) => {
        if (el && !focused) {
          el.focus();
          setFocused(true);
        }
      }}
    >
      <style>{CSS}</style>
      <canvas
        ref={canvasRef}
        style={{ display: "block", width: CW, height: CH }}
      />
      {!focused && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            cursor: "pointer",
          }}
        >
          <div style={{ textAlign: "center", color: "#e6edf3" }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>🎮</div>
            <div style={{ fontSize: 14 }}>Click to Play</div>
            <div style={{ fontSize: 9, color: "#6e7681", marginTop: 6 }}>
              WASD · E · I · TAB · ESC · B
            </div>
          </div>
        </div>
      )}
      {/* HUD */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          padding: "8px 12px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "linear-gradient(180deg,rgba(6,8,15,0.85),transparent)",
          zIndex: 50,
        }}
      >
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: "50%",
            background: "linear-gradient(135deg,#1f6feb,#a371f7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 10,
            fontWeight: 800,
            color: "#fff",
            pointerEvents: "none",
          }}
        >
          {level}
        </div>
        <div style={{ pointerEvents: "none" }}>
          <div style={{ fontSize: 8, fontWeight: 700, color: "#e6edf3" }}>
            {pname}
          </div>
          <div
            style={{
              width: 60,
              height: 3,
              background: "rgba(255,255,255,0.08)",
              borderRadius: 2,
              overflow: "hidden",
              marginTop: 1,
            }}
          >
            <div
              style={{
                width: `${xpPct}%`,
                height: "100%",
                background: "linear-gradient(90deg,#1f6feb,#a371f7)",
                borderRadius: 2,
                transition: "width .5s",
              }}
            />
          </div>
          <div style={{ fontSize: 6, color: "#484f58" }}>
            {xp}/{xpMax}
          </div>
        </div>
        <div
          style={{
            marginLeft: "auto",
            fontSize: 8,
            color: "#8b949e",
            pointerEvents: "none",
          }}
        >
          {REGION_NAMES[hudRegion]}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowInv((v) => !v);
          }}
          title="Inventory (I)"
          style={{
            background: "rgba(22,27,34,0.8)",
            border: "1px solid #30363d",
            borderRadius: 5,
            padding: "3px 7px",
            cursor: "pointer",
            fontSize: 10,
            color: "#e6edf3",
          }}
        >
          🎒{inv.length}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowQuests((v) => !v);
          }}
          title="Toggle Quests"
          style={{
            background: showQuests
              ? "rgba(22,27,34,0.8)"
              : "rgba(240,136,62,0.2)",
            border: `1px solid ${showQuests ? "#30363d" : "#f0883e"}`,
            borderRadius: 5,
            padding: "3px 7px",
            cursor: "pointer",
            fontSize: 10,
            color: "#e6edf3",
          }}
        >
          📋
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowReview((v) => !v);
          }}
          title="Review Station"
          style={{
            background: showReview
              ? "rgba(240,136,62,0.2)"
              : "rgba(22,27,34,0.8)",
            border: `1px solid ${showReview ? "#f0883e" : "#30363d"}`,
            borderRadius: 5,
            padding: "3px 7px",
            cursor: "pointer",
            fontSize: 10,
            color: "#e6edf3",
          }}
        >
          ⭐{bookmarks.length > 0 ? bookmarks.length : ""}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            gsRef.current.keys.clear();
            setShowMap((v) => !v);
          }}
          title="World Map (TAB)"
          style={{
            background: "rgba(22,27,34,0.8)",
            border: "1px solid #30363d",
            borderRadius: 5,
            padding: "3px 7px",
            cursor: "pointer",
            fontSize: 10,
            color: "#e6edf3",
          }}
        >
          🗺️
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            gsRef.current.keys.clear();
            setShowSettings((v) => !v);
          }}
          title="Settings"
          style={{
            background: "rgba(22,27,34,0.8)",
            border: "1px solid #30363d",
            borderRadius: 5,
            padding: "3px 7px",
            cursor: "pointer",
            fontSize: 10,
            color: "#e6edf3",
          }}
        >
          ⚙️
        </button>
      </div>
      {/* Quest tracker */}
      {showQuests && gfx.showQuests && activeQuests.length > 0 && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            setShowQuests(false);
          }}
          style={{
            position: "absolute",
            top: 42,
            right: 8,
            background: "rgba(6,8,15,0.8)",
            borderRadius: 6,
            padding: "6px 8px",
            zIndex: 50,
            maxWidth: 160,
            border: "1px solid #21262d",
            cursor: "pointer",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 3,
            }}
          >
            <span style={{ fontSize: 7, color: "#f0883e", fontWeight: 700 }}>
              📋 QUESTS
            </span>
            <span style={{ fontSize: 7, color: "#484f58" }}>✕</span>
          </div>
          {activeQuests.slice(0, 3).map((e, i) => (
            <div key={i} style={{ fontSize: 7, color: "#8b949e" }}>
              ❗ {e.quest.name}
            </div>
          ))}
        </div>
      )}
      {/* Build palette */}
      {buildPalette && gsRef.current.region === "sandbox" && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            background: "rgba(6,8,15,0.95)",
            borderTop: "1px solid #21262d",
            padding: "4px 8px",
            zIndex: 60,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Category tabs */}
          <div
            style={{
              display: "flex",
              gap: 3,
              marginBottom: 4,
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontSize: 8,
                color: "#f0883e",
                fontWeight: 700,
                marginRight: 2,
              }}
            >
              🔨
            </span>
            {BUILD_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setBuildCat(cat.id)}
                style={{
                  background: buildCat === cat.id ? "#1f6feb" : "#161b22",
                  border: `1px solid ${buildCat === cat.id ? "#58a6ff" : "#30363d"}`,
                  borderRadius: 4,
                  padding: "2px 8px",
                  cursor: "pointer",
                  fontSize: 9,
                  color: buildCat === cat.id ? "#fff" : "#8b949e",
                  fontFamily: "inherit",
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            ))}
            <span style={{ fontSize: 7, color: "#484f58", marginLeft: "auto" }}>
              Click=place · Right=erase
            </span>
          </div>
          {/* Tiles for selected category */}
          <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
            {BUILD_TILES.filter((bt) => bt.cat === buildCat).map((bt) => (
              <button
                key={bt.id}
                onClick={() => setSelTile(bt.id)}
                style={{
                  background: selTile === bt.id ? "#1f6feb" : "#161b22",
                  border: `2px solid ${selTile === bt.id ? "#58a6ff" : "#30363d"}`,
                  borderRadius: 5,
                  padding: "3px 7px",
                  cursor: "pointer",
                  fontSize: 13,
                  color: "#e6edf3",
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                  transition: "all 0.15s",
                  boxShadow:
                    selTile === bt.id ? "0 0 8px rgba(88,166,255,0.3)" : "none",
                }}
                title={bt.name}
              >
                <span>{bt.icon}</span>
                <span
                  style={{
                    fontSize: 8,
                    color: selTile === bt.id ? "#fff" : "#8b949e",
                  }}
                >
                  {bt.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
      {xpPop && (
        <div
          key={xpPop.k}
          style={{
            position: "absolute",
            top: "32%",
            left: "50%",
            fontSize: 20,
            fontWeight: 800,
            color: "#f0883e",
            animation: "xpFloat 1.8s ease-out forwards",
            pointerEvents: "none",
            zIndex: 60,
            textShadow: "0 2px 10px rgba(0,0,0,0.9)",
          }}
        >
          +{xpPop.amt} XP
        </div>
      )}
      {banner && (
        <div
          style={{
            position: "absolute",
            top: "22%",
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: 20,
            fontWeight: 900,
            color: "#fff",
            animation: "bannerAnim 2.5s ease-in-out forwards",
            pointerEvents: "none",
            zIndex: 60,
            textShadow: "0 2px 24px rgba(0,0,0,0.9)",
            whiteSpace: "nowrap",
            letterSpacing: 3,
          }}
        >
          {banner}
        </div>
      )}
      {showInv && (
        <div
          style={{
            position: "absolute",
            top: 40,
            left: 8,
            background: "rgba(13,17,23,0.95)",
            borderRadius: 10,
            padding: 14,
            zIndex: 70,
            border: "1px solid #30363d",
            maxWidth: 260,
            maxHeight: CH - 60,
            overflowY: "auto",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 700 }}>🎒 Inventory</span>
            <button
              onClick={() => setShowInv(false)}
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
          {inv.length === 0 ? (
            <div style={{ color: "#484f58", fontSize: 10 }}>Empty!</div>
          ) : (
            inv.map((it, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "3px 0",
                  borderBottom: "1px solid #161b22",
                }}
              >
                <span style={{ fontSize: 14 }}>{it.icon}</span>
                <div>
                  <div
                    style={{ fontSize: 9, color: RC[it.rare], fontWeight: 700 }}
                  >
                    {it.name}
                  </div>
                  <div style={{ fontSize: 7, color: "#6e7681" }}>{it.desc}</div>
                </div>
              </div>
            ))
          )}
          <div style={{ marginTop: 6, fontSize: 8, color: "#484f58" }}>
            Quests: {[...questsDone].length}
          </div>
        </div>
      )}
      {/* Review Station */}
      {showReview && (
        <div
          style={{
            position: "absolute",
            top: 40,
            left: showInv ? 280 : 8,
            background: "rgba(13,17,23,0.95)",
            borderRadius: 10,
            padding: 14,
            zIndex: 70,
            border: "1px solid #f0883e40",
            maxWidth: 300,
            maxHeight: CH - 60,
            overflowY: "auto",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 700, color: "#f0883e" }}>
              ⭐ Review Station
            </span>
            <button
              onClick={() => setShowReview(false)}
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
          {bookmarks.length === 0 ? (
            <div
              style={{
                color: "#484f58",
                fontSize: 10,
                textAlign: "center",
                padding: 16,
              }}
            >
              <div style={{ fontSize: 20, marginBottom: 6 }}>☆</div>
              No bookmarks yet! Talk to NPCs and click
              <br />
              "☆ Bookmark for Review" to save concepts here.
            </div>
          ) : (
            bookmarks.map((bm, i) => (
              <div
                key={i}
                style={{
                  background: "#161b22",
                  borderRadius: 8,
                  padding: 10,
                  marginBottom: 8,
                  border: "1px solid #21262d",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 6,
                  }}
                >
                  <span style={{ fontSize: 18 }}>{bm.em}</span>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{ fontSize: 10, fontWeight: 700, color: bm.col }}
                    >
                      {bm.name}
                    </div>
                    <div style={{ fontSize: 7, color: "#484f58" }}>
                      {REGION_NAMES[bm.region] || bm.region}
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setBookmarks((b) => b.filter((_, j) => j !== i))
                    }
                    style={{
                      background: "none",
                      border: "none",
                      color: "#484f58",
                      cursor: "pointer",
                      fontSize: 9,
                    }}
                    title="Remove"
                  >
                    🗑️
                  </button>
                </div>
                {bm.lines.map((line, li) => (
                  <div
                    key={li}
                    style={{
                      fontSize: 9,
                      color: "#8b949e",
                      lineHeight: 1.5,
                      padding: "2px 0",
                      borderTop: li > 0 ? "1px solid #161b22" : "none",
                    }}
                  >
                    {line}
                  </div>
                ))}
              </div>
            ))
          )}
          {bookmarks.length > 0 && (
            <div
              style={{
                fontSize: 8,
                color: "#484f58",
                textAlign: "center",
                marginTop: 4,
              }}
            >
              Review these concepts to master OS fundamentals!
            </div>
          )}
        </div>
      )}
      <Tooltip buildPalette={buildPalette} />

      {showSettings && (
        <SettingsPanel
          binds={binds}
          setBinds={setBinds}
          gfx={gfx}
          setGfx={setGfx}
          pname={pname}
          onClose={() => setShowSettings(false)}
          onReset={resetAll}
        />
      )}

      {showPrompt && (
        <PromptPanel
          onClose={() => setShowPrompt(false)}
          gsRef={gsRef}
          buildEnts={buildEnts}
          addXP={addXP}
          bookmarks={bookmarks}
          setBookmarks={setBookmarks}
          questsDone={questsDone}
          hudRegion={hudRegion}
          setHudRegion={setHudRegion}
          setShowQuests={setShowQuests}
          level={level}
          xp={xp}
          xpMax={xpMax}
          bottomOffset={buildPalette ? 60 : 8}
        />
      )}

      {showMap && (
        <WorldMap
          currentRegion={hudRegion}
          questsDone={questsDone}
          onClose={() => setShowMap(false)}
        />
      )}
    </div>
  );
}

const Tooltip = ({ buildPalette }: any) => (
  <div
    style={{
      position: "absolute",
      bottom: buildPalette ? 56 : 3,
      right: 6,
      fontSize: 7,
      color: "#1a1f3060",
      zIndex: 40,
      pointerEvents: "none",
    }}
  >
    WASD·E·I·TAB·ESC·B
  </div>
);
