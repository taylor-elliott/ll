import { CW, CH, TS, soNames, EMOJI, TCOL } from "./constants";
import { MAPS } from "./maps";

export default function drawWorld(ctx, g) {
  const {
    px: plx,
    py: ply,
    region,
    camX,
    camY,
    time,
    nearObj,
    entities,
    buildMode,
    sandboxTiles,
  } = g;
  let map = MAPS[region];
  if (!map) return;
  // Apply sandbox overlay
  if (region === "sandbox" && sandboxTiles) {
    map = map.map((row, r) =>
      row.map((t, c) => sandboxTiles[`${r},${c}`] || t),
    );
  }
  const mh = map.length,
    mw = map[0].length;
  ctx.clearRect(0, 0, CW, CH);
  const sc = Math.floor(camX / TS) - 1,
    sr = Math.floor(camY / TS) - 1,
    ec = sc + Math.ceil(CW / TS) + 3,
    er = sr + Math.ceil(CH / TS) + 3;
  for (let r = Math.max(0, sr); r < Math.min(mh, er); r++) {
    for (let c = Math.max(0, sc); c < Math.min(mw, ec); c++) {
      const t = map[r][c],
        dx = c * TS - camX,
        dy = r * TS - camY;
      ctx.fillStyle = TCOL[t] || "#111";
      ctx.fillRect(dx, dy, TS, TS);
      if ((t === "." || t === "d") && (r * 7 + c * 13) % 7 < 2) {
        ctx.fillStyle = "rgba(255,255,255,0.03)";
        ctx.fillRect(dx, dy, TS, TS);
      }
      if (t === "W") {
        ctx.fillStyle = `rgba(60,160,255,${0.12 + Math.sin(time * 2.5 + c * 0.6) * 0.08})`;
        ctx.fillRect(dx, dy, TS, TS);
      }
      if (t === "L" || t === "b_lava") {
        ctx.fillStyle = `rgba(255,100,0,${0.25 + Math.sin(time * 3.5 + r + c) * 0.15})`;
        ctx.fillRect(dx, dy, TS, TS);
      }
      if (t === "b_water") {
        ctx.fillStyle = `rgba(60,160,255,${0.12 + Math.sin(time * 2.5 + c * 0.6) * 0.08})`;
        ctx.fillRect(dx, dy, TS, TS);
      }
      if (t === "b_circuit" && (r + c) % 3 === 0) {
        ctx.fillStyle = `rgba(0,140,255,${0.1 + Math.sin(time * 2.5 + r * 2 + c) * 0.06})`;
        ctx.fillRect(dx + TS / 2 - 2, dy + TS / 2 - 2, 4, 4);
      }
      if (t === "T") {
        ctx.fillStyle = "#3d2817";
        ctx.fillRect(dx + 12, dy + 18, 8, 14);
        ctx.fillStyle = "#1a5c0f";
        ctx.beginPath();
        ctx.arc(dx + 16, dy + 14, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#22720f";
        ctx.beginPath();
        ctx.arc(dx + 14, dy + 12, 6, 0, Math.PI * 2);
        ctx.fill();
      }
      if (t === "F") {
        ctx.fillStyle = ["#e88", "#ee8", "#e8e"][(r * 3 + c * 5) % 3];
        ctx.beginPath();
        ctx.arc(dx + 16, dy + 16, 4, 0, Math.PI * 2);
        ctx.fill();
      }
      if (t === "R") {
        ctx.fillStyle = "#6a6a7a";
        ctx.beginPath();
        ctx.ellipse(dx + 16, dy + 18, 13, 10, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      if (t === "#" || t === "b_stone") {
        ctx.strokeStyle = "rgba(0,0,0,0.12)";
        ctx.lineWidth = 1;
        for (let ly = 0; ly < TS; ly += 8) {
          ctx.beginPath();
          ctx.moveTo(dx, dy + ly);
          ctx.lineTo(dx + TS, dy + ly);
          ctx.stroke();
        }
      }
      if (t === "b_wood") {
        ctx.strokeStyle = "rgba(0,0,0,0.1)";
        ctx.lineWidth = 1;
        for (let lx = 0; lx < TS; lx += 6) {
          ctx.beginPath();
          ctx.moveTo(dx + lx, dy);
          ctx.lineTo(dx + lx, dy + TS);
          ctx.stroke();
        }
      }
      if (t === "b_glass") {
        ctx.fillStyle = "rgba(255,255,255,0.08)";
        ctx.fillRect(dx + 2, dy + 2, TS - 4, TS / 2 - 2);
      }
      if (t === "b_metal") {
        ctx.fillStyle = "rgba(255,255,255,0.04)";
        ctx.fillRect(dx, dy, TS, 1);
      }
      if (t === "o_wall") {
        ctx.strokeStyle = "rgba(0,0,0,0.15)";
        ctx.lineWidth = 1;
        for (let ly = 0; ly < TS; ly += 8) {
          ctx.beginPath();
          ctx.moveTo(dx, dy + ly);
          ctx.lineTo(dx + TS, dy + ly);
          ctx.stroke();
        }
      }
      if (t === "o_tree") {
        ctx.fillStyle = "#3d2817";
        ctx.fillRect(dx + 12, dy + 18, 8, 14);
        ctx.fillStyle = "#1a5c0f";
        ctx.beginPath();
        ctx.arc(dx + 16, dy + 14, 11, 0, Math.PI * 2);
        ctx.fill();
      }
      if (EMOJI[t]) {
        ctx.font = "20px serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(EMOJI[t], dx + TS / 2, dy + TS / 2);
      }
      ctx.strokeStyle = "rgba(255,255,255,0.015)";
      ctx.strokeRect(dx, dy, TS, TS);
    }
  }
  // Build mode grid overlay
  if (buildMode && region === "sandbox") {
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 1;
    for (let r = Math.max(0, sr); r < Math.min(mh, er); r++)
      for (let c = Math.max(0, sc); c < Math.min(mw, ec); c++) {
        ctx.strokeRect(c * TS - camX, r * TS - camY, TS, TS);
      }
    // Cursor highlight
    if (g.mouseIn && g.mouseX !== undefined) {
      const mc = Math.floor((g.mouseX + camX) / TS),
        mr = Math.floor((g.mouseY + camY) / TS);
      if (mc >= 0 && mc < mw && mr >= 0 && mr < mh) {
        ctx.fillStyle = "rgba(88,166,255,0.2)";
        ctx.fillRect(mc * TS - camX, mr * TS - camY, TS, TS);
        ctx.strokeStyle = "rgba(88,166,255,0.5)";
        ctx.lineWidth = 2;
        ctx.strokeRect(mc * TS - camX, mr * TS - camY, TS, TS);
      }
    }
  }
  // Entities
  (entities || []).forEach((e) => {
    const ex = (e.rx ?? e.x) * TS + TS / 2 - camX,
      ey = (e.ry ?? e.y) * TS + TS / 2 - camY;
    if (ex < -TS * 2 || ex > CW + TS * 2 || ey < -TS * 2 || ey > CH + TS * 2)
      return;
    if (e.t === "portal") {
      const pulse = 0.4 + Math.sin(time * 4) * 0.2;
      ctx.fillStyle = `rgba(120,60,255,${pulse})`;
      ctx.beginPath();
      ctx.arc(ex, ey, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(180,140,255,${pulse * 0.7})`;
      ctx.beginPath();
      ctx.arc(ex, ey, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(255,255,255,${pulse * 0.5})`;
      ctx.beginPath();
      ctx.arc(ex, ey, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = `rgba(140,80,255,${0.3 + Math.sin(time * 3) * 0.15})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(ex, ey, 14, time * 2, time * 2 + 4);
      ctx.stroke();
    }
    if (e.t === "chest" && !e.opened) {
      ctx.font = "20px serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("📦", ex, ey);
    }
    if (e.t === "sign") {
      ctx.font = "18px serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("📜", ex, ey);
    }
    if (e.t === "npc") {
      const bob = Math.sin(time * 2.5 + e.x) * 2.5;
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.beginPath();
      ctx.ellipse(ex, ey + 14, 10, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = "22px serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(e.em, ex, ey - 2 + bob);
      ctx.font = "bold 8px monospace";
      ctx.fillStyle = e.col || "#fff";
      ctx.fillText(e.name, ex, ey - 18);
      if (e.quest && !e.questDone) {
        ctx.font = "bold 14px sans-serif";
        ctx.fillStyle = "#f0883e";
        ctx.fillText("❗", ex, ey - 28 + Math.sin(time * 4) * 3);
      }
    }
  });
  // Player
  const ppx = plx - camX,
    ppy = ply - camY;
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.beginPath();
  ctx.ellipse(ppx + TS / 2, ppy + TS - 2, 11, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  const glow = ctx.createRadialGradient(
    ppx + TS / 2,
    ppy + TS / 2,
    2,
    ppx + TS / 2,
    ppy + TS / 2,
    24,
  );
  glow.addColorStop(0, "rgba(88,166,255,0.15)");
  glow.addColorStop(1, "rgba(88,166,255,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(ppx - 8, ppy - 8, TS + 16, TS + 16);
  ctx.font = "24px serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("🧑‍💻", ppx + TS / 2, ppy + TS / 2 - 2);
  // Interact prompt
  if (nearObj && !buildMode) {
    const label =
      nearObj.t === "npc"
        ? `Talk: ${nearObj.name}`
        : nearObj.t === "portal"
          ? `Enter: ${nearObj.label}`
          : nearObj.t === "chest"
            ? "Open chest"
            : nearObj.t === "sandbox_obj"
              ? soNames[nearObj.tile] || "Interact"
              : "Read sign";
    const keyLabel = (g.interactKey || "E").toUpperCase();
    ctx.font = "bold 10px monospace";
    const tw = ctx.measureText(label).width;
    const kw = ctx.measureText(keyLabel).width;
    const pad = Math.max(20, kw + 10);
    const bx = CW / 2 - tw / 2 - pad - 6,
      by = CH - 36;
    ctx.fillStyle = "rgba(0,0,0,0.75)";
    ctx.beginPath();
    ctx.roundRect(bx, by, tw + pad + 18, 24, 6);
    ctx.fill();
    ctx.fillStyle = "#1f6feb";
    ctx.beginPath();
    ctx.roundRect(bx + 6, by + 4, pad, 16, 3);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "bold 10px monospace";
    ctx.textAlign = "center";
    ctx.fillText(keyLabel, bx + 6 + pad / 2, by + 14);
    ctx.fillStyle = "#e6edf3";
    ctx.textAlign = "left";
    ctx.fillText(label, bx + pad + 12, by + 14);
  }
  // Particles
  (g.particles || []).forEach((p) => {
    ctx.globalAlpha = p.a;
    ctx.fillStyle = p.col;
    ctx.shadowColor = p.col;
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(p.x - camX, p.y - camY, p.s, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  });
}
