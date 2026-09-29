// gha/generic.tsx — parameterized structural scenes: title, roadmap, divider, yaml, compare, bullets, recap.
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { mix, useP, usePop, rnd, MONO, SANS, Kicker, Brackets, ScanBeam } from "../../lib/primitives";
import { T, A, RunRail, Win, CodeBlock, HeadC, StatusIcon, useReveal } from "./core";

// ---------------------------------------------------------------- title
export const TitleScene: React.FC<{ dur?: number; kicker?: string; line1?: string; line2?: string; sub?: string }> = ({
  dur, kicker = "GITHUB ACTIONS", line1 = "GitHub Actions,", line2 = "Explained", sub = "",
}) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const pop = usePop(dur);
  const icons = ["✓", "⚡", "{ }", "▶", "⎇", "✓", "⏱", "🔒"];
  return (
    <AbsoluteFill>
      {icons.map((ic, i) => {
        const ang = frame * 0.006 + (i / icons.length) * Math.PI * 2;
        const x = 960 + Math.cos(ang) * 800, y = 470 + Math.sin(ang) * 360;
        const c = [A.ok, A.evt, A.act, A.run][i % 4];
        return <div key={i} style={{ position: "absolute", left: x - 34, top: y - 34, width: 68, height: 68, borderRadius: 18, border: `2px solid ${mix(T.line, c, 0.6)}`, background: mix(T.panel, c, 0.1), display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontWeight: 800, fontSize: 28, color: c, opacity: 0.55 }}>{ic}</div>;
      })}
      <div style={{ position: "absolute", left: 0, right: 0, top: 215, textAlign: "center", transform: `scale(${0.92 + pop(0) * 0.08})` }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 26 }}><Kicker theme={T} text={kicker} color={A.run} cx /></div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 124, lineHeight: 1.02, letterSpacing: -3, color: T.text }}>
          <div>{line1}</div>
          <div style={{ color: A.ok, textShadow: `0 0 70px ${mix(T.bg0, A.ok, 0.6)}` }}>{line2}</div>
        </div>
        <div style={{ height: 6, width: interpolate(p(0.12, 0.4), [0, 1], [0, 560]), background: `linear-gradient(90deg, ${A.evt}, ${A.run}, ${A.act}, ${A.ok})`, borderRadius: 3, margin: "30px auto" }} />
        <div style={{ fontFamily: SANS, fontSize: 36, color: T.muted, opacity: p(0.2, 0.42), width: 1500, margin: "0 auto" }}>{sub}</div>
      </div>
      <RunRail x={530} y={790} o={p(0.3, 0.5)} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- roadmap
export const RoadmapScene: React.FC<{ dur?: number; parts?: { t: string; s: string; c: string }[] }> = ({ dur, parts = [] }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const hot = Math.floor(frame / 24) % Math.max(1, parts.length);
  // narration order: 1-2 @~0.1, 3-5 @~0.25, 6 @~0.42, 7-9 @~0.55, 10 @~0.68
  const ats = [0.04, 0.1, 0.2, 0.25, 0.3, 0.42, 0.55, 0.59, 0.63, 0.7];
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 70, textAlign: "center", opacity: p(0, 0.04) }}>
        <Kicker theme={T} text="THE ROADMAP · TEN PARTS" color={A.run} cx />
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 52, color: T.text, marginTop: 10, letterSpacing: -1.5 }}>From first push to production</div>
      </div>
      {parts.map((pt, i) => {
        const col = i < 5 ? 0 : 1, row = i % 5;
        const x = col === 0 ? 150 : 990, y = 238 + row * 128;
        const at = ats[i] ?? 0.1 + i * 0.07;
        const o = p(at, at + 0.06);
        const act = hot === i && p(0.72, 0.73) > 0.5;
        return (
          <div key={i} style={{ position: "absolute", left: x, top: y, width: 780, height: 108, display: "flex", alignItems: "center", gap: 24, opacity: o, transform: `translateX(${(1 - o) * -30}px)` }}>
            <div style={{ width: 70, height: 70, borderRadius: 18, flexShrink: 0, background: mix(T.panel, pt.c, act ? 0.4 : 0.14), border: `2.5px solid ${pt.c}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontWeight: 800, fontSize: 30, color: act ? T.text : pt.c, transform: `scale(${act ? 1.1 : 1})`, boxShadow: act ? `0 0 24px ${mix(T.bg0, pt.c, 0.6)}` : "none" }}>{i + 1}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 38, color: T.text, letterSpacing: -0.8, whiteSpace: "nowrap" }}>{pt.t}</div>
              <div style={{ fontFamily: MONO, fontSize: 23, color: pt.c, marginTop: 4, whiteSpace: "nowrap" }}>{pt.s}</div>
            </div>
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 958, top: 250, width: 3, height: 600, background: T.line }} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- divider
export const Divider: React.FC<{ dur?: number; n?: number; title?: string; sub?: string; color?: string; total?: number }> = ({
  dur, n = 1, title = "", sub = "", color = A.run, total = 10,
}) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  return (
    <AbsoluteFill>
      <Brackets x={330} y={250} w={1260} h={470} color={color} o={p(0.02, 0.14)} len={54} />
      <ScanBeam theme={T} x={340} y={260} w={1240} h={450} color={color} o={p(0.05, 0.2)} speed={1.6} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 320, textAlign: "center" }}>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 34, color, letterSpacing: 10, opacity: p(0.03, 0.12) }}>PART {n < 10 ? "0" + n : n}</div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 96, color: T.text, letterSpacing: -2, marginTop: 18, opacity: p(0.08, 0.2), transform: `translateY(${(1 - p(0.08, 0.2)) * 30}px)` }}>{title}</div>
        <div style={{ height: 5, width: interpolate(p(0.15, 0.45), [0, 1], [0, 420]), background: color, borderRadius: 3, margin: "26px auto" }} />
        <div style={{ fontFamily: SANS, fontSize: 34, color: T.muted, opacity: p(0.25, 0.4) }}>{sub}</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 790, display: "flex", justifyContent: "center", gap: 14, opacity: p(0.25, 0.4) }}>
        {Array.from({ length: total }).map((_, k) => {
          const i = k + 1;
          return <div key={i} style={{ width: i === n ? 44 : 14, height: 14, borderRadius: 8, background: i <= n ? color : mix(T.panel, color, 0.15), border: `1.5px solid ${i <= n ? color : T.line}`, opacity: i === n ? 0.7 + Math.sin(frame * 0.1) * 0.3 : 1 }} />;
        })}
      </div>
      <RunRail x={530} y={130} o={0.35} phase={n * 37} labels={["event", "workflow", "job", "step"]} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- yaml walkthrough
export const YamlScene: React.FC<{
  dur?: number; kicker?: string; title?: string; file?: string; lines?: string[];
  notes?: { a: number; b: number; at: number; c: string; t: string }[];
}> = ({ dur, kicker = "", title = "", file = "", lines = [], notes = [] }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const tp = p(0, 0.1);
  let cur = -1;
  notes.forEach((n, i) => { if (p(n.at, n.at + 0.01) > 0.5) cur = i; });
  const hi = cur >= 0 ? { a: notes[cur].a, b: notes[cur].b, c: notes[cur].c } : null;
  const fs = lines.length > 14 ? 23 : 25;
  const winH = Math.min(690, 46 + 40 + lines.length * Math.round(fs * 1.52));
  return (
    <AbsoluteFill>
      <HeadC kicker={kicker} title={title} color={A.act} o={p(0, 0.04)} />
      <Win x={100} y={200} w={1010} h={winH} title={file} color={A.act} o={p(0, 0.05)} glow>
        <CodeBlock lines={lines} reveal={tp} x={30} y={22} w={940} hi={hi} size={fs} />
        <ScanBeam theme={T} x={0} y={0} w={1010} h={winH - 46} color={A.act} o={0.25} speed={1.1} />
      </Win>
      {notes.map((n, i) => {
        const o = p(n.at, n.at + 0.04);
        const on = cur === i;
        return (
          <div key={i} style={{
            position: "absolute", left: 1150, top: 200 + i * 132, width: 670, minHeight: 112, boxSizing: "border-box",
            borderRadius: 16, padding: "18px 22px", background: mix(T.panel, n.c, on ? 0.2 : 0.07),
            border: `2px solid ${on ? n.c : mix(T.line, n.c, 0.4)}`, borderLeft: `6px solid ${n.c}`,
            opacity: o * (on ? 1 : 0.72), transform: `translateX(${(1 - o) * 40}px) scale(${on ? 1.02 : 1})`,
            boxShadow: on ? `0 0 ${26 + Math.sin(frame * 0.12) * 8}px ${mix(T.bg0, n.c, 0.5)}` : "none",
            display: "flex", alignItems: "center",
          }}>
            <div style={{ fontFamily: SANS, fontSize: 27, fontWeight: 600, color: T.text, lineHeight: 1.3 }}>
              {n.a >= 0 && <span style={{ fontFamily: MONO, color: n.c, fontSize: 21, marginRight: 10 }}>L{n.a + 1}{n.b > n.a ? `–${n.b + 1}` : ""}</span>}
              {n.t}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- compare (two columns)
type Col = { h: string; icon: string; c: string; items: string[] };
export const CompareScene: React.FC<{ dur?: number; kicker?: string; title?: string; left?: Col; right?: Col }> = ({ dur, kicker = "", title = "", left, right }) => {
  const frame = useCurrentFrame();
  const p = useReveal(dur);
  const cols = [left, right].filter(Boolean) as Col[];
  const hot = Math.floor(frame / 30) % 4;
  return (
    <AbsoluteFill>
      <HeadC kicker={kicker} title={title} color={A.run} o={p(0, 0.05)} />
      {cols.map((c, ci) => {
        const x = ci === 0 ? 130 : 1000;
        const base = ci === 0 ? 0.08 : 0.38;
        const o = p(base, base + 0.06);
        const good = ci === 1;
        return (
          <div key={ci} style={{
            position: "absolute", left: x, top: 215, width: 790, height: 660, borderRadius: 22, boxSizing: "border-box", padding: "30px 34px",
            background: mix(T.panel, c.c, 0.07), border: `2.5px solid ${mix(T.line, c.c, 0.7)}`, opacity: o,
            transform: `translateY(${(1 - o) * 24}px)`,
            boxShadow: good ? `0 0 ${50 + Math.sin(frame * 0.06) * 16}px ${mix(T.bg0, c.c, 0.28)}` : "none",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <span style={{ fontSize: 58 }}>{c.icon}</span>
              <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 42, color: c.c, letterSpacing: -0.8 }}>{c.h}</span>
            </div>
            <div style={{ marginTop: 30, display: "flex", flexDirection: "column", gap: 20 }}>
              {c.items.map((it, i) => {
                const io = p(base + 0.07 + i * 0.05, base + 0.12 + i * 0.05);
                const lit = good && hot === i && p(0.7, 0.71) > 0.5;
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 18, opacity: io, background: lit ? mix(T.panel, c.c, 0.18) : "transparent", borderRadius: 12, padding: "12px 14px", transform: `translateX(${(1 - io) * -20}px)` }}>
                    <StatusIcon s={good ? "ok" : "fail"} size={34} />
                    <span style={{ fontFamily: SANS, fontSize: 30, color: T.text, fontWeight: 500 }}>{it}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 920, top: 510, width: 80, textAlign: "center", fontFamily: MONO, fontWeight: 800, fontSize: 34, color: A.evt, opacity: p(0.35, 0.4) * (0.6 + Math.sin(frame * 0.1) * 0.4) }}>VS</div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- bullets / checklist
export const BulletsScene: React.FC<{ dur?: number; kicker?: string; title?: string; color?: string; items?: { i: string; k: string; d: string }[] }> = ({
  dur, kicker = "", title = "", color = A.ok, items = [],
}) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const n = Math.max(1, items.length);
  const rowH = Math.min(100, Math.floor(660 / n));
  const hot = Math.floor(frame / 28) % n;
  return (
    <AbsoluteFill>
      <HeadC kicker={kicker} title={title} color={color} o={p(0, 0.04)} />
      {items.map((it, i) => {
        const at = 0.06 + i * (0.8 / n);
        const o = p(at, at + 0.05);
        const done = p(at + 0.05, at + 0.07) > 0.5;
        const lit = hot === i && p(0.88, 0.89) > 0.5;
        return (
          <div key={i} style={{
            position: "absolute", left: 130, top: 205 + i * rowH, width: 1660, height: rowH - 14, boxSizing: "border-box",
            display: "flex", alignItems: "center", gap: 26, padding: "0 28px", borderRadius: 16, opacity: o,
            transform: `translateX(${(1 - o) * -40}px)`,
            background: mix(T.panel, color, lit ? 0.2 : 0.06), border: `2px solid ${lit ? color : T.line}`, borderLeft: `6px solid ${color}`,
          }}>
            <span style={{ fontSize: rowH > 90 ? 44 : 38, width: 56, textAlign: "center" }}>{it.i}</span>
            <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: rowH > 90 ? 34 : 31, color: T.text, width: 520, flexShrink: 0 }}>{it.k}</span>
            <span style={{ fontFamily: SANS, fontSize: rowH > 90 ? 28 : 26, color: T.muted, flex: 1 }}>{it.d}</span>
            <StatusIcon s={done ? "ok" : "running"} size={34} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- recap
export const RecapScene: React.FC<{ dur?: number; title?: string; color?: string; items?: string[]; closer?: string }> = ({
  dur, title = "", color = A.ok, items = [], closer = "",
}) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  return (
    <AbsoluteFill>
      <RunRail x={60} y={40} o={0.3} scale={0.6} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 70, textAlign: "center" }}>
        <Kicker theme={T} text="RECAP — THE WHOLE MAP" color={color} cx o={p(0, 0.04)} />
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 58, color: T.text, marginTop: 10, letterSpacing: -1.5, opacity: p(0, 0.05) }}>{title}</div>
      </div>
      <div style={{ position: "absolute", left: 250, top: 205, width: 1420, display: "flex", flexDirection: "column", gap: 11 }}>
        {items.map((it, i) => {
          const at = 0.05 + i * 0.085;
          const o = p(at, at + 0.05);
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 18, opacity: o, transform: `translateX(${(1 - o) * -26}px)`, background: mix(T.panel, color, 0.05), border: `1.5px solid ${T.line}`, borderLeft: `4px solid ${color}`, borderRadius: 12, padding: "12px 24px" }}>
              <StatusIcon s={o > 0.9 ? "ok" : "running"} size={30} />
              <span style={{ fontFamily: SANS, fontSize: 29, color: T.text, lineHeight: 1.2 }}>{it}</span>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 820, textAlign: "center", opacity: p(0.8, 0.88) }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontStyle: "italic", fontSize: 42, color, textShadow: `0 0 ${30 + Math.sin(frame * 0.06) * 14}px ${mix(T.bg0, color, 0.7)}` }}>{closer}</div>
      </div>
      {Array.from({ length: 6 }).map((_, i) => {
        const y = ((frame * (1.2 + rnd(i, 1) * 0.8) + i * 180) % 1100) - 40;
        return <div key={i} style={{ position: "absolute", left: i % 2 ? 1760 : 120, top: 1080 - y, opacity: 0.35 }}><StatusIcon s="ok" size={26} /></div>;
      })}
    </AbsoluteFill>
  );
};
