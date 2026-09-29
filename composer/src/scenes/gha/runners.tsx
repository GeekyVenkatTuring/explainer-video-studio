// gha/runners.tsx — chapters 3–4: events hub, path filters (computed glob), cron (computed schedule),
// dispatch form, hosted & self-hosted runners, job DAG + Gantt (computed), matrix (computed), services.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { mix, useP, rnd, MONO, SANS, Wire, Flow, Counter, Type } from "../../lib/primitives";
import { T, A, Win, HeadC, StatusIcon, St, Chip, CodeBlock, clamp01, ease } from "./core";

// ---------------------------------------------------------------- events hub
export const EventsScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const ev = [
    { n: "push", i: "⬆️", d: "commits land", at: 0.1 },
    { n: "pull_request", i: "🔀", d: "PR opened / updated", at: 0.13 },
    { n: "workflow_dispatch", i: "▶️", d: "manual Run button", at: 0.22 },
    { n: "schedule", i: "⏰", d: "cron timer", at: 0.3 },
    { n: "release", i: "🏷️", d: "version published", at: 0.37 },
    { n: "issues", i: "🐞", d: "issue opened / labeled", at: 0.44 },
    { n: "issue_comment", i: "💬", d: "someone comments", at: 0.47 },
    { n: "workflow_run", i: "⛓️", d: "after another workflow", at: 0.56 },
    { n: "repository_dispatch", i: "🌐", d: "external API call", at: 0.66 },
  ];
  const multi = p(0.8, 0.82) > 0.5;
  const hot = Math.floor(frame / 24) % ev.length;
  const active = multi ? [0, 1, 3] : [hot];
  return (
    <AbsoluteFill>
      <HeadC kicker="TRIGGERS · on:" title="The events that wake a workflow" color={A.evt} o={p(0, 0.04)} />
      {ev.map((e, i) => {
        const ang = (i / ev.length) * Math.PI * 2 - Math.PI / 2 + Math.sin(frame * 0.006) * 0.04;
        const x = 960 + Math.cos(ang) * 650, y = 555 + Math.sin(ang) * 285;
        const o = p(e.at, e.at + 0.04);
        const on = active.includes(i) && o > 0.9;
        return (
          <React.Fragment key={i}>
            <Wire x1={x} y1={y} x2={960} y2={555} p={p(e.at, e.at + 0.03)} color={on ? A.evt : mix(T.muted, T.bg1, 0.5)} w={on ? 3 : 2} arrow={false} />
            {on && <Flow x1={x} y1={y} x2={960} y2={555} color={A.evt} n={5} speed={0.02} />}
            <div style={{ position: "absolute", left: x - 170, top: y - 44, width: 340, height: 88, borderRadius: 16, boxSizing: "border-box", padding: "0 18px", display: "flex", alignItems: "center", gap: 14, background: mix(T.panel, A.evt, on ? 0.25 : 0.07), border: `2.5px solid ${on ? A.evt : mix(T.line, A.evt, 0.45)}`, opacity: o, transform: `scale(${on ? 1.06 : 1})` }}>
              <span style={{ fontSize: 36 }}>{e.i}</span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: e.n.length > 16 ? 20 : 23, color: T.text, whiteSpace: "nowrap" }}>{e.n}</div>
                <div style={{ fontFamily: SANS, fontSize: 20, color: T.muted, whiteSpace: "nowrap" }}>{e.d}</div>
              </div>
            </div>
          </React.Fragment>
        );
      })}
      <div style={{ position: "absolute", left: 790, top: 455, width: 340, height: 200, borderRadius: 20, background: T.bg1, border: `3px solid ${A.act}`, boxShadow: `0 0 ${30 + Math.sin(frame * 0.1) * 10}px ${mix(T.bg0, A.act, 0.5)}`, opacity: p(0.03, 0.08), padding: "18px 24px", boxSizing: "border-box" }}>
        <div style={{ fontFamily: MONO, fontSize: 21, color: A.act }}>ci.yml</div>
        <div style={{ fontFamily: MONO, fontSize: 25, color: A.key, marginTop: 6 }}>on:</div>
        {active.map((k) => <div key={k} style={{ fontFamily: MONO, fontSize: 23, color: A.evt, marginLeft: 24 }}>{ev[k].n}:</div>)}
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- path filters (computed glob)
const globRe = (g: string) => new RegExp("^" + g.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*\*/g, "\u0000").replace(/\*/g, "[^/]*").replace(/\u0000/g, ".*") + "$");
const PATTERNS = ["src/**", "package.json"];
const matchAny = (f: string) => PATTERNS.some((g) => globRe(g).test(f));
const PUSHES = [
  { n: "Push A", files: ["README.md", "docs/setup.md"], at: 0.44 },
  { n: "Push B", files: ["src/api/user.ts", "README.md"], at: 0.6 },
].map((ps) => ({ ...ps, hits: ps.files.map(matchAny), runs: ps.files.some(matchAny) }));

export const FilterScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const hiLine = p(0.22, 0.23) > 0.5 ? { a: 3, b: 5, c: A.evt } : p(0.1, 0.11) > 0.5 ? { a: 2, b: 2, c: A.run } : null;
  return (
    <AbsoluteFill>
      <HeadC kicker="FILTERS" title="Run only when it matters: branches · paths · types" color={A.evt} o={p(0, 0.04)} />
      <Win x={100} y={200} w={660} h={360} title="ci.yml" color={A.evt} o={p(0.02, 0.06)}>
        <CodeBlock lines={["on:", "  push:", "    branches: [main]", "    paths:", "      - 'src/**'", "      - 'package.json'"]} reveal={p(0.03, 0.12)} x={26} y={20} w={600} size={27} hi={hiLine} />
      </Win>
      {/* branches demo */}
      <div style={{ position: "absolute", left: 100, top: 590, width: 660, opacity: p(0.1, 0.14) }}>
        <div style={{ fontFamily: MONO, fontSize: 22, color: A.run, marginBottom: 10 }}>branches: [main]</div>
        <div style={{ display: "flex", gap: 14 }}>
          <Chip text="main ✓ runs" color={A.ok} size={22} />
          <Chip text="feat/x ✕ ignored" color={A.bad} size={22} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 100, top: 720, width: 660, opacity: p(0.8, 0.84) }}>
        <div style={{ fontFamily: MONO, fontSize: 22, color: A.act, marginBottom: 10 }}>pull_request: types:</div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {["opened", "synchronize", "labeled", "reopened"].map((t, i) => <Chip key={t} text={t} color={A.act} size={20} solid={Math.floor(frame / 24) % 4 === i} />)}
        </div>
      </div>
      {PUSHES.map((ps, pi) => {
        const o = p(ps.at, ps.at + 0.04);
        const y = 200 + pi * 345;
        const verdict = p(ps.at + 0.08, ps.at + 0.1);
        return (
          <div key={pi} style={{ position: "absolute", left: 810, top: y, width: 1010, height: 325, borderRadius: 20, boxSizing: "border-box", padding: "22px 28px", background: mix(T.panel, ps.runs ? A.ok : A.gray, 0.08), border: `2.5px solid ${verdict > 0.5 ? (ps.runs ? A.ok : A.gray) : T.line}`, opacity: o, transform: `translateX(${(1 - o) * 40}px)` }}>
            <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 32, color: T.text }}>{ps.n} <span style={{ fontFamily: MONO, fontSize: 21, color: T.muted, fontWeight: 400 }}>· changed files</span></div>
            {ps.files.map((f, fi) => {
              const fo = p(ps.at + 0.02 + fi * 0.025, ps.at + 0.04 + fi * 0.025);
              const hit = ps.hits[fi];
              return (
                <div key={fi} style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 16, opacity: fo }}>
                  <span style={{ fontFamily: MONO, fontSize: 25, color: T.text, width: 340 }}>📄 {f}</span>
                  <span style={{ fontFamily: MONO, fontSize: 19, color: T.muted, width: 300, whiteSpace: "nowrap" }}>vs src/** · package.json</span>
                  <StatusIcon s={hit ? "ok" : "fail"} size={30} />
                  <span style={{ fontFamily: MONO, fontSize: 22, color: hit ? A.ok : A.bad }}>{hit ? "match" : "no match"}</span>
                </div>
              );
            })}
            <div style={{ position: "absolute", right: 28, bottom: 22, opacity: verdict, transform: `scale(${0.8 + 0.2 * verdict})` }}>
              {ps.runs
                ? <Chip text="▶ workflow RUNS" color={A.ok} solid size={27} style={{ boxShadow: `0 0 ${18 + Math.sin(frame * 0.12) * 8}px ${A.ok}` }} />
                : <Chip text="⤼ workflow SKIPPED" color={A.gray} solid size={27} />}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- cron (computed)
type CronF = (v: number) => boolean;
const cronField = (s: string): CronF => {
  if (s === "*") return () => true;
  const parts = s.split(",").map((pt) => {
    const [rng, step] = pt.split("/");
    const st = step ? parseInt(step) : 1;
    if (rng === "*") return (v: number) => v % st === 0;
    const [a, b] = rng.split("-").map(Number);
    const hi = b === undefined ? a : b;
    return (v: number) => v >= a && v <= hi && (v - a) % st === 0;
  });
  return (v) => parts.some((f) => f(v));
};
const CRON_CACHE: Record<string, Date[]> = {};
const nextFires = (expr: string, n: number): Date[] => {
  if (CRON_CACHE[expr]) return CRON_CACHE[expr];
  const [mi, h, dom, mo, dow] = expr.split(/\s+/).map(cronField);
  const out: Date[] = [];
  let t = Date.UTC(2026, 8, 21, 0, 0); // Mon 21 Sep 2026 00:00 UTC
  for (let k = 0; k < 60 * 24 * 14 && out.length < n; k++, t += 60000) {
    const d = new Date(t);
    if (mi(d.getUTCMinutes()) && h(d.getUTCHours()) && dom(d.getUTCDate()) && mo(d.getUTCMonth() + 1) && dow(d.getUTCDay())) out.push(d);
  }
  CRON_CACHE[expr] = out;
  return out;
};
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const hhmm = (m: number) => `${String(Math.floor(m / 60) % 24).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

export const CronScene: React.FC<{ dur?: number; expr?: string }> = ({ dur, expr = "30 2 * * 1-5" }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const f = expr.split(/\s+/);
  const names = ["minute", "hour", "day of month", "month", "day of week"];
  const means = [f[0], f[1], f[2] === "*" ? "every" : f[2], f[3] === "*" ? "every" : f[3], f[4] === "1-5" ? "Mon–Fri" : f[4]];
  const fires = nextFires(expr, 7);
  const utcMin = fires.length ? fires[0].getUTCHours() * 60 + fires[0].getUTCMinutes() : 0;
  const istMin = utcMin + 330;
  const firedDays = new Set(fires.map((d) => (d.getUTCDay() + 6) % 7));
  const G0 = 130, GW = 140, Y0 = 490, YH = 360; // week grid: 24h → 360px
  const sweep = (frame * 0.9) % (7 * GW);
  const rules = [
    { t: "runs on the default branch", at: 0.55 }, { t: "may start a few minutes late", at: 0.6 },
    { t: "no more often than every 5 min", at: 0.66 }, { t: "public repo idle 60 days → paused", at: 0.74 },
  ];
  return (
    <AbsoluteFill>
      <HeadC kicker="on: schedule" title="Cron: run on a timer (always in UTC)" color={A.evt} o={p(0, 0.04)} />
      <div style={{ position: "absolute", left: 130, top: 215, display: "flex", gap: 22 }}>
        {f.map((v, i) => {
          const o = p(0.06 + i * 0.03, 0.09 + i * 0.03);
          return (
            <div key={i} style={{ width: 300, height: 180, borderRadius: 18, background: mix(T.panel, A.evt, 0.1), border: `2.5px solid ${mix(T.line, A.evt, 0.7)}`, opacity: o, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transform: `translateY(${(1 - o) * 20}px)` }}>
              <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 64, color: A.evt }}>{v}</div>
              <div style={{ fontFamily: MONO, fontSize: 21, color: T.muted, marginTop: 4 }}>{names[i]}</div>
              <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 24, color: T.text, marginTop: 4, opacity: p(0.2, 0.24) }}>{means[i]}</div>
            </div>
          );
        })}
      </div>
      {/* week grid, computed fires */}
      <div style={{ opacity: p(0.24, 0.3) }}>
        {DAYS.map((d, i) => {
          const fired = firedDays.has(i);
          const x = G0 + i * GW;
          const passing = Math.abs(sweep - (i * GW + GW / 2)) < GW / 2;
          return (
            <React.Fragment key={i}>
              <div style={{ position: "absolute", left: x, top: Y0 - 44, width: GW - 14, textAlign: "center", fontFamily: MONO, fontWeight: 700, fontSize: 23, color: fired ? T.text : T.muted }}>{d}</div>
              <div style={{ position: "absolute", left: x, top: Y0, width: GW - 14, height: YH, borderRadius: 12, background: mix(T.panel, fired ? A.evt : T.panel, passing ? 0.12 : 0.04), border: `1.5px solid ${T.line}` }} />
              {fired && (
                <>
                  <div style={{ position: "absolute", left: x + 14, top: Y0 + (utcMin / 1440) * YH - 16, width: GW - 42, height: 32, borderRadius: 8, background: A.evt, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontWeight: 800, fontSize: 19, color: T.bg0, boxShadow: passing ? `0 0 18px ${A.evt}` : "none" }}>{hhmm(utcMin)}</div>
                  <div style={{ position: "absolute", left: x + 14, top: Y0 + (istMin / 1440) * YH - 16, width: GW - 42, height: 32, borderRadius: 8, border: `2px solid ${A.run}`, background: mix(T.panel, A.run, 0.2), display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontWeight: 800, fontSize: 19, color: A.run, opacity: p(0.36, 0.4) }}>{hhmm(istMin)}</div>
                </>
              )}
            </React.Fragment>
          );
        })}
        <div style={{ position: "absolute", left: G0 + sweep, top: Y0 - 6, width: 3, height: YH + 12, background: A.evt, opacity: 0.6, boxShadow: `0 0 10px ${A.evt}` }} />
      </div>
      <div style={{ position: "absolute", left: 130, top: Y0 + YH + 10, width: 970, fontFamily: MONO, fontSize: 21, color: T.muted, opacity: p(0.3, 0.36) }}>
        next runs (computed): {fires.slice(0, 3).map((d) => `${DAYS[(d.getUTCDay() + 6) % 7]} ${d.getUTCDate()} Sep`).join(" · ")} …
      </div>
      <div style={{ position: "absolute", left: 1130, top: 450, width: 690, opacity: p(0.36, 0.4) }}>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <Chip text={`${hhmm(utcMin)} UTC`} color={A.evt} solid size={26} />
          <span style={{ fontFamily: MONO, fontSize: 26, color: T.muted }}>+5:30 →</span>
          <Chip text={`${hhmm(istMin)} IST`} color={A.run} solid size={26} />
        </div>
        <div style={{ marginTop: 30, display: "flex", flexDirection: "column", gap: 14 }}>
          {rules.map((r, i) => (
            <div key={i} style={{ opacity: p(r.at, r.at + 0.04), display: "flex", gap: 14, alignItems: "center", fontFamily: SANS, fontSize: 27, color: T.text }}>
              <span style={{ color: A.evt, fontFamily: MONO, fontWeight: 800 }}>!</span>{r.t}
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- workflow_dispatch form
export const DispatchScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const envSel = p(0.36, 0.38) > 0.5 ? "production" : "staging";
  const dry = p(0.41, 0.42) > 0.5;
  const clicked = p(0.46, 0.47) > 0.5;
  return (
    <AbsoluteFill>
      <HeadC kicker="on: workflow_dispatch" title="A Run button — with inputs" color={A.evt} o={p(0, 0.04)} />
      <Win x={100} y={200} w={800} h={500} title="deploy.yml" color={A.evt} o={p(0.02, 0.06)}>
        <CodeBlock lines={["on:", "  workflow_dispatch:", "    inputs:", "      environment:", "        type: choice", "        options: [staging, production]", "      dry_run:", "        type: boolean", "jobs:", "  deploy:", "    steps:", "      - run: ./deploy.sh ${{ inputs.environment }}"]}
          reveal={p(0.04, 0.2)} x={24} y={14} w={740} size={23} lh={1.5}
          hi={p(0.52, 0.53) > 0.5 ? { a: 11, b: 11, c: A.evt } : p(0.12, 0.13) > 0.5 ? { a: 2, b: 7, c: A.act } : null} />
      </Win>
      {/* form mock */}
      <div style={{ position: "absolute", left: 960, top: 200, width: 860, height: 500, borderRadius: 18, background: T.bg1, border: `2px solid ${mix(T.line, A.ok, 0.6)}`, opacity: p(0.3, 0.34), boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }}>
        <div style={{ padding: "22px 28px", borderBottom: `1.5px solid ${T.line}`, fontFamily: SANS, fontWeight: 800, fontSize: 28, color: T.text }}>Run workflow <span style={{ fontFamily: MONO, fontSize: 20, color: T.muted, fontWeight: 400 }}>· deploy.yml</span></div>
        <div style={{ padding: "18px 28px" }}>
          <div style={{ fontFamily: SANS, fontSize: 22, color: T.muted }}>Use workflow from</div>
          <div style={{ marginTop: 8, width: 300, padding: "10px 16px", borderRadius: 10, border: `1.5px solid ${T.line}`, fontFamily: MONO, fontSize: 22, color: T.text }}>⎇ main ▾</div>
          <div style={{ fontFamily: SANS, fontSize: 22, color: T.muted, marginTop: 20 }}>environment *</div>
          <div style={{ marginTop: 8, width: 400, padding: "10px 16px", borderRadius: 10, border: `2px solid ${p(0.34, 0.4) > 0 && p(0.34, 0.4) < 1 ? A.run : T.line}`, fontFamily: MONO, fontSize: 24, color: envSel === "production" ? A.evt : T.text }}>{envSel} ▾</div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 24 }}>
            <div style={{ width: 30, height: 30, borderRadius: 7, border: `2px solid ${dry ? A.run : T.muted}`, background: dry ? A.run : "transparent", display: "flex", alignItems: "center", justifyContent: "center", color: T.bg0, fontWeight: 800, fontSize: 22 }}>{dry ? "✓" : ""}</div>
            <span style={{ fontFamily: MONO, fontSize: 24, color: T.text }}>dry_run</span>
          </div>
          <div style={{ marginTop: 28, width: 260, height: 62, borderRadius: 12, background: A.ok, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontWeight: 800, fontSize: 26, color: T.bg0, transform: `scale(${clicked && !p(0.48, 0.49) ? 0.94 : 1})`, boxShadow: clicked ? `0 0 ${18 + Math.sin(frame * 0.12) * 8}px ${A.ok}` : "none" }}>Run workflow</div>
        </div>
        {clicked && (
          <div style={{ position: "absolute", right: 28, bottom: 28, display: "flex", alignItems: "center", gap: 12, fontFamily: MONO, fontSize: 22, color: T.text }}>
            <StatusIcon s="running" size={26} /> Deploy #46 · production
          </div>
        )}
      </div>
      <div style={{ position: "absolute", left: 100, top: 730, width: 800, opacity: p(0.52, 0.56) }}>
        <Chip text="${{ inputs.environment }}  →  production" color={A.evt} size={24} />
        <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
          {["one-click deploys", "DB migrations", "on-purpose jobs"].map((t, i) => <Chip key={t} text={t} color={A.ok} size={20} o={p(0.6 + i * 0.05, 0.64 + i * 0.05)} />)}
        </div>
      </div>
      <div style={{ position: "absolute", left: 960, top: 730, width: 860, height: 130, borderRadius: 14, background: T.bg0, border: `1.5px solid ${T.line}`, padding: "18px 22px", boxSizing: "border-box", opacity: p(0.8, 0.84) }}>
        <Type text="$ gh workflow run deploy.yml -f environment=production -f dry_run=true" p={p(0.82, 0.95)} color={A.ok} mono size={23} />
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- hosted runners
export const HostedScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const cards = [
    { i: "🐧", n: "ubuntu-latest", d: "Linux · the default", c: A.run, at: 0.07 },
    { i: "🪟", n: "windows-latest", d: "Windows Server", c: A.run, at: 0.1 },
    { i: "🍎", n: "macos-latest", d: "macOS · iOS builds", c: A.run, at: 0.13 },
    { i: "💪", n: "ubuntu-24.04-arm", d: "Arm64 runners", c: A.act, at: 0.3 },
    { i: "🏋️", n: "larger runners", d: "more cores, more RAM", c: A.act, at: 0.33 },
    { i: "🎮", n: "GPU runners", d: "ML & graphics jobs", c: A.act, at: 0.36 },
  ];
  const period = 150;
  const cyc = (frame % period) / period;
  const jobNo = 1000 + Math.floor(frame / period);
  const stage = cyc < 0.2 ? 0 : cyc < 0.75 ? 1 : 2; // boot / run / wipe
  const scale = stage === 0 ? ease(cyc / 0.2) : stage === 2 ? 1 - ease((cyc - 0.75) / 0.25) : 1;
  const runProg = clamp01((cyc - 0.2) / 0.55);
  return (
    <AbsoluteFill>
      <HeadC kicker="GITHUB-HOSTED RUNNERS" title="runs-on: a fresh machine for every job" color={A.run} o={p(0, 0.04)} />
      {cards.map((c, i) => {
        const x = 140 + (i % 3) * 560, y = 205 + Math.floor(i / 3) * 160;
        const o = p(c.at, c.at + 0.04);
        return (
          <div key={i} style={{ position: "absolute", left: x, top: y, width: 520, height: 140, borderRadius: 18, boxSizing: "border-box", padding: "0 26px", display: "flex", alignItems: "center", gap: 20, background: mix(T.panel, c.c, 0.09), border: `2.5px solid ${mix(T.line, c.c, 0.7)}`, opacity: o, transform: `translateY(${(1 - o) * 20}px)` }}>
            <span style={{ fontSize: 54 }}>{c.i}</span>
            <div>
              <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 28, color: c.c }}>{c.n}</div>
              <div style={{ fontFamily: SANS, fontSize: 24, color: T.muted, marginTop: 4 }}>{c.d}</div>
            </div>
          </div>
        );
      })}
      {/* ephemeral lifecycle */}
      <div style={{ position: "absolute", left: 140, top: 545, width: 1640, height: 330, borderRadius: 22, border: `2px dashed ${mix(T.line, A.run, 0.6)}`, opacity: p(0.44, 0.5) }}>
        <div style={{ position: "absolute", left: 28, top: 20, fontFamily: MONO, fontWeight: 700, fontSize: 24, color: A.run }}>EPHEMERAL · create → run → wipe, every job</div>
        {["🆕 boot clean VM", "⚙️ run the job", "🧹 wipe it"].map((s, i) => (
          <div key={i} style={{ position: "absolute", left: 28, top: 80 + i * 76, width: 360, height: 60, borderRadius: 12, display: "flex", alignItems: "center", gap: 12, padding: "0 16px", boxSizing: "border-box", background: mix(T.panel, A.run, stage === i ? 0.3 : 0.06), border: `2px solid ${stage === i ? A.run : T.line}`, fontFamily: SANS, fontSize: 25, color: T.text }}>{s}</div>
        ))}
        <div style={{ position: "absolute", left: 480, top: 70, width: 620, height: 230, borderRadius: 18, background: mix(T.bg1, A.run, 0.12), border: `3px solid ${A.run}`, transform: `scale(${Math.max(0.02, scale)})`, opacity: Math.max(0.05, scale), boxShadow: `0 0 30px ${mix(T.bg0, A.run, 0.4)}` }}>
          <div style={{ position: "absolute", left: 20, top: 14, fontFamily: MONO, fontSize: 22, color: A.run }}>vm · job #{jobNo}</div>
          {[0, 1, 2, 3].map((k) => (
            <div key={k} style={{ position: "absolute", left: 20, top: 56 + k * 40, display: "flex", alignItems: "center", gap: 10, fontFamily: MONO, fontSize: 21, color: T.text }}>
              <StatusIcon s={runProg * 4 > k + 1 ? "ok" : runProg * 4 > k ? "running" : "queued"} size={22} />
              {["checkout", "setup-node", "npm ci", "npm test"][k]}
            </div>
          ))}
        </div>
        {stage === 2 && Array.from({ length: 14 }).map((_, k) => {
          const u = (cyc - 0.75) / 0.25;
          return <div key={k} style={{ position: "absolute", left: 790 + (rnd(k, 1) - 0.5) * 700 * u, top: 185 + (rnd(k, 2) - 0.5) * 300 * u, width: 10, height: 10, borderRadius: 5, background: A.run, opacity: 1 - u }} />;
        })}
        <div style={{ position: "absolute", left: 1150, top: 90, width: 460, fontFamily: SANS, fontSize: 27, color: T.text, lineHeight: 1.45, opacity: p(0.56, 0.6) }}>
          Nothing leaks between runs → <span style={{ color: A.ok, fontWeight: 700 }}>reproducible</span>
          <div style={{ marginTop: 10, color: T.muted, fontSize: 24 }}>…so cache what you want to keep</div>
        </div>
        <div style={{ position: "absolute", left: 1150, top: 230, opacity: p(0.84, 0.88) }}><Chip text="⏱ up to 6 h per job" color={A.evt} size={24} /></div>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- self-hosted + ARC autoscaling (computed)
const QUEUE = (t: number) => Math.max(0, Math.round(4 + 3.5 * Math.sin(t * 0.021) + 2.5 * Math.sin(t * 0.047 + 1)));
export const SelfHostedScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const q = QUEUE(frame);
  const pods = Math.max(1, Math.min(10, q));
  const hist = Array.from({ length: 60 }).map((_, i) => QUEUE(frame - (59 - i) * 5));
  return (
    <AbsoluteFill>
      <HeadC kicker="SELF-HOSTED RUNNERS" title="Your machines, registered with GitHub" color={A.run} o={p(0, 0.04)} />
      <div style={{ position: "absolute", left: 100, top: 220, width: 520, height: 300, borderRadius: 22, background: mix(T.panel, A.act, 0.08), border: `2.5px solid ${A.act}`, opacity: p(0.03, 0.08) }}>
        <div style={{ position: "absolute", left: 26, top: 18, fontFamily: SANS, fontWeight: 800, fontSize: 32, color: T.text }}>☁️ GitHub</div>
        <div style={{ position: "absolute", left: 26, top: 74, fontFamily: MONO, fontSize: 22, color: T.muted }}>job queue</div>
        <div style={{ position: "absolute", left: 26, top: 112, display: "flex", flexWrap: "wrap", gap: 8, width: 470 }}>
          {Array.from({ length: q }).map((_, i) => <div key={i} style={{ width: 42, height: 42, borderRadius: 8, background: mix(T.panel, A.evt, 0.3), border: `2px solid ${A.evt}`, display: "flex", alignItems: "center", justifyContent: "center" }}><StatusIcon s="queued" size={20} /></div>)}
        </div>
      </div>
      <Wire x1={1120} y1={300} x2={625} y2={300} p={p(0.1, 0.14)} color={A.run} curve={40} />
      <Wire x1={625} y1={440} x2={1120} y2={440} p={p(0.14, 0.18)} color={A.evt} curve={-40} />
      <Flow x1={625} y1={440} x2={1120} y2={440} curve={-40} color={A.evt} o={p(0.18, 0.22)} n={5} />
      <div style={{ position: "absolute", left: 700, top: 232, width: 340, textAlign: "center", fontFamily: MONO, fontSize: 21, color: A.run, opacity: p(0.1, 0.14) }}>agent: “any jobs for me?”</div>
      <div style={{ position: "absolute", left: 700, top: 490, width: 340, textAlign: "center", fontFamily: MONO, fontSize: 21, color: A.evt, opacity: p(0.16, 0.2) }}>job → run → report back</div>
      <div style={{ position: "absolute", left: 1130, top: 220, width: 690, height: 420, borderRadius: 22, background: mix(T.panel, A.run, 0.07), border: `2.5px solid ${A.run}`, opacity: p(0.06, 0.1) }}>
        <div style={{ position: "absolute", left: 26, top: 18, fontFamily: SANS, fontWeight: 800, fontSize: 30, color: T.text }}>🏢 your infrastructure</div>
        <div style={{ position: "absolute", left: 26, top: 368, opacity: p(0.44, 0.48) }}><Chip text="☸ Actions Runner Controller on Kubernetes" color={A.run} size={19} /></div>
        <div style={{ position: "absolute", left: 26, top: 80, fontFamily: MONO, fontSize: 22, color: T.muted, opacity: p(0.44, 0.48) }}>runner pods: <span style={{ color: A.ok, fontWeight: 800 }}>{pods}</span> (scale with queue)</div>
        <div style={{ position: "absolute", left: 26, top: 124, display: "grid", gridTemplateColumns: "repeat(5, 118px)", gap: 14 }}>
          {Array.from({ length: 10 }).map((_, i) => {
            const on = i < pods && p(0.44, 0.48) > 0.5 || i < 2;
            return <div key={i} style={{ height: 110, borderRadius: 14, background: on ? mix(T.panel, A.run, 0.25) : T.bg1, border: `2px ${on ? "solid" : "dashed"} ${on ? A.run : T.line}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, transition: "none" }}>
              <span style={{ fontSize: 30, opacity: on ? 1 : 0.2 }}>🖥️</span>
              {on && <StatusIcon s={i < Math.min(pods, q) ? "running" : "queued"} size={20} />}
            </div>;
          })}
        </div>
      </div>
      <div style={{ position: "absolute", left: 100, top: 560, width: 520, opacity: p(0.26, 0.3) }}>
        {["🧰 special hardware", "🔐 private network access", "💸 cheaper for heavy loads"].map((t, i) => (
          <div key={i} style={{ fontFamily: SANS, fontSize: 27, color: T.text, marginBottom: 12, opacity: p(0.26 + i * 0.04, 0.3 + i * 0.04) }}>{t}</div>
        ))}
      </div>
      {/* queue vs pods sparkline */}
      <svg width={690} height={120} style={{ position: "absolute", left: 1130, top: 660, opacity: p(0.46, 0.5) }}>
        <polyline points={hist.map((v, i) => `${i * 11.5},${110 - v * 9}`).join(" ")} fill="none" stroke={A.evt} strokeWidth={3} />
        <polyline points={hist.map((v, i) => `${i * 11.5},${110 - Math.max(1, Math.min(10, v)) * 9 + 4}`).join(" ")} fill="none" stroke={A.run} strokeWidth={3} strokeDasharray="8 6" />
        <text x={4} y={20} fill={A.evt} fontFamily="monospace" fontSize={19}>— queue</text>
        <text x={110} y={20} fill={A.run} fontFamily="monospace" fontSize={19}>- - pods</text>
      </svg>
      <div style={{ position: "absolute", left: 100, top: 740, width: 1000, opacity: p(0.64, 0.68) }}>
        <Chip text="you own: patching · security · cleanup" color={A.evt} size={23} />
      </div>
      <div style={{ position: "absolute", left: 100, top: 810, width: 1720, opacity: p(0.8, 0.84) }}>
        <Chip text="⚠ never on public repos — a fork's PR could run code on your machine" color={A.bad} solid size={25} style={{ opacity: 0.75 + Math.sin(frame * 0.12) * 0.25 }} />
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- DAG + Gantt (computed)
type Job = { id: string; d: number; needs: string[]; lv: number; row: number };
const JOBS: Job[] = [
  { id: "build", d: 2, needs: [], lv: 0, row: 0 }, { id: "lint", d: 1, needs: [], lv: 0, row: 1 }, { id: "docs", d: 1, needs: [], lv: 0, row: 2 },
  { id: "unit", d: 3, needs: ["build"], lv: 1, row: 0 }, { id: "e2e", d: 3, needs: ["build"], lv: 1, row: 1 },
  { id: "deploy", d: 1, needs: ["unit", "lint", "e2e"], lv: 2, row: 0 },
];
const ES: Record<string, number> = {};
JOBS.forEach((j) => { ES[j.id] = Math.max(0, ...j.needs.map((n) => ES[n] + JOBS.find((x) => x.id === n)!.d)); });
const PAR = Math.max(...JOBS.map((j) => ES[j.id] + j.d));      // 6
const SER = JOBS.reduce((s, j) => s + j.d, 0);                   // 11
const SER_START: Record<string, number> = {};
JOBS.reduce((s, j) => { SER_START[j.id] = s; return s + j.d; }, 0);

export const DagScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const edges = p(0.2, 0.32);
  const failMode = p(0.82, 0.84) > 0.5;
  const pos = (j: Job): [number, number] => [110 + j.lv * 240, 250 + j.row * 130 + (j.lv === 2 ? 130 : j.lv === 1 ? 65 : 0)];
  const clock = ((frame % 210) / 210) * (PAR + 1);
  const morph = ease(p(0.68, 0.74));
  const X0 = 960, SC = 72, R0 = 250, RH = 62;
  const stOf = (j: Job): St => {
    if (failMode) return j.id === "build" ? "fail" : ["unit", "e2e", "deploy"].includes(j.id) ? "skip" : "ok";
    if (p(0.1, 0.11) < 0.5) return "queued";
    if (edges < 1) return j.needs.length === 0 ? "running" : "queued";
    return clock >= ES[j.id] + j.d ? "ok" : clock >= ES[j.id] ? "running" : "queued";
  };
  return (
    <AbsoluteFill>
      <HeadC kicker="JOBS · needs:" title="Parallel by default, ordered by a graph" color={A.run} o={p(0, 0.04)} />
      {JOBS.flatMap((j) => j.needs.map((n) => {
        const a = pos(JOBS.find((x) => x.id === n)!), b = pos(j);
        return <Wire key={n + j.id} x1={a[0] + 200} y1={a[1] + 40} x2={b[0]} y2={b[1] + 40} p={edges} color={failMode ? A.bad : A.run} w={2.5} />;
      }))}
      {JOBS.map((j) => {
        const [x, y] = pos(j);
        const s = stOf(j);
        const col = s === "fail" ? A.bad : s === "skip" ? A.gray : s === "ok" ? A.ok : s === "running" ? A.evt : A.run;
        return (
          <div key={j.id} style={{ position: "absolute", left: x, top: y, width: 200, height: 80, borderRadius: 14, boxSizing: "border-box", padding: "0 16px", display: "flex", alignItems: "center", gap: 12, background: mix(T.panel, col, 0.14), border: `2.5px solid ${col}`, opacity: p(0.04, 0.1) }}>
            <StatusIcon s={s} size={28} />
            <div>
              <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 25, color: T.text }}>{j.id}</div>
              <div style={{ fontFamily: MONO, fontSize: 18, color: T.muted }}>{j.d} min</div>
            </div>
          </div>
        );
      })}
      {/* gantt */}
      <div style={{ opacity: p(0.5, 0.55) }}>
        {Array.from({ length: SER + 1 }).map((_, t) => (
          <div key={t} style={{ position: "absolute", left: X0 + t * SC, top: R0 - 34, width: 1, height: JOBS.length * RH + 34, background: T.line }}>
            <span style={{ position: "absolute", top: -2, left: 4, fontFamily: MONO, fontSize: 17, color: T.muted }}>{t}</span>
          </div>
        ))}
        {JOBS.map((j, i) => {
          const st = SER_START[j.id] + (ES[j.id] - SER_START[j.id]) * morph;
          return (
            <React.Fragment key={j.id}>
              <div style={{ position: "absolute", left: X0 - 110, top: R0 + i * RH + 10, width: 100, textAlign: "right", fontFamily: MONO, fontSize: 21, color: T.text }}>{j.id}</div>
              <div style={{ position: "absolute", left: X0 + st * SC, top: R0 + i * RH + 8, width: j.d * SC - 4, height: RH - 18, borderRadius: 8, background: failMode && ["unit", "e2e", "deploy"].includes(j.id) ? mix(T.panel, A.gray, 0.3) : `linear-gradient(90deg, ${mix(T.panel, A.run, 0.6)}, ${A.run})` }} />
            </React.Fragment>
          );
        })}
        {p(0.74, 0.75) > 0.5 && <div style={{ position: "absolute", left: X0 + Math.min(clock, PAR) * SC, top: R0 - 10, width: 3, height: JOBS.length * RH + 10, background: A.evt, boxShadow: `0 0 10px ${A.evt}` }} />}
      </div>
      <div style={{ position: "absolute", left: 960, top: 660, width: 860, display: "flex", gap: 30 }}>
        <div style={{ flex: 1, borderRadius: 18, padding: "18px 24px", background: mix(T.panel, A.bad, 0.1), border: `2px solid ${mix(T.line, A.bad, 0.6)}`, opacity: p(0.6, 0.63) }}>
          <div style={{ fontFamily: MONO, fontSize: 21, color: T.muted }}>one after another</div>
          <Counter p={p(0.6, 0.66)} to={SER} suffix=" min" color={A.bad} size={56} />
        </div>
        <div style={{ flex: 1, borderRadius: 18, padding: "18px 24px", background: mix(T.panel, A.ok, 0.12), border: `2px solid ${A.ok}`, opacity: p(0.69, 0.72), boxShadow: `0 0 ${20 + Math.sin(frame * 0.1) * 8}px ${mix(T.bg0, A.ok, 0.4)}` }}>
          <div style={{ fontFamily: MONO, fontSize: 21, color: T.muted }}>as a graph</div>
          <Counter p={p(0.69, 0.75)} to={PAR} suffix=" min" color={A.ok} size={56} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 130, top: 690, width: 760, fontFamily: SANS, fontSize: 27, color: failMode ? A.bad : T.muted, opacity: p(0.2, 0.26), lineHeight: 1.4 }}>
        {failMode ? "✕ build failed → unit, e2e, deploy skipped. A broken build never ships." : "unit + e2e need build · deploy needs every check"}
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- matrix (computed)
const OS = [{ k: "ubuntu", i: "🐧" }, { k: "windows", i: "🪟" }, { k: "macos", i: "🍎" }];
const NODE = [18, 20, 22, 24];
const EXCL = { os: "windows", node: 18 };
const INCL = { os: "ubuntu", node: 24 };
const COMBOS = OS.flatMap((o) => [18, 20, 22].map((n) => ({ os: o.k, node: n })));
const COUNT = COMBOS.filter((c) => !(c.os === EXCL.os && c.node === EXCL.node)).length + 1; // = 9

export const MatrixScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const X0 = 900, Y0 = 300, CW = 210, CH = 130, GP = 20;
  const failAt = p(0.62, 0.63) > 0.5;
  const fastDone = p(0.7, 0.71) > 0.5;
  const counter = p(0.46, 0.48) > 0.5 ? COUNT : p(0.3, 0.32) > 0.5 ? 9 : 0;
  return (
    <AbsoluteFill>
      <HeadC kicker="strategy: matrix" title="One job definition, many combinations" color={A.run} o={p(0, 0.04)} />
      <Win x={100} y={200} w={700} h={560} title="test.yml" color={A.run} o={p(0.02, 0.06)}>
        <CodeBlock lines={["strategy:", "  fail-fast: true", "  matrix:", "    os: [ubuntu, windows, macos]", "    node: [18, 20, 22]", "    exclude:", "      - os: windows", "        node: 18", "    include:", "      - os: ubuntu", "        node: 24", "runs-on: ${{ matrix.os }}-latest"]}
          reveal={p(0.04, 0.14)} x={22} y={14} w={650} size={23} lh={1.5}
          hi={p(0.56, 0.57) > 0.5 ? { a: 1, b: 1, c: A.bad } : p(0.4, 0.41) > 0.5 ? { a: 5, b: 10, c: A.act } : p(0.1, 0.11) > 0.5 ? { a: 3, b: 4, c: A.run } : null} />
      </Win>
      {NODE.map((n, ci) => <div key={n} style={{ position: "absolute", left: X0 + ci * (CW + GP), top: Y0 - 50, width: CW, textAlign: "center", fontFamily: MONO, fontWeight: 800, fontSize: 25, color: ci === 3 ? A.act : A.run, opacity: ci === 3 ? p(0.46, 0.5) : p(0.14, 0.18) }}>node {n}</div>)}
      {OS.map((o, ri) => NODE.map((n, ci) => {
        const isIncl = o.k === INCL.os && n === INCL.node;
        const isExcl = o.k === EXCL.os && n === EXCL.node;
        if (ci === 3 && !isIncl) return null;
        const at = isIncl ? 0.48 : 0.26 + (ri * 3 + ci) * 0.01;
        const o2 = p(at, at + 0.03);
        const idx = ri * 4 + ci;
        const failing = failAt && idx === 5;
        let s: St = (Math.floor(frame / 18) + idx) % 7 < 5 ? "running" : "ok";
        if (failAt && !fastDone) s = failing ? "fail" : "running";
        if (fastDone && p(0.8, 0.81) < 0.5) s = failing ? "fail" : "cancel";
        const col = isExcl ? A.gray : isIncl ? A.act : s === "fail" ? A.bad : s === "cancel" ? A.gray : A.run;
        return (
          <div key={o.k + n} style={{ position: "absolute", left: X0 + ci * (CW + GP), top: Y0 + ri * (CH + GP), width: CW, height: CH, borderRadius: 16, boxSizing: "border-box", background: mix(T.panel, col, isExcl ? 0.03 : 0.14), border: `2.5px ${isExcl && p(0.4, 0.44) > 0.5 ? "dashed" : "solid"} ${col}`, opacity: o2 * (isExcl && p(0.4, 0.44) > 0.5 ? 0.45 : 1), display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, transform: `scale(${0.7 + 0.3 * o2})` }}>
            <span style={{ fontSize: 34 }}>{o.i}</span>
            <span style={{ fontFamily: MONO, fontSize: 20, color: T.text }}>{o.k} · {n}</span>
            {!isExcl && <StatusIcon s={s} size={24} />}
            {isExcl && p(0.4, 0.44) > 0.5 && <span style={{ position: "absolute", fontSize: 90, color: A.bad, opacity: 0.8 }}>✕</span>}
          </div>
        );
      }))}
      <div style={{ position: "absolute", left: X0, top: 770, width: 920, display: "flex", alignItems: "center", gap: 20, opacity: p(0.3, 0.34) }}>
        <span style={{ fontFamily: MONO, fontSize: 30, color: T.muted }}>3 × 3</span>
        <span style={{ fontFamily: MONO, fontSize: 30, color: A.bad, opacity: p(0.44, 0.46) }}>− 1</span>
        <span style={{ fontFamily: MONO, fontSize: 30, color: A.act, opacity: p(0.46, 0.5) }}>+ 1</span>
        <span style={{ fontFamily: MONO, fontSize: 30, color: T.muted }}>=</span>
        <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: 52, color: A.ok }}>{counter} jobs</span>
      </div>
      <div style={{ position: "absolute", left: 100, top: 790, width: 700, opacity: p(0.58, 0.62) }}>
        <div style={{ fontFamily: SANS, fontSize: 25, color: fastDone ? A.bad : T.muted, lineHeight: 1.35 }}>fail-fast: one fails → the rest are cancelled</div>
        <div style={{ marginTop: 10, opacity: p(0.86, 0.9) }}><Chip text="max 256 jobs per matrix" color={A.evt} size={21} /></div>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- service containers
export const ServicesScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const healthy = p(0.36, 0.38) > 0.5;
  const beat = (frame % 45) / 45;
  const wipe = p(0.56, 0.6);
  const wipeCyc = p(0.6, 0.61) > 0.5 ? (frame % 180) / 180 : 0;
  const vis = wipeCyc > 0.8 ? 1 - (wipeCyc - 0.8) / 0.2 : wipeCyc > 0 && wipeCyc < 0.1 ? wipeCyc / 0.1 : 1;
  return (
    <AbsoluteFill>
      <HeadC kicker="services: + container:" title="A real database for every test run" color={A.run} o={p(0, 0.04)} />
      <Win x={100} y={200} w={720} h={520} title="test.yml" color={A.run} o={p(0.02, 0.06)}>
        <CodeBlock lines={["jobs:", "  test:", "    runs-on: ubuntu-latest", "    services:", "      postgres:", "        image: postgres:16", "        env:", "          POSTGRES_PASSWORD: test", "        ports: ['5432:5432']", "        options: --health-cmd pg_isready"]}
          reveal={p(0.04, 0.16)} x={22} y={16} w={670} size={23} lh={1.55}
          hi={p(0.8, 0.81) > 0.5 ? null : p(0.14, 0.15) > 0.5 ? { a: 3, b: 9, c: A.run } : null} />
      </Win>
      <div style={{ position: "absolute", left: 870, top: 200, width: 950, height: 520, borderRadius: 22, border: `3px solid ${A.run}`, background: mix(T.bg1, A.run, 0.05), opacity: p(0.1, 0.14) }}>
        <div style={{ position: "absolute", left: 24, top: 16, fontFamily: MONO, fontSize: 23, color: A.run }}>runner VM · job “test”</div>
        <div style={{ opacity: vis }}>
          <div style={{ position: "absolute", left: 40, top: 110, width: 340, height: 250, borderRadius: 18, background: mix(T.panel, A.ok, 0.1), border: `2.5px solid ${A.ok}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
            <span style={{ fontSize: 64 }}>🧪</span>
            <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 30, color: T.text }}>your tests</span>
            <span style={{ fontFamily: MONO, fontSize: 20, color: T.muted }}>npm test</span>
          </div>
          <div style={{ position: "absolute", left: 570, top: 110, width: 340, height: 250, borderRadius: 18, background: mix(T.panel, A.act, 0.1), border: `2.5px solid ${healthy ? A.act : A.evt}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, opacity: p(0.2, 0.24) }}>
            <span style={{ fontSize: 64 }}>🐘</span>
            <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 30, color: T.text }}>postgres:16</span>
            <span style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: MONO, fontSize: 20, color: healthy ? A.ok : A.evt }}>
              <StatusIcon s={healthy ? "ok" : "running"} size={22} /> {healthy ? "healthy" : "starting…"}
            </span>
          </div>
          <Wire x1={380} y1={235} x2={570} y2={235} p={p(0.3, 0.34)} color={A.act} arrow={false} />
          {healthy && <Flow x1={385} y1={222} x2={565} y2={222} color={A.ok} n={4} speed={0.02} />}
          {healthy && <Flow x1={565} y1={250} x2={385} y2={250} color={A.act} n={4} speed={0.02} />}
          <div style={{ position: "absolute", left: 385, top: 196, width: 180, textAlign: "center", fontFamily: MONO, fontSize: 18, color: T.muted, opacity: p(0.3, 0.34) }}>:5432</div>
          <svg width={880} height={70} style={{ position: "absolute", left: 40, top: 395, opacity: p(0.24, 0.28) }}>
            <polyline points={Array.from({ length: 88 }).map((_, i) => { const u = ((i / 88) + beat) % 1; const spike = Math.abs(u - 0.5) < 0.03 ? -28 : Math.abs(u - 0.53) < 0.02 ? 16 : 0; return `${i * 10},${35 + spike}`; }).join(" ")} fill="none" stroke={healthy ? A.ok : A.evt} strokeWidth={3} />
          </svg>
          <div style={{ position: "absolute", left: 40, top: 470, fontFamily: MONO, fontSize: 19, color: T.muted, opacity: p(0.24, 0.28) }}>health check · pg_isready every few seconds</div>
        </div>
        {wipeCyc > 0.8 && <div style={{ position: "absolute", left: 0, right: 0, top: 230, textAlign: "center", fontFamily: MONO, fontWeight: 800, fontSize: 30, color: A.evt }}>🧹 job ended → containers removed</div>}
      </div>
      <div style={{ position: "absolute", left: 870, top: 750, width: 950, opacity: wipe }}>
        <Chip text="every run → a brand-new, empty database" color={A.ok} size={24} />
      </div>
      <div style={{ position: "absolute", left: 100, top: 750, width: 740, height: 120, borderRadius: 16, background: mix(T.panel, A.act, 0.08), border: `2px solid ${mix(T.line, A.act, 0.6)}`, padding: "16px 22px", boxSizing: "border-box", opacity: p(0.78, 0.82) }}>
        <div style={{ fontFamily: MONO, fontSize: 24, color: A.key }}>container: <span style={{ color: A.str }}>node:22</span></div>
        <div style={{ fontFamily: SANS, fontSize: 23, color: T.muted, marginTop: 6 }}>run the whole job inside an image you choose</div>
      </div>
    </AbsoluteFill>
  );
};
