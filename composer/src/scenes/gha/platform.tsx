// gha/platform.tsx — chapters 9–10: billing (computed), speed waterfall (computed), debugging, beyond-CI,
// and the GitHub platform tour: map, pull requests, issues/projects, codespaces, copilot, advanced security.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { mix, useP, MONO, SANS, Wire, Flow, Counter, Type } from "../../lib/primitives";
import { T, A, Win, HeadC, StatusIcon, St, Chip } from "./core";

// ---------------------------------------------------------------- billing (computed rounding)
const JOBS_N = 12, JOB_SECS = 10;
const ACTUAL_MIN = (JOBS_N * JOB_SECS) / 60;              // 2
const BILLED_MIN = JOBS_N * Math.ceil(JOB_SECS / 60);     // 12
export const BillingScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const quota = 0.15 + 0.6 * p(0.14, 0.3) + 0.03 * Math.sin(frame * 0.05);
  const os = [{ n: "🐧 Linux", w: 0.18, c: A.ok }, { n: "🪟 Windows", w: 0.34, c: A.evt }, { n: "🍎 macOS", w: 1, c: A.bad }];
  return (
    <AbsoluteFill>
      <HeadC kicker="COST" title="What Actions costs — and the rounding trap" color={A.evt} o={p(0, 0.04)} />
      <div style={{ position: "absolute", left: 100, top: 205, width: 520, height: 170, borderRadius: 18, background: mix(T.panel, A.ok, 0.12), border: `2.5px solid ${A.ok}`, padding: "20px 24px", boxSizing: "border-box", opacity: p(0.03, 0.07) }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 30, color: T.text }}>🌍 Public repos</div>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 44, color: A.ok, marginTop: 8 }}>FREE</div>
        <div style={{ fontFamily: SANS, fontSize: 20, color: T.muted }}>on standard hosted runners</div>
      </div>
      <div style={{ position: "absolute", left: 660, top: 205, width: 1160, height: 170, borderRadius: 18, background: T.bg1, border: `2px solid ${mix(T.line, A.run, 0.6)}`, padding: "20px 26px", boxSizing: "border-box", opacity: p(0.12, 0.16) }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 30, color: T.text }}>🔒 Private repos · monthly free minutes</div>
        <div style={{ marginTop: 18, height: 36, borderRadius: 10, background: T.panel, position: "relative" }}>
          <div style={{ width: `${quota * 100}%`, height: 36, borderRadius: 10, background: `linear-gradient(90deg, ${A.run}, ${quota > 0.8 ? A.bad : A.evt})` }} />
          <span style={{ position: "absolute", right: 0, top: 44, fontFamily: MONO, fontSize: 21, color: T.text }}>{Math.round(quota * 2000).toLocaleString("en-US")} / 2,000 min · Free plan</span>
        </div>
        <div style={{ fontFamily: SANS, fontSize: 21, color: T.muted, marginTop: 12 }}>more on paid plans · then pay per minute</div>
      </div>
      <div style={{ position: "absolute", left: 100, top: 405, width: 1720, opacity: p(0.34, 0.38) }}>
        <div style={{ fontFamily: MONO, fontSize: 21, color: T.muted, marginBottom: 10 }}>per-minute price by runner OS (relative · illustrative)</div>
        {os.map((o, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 12 }}>
            <span style={{ width: 200, fontFamily: SANS, fontWeight: 700, fontSize: 26, color: T.text }}>{o.n}</span>
            <div style={{ width: 1000 * o.w * p(0.36 + i * 0.03, 0.42 + i * 0.03), height: 34, borderRadius: 8, background: `linear-gradient(90deg, ${mix(T.panel, o.c, 0.5)}, ${o.c})` }} />
            <span style={{ fontFamily: MONO, fontSize: 21, color: o.c }}>{["cheapest", "more", "most"][i]}</span>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 100, top: 620, width: 820, opacity: p(0.56, 0.6) }}>
        <div style={{ fontFamily: MONO, fontSize: 21, color: T.muted, marginBottom: 10 }}>{JOBS_N} jobs × {JOB_SECS} s each</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 124px)", gap: 12 }}>
          {Array.from({ length: JOBS_N }).map((_, i) => {
            const on = p(0.58 + i * 0.008, 0.6 + i * 0.008);
            const s: St = (Math.floor(frame / 12) + i) % 8 < 2 ? "running" : "ok";
            return <div key={i} style={{ height: 88, borderRadius: 12, background: mix(T.panel, A.run, 0.15), border: `2px solid ${A.run}`, opacity: on, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }}>
              <StatusIcon s={s} size={22} /><span style={{ fontFamily: MONO, fontSize: 19, color: T.text }}>10 s</span>
            </div>;
          })}
        </div>
      </div>
      <div style={{ position: "absolute", left: 980, top: 640, width: 840, opacity: p(0.64, 0.68) }}>
        <div style={{ fontFamily: SANS, fontSize: 28, color: T.muted }}>actual compute</div>
        <Counter p={p(0.64, 0.7)} to={ACTUAL_MIN} suffix=" min" color={A.ok} size={50} />
        <div style={{ fontFamily: SANS, fontSize: 28, color: T.muted, marginTop: 14 }}>billed (each job rounded up)</div>
        <div style={{ opacity: p(0.7, 0.74) }}><Counter p={p(0.7, 0.78)} to={BILLED_MIN} suffix=" min" color={A.bad} size={64} /><span style={{ fontFamily: MONO, fontSize: 30, color: A.bad, marginLeft: 20 }}>6×</span></div>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- speed waterfall (computed)
const STEPS_SPEED = [{ n: "Baseline pipeline", d: 0 }, { n: "+ cache dependencies", d: -5 }, { n: "+ parallel jobs", d: -5 }, { n: "+ larger runner", d: -3 }];
const SPEED_VALS = STEPS_SPEED.reduce<number[]>((acc, s, i) => { acc.push(i === 0 ? 18 : acc[i - 1] + s.d); return acc; }, []);
export const SpeedScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const X0 = 520, SC = 64;
  const ats = [0.04, 0.17, 0.25, 0.36];
  return (
    <AbsoluteFill>
      <HeadC kicker="SPEED" title="Stacking the speed-ups" color={A.evt} o={p(0, 0.04)} />
      {Array.from({ length: 19 }).map((_, t) => t % 3 === 0 && (
        <div key={t} style={{ position: "absolute", left: X0 + t * SC, top: 210, width: 1, height: 460, background: T.line }}>
          <span style={{ position: "absolute", top: 462, left: -10, fontFamily: MONO, fontSize: 18, color: T.muted }}>{t}m</span>
        </div>
      ))}
      {STEPS_SPEED.map((s, i) => {
        const o = p(ats[i], ats[i] + 0.04);
        const v = SPEED_VALS[i];
        const w = v * SC * o;
        const c = i === 0 ? A.bad : i === STEPS_SPEED.length - 1 ? A.ok : A.evt;
        const tok = ((frame * 0.01 + i * 0.3) % 1) * w;
        return (
          <React.Fragment key={i}>
            <div style={{ position: "absolute", left: 100, top: 230 + i * 110, width: 400, fontFamily: SANS, fontWeight: 700, fontSize: 28, color: T.text, opacity: o, lineHeight: "80px" }}>{s.n}</div>
            <div style={{ position: "absolute", left: X0, top: 230 + i * 110, width: w, height: 80, borderRadius: 12, background: `linear-gradient(90deg, ${mix(T.panel, c, 0.4)}, ${c})`, opacity: o }}>
              <div style={{ position: "absolute", left: tok - 8, top: 32, width: 16, height: 16, borderRadius: 8, background: T.text, opacity: 0.7 }} />
            </div>
            {i > 0 && <div style={{ position: "absolute", left: X0 + v * SC, top: 230 + i * 110, width: -s.d * SC, height: 80, borderRadius: 12, border: `2px dashed ${mix(T.line, A.ok, 0.7)}`, opacity: o * 0.8, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontWeight: 800, fontSize: 24, color: A.ok }}>{s.d}m</div>}
            <div style={{ position: "absolute", left: X0 + (i === 0 ? v : SPEED_VALS[i - 1]) * SC + 16, top: 252 + i * 110, fontFamily: MONO, fontWeight: 800, fontSize: 28, color: c, opacity: o }}>{v} min</div>
          </React.Fragment>
        );
      })}
      <div style={{ position: "absolute", left: 100, top: 710, opacity: p(0.52, 0.56), display: "flex", alignItems: "baseline", gap: 18 }}>
        <Counter p={1} to={SPEED_VALS[0]} suffix=" min" color={A.bad} size={56} />
        <span style={{ fontFamily: MONO, fontSize: 44, color: T.muted }}>→</span>
        <Counter p={p(0.52, 0.6)} to={SPEED_VALS[SPEED_VALS.length - 1]} suffix=" min" color={A.ok} size={72} />
        <span style={{ fontFamily: MONO, fontSize: 20, color: T.muted, marginLeft: 14 }}>illustrative</span>
      </div>
      <div style={{ position: "absolute", left: 1000, top: 715, width: 820, display: "flex", flexDirection: "column", gap: 12, opacity: p(0.66, 0.7) }}>
        <Chip text="paths: docs-only change → run skipped (0 min)" color={A.run} size={22} />
        <Chip text="cancel-in-progress → stale runs dropped" color={A.run} size={22} />
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- debugging
export const DebugScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const steps: [string, St][] = [["Set up job", "ok"], ["Run actions/checkout@v4", "ok"], ["Run npm ci", "ok"], ["Run npm test", "fail"], ["Post cleanup", "skip"]];
  const tail = ["PASS src/api.test.ts", "FAIL src/auth.test.ts", "  ● login › rejects bad token", "    expect(received).toBe(expected)", "    Expected: 401   Received: 500", "Error: Process completed with exit code 1."];
  const cards = [
    { i: "↻", t: "Re-run failed jobs", d: "not the whole workflow", c: A.run, at: 0.3 },
    { i: "🔬", t: "Re-run with debug logging", d: "much more detail per step", c: A.act, at: 0.45 },
    { i: "🐳", t: "act — run it locally", d: "$ act pull_request -j test", c: A.evt, at: 0.6 },
    { i: "📝", t: "Job summary", d: "markdown report on the run page", c: A.ok, at: 0.8 },
  ];
  return (
    <AbsoluteFill>
      <HeadC kicker="DEBUGGING" title="When the run goes red" color={A.bad} o={p(0, 0.04)} />
      <Win x={100} y={200} w={1020} h={680} title="CI #131 · test · failed" color={A.bad} o={p(0.02, 0.06)}>
        {steps.map(([n, s], i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 22px", borderBottom: `1px solid ${T.line}`, background: s === "fail" ? mix(T.bg1, A.bad, 0.1) : "transparent" }}>
            <span style={{ fontFamily: MONO, color: T.muted, fontSize: 19 }}>{s === "fail" ? "▾" : "▸"}</span>
            <StatusIcon s={s} size={24} />
            <span style={{ fontFamily: MONO, fontSize: 23, color: T.text }}>{n}</span>
          </div>
        ))}
        <div style={{ position: "absolute", left: 20, top: 330, width: 980, fontFamily: MONO, fontSize: 21, lineHeight: 1.55 }}>
          {tail.map((l, i) => <div key={i} style={{ color: l.startsWith("PASS") ? A.ok : l.startsWith("FAIL") || l.startsWith("Error") ? A.bad : T.text, opacity: p(0.08 + i * 0.02, 0.1 + i * 0.02), whiteSpace: "pre" }}>{l}</div>)}
        </div>
        <div style={{ position: "absolute", left: 20, top: 540, width: 976, borderRadius: 12, padding: "12px 18px", boxSizing: "border-box", background: mix(T.bg1, A.bad, 0.15), border: `2px solid ${A.bad}`, opacity: p(0.2, 0.24), boxShadow: `0 0 ${14 + Math.sin(frame * 0.14) * 8}px ${mix(T.bg0, A.bad, 0.6)}` }}>
          <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 23, color: A.bad }}>✕ Annotation · src/auth.test.ts#L42</div>
          <div style={{ fontFamily: MONO, fontSize: 20, color: T.text, marginTop: 4 }}>Expected: 401 Received: 500</div>
        </div>
      </Win>
      {cards.map((c, i) => {
        const o = p(c.at, c.at + 0.04);
        return (
          <div key={i} style={{ position: "absolute", left: 1160, top: 200 + i * 172, width: 660, height: 156, borderRadius: 18, boxSizing: "border-box", padding: "16px 22px", background: mix(T.panel, c.c, 0.1), border: `2.5px solid ${c.c}`, opacity: o, transform: `translateX(${(1 - o) * 40}px)` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ fontSize: 36, color: c.c, display: "inline-block", transform: i === 0 ? `rotate(${frame * 4}deg)` : "none" }}>{c.i}</span>
              <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 29, color: T.text }}>{c.t}</span>
            </div>
            {i === 2 ? <div style={{ marginTop: 12 }}><Type text={c.d} p={p(0.62, 0.7)} color={A.evt} mono size={22} /></div>
              : <div style={{ fontFamily: i === 1 ? SANS : SANS, fontSize: 23, color: T.muted, marginTop: 10 }}>{c.d}</div>}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- beyond CI (orbit)
export const BeyondScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const items = [
    { i: "🏷️", t: "label & triage issues", at: 0.12 }, { i: "🧹", t: "close stale issues", at: 0.16 }, { i: "👋", t: "welcome first-timers", at: 0.2 },
    { i: "📝", t: "write release notes", at: 0.32 }, { i: "🔢", t: "bump versions", at: 0.35 }, { i: "🌙", t: "nightly scrapers", at: 0.46 },
    { i: "📊", t: "scheduled reports", at: 0.49 }, { i: "💾", t: "backups", at: 0.52 }, { i: "🤖", t: "Copilot coding agent", at: 0.64 },
  ];
  const hot = Math.floor(frame / 24) % items.length;
  return (
    <AbsoluteFill>
      <HeadC kicker="BEYOND CI" title="If it happens on GitHub, you can automate it" color={A.evt} o={p(0, 0.04)} />
      {items.map((it, i) => {
        const ang = (i / items.length) * Math.PI * 2 - Math.PI / 2 + frame * 0.0015;
        const x = 960 + Math.cos(ang) * 640, y = 560 + Math.sin(ang) * 270;
        const o = p(it.at, it.at + 0.04);
        const ai = i === 8;
        const on = (hot === i || (ai && p(0.66, 0.67) > 0.5)) && o > 0.9;
        const c = ai ? A.act : A.evt;
        return (
          <React.Fragment key={i}>
            <Wire x1={960} y1={560} x2={x} y2={y} p={p(it.at, it.at + 0.03)} color={on ? c : mix(T.muted, T.bg1, 0.5)} arrow={false} />
            {on && <Flow x1={960} y1={560} x2={x} y2={y} color={c} n={4} speed={0.02} />}
            <div style={{ position: "absolute", left: x - 170, top: y - 40, width: 340, height: 80, borderRadius: 16, display: "flex", alignItems: "center", gap: 12, padding: "0 18px", boxSizing: "border-box", background: mix(T.panel, c, on ? 0.25 : 0.08), border: `2.5px solid ${on ? c : mix(T.line, c, 0.5)}`, opacity: o, transform: `scale(${on ? 1.06 : 1})` }}>
              <span style={{ fontSize: 34 }}>{it.i}</span>
              <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 25, color: T.text, whiteSpace: "nowrap" }}>{it.t}</span>
            </div>
          </React.Fragment>
        );
      })}
      <div style={{ position: "absolute", left: 860, top: 460, width: 200, height: 200, borderRadius: 100, background: mix(T.panel, A.evt, 0.2), border: `3px solid ${A.evt}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: `0 0 ${30 + Math.sin(frame * 0.1) * 12}px ${mix(T.bg0, A.evt, 0.5)}`, opacity: p(0.02, 0.06) }}>
        <span style={{ fontSize: 60 }}>⚡</span>
        <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: 22, color: A.evt }}>Actions</span>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- GitHub platform map
export const PlatformScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const fams = [
    { h: "Collaborate", i: "🔀", f: ["Pull requests", "Code review"], c: A.run, at: 0.3 },
    { h: "Plan", i: "🗂️", f: ["Issues", "Projects", "Discussions"], c: A.evt, at: 0.4 },
    { h: "Build", i: "💻", f: ["Codespaces", "Copilot"], c: A.act, at: 0.49 },
    { h: "Automate", i: "⚡", f: ["Actions"], c: A.evt, at: 0.6 },
    { h: "Secure", i: "🛡️", f: ["Dependabot", "Code scanning", "Secret scanning"], c: A.bad, at: 0.71 },
    { h: "Ship", i: "📦", f: ["Releases", "Packages", "Pages"], c: A.ok, at: 0.82 },
  ];
  const hot = Math.floor(frame / 30) % fams.length;
  return (
    <AbsoluteFill>
      <HeadC kicker="THE GITHUB PLATFORM" title="Everything orbits the repository" color={A.ok} o={p(0, 0.04)} />
      {fams.map((f, i) => {
        const ang = (i / fams.length) * Math.PI * 2 - Math.PI / 2;
        const x = 960 + Math.cos(ang) * 610, y = 555 + Math.sin(ang) * 245;
        const o = p(f.at, f.at + 0.04);
        const on = (hot === i && p(0.9, 0.91) > 0.5) || (i === 3 && p(0.6, 0.61) > 0.5 && p(0.71, 0.72) < 0.5);
        return (
          <React.Fragment key={i}>
            <Wire x1={960} y1={555} x2={x} y2={y} p={p(f.at, f.at + 0.03)} color={on ? f.c : mix(T.muted, T.bg1, 0.45)} arrow={false} />
            {o > 0.9 && <Flow x1={960} y1={555} x2={x} y2={y} color={f.c} n={3} o={on ? 1 : 0.35} />}
            <div style={{ position: "absolute", left: x - 240, top: y - 82, width: 480, height: 164, borderRadius: 18, boxSizing: "border-box", padding: "14px 20px", background: mix(T.panel, f.c, on ? 0.22 : 0.08), border: `2.5px solid ${on ? f.c : mix(T.line, f.c, 0.6)}`, opacity: o, transform: `scale(${on ? 1.05 : 1})` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 34 }}>{f.i}</span>
                <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 31, color: f.c }}>{f.h}</span>
                {i === 3 && <span style={{ marginLeft: "auto" }}><Chip text="you know this ✓" color={A.ok} size={16} /></span>}
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
                {f.f.map((x2) => <Chip key={x2} text={x2} color={f.c} size={18} />)}
              </div>
            </div>
          </React.Fragment>
        );
      })}
      <div style={{ position: "absolute", left: 770, top: 480, width: 380, height: 150, borderRadius: 22, background: T.panel, border: `3px solid ${T.text}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: p(0.03, 0.08), boxShadow: `0 0 ${30 + Math.sin(frame * 0.08) * 12}px rgba(230,237,243,0.18)` }}>
        <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 34, color: T.text }}>📁 repository</span>
        <span style={{ fontFamily: MONO, fontSize: 20, color: T.muted, marginTop: 6 }}>code · history · branches</span>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- pull requests
export const PrScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const merged = p(0.86, 0.9);
  const MX = (i: number) => 160 + i * 150, MY = 270, BY = 360;
  const brCommits = [0.07, 0.09, 0.11];
  const checks = p(0.46, 0.5);
  const rules = [
    { t: "CODEOWNERS → @web-team review required", c: A.run, at: 0.4 },
    { t: "Checks by Actions: build ✓ test ✓ lint ✓", c: A.ok, at: 0.48 },
    { t: "Ruleset: 1 approval + green checks", c: A.evt, at: 0.6 },
    { t: "Merge queue: tested together before landing", c: A.act, at: 0.68 },
  ];
  const opts = ["Squash and merge", "Rebase and merge", "Create a merge commit"];
  const optHot = Math.floor(frame / 30) % 3;
  return (
    <AbsoluteFill>
      <HeadC kicker="COLLABORATE" title="The pull request: propose, review, merge" color={A.run} o={p(0, 0.04)} />
      {/* git graph */}
      <div style={{ position: "absolute", left: MX(0), top: MY - 2, width: MX(10) - MX(0), height: 4, background: mix(T.line, A.ok, 0.7), opacity: p(0.02, 0.05) }} />
      {[0, 1, 9, 10].map((i) => <div key={i} style={{ position: "absolute", left: MX(i) - 14, top: MY - 14, width: 28, height: 28, borderRadius: 14, background: A.ok, opacity: i >= 9 ? merged : p(0.02, 0.05) }} />)}
      <svg width={1920} height={500} style={{ position: "absolute", left: 0, top: 0, opacity: p(0.05, 0.08) }}>
        <path d={`M ${MX(1)} ${MY} C ${MX(1) + 60} ${MY} ${MX(2) - 60} ${BY} ${MX(2)} ${BY} L ${MX(8)} ${BY}`} stroke={A.run} strokeWidth={4} fill="none" />
        <path d={`M ${MX(8)} ${BY} C ${MX(8) + 60} ${BY} ${MX(9) - 60} ${MY} ${MX(9)} ${MY}`} stroke={A.ok} strokeWidth={4} fill="none" opacity={merged} />
      </svg>
      {[2, 3, 4].map((ci, k) => <div key={ci} style={{ position: "absolute", left: MX(ci) - 14, top: BY - 14, width: 28, height: 28, borderRadius: 14, background: A.run, opacity: p(brCommits[k], brCommits[k] + 0.02) }} />)}
      <div style={{ position: "absolute", left: MX(2) - 20, top: BY + 24, fontFamily: MONO, fontSize: 21, color: A.run, opacity: p(0.06, 0.09) }}>feat/login</div>
      <div style={{ position: "absolute", left: MX(5) - 30, top: BY - 34, opacity: p(0.13, 0.16) }}><Chip text="PR #42 opened" color={A.run} size={20} solid /></div>
      <div style={{ position: "absolute", left: MX(10) + 30, top: MY - 18, fontFamily: MONO, fontSize: 21, color: A.ok, opacity: p(0.02, 0.05) }}>main</div>
      {/* diff + review */}
      <Win x={100} y={440} w={1000} h={440} title="Files changed · src/auth.ts" color={A.run} o={p(0.18, 0.22)}>
        {[["  export function login(req) {", 0], ["-   if (!user) return 500;", -1], ["+   if (!user) return 401;", 1], ["+   audit.log(req.ip);", 1], ["  }", 0]].map(([l, t], i) => (
          <div key={i} style={{ fontFamily: MONO, fontSize: 23, padding: "5px 20px", whiteSpace: "pre", color: T.text, background: t === 1 ? mix(T.bg1, A.ok, 0.14) : t === -1 ? mix(T.bg1, A.bad, 0.14) : "transparent" }}>{l as string}</div>
        ))}
        <div style={{ margin: "14px 20px 0", borderRadius: 12, border: `2px solid ${mix(T.line, A.evt, 0.7)}`, background: T.panel, padding: "12px 16px", opacity: p(0.24, 0.28) }}>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 21, color: A.evt }}>💬 reviewer · suggestion</div>
          <div style={{ fontFamily: MONO, fontSize: 21, color: T.text, marginTop: 4 }}>audit.log(req.ip, "login-failed");</div>
        </div>
        <div style={{ margin: "12px 20px 0", display: "flex", gap: 12, opacity: p(0.3, 0.34) }}>
          <Chip text="✓ Approved" color={A.ok} solid size={20} />
          <Chip text="Request changes" color={A.bad} size={18} />
        </div>
      </Win>
      <div style={{ position: "absolute", left: 1140, top: 440, width: 680 }}>
        {rules.map((r, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12, padding: "12px 16px", borderRadius: 12, background: mix(T.panel, r.c, 0.1), border: `2px solid ${mix(T.line, r.c, 0.6)}`, opacity: p(r.at, r.at + 0.04) }}>
            <StatusIcon s={i === 1 && checks < 1 ? "running" : "ok"} size={24} />
            <span style={{ fontFamily: SANS, fontSize: 22, color: T.text }}>{r.t}</span>
          </div>
        ))}
        <div style={{ display: "flex", gap: 8, marginTop: 8, opacity: p(0.8, 0.84) }}>
          {opts.map((o, i) => <Chip key={o} text={o} color={A.ok} solid={optHot === i} size={17} />)}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- issues + projects
export const IssuesScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const closed = p(0.54, 0.56) > 0.5;
  const views = ["Table", "Board", "Roadmap"];
  const vHot = p(0.2, 0.21) > 0.5 ? Math.floor(frame / 40) % 3 : 1;
  const cols = ["Todo", "In progress", "Done"];
  const mover = (frame % 180) / 180;
  const cards = [
    { t: "#131 Dark mode", col: 0 }, { t: "#129 Rate limits", col: 1 }, { t: "#120 SSO", col: 2 }, { t: "#118 Docs", col: 2 },
  ];
  return (
    <AbsoluteFill>
      <HeadC kicker="PLAN" title="Issues, Projects, Discussions and Wiki" color={A.evt} o={p(0, 0.04)} />
      <div style={{ position: "absolute", left: 100, top: 205, width: 560, height: 400, borderRadius: 18, background: T.bg1, border: `2px solid ${closed ? A.act : A.ok}`, padding: "22px 24px", boxSizing: "border-box", opacity: p(0.03, 0.07) }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Chip text={closed ? "✓ Closed" : "◉ Open"} color={closed ? A.act : A.ok} solid size={19} />
          <span style={{ fontFamily: MONO, fontSize: 21, color: T.muted }}>#128</span>
        </div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 30, color: T.text, marginTop: 12 }}>Login fails on Safari</div>
        <div style={{ display: "flex", gap: 8, marginTop: 14, opacity: p(0.07, 0.1) }}>
          <Chip text="bug" color={A.bad} size={18} /><Chip text="priority: high" color={A.evt} size={18} /><Chip text="👤 assignee" color={A.run} size={18} />
        </div>
        <div style={{ fontFamily: MONO, fontSize: 20, color: T.muted, marginTop: 18, opacity: p(0.1, 0.13) }}>sub-issues 2 / 3</div>
        <div style={{ height: 12, borderRadius: 6, background: T.panel, marginTop: 8, opacity: p(0.1, 0.13) }}><div style={{ width: closed ? "100%" : "66%", height: 12, borderRadius: 6, background: A.ok }} /></div>
        <div style={{ marginTop: 22, opacity: p(0.46, 0.5) }}><Chip text="PR #42: “Closes #128”" color={A.run} size={19} /></div>
        {closed && <div style={{ fontFamily: SANS, fontSize: 21, color: A.act, marginTop: 12 }}>merged → issue closed automatically</div>}
      </div>
      <div style={{ position: "absolute", left: 700, top: 205, width: 1120, height: 400, borderRadius: 18, background: T.bg1, border: `2px solid ${mix(T.line, A.evt, 0.6)}`, opacity: p(0.18, 0.22) }}>
        <div style={{ display: "flex", gap: 10, padding: "16px 20px", borderBottom: `1.5px solid ${T.line}` }}>
          <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 24, color: T.text, marginRight: 16 }}>🗂️ Project · Web v2</span>
          {views.map((v, i) => <Chip key={v} text={v} color={A.evt} solid={vHot === i} size={17} />)}
          <span style={{ marginLeft: "auto", opacity: p(0.3, 0.34) }}><Chip text="fields: priority · sprint" color={A.act} size={16} /></span>
        </div>
        {cols.map((c, ci) => (
          <div key={c} style={{ position: "absolute", left: 20 + ci * 365, top: 80, width: 345, height: 300, borderRadius: 12, background: T.panel }}>
            <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 20, color: T.muted, padding: "10px 14px" }}>{c}</div>
            {cards.filter((k) => k.col === ci).map((k, j) => (
              <div key={k.t} style={{ margin: "0 12px 10px", padding: "10px 12px", borderRadius: 10, background: T.bg1, border: `1.5px solid ${T.line}`, fontFamily: SANS, fontSize: 20, color: T.text }}>{k.t}</div>
            ))}
            {ci === 1 && !closed && <div style={{ margin: "0 12px", padding: "10px 12px", borderRadius: 10, background: mix(T.bg1, A.bad, 0.15), border: `1.5px solid ${A.bad}`, fontFamily: SANS, fontSize: 20, color: T.text }}>#128 Login on Safari</div>}
            {ci === 2 && closed && <div style={{ margin: "0 12px", padding: "10px 12px", borderRadius: 10, background: mix(T.bg1, A.act, 0.2), border: `1.5px solid ${A.act}`, fontFamily: SANS, fontSize: 20, color: T.text }}>#128 Login on Safari ✓</div>}
          </div>
        ))}
        <div style={{ position: "absolute", left: 40 + mover * 700, top: 330 - Math.sin(mover * Math.PI) * 60, padding: "8px 12px", borderRadius: 10, background: mix(T.bg1, A.evt, 0.3), border: `1.5px solid ${A.evt}`, fontFamily: SANS, fontSize: 19, color: T.text, opacity: 0.85 }}>#133 Search</div>
      </div>
      <div style={{ position: "absolute", left: 100, top: 640, width: 850, height: 230, borderRadius: 18, background: mix(T.panel, A.run, 0.08), border: `2px solid ${A.run}`, padding: "20px 24px", boxSizing: "border-box", opacity: p(0.66, 0.7) }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 30, color: T.text }}>💬 Discussions</div>
        {["❓ Q&A · “How do I self-host?”  ✓ answered", "💡 Ideas · “Plugin API?”  ▲ 48", "📣 Announcements · v2 roadmap"].map((t, i) => (
          <div key={i} style={{ fontFamily: SANS, fontSize: 23, color: T.muted, marginTop: 10, opacity: p(0.68 + i * 0.03, 0.71 + i * 0.03) }}>{t}</div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 990, top: 640, width: 830, height: 230, borderRadius: 18, background: mix(T.panel, A.act, 0.08), border: `2px solid ${A.act}`, padding: "20px 24px", boxSizing: "border-box", opacity: p(0.86, 0.9) }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 30, color: T.text }}>📖 Wiki</div>
        <div style={{ fontFamily: SANS, fontSize: 23, color: T.muted, marginTop: 10 }}>longer docs: architecture, runbooks, onboarding</div>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- codespaces
export const CodespacesScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const prov = p(0.1, 0.2);
  const ready = prov >= 1;
  return (
    <AbsoluteFill>
      <HeadC kicker="BUILD · CODESPACES" title="A full dev environment, in the cloud" color={A.act} o={p(0, 0.04)} />
      <Win x={100} y={200} w={1280} h={680} title="🌐 fantastic-space-waffle.github.dev" color={A.act} o={p(0.03, 0.07)} glow>
        {!ready && (
          <div style={{ position: "absolute", left: 0, right: 0, top: 200, textAlign: "center" }}>
            <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 34, color: T.text }}>Setting up your codespace…</div>
            <div style={{ width: 600, height: 16, borderRadius: 8, background: T.panel, margin: "26px auto" }}><div style={{ width: `${prov * 100}%`, height: 16, borderRadius: 8, background: A.act }} /></div>
            <div style={{ fontFamily: MONO, fontSize: 22, color: T.muted }}>4-core · 16 GB RAM · repo cloned · devcontainer building</div>
          </div>
        )}
        {ready && (
          <>
            <div style={{ position: "absolute", left: 0, top: 0, width: 60, height: 634, background: T.panel, display: "flex", flexDirection: "column", alignItems: "center", gap: 22, paddingTop: 20, fontSize: 26 }}>
              <span>📄</span><span>🔍</span><span>⎇</span><span>🧩</span>
            </div>
            <div style={{ position: "absolute", left: 60, top: 0, width: 250, height: 634, background: T.bg1, borderRight: `1px solid ${T.line}`, padding: "14px 16px", boxSizing: "border-box", fontFamily: MONO, fontSize: 19, color: T.muted, lineHeight: 1.7 }}>
              <div style={{ color: T.text }}>▾ web-app</div><div>&nbsp;▸ .devcontainer</div><div>&nbsp;▸ .github</div><div style={{ color: A.act }}>&nbsp;▾ src</div><div>&nbsp;&nbsp;&nbsp;app.ts</div><div>&nbsp;&nbsp;&nbsp;auth.ts</div><div>&nbsp;package.json</div>
            </div>
            <div style={{ position: "absolute", left: 330, top: 16, width: 920, fontFamily: MONO, fontSize: 22, lineHeight: 1.6 }}>
              {["import express from 'express';", "const app = express();", "", "app.get('/health', (_, res) =>", "  res.json({ ok: true }));", "", "app.listen(3000);"].map((l, i) => (
                <div key={i} style={{ whiteSpace: "pre", color: l.startsWith("import") ? A.act : T.text }}><span style={{ color: T.muted, marginRight: 20 }}>{i + 1}</span>{l}</div>
              ))}
            </div>
            <div style={{ position: "absolute", left: 310, top: 400, width: 970, height: 234, background: T.bg0, borderTop: `1.5px solid ${T.line}`, padding: "12px 20px", boxSizing: "border-box", fontFamily: MONO, fontSize: 21 }}>
              <div style={{ color: T.muted }}>TERMINAL</div>
              <Type text="$ npm run dev" p={p(0.24, 0.3)} color={T.text} mono size={21} />
              <div style={{ color: A.ok, opacity: p(0.3, 0.32), marginTop: 6 }}>✓ ready on port 3000 → forwarded to a private URL</div>
              <div style={{ color: T.muted, opacity: p(0.3, 0.32), marginTop: 6 }}>{Math.floor(frame / 15) % 2 ? "▌" : ""}</div>
            </div>
          </>
        )}
      </Win>
      <div style={{ position: "absolute", left: 1420, top: 200, width: 400, height: 330, borderRadius: 16, background: T.bg1, border: `2px solid ${mix(T.line, A.act, 0.6)}`, padding: "16px 18px", boxSizing: "border-box", opacity: p(0.4, 0.44) }}>
        <div style={{ fontFamily: MONO, fontSize: 18, color: A.act }}>.devcontainer/devcontainer.json</div>
        <div style={{ fontFamily: MONO, fontSize: 18, color: A.str, marginTop: 10, lineHeight: 1.6, whiteSpace: "pre" }}>{'{\n  "image": "…/typescript-node",\n  "features": { "docker": {} },\n  "postCreateCommand":\n    "npm ci"\n}'}</div>
      </div>
      <div style={{ position: "absolute", left: 1420, top: 555, width: 400, display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ opacity: p(0.46, 0.5) }}><Chip text="identical setup for all" color={A.ok} size={19} /></div>
        <div style={{ opacity: p(0.62, 0.66) }}><Chip text="free monthly core-hours" color={A.evt} size={19} /></div>
        {["👋 onboarding", "🔍 real PR reviews", "📱 code from a tablet"].map((t, i) => <div key={t} style={{ fontFamily: SANS, fontSize: 23, color: T.text, opacity: p(0.76 + i * 0.03, 0.79 + i * 0.03) }}>{t}</div>)}
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- copilot
export const CopilotScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const agentProg = p(0.44, 0.7);
  const agentSteps: [string, number][] = [["📋 reads issue #140", 0], ["✍️ writes the code", 0.25], ["🧪 runs tests (Actions env)", 0.5], ["🔀 opens draft PR #143", 0.8]];
  const panel = (x: number, y: number, h: string, i: string, o: number, c: string, children: React.ReactNode) => (
    <div style={{ position: "absolute", left: x, top: y, width: 830, height: 300, borderRadius: 18, background: T.bg1, border: `2px solid ${mix(T.line, c, 0.7)}`, opacity: o, padding: "16px 22px", boxSizing: "border-box", transform: `translateY(${(1 - o) * 20}px)` }}>
      <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 27, color: c }}>{i} {h}</div>
      {children}
    </div>
  );
  return (
    <AbsoluteFill>
      <HeadC kicker="BUILD · COPILOT" title="An AI pair — from autocomplete to agent" color={A.act} o={p(0, 0.04)} />
      {panel(100, 200, "In the editor: completions", "⌨️", p(0.08, 0.12), A.act, (
        <div style={{ fontFamily: MONO, fontSize: 22, marginTop: 16, lineHeight: 1.6 }}>
          <div style={{ color: T.text }}>function isValidEmail(s) {"{"}</div>
          <div style={{ color: mix(T.muted, T.bg1, 0.2), fontStyle: "italic" }}><Type text="  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s);" p={((frame % 150) / 150) * 1.4} color={T.muted} mono size={22} /></div>
          <div style={{ color: T.text }}>{"}"}</div>
          <div style={{ fontFamily: SANS, fontSize: 19, color: T.muted, marginTop: 6 }}>Tab to accept</div>
        </div>
      ))}
      {panel(990, 200, "Chat", "💬", p(0.15, 0.19), A.run, (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontFamily: SANS, fontSize: 21, color: T.text, background: T.panel, borderRadius: 10, padding: "8px 12px", width: 560 }}>Why does this workflow skip on PRs?</div>
          <div style={{ fontFamily: SANS, fontSize: 21, color: T.text, background: mix(T.panel, A.run, 0.18), borderRadius: 10, padding: "8px 12px", width: 700, marginTop: 10, marginLeft: 60, opacity: p(0.2, 0.24) }}>Your <span style={{ fontFamily: MONO, color: A.evt }}>paths</span> filter only matches <span style={{ fontFamily: MONO }}>src/**</span> — this PR changed docs only.</div>
        </div>
      ))}
      {panel(100, 520, "On github.com: code review", "🔍", p(0.28, 0.32), A.evt, (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontFamily: MONO, fontSize: 21, color: T.text, background: mix(T.bg1, A.ok, 0.14), padding: "4px 10px", whiteSpace: "pre" }}>+ const q = "SELECT * FROM users WHERE id=" + id;</div>
          <div style={{ marginTop: 10, borderRadius: 10, border: `1.5px solid ${A.evt}`, padding: "10px 14px", fontFamily: SANS, fontSize: 21, color: T.text, opacity: p(0.33, 0.37) }}>🤖 Copilot: string-built SQL → injection risk. Use a parameterized query.</div>
        </div>
      ))}
      {panel(990, 520, "Coding agent", "🤖", p(0.4, 0.44), A.ok, (
        <div style={{ marginTop: 10 }}>
          {agentSteps.map(([t, at], i) => {
            const s: St = agentProg > at + 0.2 ? "ok" : agentProg > at ? "running" : "queued";
            return <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: SANS, fontSize: 22, color: T.text, marginTop: 8 }}><StatusIcon s={p(0.72, 0.73) > 0.5 ? "ok" : s} size={22} />{t}</div>;
          })}
          <div style={{ position: "absolute", right: 20, bottom: 16, display: "flex", gap: 8, opacity: p(0.76, 0.8) }}>
            <Chip text="free tier + paid plans" color={A.evt} size={16} />
            <Chip text="you review" color={A.ok} size={16} o={p(0.86, 0.9)} />
          </div>
        </div>
      ))}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- advanced security
export const GhasScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const bumped = p(0.24, 0.26) > 0.5;
  const flowT = (frame % 90) / 90;
  const cols = [
    { h: "Dependabot", i: "🤖", c: A.run, at: 0.08 }, { h: "Code scanning", i: "🔎", c: A.act, at: 0.34 }, { h: "Secret scanning", i: "🔑", c: A.bad, at: 0.56 },
  ];
  return (
    <AbsoluteFill>
      <HeadC kicker="SECURE" title="Security built into every repository" color={A.bad} o={p(0, 0.04)} />
      {cols.map((c, i) => (
        <div key={i} style={{ position: "absolute", left: 140 + i * 560, top: 205, width: 520, height: 540, borderRadius: 20, background: mix(T.panel, c.c, 0.07), border: `2.5px solid ${c.c}`, opacity: p(c.at, c.at + 0.04), padding: "20px 24px", boxSizing: "border-box" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 44 }}>{c.i}</span>
            <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 34, color: c.c }}>{c.h}</span>
          </div>
          {i === 0 && (
            <div style={{ marginTop: 20 }}>
              <div style={{ borderRadius: 12, padding: "12px 14px", background: mix(T.bg1, A.bad, 0.14), border: `1.5px solid ${A.bad}`, fontFamily: SANS, fontSize: 21, color: T.text, opacity: bumped ? 0.4 : 1 }}>⚠ alert · lodash 4.17.20 · known vulnerability</div>
              <div style={{ marginTop: 14, borderRadius: 12, padding: "12px 14px", background: mix(T.bg1, A.ok, 0.14), border: `1.5px solid ${A.ok}`, fontFamily: SANS, fontSize: 21, color: T.text, opacity: p(0.18, 0.22) }}>🔀 PR: Bump lodash 4.17.20 → 4.17.21</div>
              <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 10, fontFamily: SANS, fontSize: 21, color: A.ok, opacity: p(0.24, 0.28) }}><StatusIcon s="ok" size={24} /> checks pass → merged</div>
              <div style={{ marginTop: 26, fontFamily: MONO, fontSize: 19, color: T.muted }}>also updates your actions/*@v…</div>
            </div>
          )}
          {i === 1 && (
            <div style={{ marginTop: 20, position: "relative", height: 380 }}>
              {[["source", "req.query.id", 0], ["flows to", "buildQuery(id)", 120], ["sink", "db.query(sql)", 240]].map(([k, v, y], j) => (
                <div key={j} style={{ position: "absolute", left: 0, top: y as number, width: 470, height: 90, borderRadius: 12, background: T.bg1, border: `1.5px solid ${j === 2 ? A.bad : A.act}`, padding: "10px 14px", boxSizing: "border-box", opacity: p(0.36 + j * 0.03, 0.39 + j * 0.03) }}>
                  <div style={{ fontFamily: MONO, fontSize: 17, color: T.muted }}>{k as string}</div>
                  <div style={{ fontFamily: MONO, fontSize: 21, color: j === 2 ? A.bad : T.text }}>{v as string}</div>
                </div>
              ))}
              <div style={{ position: "absolute", left: 440, top: 45 + flowT * 240, width: 14, height: 14, borderRadius: 7, background: A.act, boxShadow: `0 0 10px ${A.act}`, opacity: p(0.42, 0.45) }} />
              <div style={{ position: "absolute", left: 0, top: 344, opacity: p(0.46, 0.5) }}><Chip text="CodeQL: SQL injection → flagged in the PR" color={A.bad} size={17} /></div>
            </div>
          )}
          {i === 2 && (
            <div style={{ marginTop: 20 }}>
              <div style={{ borderRadius: 12, background: T.bg0, padding: "12px 14px", fontFamily: MONO, fontSize: 19, lineHeight: 1.55, border: `1.5px solid ${T.line}` }}>
                <div style={{ color: T.text }}>$ git push</div>
                <div style={{ color: A.bad, opacity: p(0.62, 0.64) }}>! [remote rejected]</div>
                <div style={{ color: A.bad, opacity: p(0.62, 0.64) }}>push protection:</div>
                <div style={{ color: A.bad, opacity: p(0.62, 0.64) }}>secret detected</div>
                <div style={{ color: T.muted, opacity: p(0.64, 0.66) }}>— AWS access key, config.js:3</div>
              </div>
              <div style={{ marginTop: 18, fontFamily: SANS, fontSize: 23, color: T.text, opacity: p(0.6, 0.63) }}>finds leaked keys & tokens in history</div>
              <div style={{ marginTop: 10, fontFamily: SANS, fontWeight: 700, fontSize: 23, color: A.ok, opacity: p(0.66, 0.7) }}>🛑 blocked before it reaches GitHub</div>
              <div style={{ position: "absolute", right: 24, top: 24, fontSize: 40, opacity: p(0.62, 0.64) * (0.6 + Math.sin(frame * 0.2) * 0.4) }}>🛑</div>
            </div>
          )}
        </div>
      ))}
      <div style={{ position: "absolute", left: 140, top: 775, width: 1640, display: "flex", gap: 16, justifyContent: "center", opacity: p(0.78, 0.82) }}>
        <Chip text="public repos: much of it free" color={A.ok} size={23} />
        <Chip text="private: GitHub Secret Protection · GitHub Code Security" color={A.act} size={23} />
      </div>
    </AbsoluteFill>
  );
};
