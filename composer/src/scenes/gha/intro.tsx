// gha/intro.tsx — chapters 0–2: manual hook, timeline, CI/CD loop, hierarchy, steps, lifecycle, run log.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { mix, useP, MONO, SANS, Kicker, Wire, Flow, ScanBeam } from "../../lib/primitives";
import { T, A, Win, HeadC, StatusIcon, St, Chip, CodeBlock, along, clamp01, RunRail } from "./core";

// ---------------------------------------------------------------- manual vs robot (hook)
export const ManualScene: React.FC<{ dur?: number; steps?: string[] }> = ({ dur, steps = [] }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const manualSt: St[] = ["skip", "ok", "ok", "ok", "fail"];
  const manualNote = ["forgot…", "on a laptop", "by hand", "scp + ftp", "it broke"];
  const mins = [0, 12, 21, 34, 47];
  let shown = 0;
  steps.forEach((_, i) => { if (p(0.1 + i * 0.07, 0.12 + i * 0.07) > 0.5) shown = i + 1; });
  const robotOn = p(0.64, 0.7);
  const rk = Math.floor(frame / 16) % (steps.length + 3);
  return (
    <AbsoluteFill>
      <HeadC kicker="THE PROBLEM" title="Shipping by hand vs. a robot that never forgets" color={A.evt} o={p(0, 0.04)} />
      {/* manual */}
      <div style={{ position: "absolute", left: 100, top: 205, width: 820, height: 670, borderRadius: 22, background: mix(T.panel, A.bad, 0.05), border: `2.5px solid ${mix(T.line, A.bad, 0.5)}`, opacity: p(0.02, 0.08) }}>
        <div style={{ position: "absolute", left: 30, top: 24, display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 56 }}>🧑‍💻</span>
          <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 38, color: A.bad }}>Manual</span>
        </div>
        <div style={{ position: "absolute", right: 30, top: 34, fontFamily: MONO, fontWeight: 800, fontSize: 32, color: A.evt }}>⏱ {mins[Math.max(0, shown - 1)] + Math.floor(shown > 0 ? (frame % 60) / 20 : 0)} min</div>
        {steps.map((s, i) => {
          const o = p(0.1 + i * 0.07, 0.14 + i * 0.07);
          return (
            <div key={i} style={{ position: "absolute", left: 30, top: 120 + i * 80, width: 760, height: 66, display: "flex", alignItems: "center", gap: 18, opacity: o, borderRadius: 12, padding: "0 16px", boxSizing: "border-box", background: mix(T.panel, manualSt[i] === "fail" ? A.bad : T.panel, 0.12) }}>
              <StatusIcon s={manualSt[i]} size={34} />
              <span style={{ fontFamily: SANS, fontSize: 30, color: T.text, width: 330 }}>{s}</span>
              <span style={{ fontFamily: MONO, fontSize: 23, color: manualSt[i] === "ok" ? T.muted : manualSt[i] === "fail" ? A.bad : A.evt }}>{manualNote[i]}</span>
            </div>
          );
        })}
        <div style={{ position: "absolute", left: 60, top: 520, width: 700, padding: "14px 24px", borderRadius: 18, background: mix(T.panel, A.evt, 0.14), border: `2px solid ${A.evt}`, opacity: p(0.42, 0.46), transform: `rotate(${Math.sin(frame * 0.08) * 1.2}deg)` }}>
          <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 32, color: A.evt }}>💬 “It works on my machine!” 🤷</span>
        </div>
      </div>
      <div style={{ position: "absolute", left: 100, top: 822, width: 820, textAlign: "center", opacity: p(0.55, 0.6) }}>
        <span style={{ fontFamily: MONO, fontSize: 26, color: A.bad }}>× dozens of times a day, × every developer</span>
      </div>
      {/* robot */}
      <div style={{ position: "absolute", left: 1000, top: 205, width: 820, height: 670, borderRadius: 22, background: mix(T.panel, A.ok, 0.06), border: `2.5px solid ${mix(T.line, A.ok, 0.6)}`, opacity: robotOn, boxShadow: `0 0 ${40 + Math.sin(frame * 0.07) * 14}px ${mix(T.bg0, A.ok, 0.25 * robotOn)}` }}>
        <div style={{ position: "absolute", left: 30, top: 24, display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 56, transform: `translateY(${Math.sin(frame * 0.12) * 4}px)`, display: "inline-block" }}>🤖</span>
          <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 38, color: A.ok }}>Automated</span>
        </div>
        <div style={{ position: "absolute", right: 30, top: 34, fontFamily: MONO, fontWeight: 800, fontSize: 32, color: A.ok }}>every push</div>
        {steps.map((s, i) => {
          const st: St = i < rk ? "ok" : i === rk ? "running" : "queued";
          return (
            <div key={i} style={{ position: "absolute", left: 30, top: 120 + i * 80, width: 760, height: 66, display: "flex", alignItems: "center", gap: 18, borderRadius: 12, padding: "0 16px", boxSizing: "border-box", background: st === "running" ? mix(T.panel, A.evt, 0.14) : "transparent" }}>
              <StatusIcon s={st} size={34} />
              <span style={{ fontFamily: SANS, fontSize: 30, color: T.text, width: 330 }}>{s}</span>
              <span style={{ fontFamily: MONO, fontSize: 23, color: T.muted }}>{st === "ok" ? `${3 + ((i * 7) % 11)}s` : ""}</span>
            </div>
          );
        })}
        <div style={{ position: "absolute", left: 30, top: 545, width: 760, fontFamily: MONO, fontSize: 25, color: A.ok, textAlign: "center", lineHeight: 1.5 }}>
          same steps · same order · clean machine<br />every single time
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- history timeline
export const TimelineScene: React.FC<{ dur?: number; events?: { y: string; t: string; d: string }[] }> = ({ dur, events = [] }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const ats = [0.1, 0.17, 0.3, 0.36, 0.42, 0.55];
  const X0 = 190, X1 = 1730, Y = 530;
  const n = events.length;
  const fill = p(0.08, 0.6);
  return (
    <AbsoluteFill>
      <HeadC kicker="A SHORT HISTORY" title="From beta to the default automation engine" color={A.run} o={p(0, 0.04)} />
      <div style={{ position: "absolute", left: X0, top: Y - 3, width: X1 - X0, height: 6, background: T.line, borderRadius: 3 }} />
      <div style={{ position: "absolute", left: X0, top: Y - 3, width: (X1 - X0) * fill, height: 6, background: `linear-gradient(90deg, ${A.run}, ${A.ok})`, borderRadius: 3, boxShadow: `0 0 14px ${A.run}` }} />
      {fill > 0.99 && Array.from({ length: 4 }).map((_, k) => {
        const t = ((frame * 0.006) + k / 4) % 1;
        return <div key={k} style={{ position: "absolute", left: X0 + (X1 - X0) * t - 6, top: Y - 6, width: 12, height: 12, borderRadius: 6, background: A.ok, boxShadow: `0 0 12px ${A.ok}`, opacity: Math.sin(t * Math.PI) }} />;
      })}
      {events.map((e, i) => {
        const x = X0 + ((X1 - X0) * i) / (n - 1);
        const at = ats[i] ?? 0.1 + i * 0.08;
        const o = p(at, at + 0.05);
        const up = i % 2 === 0;
        const c = [A.run, A.ok, A.act, A.evt, A.run, A.ok][i % 6];
        return (
          <React.Fragment key={i}>
            <div style={{ position: "absolute", left: x - 16, top: Y - 16, width: 32, height: 32, borderRadius: 16, background: o > 0.5 ? c : T.panel, border: `3px solid ${c}`, boxShadow: o > 0.5 ? `0 0 ${16 + Math.sin(frame * 0.1 + i) * 6}px ${c}` : "none" }} />
            <div style={{ position: "absolute", left: x - 1, top: up ? Y - 70 : Y + 18, width: 2, height: 52, background: mix(T.line, c, 0.6), opacity: o }} />
            <div style={{
              position: "absolute", left: x - 150, top: up ? 225 : 600, width: 300, height: 235, boxSizing: "border-box", padding: "18px 20px",
              borderRadius: 18, background: mix(T.panel, c, 0.1), border: `2px solid ${mix(T.line, c, 0.7)}`, opacity: o,
              transform: `translateY(${(1 - o) * (up ? -20 : 20)}px)`,
            }}>
              <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 40, color: c }}>{e.y}</div>
              <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 29, color: T.text, marginTop: 6 }}>{e.t}</div>
              <div style={{ fontFamily: SANS, fontSize: 23, color: T.muted, marginTop: 8, lineHeight: 1.3 }}>{e.d}</div>
            </div>
          </React.Fragment>
        );
      })}
      <div style={{ position: "absolute", left: 0, right: 0, top: 855, textAlign: "center", opacity: p(0.7, 0.76) }}>
        <Chip text="public repos + standard runners = free" color={A.ok} size={24} />
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- CI/CD infinity loop
const LEM = (t: number, a = 640, cx = 960, cy = 560): [number, number] => {
  const s = Math.sin(t), c = Math.cos(t), d = 1 + s * s;
  return [cx + (a * c) / d, cy + (a * s * c) / d];
};
export const CicdScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const nodes = [
    { t: (3 * Math.PI) / 4, l: "Code", i: "⌨️", c: A.run, at: 0.12 },
    { t: Math.PI, l: "Build", i: "🔨", c: A.run, at: 0.16 },
    { t: (5 * Math.PI) / 4, l: "Test", i: "🧪", c: A.run, at: 0.2 },
    { t: (7 * Math.PI) / 4, l: "Release", i: "🏷️", c: A.ok, at: 0.36 },
    { t: 2 * Math.PI, l: "Deploy", i: "🚀", c: A.ok, at: 0.42 },
    { t: Math.PI / 4, l: "Monitor", i: "📈", c: A.ok, at: 0.6 },
  ];
  const pts = Array.from({ length: 181 }).map((_, i) => LEM((i / 180) * Math.PI * 2));
  const speedUp = p(0.7, 0.85);
  const base = frame * 0.014 + speedUp * frame * 0.012;
  return (
    <AbsoluteFill>
      <HeadC kicker="THE LOOP" title="Continuous Integration + Continuous Delivery" color={A.run} o={p(0, 0.04)} />
      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
        <polyline points={pts.map((q) => q.join(",")).join(" ")} fill="none" stroke={mix(T.bg1, A.run, 0.35)} strokeWidth={10} opacity={p(0.03, 0.1)} strokeLinecap="round" />
        <polyline points={pts.slice(45, 136).map((q) => q.join(",")).join(" ")} fill="none" stroke={A.run} strokeWidth={4} opacity={p(0.08, 0.14) * 0.8} />
        <polyline points={[...pts.slice(135), ...pts.slice(0, 46)].map((q) => q.join(",")).join(" ")} fill="none" stroke={A.ok} strokeWidth={4} opacity={p(0.32, 0.38) * 0.8} />
      </svg>
      {Array.from({ length: 10 }).map((_, k) => {
        const [x, y] = LEM(Math.PI / 2 + ((base + k / 10) % 1) * Math.PI * 2);
        const c = x < 960 ? A.run : A.ok;
        return <div key={k} style={{ position: "absolute", left: x - 8, top: y - 8, width: 16, height: 16, borderRadius: 8, background: c, boxShadow: `0 0 14px ${c}`, opacity: p(0.1, 0.2) }} />;
      })}
      <div style={{ position: "absolute", left: 470, top: 510, width: 380, textAlign: "center", opacity: p(0.06, 0.12) }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 64, color: A.run }}>CI</div>
        <div style={{ fontFamily: MONO, fontSize: 21, color: T.muted }}>merge often · build + test</div>
      </div>
      <div style={{ position: "absolute", left: 1070, top: 510, width: 380, textAlign: "center", opacity: p(0.3, 0.36) }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 64, color: A.ok }}>CD</div>
        <div style={{ fontFamily: MONO, fontSize: 21, color: T.muted }}>package · ship · observe</div>
      </div>
      {nodes.map((n, i) => {
        const [x, y] = LEM(n.t);
        const o = p(n.at, n.at + 0.04);
        const lit = p(0.62, 0.63) > 0.5 && (Math.floor(frame / 20) % 6) === i;
        return (
          <div key={i} style={{ position: "absolute", left: x - 110, top: y - 38, width: 220, height: 76, borderRadius: 16, background: mix(T.panel, n.c, lit ? 0.3 : 0.12), border: `2.5px solid ${n.c}`, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, opacity: o, transform: `scale(${(lit ? 1.08 : 1) * (0.8 + 0.2 * o)})`, boxShadow: lit ? `0 0 26px ${n.c}` : "none" }}>
            <span style={{ fontSize: 34 }}>{n.i}</span>
            <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 30, color: T.text }}>{n.l}</span>
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 860, top: 505, width: 200, height: 110, display: "flex", alignItems: "center", justifyContent: "center", opacity: p(0.76, 0.82) }}>
        <div style={{ width: 96, height: 96, borderRadius: 48, background: mix(T.panel, A.evt, 0.25), border: `3px solid ${A.evt}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48, boxShadow: `0 0 ${30 + Math.sin(frame * 0.12) * 12}px ${A.evt}`, transform: `rotate(${frame * 2}deg)` }}>⚙️</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 830, textAlign: "center", opacity: p(0.78, 0.84) }}>
        <Chip text="⚡ GitHub Actions spins the loop" color={A.evt} size={26} />
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- mental model hierarchy
export const HierarchyScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const chain = [
    { w: "Event", c: A.evt, at: 0.1 }, { w: "Workflow", c: A.act, at: 0.2 }, { w: "Job", c: A.run, at: 0.3 },
    { w: "Runner", c: A.run, at: 0.38 }, { w: "Step", c: A.ok, at: 0.48 },
  ];
  const jobs = [
    { n: "build", steps: [["uses", "actions/checkout@v4"], ["uses", "actions/setup-node@v4"], ["run", "npm ci"], ["run", "npm run build"]] },
    { n: "test", steps: [["uses", "actions/checkout@v4"], ["uses", "actions/setup-node@v4"], ["run", "npm ci"], ["run", "npm test"]] },
  ];
  const k = Math.floor(frame / 22) % 6;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 100, top: 50 }}><Kicker theme={T} text="THE MENTAL MODEL · FIVE WORDS" color={A.run} o={p(0, 0.04)} /></div>
      <div style={{ position: "absolute", left: 100, top: 100, display: "flex", alignItems: "center", gap: 14 }}>
        {chain.map((c, i) => {
          const o = p(c.at, c.at + 0.04);
          const again = p(0.82, 0.84) > 0.5 && Math.floor(frame / 18) % 5 === i;
          return (
            <React.Fragment key={i}>
              <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 46, color: o > 0.5 ? c.c : mix(T.muted, T.bg0, 0.5), opacity: 0.35 + o * 0.65, transform: `scale(${again ? 1.1 : 1})`, display: "inline-block", textShadow: again ? `0 0 20px ${c.c}` : "none" }}>{c.w}</span>
              {i < chain.length - 1 && <span style={{ fontFamily: MONO, fontSize: 36, color: T.muted }}>→</span>}
            </React.Fragment>
          );
        })}
      </div>
      {/* event */}
      <div style={{ position: "absolute", left: 100, top: 470, width: 200, height: 110, borderRadius: 18, background: mix(T.panel, A.evt, 0.18), border: `3px solid ${A.evt}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: p(0.1, 0.14), boxShadow: `0 0 ${20 + Math.sin(frame * 0.12) * 10}px ${mix(T.bg0, A.evt, 0.5)}` }}>
        <span style={{ fontSize: 40 }}>⚡</span>
        <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: 26, color: A.evt }}>push</span>
      </div>
      <Wire x1={300} y1={525} x2={365} y2={525} p={p(0.18, 0.21)} color={A.evt} />
      <Flow x1={300} y1={525} x2={370} y2={525} color={A.evt} n={3} o={p(0.21, 0.25)} />
      {/* workflow */}
      <div style={{ position: "absolute", left: 370, top: 215, width: 1450, height: 665, borderRadius: 24, border: `3px solid ${A.act}`, background: mix(T.bg1, A.act, 0.05), opacity: p(0.2, 0.25) }}>
        <div style={{ position: "absolute", left: 24, top: 14, fontFamily: MONO, fontWeight: 700, fontSize: 24, color: A.act }}>workflow · .github/workflows/ci.yml</div>
        {jobs.map((j, ji) => {
          const o = p(0.3 + ji * 0.04, 0.34 + ji * 0.04);
          return (
            <div key={ji} style={{ position: "absolute", left: 30 + ji * 710, top: 62, width: 680, height: 580, borderRadius: 20, border: `2.5px solid ${A.run}`, background: mix(T.panel, A.run, 0.06), opacity: o, transform: `translateY(${(1 - o) * 20}px)` }}>
              <div style={{ position: "absolute", left: 22, top: 16, fontFamily: SANS, fontWeight: 800, fontSize: 34, color: T.text }}>job: <span style={{ color: A.run }}>{j.n}</span></div>
              <div style={{ position: "absolute", right: 20, top: 18, opacity: p(0.38, 0.42) }}><Chip text="🖥 runner · ubuntu-latest" color={A.run} size={20} /></div>
              {j.steps.map((s, si) => {
                const so = p(0.48 + si * 0.025, 0.5 + si * 0.025);
                const st: St = p(0.56, 0.57) < 0.5 ? "queued" : si < (k - ji) ? "ok" : si === (k - ji) ? "running" : "queued";
                const isUses = s[0] === "uses";
                return (
                  <div key={si} style={{ position: "absolute", left: 22, top: 90 + si * 118, width: 636, height: 100, borderRadius: 14, boxSizing: "border-box", padding: "0 20px", display: "flex", alignItems: "center", gap: 16, background: mix(T.bg1, isUses ? A.act : A.ok, 0.1), border: `2px solid ${mix(T.line, isUses ? A.act : A.ok, 0.6)}`, opacity: so }}>
                    <StatusIcon s={st} size={30} />
                    <Chip text={s[0]} color={isUses ? A.act : A.ok} size={21} solid />
                    <span style={{ fontFamily: MONO, fontSize: 25, color: T.text }}>{s[1]}</span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- uses vs run
export const StepsScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const term = ["$ npm ci", "added 812 packages in 9s", "$ npm run build", "✓ built in 4.2s"];
  const tshow = p(0.44, 0.58) * term.length;
  const parts = [
    { t: "actions", l: "owner", c: A.run, at: 0.13 },
    { t: "/checkout", l: "repository", c: A.act, at: 0.17 },
    { t: "@v4", l: "version", c: A.evt, at: 0.21 },
  ];
  const k = Math.floor(frame / 20) % 5;
  return (
    <AbsoluteFill>
      <HeadC kicker="TWO KINDS OF STEP" title="uses: an action  ·  run: a shell command" color={A.act} o={p(0, 0.04)} />
      {/* uses */}
      <div style={{ position: "absolute", left: 100, top: 205, width: 830, height: 510, borderRadius: 22, border: `2.5px solid ${A.act}`, background: mix(T.panel, A.act, 0.07), opacity: p(0.03, 0.08) }}>
        <div style={{ position: "absolute", left: 28, top: 20, display: "flex", gap: 14, alignItems: "center" }}>
          <span style={{ fontSize: 46, transform: `rotate(${Math.sin(frame * 0.08) * 6}deg)`, display: "inline-block" }}>📦</span>
          <Chip text="uses:" color={A.act} solid size={26} />
          <span style={{ fontFamily: SANS, fontSize: 28, color: T.muted }}>reuse someone's code</span>
        </div>
        <CodeBlock lines={["- uses: actions/checkout@v4", "  with:", "    fetch-depth: 0"]} reveal={p(0.05, 0.12)} x={36} y={110} w={760} size={28} numbers={false} hi={p(0.28, 0.29) > 0.5 ? { a: 1, b: 2, c: A.evt } : null} />
        <div style={{ position: "absolute", left: 36, top: 290, display: "flex", gap: 0 }}>
          {parts.map((pt, i) => {
            const o = p(pt.at, pt.at + 0.03);
            return (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", opacity: o, transform: `translateY(${(1 - o) * 14}px)` }}>
                <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: 36, color: pt.c, padding: "6px 10px", background: mix(T.panel, pt.c, 0.16), borderBottom: `4px solid ${pt.c}` }}>{pt.t}</span>
                <span style={{ fontFamily: MONO, fontSize: 22, color: pt.c, marginTop: 10 }}>{pt.l}</span>
              </div>
            );
          })}
        </div>
        <div style={{ position: "absolute", left: 36, top: 420, width: 760, fontFamily: SANS, fontSize: 26, color: T.muted, opacity: p(0.26, 0.3) }}>
          <span style={{ color: A.evt, fontFamily: MONO }}>with:</span> passes inputs to the action
        </div>
      </div>
      {/* run */}
      <div style={{ position: "absolute", left: 990, top: 205, width: 830, height: 510, borderRadius: 22, border: `2.5px solid ${A.run}`, background: mix(T.panel, A.run, 0.07), opacity: p(0.36, 0.41) }}>
        <div style={{ position: "absolute", left: 28, top: 20, display: "flex", gap: 14, alignItems: "center" }}>
          <span style={{ fontSize: 46 }}>🖥️</span>
          <Chip text="run:" color={A.run} solid size={26} />
          <span style={{ fontFamily: SANS, fontSize: 28, color: T.muted }}>plain shell on the runner</span>
        </div>
        <CodeBlock lines={["- run: |", "    npm ci", "    npm run build"]} reveal={p(0.4, 0.46)} x={36} y={110} w={760} size={28} numbers={false} hi={p(0.47, 0.48) > 0.5 ? { a: 0, b: 0, c: A.evt } : null} />
        <div style={{ position: "absolute", left: 36, top: 270, width: 758, height: 210, borderRadius: 14, background: T.bg0, border: `1.5px solid ${T.line}`, padding: "16px 20px", boxSizing: "border-box", fontFamily: MONO, fontSize: 25 }}>
          {term.map((l, i) => (
            <div key={i} style={{ color: l.startsWith("$") ? T.text : l.startsWith("✓") ? A.ok : T.muted, opacity: clamp01(tshow - i), lineHeight: 1.6 }}>{l}</div>
          ))}
          {tshow >= term.length && <span style={{ color: A.ok, opacity: Math.floor(frame / 10) % 2 }}>▌</span>}
        </div>
      </div>
      {/* shared workspace */}
      <div style={{ position: "absolute", left: 100, top: 740, width: 1720, height: 140, borderRadius: 20, border: `2px dashed ${A.ok}`, background: mix(T.panel, A.ok, 0.06), opacity: p(0.62, 0.68) }}>
        <div style={{ position: "absolute", left: 28, top: 22, fontFamily: MONO, fontSize: 24, color: A.ok }}>📁 shared workspace · same machine, same files</div>
        {[0, 1, 2, 3].map((i) => {
          const on = k === i;
          return (
            <div key={i} style={{ position: "absolute", left: 60 + i * 420, top: 70, width: 360, height: 50, borderRadius: 12, background: mix(T.panel, A.ok, on ? 0.3 : 0.1), border: `2px solid ${on ? A.ok : T.line}`, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontFamily: SANS, fontSize: 24, color: T.text }}>
              <StatusIcon s={i < k ? "ok" : on ? "running" : "queued"} size={24} /> step {i + 1} · {["checkout", "setup-node", "npm ci", "npm test"][i]}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- push lifecycle
export const LifecycleScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const cells = [
    { i: "⬆️", t: "git push", d: "commit a1b2c3d", c: A.evt, at: 0.05 },
    { i: "⚡", t: "Event recorded", d: "“push” to main", c: A.evt, at: 0.1 },
    { i: "🔎", t: "Workflows matched", d: ".github/workflows/*.yml @ a1b2c3d", c: A.act, at: 0.2 },
    { i: "🗂️", t: "Jobs queued", d: "run #128 · 2 jobs", c: A.run, at: 0.32 },
    { i: "🖥️", t: "Fresh VM boots", d: "ubuntu-latest, just for you", c: A.run, at: 0.45 },
    { i: "📜", t: "Steps run", d: "logs stream live", c: A.ok, at: 0.6 },
    { i: "🧹", t: "VM destroyed", d: "nothing persists", c: A.gray, at: 0.76 },
    { i: "✅", t: "Status on commit", d: "a1b2c3d  ✓ CI passed", c: A.ok, at: 0.8 },
  ];
  // snake layout: row1 L→R cols 0..3, row2 R→L cols 3..0
  const pos = (i: number): [number, number] => i < 4 ? [130 + i * 430, 225] : [130 + (7 - i) * 430, 575];
  const centers = cells.map((_, i) => { const [x, y] = pos(i); return [x + 190, y + 120] as [number, number]; });
  // token travels the path as reveals land, then loops
  let reached = 0;
  cells.forEach((c, i) => { if (p(c.at, c.at + 0.01) > 0.5) reached = i; });
  const loopT = p(0.86, 0.87) > 0.5 ? ((frame % 150) / 150) : reached / 7;
  const [tx, ty] = along(centers, loopT);
  const logs = ["Run actions/checkout@v4", "Run npm ci", "added 812 packages", "Run npm test", "✓ 128 passed"];
  return (
    <AbsoluteFill>
      <HeadC kicker="WHAT HAPPENS ON git push" title="The life of a workflow run" color={A.evt} o={p(0, 0.04)} />
      {centers.slice(0, -1).map((c, i) => {
        const n = centers[i + 1];
        return <Wire key={i} x1={c[0] + (i === 3 ? 0 : i < 3 ? 190 : -190)} y1={c[1] + (i === 3 ? 120 : 0)} x2={n[0] + (i === 3 ? 0 : i < 3 ? -190 : 190)} y2={n[1] - (i === 3 ? 120 : 0)} p={p(cells[i + 1].at - 0.02, cells[i + 1].at)} color={mix(T.muted, cells[i + 1].c, 0.6)} />;
      })}
      {cells.map((c, i) => {
        const [x, y] = pos(i);
        const o = p(c.at, c.at + 0.04);
        const cur = reached === i && p(0.86, 0.87) < 0.5;
        return (
          <div key={i} style={{ position: "absolute", left: x, top: y, width: 380, height: 240, borderRadius: 20, boxSizing: "border-box", padding: "20px 24px", background: mix(T.panel, c.c, cur ? 0.22 : 0.08), border: `2.5px solid ${cur ? c.c : mix(T.line, c.c, 0.6)}`, opacity: o, transform: `scale(${0.9 + 0.1 * o})`, boxShadow: cur ? `0 0 ${28 + Math.sin(frame * 0.12) * 8}px ${mix(T.bg0, c.c, 0.5)}` : "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: 24, color: c.c }}>{i + 1}</span>
              <span style={{ fontSize: 44 }}>{c.i}</span>
            </div>
            <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 32, color: T.text, marginTop: 10 }}>{c.t}</div>
            <div style={{ fontFamily: MONO, fontSize: 21, color: T.muted, marginTop: 6 }}>{c.d}</div>
            {i === 5 && o > 0.5 && (
              <div style={{ position: "absolute", left: 24, bottom: 16, width: 330, fontFamily: MONO, fontSize: 19, color: A.ok, whiteSpace: "nowrap", overflow: "hidden" }}>{logs[Math.floor(frame / 20) % logs.length]}</div>
            )}
          </div>
        );
      })}
      <div style={{ position: "absolute", left: tx - 14, top: ty - 134, width: 28, height: 28, borderRadius: 14, background: A.evt, boxShadow: `0 0 22px ${A.evt}`, border: `3px solid ${T.text}`, opacity: p(0.05, 0.08) }} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- Actions tab + PR checks
export const RunLogScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const runs: { n: string; s: St; b: string }[] = [
    { n: "CI #128", s: "running", b: "feat/login" }, { n: "CI #127", s: "ok", b: "main" }, { n: "Deploy #45", s: "ok", b: "main" },
    { n: "CI #126", s: "fail", b: "fix/typo" }, { n: "Nightly #30", s: "ok", b: "main" }, { n: "CI #125", s: "ok", b: "main" },
  ];
  const steps = [
    { n: "Set up job", t: "2s" }, { n: "Run actions/checkout@v4", t: "1s" }, { n: "Run actions/setup-node@v4", t: "4s" },
    { n: "Run npm ci", t: "18s" }, { n: "Run npm test", t: "32s" }, { n: "Complete job", t: "0s" },
  ];
  const prog = p(0.28, 0.7) * (steps.length + 0.05);
  const logLines = ["> jest --ci", "PASS src/auth.test.ts", "PASS src/api.test.ts", "PASS src/ui.test.tsx", "Tests: 128 passed, 128 total"];
  const allOk = prog >= steps.length;
  const merge = p(0.62, 0.66) > 0.5 && allOk;
  return (
    <AbsoluteFill>
      <HeadC kicker="WATCHING IT RUN" title="The Actions tab, and the status check" color={A.ok} o={p(0, 0.04)} />
      <Win x={100} y={200} w={1070} h={680} title="github.com/acme/web/actions" color={A.run} o={p(0.02, 0.06)}>
        <div style={{ position: "absolute", left: 0, top: 0, width: 330, height: 634, borderRight: `1.5px solid ${T.line}`, background: T.bg1 }}>
          <div style={{ padding: "16px 20px", fontFamily: SANS, fontWeight: 800, fontSize: 25, color: T.text }}>All workflows</div>
          {runs.map((r, i) => {
            const o = p(0.06 + i * 0.015, 0.08 + i * 0.015);
            const sel = i === 0;
            const s: St = i === 0 ? (allOk ? "ok" : "running") : r.s;
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 18px", opacity: o, background: sel ? mix(T.bg1, A.run, 0.15) : "transparent", borderLeft: sel ? `4px solid ${A.run}` : "4px solid transparent" }}>
                <StatusIcon s={s} size={24} />
                <div>
                  <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 23, color: T.text }}>{r.n}</div>
                  <div style={{ fontFamily: MONO, fontSize: 19, color: T.muted }}>{r.b}</div>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ position: "absolute", left: 350, top: 14, opacity: p(0.14, 0.18) }}>
          <RunRail x={0} y={0} labels={["build", "test", "deploy"]} scale={0.8} period={40} />
        </div>
        <div style={{ position: "absolute", left: 350, top: 84, width: 700, height: 530, borderRadius: 12, background: T.bg0, border: `1.5px solid ${T.line}`, opacity: p(0.24, 0.28), overflow: "hidden" }}>
          {steps.map((s, i) => {
            const st: St = prog > i + 1 ? "ok" : prog > i ? "running" : "queued";
            const open = i === 4 && prog > 4;
            return (
              <div key={i}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", borderBottom: `1px solid ${T.line}` }}>
                  <span style={{ fontFamily: MONO, color: T.muted, fontSize: 18 }}>{open ? "▾" : "▸"}</span>
                  <StatusIcon s={st} size={22} />
                  <span style={{ fontFamily: MONO, fontSize: 21, color: T.text, flex: 1 }}>{s.n}</span>
                  <span style={{ fontFamily: MONO, fontSize: 19, color: T.muted }}>{st === "ok" ? s.t : ""}</span>
                </div>
                {open && (
                  <div style={{ padding: "8px 16px 8px 58px", fontFamily: MONO, fontSize: 19, lineHeight: 1.5 }}>
                    {logLines.map((l, li) => <div key={li} style={{ color: l.startsWith("PASS") ? A.ok : l.startsWith("Tests") ? A.ok : T.muted, opacity: clamp01((prog - 4) * 6 - li) }}>{l}</div>)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Win>
      {/* PR checks panel */}
      <div style={{ position: "absolute", left: 1210, top: 200, width: 610, height: 680, borderRadius: 18, border: `2px solid ${mix(T.line, merge ? A.ok : A.evt, 0.7)}`, background: T.bg1, opacity: p(0.46, 0.5), transform: `translateX(${(1 - p(0.46, 0.5)) * 40}px)` }}>
        <div style={{ padding: "22px 26px", fontFamily: SANS, fontWeight: 800, fontSize: 30, color: T.text }}>Pull request #42</div>
        <div style={{ padding: "0 26px", fontFamily: MONO, fontSize: 21, color: T.muted }}>feat/login → main</div>
        <div style={{ margin: "26px 26px 0", borderRadius: 14, border: `1.5px solid ${T.line}`, overflow: "hidden" }}>
          {[["CI / build", 1], ["CI / test", 4.5], ["CI / lint", 2]].map(([nm, need], i) => {
            const s: St = prog > (need as number) ? "ok" : "running";
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", borderBottom: `1px solid ${T.line}` }}>
                <StatusIcon s={s} size={26} />
                <span style={{ fontFamily: MONO, fontSize: 23, color: T.text, flex: 1 }}>{nm as string}</span>
                <span style={{ opacity: p(0.56, 0.6) }}><Chip text="Required" color={A.evt} size={17} /></span>
              </div>
            );
          })}
        </div>
        <div style={{ margin: "30px 26px 0", fontFamily: SANS, fontSize: 25, color: merge ? A.ok : A.evt, fontWeight: 700 }}>
          {merge ? "✓ All checks have passed" : "⏳ Required checks are running…"}
        </div>
        <div style={{ margin: "22px 26px 0", height: 76, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, fontFamily: SANS, fontWeight: 800, fontSize: 28, background: merge ? A.ok : mix(T.panel, T.muted, 0.2), color: merge ? T.bg0 : T.muted, boxShadow: merge ? `0 0 ${24 + Math.sin(frame * 0.12) * 10}px ${A.ok}` : "none" }}>
          {merge ? "⇄ Merge pull request" : "🔒 Merging is blocked"}
        </div>
        <div style={{ position: "absolute", left: 26, bottom: 24, width: 560, fontFamily: MONO, fontSize: 20, color: T.muted, opacity: p(0.56, 0.6) }}>branch protection · required status checks</div>
      </div>
      {!merge && <ScanBeam theme={T} x={1210} y={200} w={610} h={680} color={A.evt} o={0.3 * p(0.46, 0.5)} speed={1.4} />}
    </AbsoluteFill>
  );
};
