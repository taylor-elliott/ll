import { useEffect, useState } from "react";

export const ss = {
  background: "#0d1117",
  borderRadius: 12,
  padding: 18,
  color: "#e6edf3",
  fontFamily: "'Courier New',monospace",
  fontSize: 12,
};

export function ProcessKillSim({ onDone }) {
  const [procs, setProcs] = useState([
    { pid: 1001, n: "init", cpu: 2, bad: false },
    { pid: 1038, n: "sshd", cpu: 5, bad: false },
    { pid: 1042, n: "nginx", cpu: 8, bad: false },
    { pid: 1099, n: "rogue_loop", cpu: 97, bad: true },
    { pid: 1105, n: "cron", cpu: 1, bad: false },
    { pid: 1120, n: "bash", cpu: 3, bad: false },
  ]);
  const [res, setRes] = useState(null);
  const [tmr, setTmr] = useState(14);
  useEffect(() => {
    if (res) return;
    const iv = setInterval(() => {
      setTmr((t) => {
        if (t <= 1) {
          setRes("time");
          return 0;
        }
        return t - 1;
      });
      setProcs((ps) =>
        ps.map((p) =>
          p.bad
            ? { ...p, cpu: 95 + Math.floor(Math.random() * 5) }
            : {
                ...p,
                cpu: Math.max(
                  1,
                  Math.min(25, p.cpu + Math.floor(Math.random() * 9 - 4)),
                ),
              },
        ),
      );
    }, 1000);
    return () => clearInterval(iv);
  }, [res]);
  const kill = (p) => {
    if (res) return;
    setRes(p.bad ? "win" : "fail");
    setTimeout(() => onDone(p.bad), 1500);
  };
  return (
    <div style={ss}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <span style={{ color: "#f85149", fontWeight: 700 }}>
          ⚠ Find & kill the rogue!
        </span>
        <span
          style={{ color: tmr < 5 ? "#f85149" : "#8b949e", fontWeight: 700 }}
        >
          ⏱{tmr}s
        </span>
      </div>
      <div
        style={{
          height: 4,
          background: "#21262d",
          borderRadius: 2,
          margin: "8px 0",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${(tmr / 14) * 100}%`,
            height: "100%",
            background: tmr < 5 ? "#f85149" : "#f0883e",
            transition: "width 1s linear",
            borderRadius: 2,
          }}
        />
      </div>
      {res ? (
        <div style={{ textAlign: "center", padding: 20 }}>
          <div style={{ fontSize: 36 }}>{res === "win" ? "⚔️" : "💥"}</div>
          <div
            style={{
              color: res === "win" ? "#3fb950" : "#f85149",
              fontWeight: 700,
            }}
          >
            {res === "win" ? "Rogue destroyed!" : "Wrong target / timeout!"}
          </div>
        </div>
      ) : (
        <div>
          {procs.map((p) => (
            <div
              key={p.pid}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 0",
                borderBottom: "1px solid #161b22",
              }}
            >
              <span style={{ width: 40, color: "#6e7681", fontSize: 11 }}>
                {p.pid}
              </span>
              <span
                style={{
                  flex: 1,
                  color: p.cpu > 90 ? "#f85149" : "#e6edf3",
                  fontWeight: p.cpu > 90 ? 700 : 400,
                }}
              >
                {p.n}
              </span>
              <div style={{ width: 50 }}>
                <div
                  style={{ height: 5, background: "#21262d", borderRadius: 3 }}
                >
                  <div
                    style={{
                      width: `${p.cpu}%`,
                      height: "100%",
                      borderRadius: 3,
                      background: p.cpu > 80 ? "#f85149" : "#3fb950",
                      transition: "width .5s",
                    }}
                  />
                </div>
              </div>
              <button
                onClick={() => kill(p)}
                style={{
                  background: "#da3633",
                  border: "none",
                  color: "#fff",
                  borderRadius: 4,
                  padding: "3px 8px",
                  cursor: "pointer",
                  fontSize: 10,
                  fontWeight: 700,
                }}
              >
                KILL
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SchedulerSim({ onDone }) {
  const ps = [
    { n: "P1", b: 4, c: "#e74c3c" },
    { n: "P2", b: 2, c: "#3498db" },
    { n: "P3", b: 3, c: "#2ecc71" },
    { n: "P4", b: 1, c: "#f39c12" },
  ];
  const [q, setQ] = useState(2);
  const [tl, setTl] = useState([]);
  const [step, setStep] = useState(0);
  const [run, setRun] = useState(false);
  const [dn, setDn] = useState(false);
  const go = () => {
    const t = [];
    const rem = ps.map((p) => ({ ...p, r: p.b }));
    while (rem.some((p) => p.r > 0))
      for (const p of rem) {
        if (p.r <= 0) continue;
        const ru = Math.min(q, p.r);
        for (let i = 0; i < ru; i++) t.push({ n: p.n, c: p.c });
        p.r -= ru;
      }
    setTl(t);
    setRun(true);
    setStep(0);
  };
  useEffect(() => {
    if (!run || step >= tl.length) {
      if (run && step >= tl.length && !dn) {
        setDn(true);
        setTimeout(() => onDone(true), 1500);
      }
      return;
    }
    const iv = setTimeout(() => setStep((s) => s + 1), 300);
    return () => clearTimeout(iv);
  }, [run, step, tl.length, dn]);
  return (
    <div style={ss}>
      <div style={{ color: "#58a6ff", fontWeight: 700, marginBottom: 10 }}>
        ⏱ Round Robin Scheduler
      </div>
      <div
        style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}
      >
        {ps.map((p) => (
          <span
            key={p.n}
            style={{
              background: "#161b22",
              borderRadius: 6,
              padding: "4px 8px",
              border: `2px solid ${p.c}40`,
              fontSize: 11,
            }}
          >
            <span style={{ color: p.c, fontWeight: 700 }}>{p.n}</span> burst:
            {p.b}
          </span>
        ))}
      </div>
      {!run && (
        <div
          style={{
            display: "flex",
            gap: 6,
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <span style={{ fontSize: 11, color: "#8b949e" }}>Quantum:</span>
          {[1, 2, 3].map((v) => (
            <button
              key={v}
              onClick={() => setQ(v)}
              style={{
                background: q === v ? "#1f6feb" : "#21262d",
                border: "none",
                color: "#fff",
                borderRadius: 4,
                padding: "4px 10px",
                cursor: "pointer",
              }}
            >
              {v}
            </button>
          ))}
          <button
            onClick={go}
            style={{
              background: "#238636",
              border: "none",
              color: "#fff",
              borderRadius: 6,
              padding: "5px 16px",
              cursor: "pointer",
              fontWeight: 700,
              marginLeft: "auto",
            }}
          >
            ▶ Run
          </button>
        </div>
      )}
      {tl.length > 0 && (
        <div style={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          {tl.map((s, i) => (
            <div
              key={i}
              style={{
                width: 28,
                height: 28,
                borderRadius: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: i < step ? s.c : "#21262d",
                color: i < step ? "#fff" : "#484f58",
                fontSize: 10,
                fontWeight: 700,
                transition: "all .2s",
                transform: i === step - 1 ? "scale(1.15)" : "",
              }}
            >
              {s.n}
            </div>
          ))}
        </div>
      )}
      {dn && (
        <div
          style={{
            textAlign: "center",
            marginTop: 12,
            color: "#3fb950",
            fontWeight: 700,
          }}
        >
          ✅ Done! Total: {tl.length} units
        </div>
      )}
    </div>
  );
}

function PageFaultSim({ onDone }) {
  const [fr, setFr] = useState([null, null, null, null]);
  const reqs = [2, 3, 1, 4, 2, 5, 1, 3];
  const [st, setSt] = useState(0);
  const [faults, setFaults] = useState(0);
  const [hits, setHits] = useState(0);
  const [dn, setDn] = useState(false);
  const [ani, setAni] = useState(false);
  const cur = st < reqs.length ? reqs[st] : null;
  const isHit = cur !== null && fr.includes(cur);
  useEffect(() => {
    if (dn || ani || cur === null || !isHit) return;
    const t = setTimeout(() => {
      setHits((h) => h + 1);
      if (st + 1 >= reqs.length) {
        setDn(true);
        setTimeout(() => onDone(true), 1200);
      } else setSt((s) => s + 1);
    }, 500);
    return () => clearTimeout(t);
  }, [st, dn, ani, cur, isHit]);
  const load = (i) => {
    if (ani || dn || isHit) return;
    setAni(true);
    const nf = [...fr];
    nf[i] = cur;
    setFr(nf);
    setFaults((f) => f + 1);
    setTimeout(() => {
      setAni(false);
      if (st + 1 >= reqs.length) {
        setDn(true);
        setTimeout(() => onDone(true), 1200);
      } else setSt((s) => s + 1);
    }, 500);
  };
  return (
    <div style={ss}>
      <div style={{ color: "#58a6ff", fontWeight: 700, marginBottom: 10 }}>
        🧠 Page Fault Handler
      </div>
      <div
        style={{
          display: "flex",
          gap: 4,
          marginBottom: 12,
          justifyContent: "center",
        }}
      >
        {reqs.map((r, i) => (
          <div
            key={i}
            style={{
              width: 32,
              height: 32,
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: i === st ? 800 : 400,
              background: i < st ? "#21262d" : i === st ? "#1f6feb" : "#161b22",
              color: i === st ? "#fff" : "#6e7681",
              border: i === st ? "2px solid #58a6ff" : "2px solid transparent",
              transform: i === st ? "scale(1.15)" : "",
              transition: "all .2s",
            }}
          >
            P{r}
          </div>
        ))}
      </div>
      {!dn && !isHit && cur !== null && (
        <div
          style={{
            color: "#f0883e",
            fontSize: 11,
            marginBottom: 8,
            textAlign: "center",
          }}
        >
          ⚡ FAULT! P{cur} not in memory. Click a frame:
        </div>
      )}
      {!dn && isHit && (
        <div
          style={{
            color: "#3fb950",
            fontSize: 11,
            marginBottom: 8,
            textAlign: "center",
          }}
        >
          ✓ HIT!
        </div>
      )}
      <div
        style={{
          display: "flex",
          gap: 8,
          justifyContent: "center",
          marginBottom: 12,
        }}
      >
        {fr.map((f, i) => (
          <button
            key={i}
            onClick={() => load(i)}
            disabled={ani || dn || isHit}
            style={{
              width: 58,
              height: 58,
              borderRadius: 8,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              background: f !== null ? "#161b22" : "#0d1117",
              border: `2px solid ${f !== null ? "#30363d" : "#21262d"}`,
              color: "#e6edf3",
              cursor: ani || dn || isHit ? "default" : "pointer",
              fontSize: 16,
              fontWeight: 700,
              fontFamily: "monospace",
            }}
          >
            <span style={{ fontSize: 8, color: "#6e7681" }}>F{i}</span>
            {f !== null ? `P${f}` : "—"}
          </button>
        ))}
      </div>
      <div
        style={{
          display: "flex",
          gap: 12,
          justifyContent: "center",
          fontSize: 11,
        }}
      >
        <span style={{ color: "#f85149" }}>Faults:{faults}</span>
        <span style={{ color: "#3fb950" }}>Hits:{hits}</span>
      </div>
      {dn && (
        <div
          style={{
            textAlign: "center",
            marginTop: 8,
            color: "#3fb950",
            fontWeight: 700,
          }}
        >
          ✅ Rate: {((faults / reqs.length) * 100).toFixed(0)}%
        </div>
      )}
    </div>
  );
}

function MutexSim({ onDone }) {
  const [val, setVal] = useState(0);
  const [lk, setLk] = useState(false);
  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState([]);
  const [rnd, setRnd] = useState(0);
  const [bad, setBad] = useState(0);
  const safe = (th) => {
    if (busy) return;
    if (lk) {
      setLog((l) => [...l, { m: `T${th} BLOCKED`, c: "#f0883e" }]);
      return;
    }
    setBusy(true);
    setLk(true);
    setLog((l) => [...l, { m: `T${th} locked ✓`, c: "#3fb950" }]);
    setTimeout(() => {
      setVal((v) => {
        setLog((l) => [...l, { m: `T${th} wrote → ${v + 1}`, c: "#58a6ff" }]);
        return v + 1;
      });
      setTimeout(() => {
        setLk(false);
        setBusy(false);
        setLog((l) => [...l, { m: `T${th} released`, c: "#6e7681" }]);
        setRnd((r) => {
          if (r + 1 >= 4) setTimeout(() => onDone(true), 1200);
          return r + 1;
        });
      }, 500);
    }, 600);
  };
  const unsafe = (th) => {
    if (busy) return;
    setBusy(true);
    setLog((l) => [...l, { m: `⚠ T${th} NO LOCK!`, c: "#f85149" }]);
    setTimeout(() => {
      setBad((b) => b + 1);
      setLog((l) => [...l, { m: `💥 RACE CONDITION!`, c: "#f85149" }]);
      setBusy(false);
      setRnd((r) => {
        if (r + 1 >= 4) setTimeout(() => onDone(false), 1200);
        return r + 1;
      });
    }, 400);
  };
  const done = rnd >= 4;
  return (
    <div style={ss}>
      <div style={{ color: "#a371f7", fontWeight: 700, marginBottom: 10 }}>
        🔒 Mutex Sim ({Math.min(rnd + 1, 4)}/4)
      </div>
      <div
        style={{
          display: "flex",
          gap: 20,
          justifyContent: "center",
          marginBottom: 12,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 9, color: "#6e7681" }}>Shared</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#58a6ff" }}>
            {val}
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 9, color: "#6e7681" }}>Mutex</div>
          <div style={{ fontSize: 22 }}>{lk ? "🔒" : "🔓"}</div>
        </div>
      </div>
      {!done && (
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          {[1, 2].map((th) => (
            <div
              key={th}
              style={{
                flex: 1,
                background: "#161b22",
                borderRadius: 6,
                padding: 8,
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 4 }}>
                Thread {th}
              </div>
              <button
                onClick={() => safe(th)}
                disabled={busy}
                style={{
                  width: "100%",
                  background: "#238636",
                  border: "none",
                  color: "#fff",
                  borderRadius: 4,
                  padding: "5px",
                  cursor: "pointer",
                  fontSize: 10,
                  opacity: busy ? 0.4 : 1,
                  marginBottom: 3,
                }}
              >
                🔒 Lock
              </button>
              <button
                onClick={() => unsafe(th)}
                disabled={busy}
                style={{
                  width: "100%",
                  background: "#da3633",
                  border: "none",
                  color: "#fff",
                  borderRadius: 4,
                  padding: "5px",
                  cursor: "pointer",
                  fontSize: 10,
                  opacity: busy ? 0.4 : 1,
                }}
              >
                ⚠ No lock
              </button>
            </div>
          ))}
        </div>
      )}
      <div
        style={{
          background: "#161b22",
          borderRadius: 6,
          padding: 6,
          maxHeight: 60,
          overflowY: "auto",
        }}
      >
        {log.length === 0 ? (
          <div style={{ color: "#484f58", fontSize: 10 }}>Choose...</div>
        ) : (
          log.slice(-4).map((l, i) => (
            <div key={i} style={{ color: l.c, fontSize: 10 }}>
              {l.m}
            </div>
          ))
        )}
      </div>
      {done && (
        <div
          style={{
            textAlign: "center",
            marginTop: 8,
            color: bad === 0 ? "#3fb950" : "#f85149",
            fontWeight: 700,
          }}
        >
          {bad === 0 ? "✅ Perfect sync!" : "⚠ " + bad + " race(s)"}
        </div>
      )}
    </div>
  );
}

function PermsSim({ onDone }) {
  const files = [
    { n: "/etc/passwd", s: "644", d: "World-readable, root-writable" },
    { n: "~/.ssh/id_rsa", s: "600", d: "Owner only!" },
    { n: "/var/www/index.html", s: "644", d: "Web page, world readable" },
  ];
  const [ci, setCi] = useState(0);
  const [p, setP] = useState(["6", "4", "4"]);
  const [rs, setRs] = useState([]);
  const pL = ["---", "--x", "-w-", "-wx", "r--", "r-x", "rw-", "rwx"];
  const sub = () => {
    const a = p.join(""),
      ok = a === files[ci].s;
    setRs((r) => [...r, { ok, a, e: files[ci].s }]);
    if (ci + 1 >= files.length) {
      setTimeout(
        () => onDone([...rs, { ok }].filter((r) => r.ok).length >= 2),
        1500,
      );
    } else {
      setCi((c) => c + 1);
      setP(["6", "4", "4"]);
    }
  };
  const f = files[ci];
  const done = rs.length >= files.length;
  return (
    <div style={ss}>
      <div style={{ color: "#f39c12", fontWeight: 700, marginBottom: 10 }}>
        🔐 Permissions ({ci + 1}/{files.length})
      </div>
      {!done ? (
        <>
          <div
            style={{
              background: "#161b22",
              borderRadius: 6,
              padding: 10,
              marginBottom: 10,
            }}
          >
            <div style={{ fontWeight: 700, color: "#58a6ff" }}>{f.n}</div>
            <div style={{ color: "#8b949e", fontSize: 10 }}>{f.d}</div>
          </div>
          <div
            style={{
              display: "flex",
              gap: 10,
              justifyContent: "center",
              marginBottom: 8,
            }}
          >
            {["Owner", "Group", "Other"].map((l, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 9, color: "#6e7681", marginBottom: 3 }}>
                  {l}
                </div>
                <select
                  value={p[i]}
                  onChange={(e) => {
                    const np = [...p];
                    np[i] = e.target.value;
                    setP(np);
                  }}
                  style={{
                    background: "#161b22",
                    color: "#e6edf3",
                    border: "1px solid #30363d",
                    borderRadius: 4,
                    padding: "4px 6px",
                    fontSize: 13,
                    fontFamily: "monospace",
                  }}
                >
                  {[0, 1, 2, 3, 4, 5, 6, 7].map((v) => (
                    <option key={v} value={String(v)}>
                      {v} ({pL[v]})
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          <div
            style={{
              textAlign: "center",
              fontSize: 20,
              fontWeight: 800,
              color: "#f0883e",
              marginBottom: 10,
            }}
          >
            {p.join("")}
          </div>
          <button
            onClick={sub}
            style={{
              width: "100%",
              background: "#238636",
              border: "none",
              color: "#fff",
              borderRadius: 6,
              padding: "7px",
              cursor: "pointer",
              fontWeight: 700,
              fontSize: 11,
            }}
          >
            Set →
          </button>
        </>
      ) : (
        <div style={{ textAlign: "center" }}>
          {rs.map((r, i) => (
            <div
              key={i}
              style={{ color: r.ok ? "#3fb950" : "#f85149", fontSize: 11 }}
            >
              {files[i].n}: {r.ok ? "✓" : "✗ " + r.a + "→" + r.e}
            </div>
          ))}
          <div
            style={{
              marginTop: 6,
              fontWeight: 700,
              color: rs.filter((r) => r.ok).length >= 2 ? "#3fb950" : "#f85149",
            }}
          >
            {rs.filter((r) => r.ok).length >= 2 ? "✅ Secured!" : "Study rwx!"}
          </div>
        </div>
      )}
    </div>
  );
}

export const SIMS = {
  process_kill: ProcessKillSim,
  scheduler: SchedulerSim,
  page_fault: PageFaultSim,
  mutex_sim: MutexSim,
  permissions: PermsSim,
};
