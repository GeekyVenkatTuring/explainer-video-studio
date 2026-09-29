/**
 * gt/core.tsx — Title, Hook, Divider, Recap for the GTT video (Claude-owned).
 * Trading-terminal identity from kit.tsx. Full-bleed cards center on the Stage; the Hook
 * is a developing chart scene. See GTScenes.tsx for routing.
 */
import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { Stage, Card, Flow, Brackets, ScanBeam, mix as pmix } from "../../lib/primitives";
import {
  T, A, MONO, SANS, BW, useP, usePop, TermBg, TapeStrip, GTHead, SceneProgress, DefBadge,
  CandleChart, TAPE_C, TAPE, Chip, Verdict, rupee,
} from "./kit";

const LO = Math.min(...TAPE) - 3, HI = Math.max(...TAPE) + 3;

// ---------------------------------------------------------------- TITLE
export const TitleScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const p = useP(dur); const pop = usePop(dur);
  const under = interpolate(p(0.2, 0.5), [0, 1], [0, 560]);
  return (
    <Stage>
      {/* ambient candlestick ribbons top & bottom (continuous motion) */}
      <TapeStrip x={120} y={92} w={1680} h={90} o={0.5} seed={2} />
      <TapeStrip x={120} y={905} w={1680} h={90} o={0.45} seed={7} />
      <Brackets x={430} y={330} w={1060} h={330} color={A.main} o={p(0.02, 0.14)} len={50} />
      <ScanBeam theme={T} x={440} y={340} w={1040} h={310} color={A.main} o={p(0.05, 0.2)} speed={1.4} />
      {/* kicker */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 300, textAlign: "center", opacity: p(0.05, 0.16) }}>
        <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 24, letterSpacing: 8, color: A.main, textTransform: "uppercase" }}>
          Zerodha Kite · GTT · Full walkthrough
        </span>
      </div>
      {/* headline */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 352, textAlign: "center", transform: `scale(${0.94 + pop(0.08) * 0.06})` }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 104, lineHeight: 1.05, letterSpacing: -3, color: T.text, opacity: p(0.1, 0.22) }}>
          The GTT Buy-Schedule,
        </div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 104, lineHeight: 1.05, letterSpacing: -3, color: A.main, opacity: p(0.16, 0.3),
          textShadow: `0 0 40px ${pmix(T.bg0, A.main, 0.7)}` }}>
          Explained
        </div>
      </div>
      <div style={{ position: "absolute", left: "50%", top: 588, width: under, height: 5, marginLeft: -under / 2,
        background: `linear-gradient(90deg, ${A.buy}, ${A.main})`, borderRadius: 3 }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 628, textAlign: "center", opacity: p(0.3, 0.46) }}>
        <span style={{ fontFamily: SANS, fontSize: 36, color: T.muted }}>
          What a GTT is · how to stagger an entry · every price, derived — from zero.
        </span>
      </div>
      {/* disclaimer */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 700, textAlign: "center", opacity: p(0.5, 0.62) }}>
        <span style={{ fontFamily: MONO, fontSize: 21, color: pmix(T.muted, A.trig, 0.4) }}>
          Educational — not investment advice · numbers illustrative (Aug 2026)
        </span>
      </div>
      <div style={{ position: "absolute", left: 1560, top: 250, width: 12, height: 12, borderRadius: 8, background: A.buy,
        opacity: 0.5 + Math.sin(frame * 0.14) * 0.5, boxShadow: `0 0 14px ${A.buy}` }} />
    </Stage>
  );
};

// ---------------------------------------------------------------- HOOK
export const HookScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const p = useP(dur); const frame = useCurrentFrame();
  // the "buy now" dot sits at the recent top; then the four-part plan reveals
  const chartX = 100, chartY = 300, chartW = 1080, chartH = 470;
  const plan = [
    { k: "WHERE to buy", v: "two dips", c: A.buy, at: 0.5 },
    { k: "HOW MUCH", v: "budget legs", c: A.main, at: 0.58 },
    { k: "WHERE to quit", v: "a stop", c: A.stop, at: 0.66 },
    { k: "WHERE aiming", v: "a target", c: A.tgt, at: 0.74 },
  ];
  return (
    <Stage>
      <SceneProgress p={p} color={A.main} />
      <GTHead kicker="THE PROBLEM" title="Buying well is a plan, not a click" color={A.main} p={p} />
      <CandleChart x={chartX} y={chartY} w={chartW} h={chartH} candles={TAPE_C} lo={LO} hi={HI}
        reveal={p(0.08, 0.6)} dmas={[]} o={p(0.06, 0.16)}
        marker={{ price: TAPE[TAPE.length - 1], o: p(0.2, 0.3), label: rupee(TAPE[TAPE.length - 1], 0) }}
        xlabels={["1Y AGO", "TODAY"]} />
      {/* the trap chip near the top of the tape */}
      <div style={{ position: "absolute", left: 720, top: 350, opacity: p(0.22, 0.32) - p(0.5, 0.6) * 0.6 }}>
        <Chip label="the trap" value="BUY IT ALL — NOW?" color={A.trig} hero />
      </div>
      <div style={{ position: "absolute", left: 720, top: 470, fontFamily: SANS, fontSize: 24, color: A.stop,
        opacity: p(0.34, 0.44) - p(0.52, 0.62) * 0.5 }}>
        …then it dips 8% and you have no cash left.
      </div>
      {/* the pro's 4-part plan */}
      <div style={{ position: "absolute", left: 1240, top: 300 }}>
        <div style={{ fontFamily: MONO, fontSize: 20, letterSpacing: 2, color: A.main, opacity: p(0.44, 0.5), marginBottom: 14 }}>
          THE PRO DECIDES, IN ADVANCE:
        </div>
        {plan.map((it, i) => (
          <div key={i} style={{ marginBottom: 14, opacity: p(it.at, it.at + 0.06),
            transform: `translateY(${(1 - p(it.at, it.at + 0.06)) * 16}px)` }}>
            <div style={{ background: pmix(T.panel, it.c, 0.12), border: `2px solid ${it.c}`, borderRadius: 13,
              padding: "12px 18px", width: 470, boxSizing: "border-box" }}>
              <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: 22, color: it.c }}>{it.k}</span>
              <span style={{ fontFamily: SANS, fontSize: 22, color: T.text, marginLeft: 10 }}>→ {it.v}</span>
            </div>
          </div>
        ))}
      </div>
      <Flow x1={1180} y1={520} x2={1240} y2={430} color={A.main} n={6} speed={0.014} size={8} o={0.7} />
      <Verdict color={A.main} o={p(0.82, 0.9)}
        text="Decide it in advance, in writing — then let the orders wait so emotion never votes." />
    </Stage>
  );
};

// ---------------------------------------------------------------- DIVIDER
export const DividerScene: React.FC<{ dur?: number; n?: number; title?: string; sub?: string; color?: string; pips?: number }> =
({ dur, n = 1, title = "", sub = "", color = A.main, pips = 4 }) => {
  const frame = useCurrentFrame(); const p = useP(dur);
  const under = interpolate(p(0.2, 0.5), [0, 1], [0, 440]);
  return (
    <Stage>
      <TapeStrip x={120} y={120} w={1680} h={80} o={0.4} seed={n + 1} color={color} />
      <TapeStrip x={120} y={880} w={1680} h={80} o={0.4} seed={n + 5} color={color} />
      <Brackets x={360} y={330} w={1200} h={410} color={color} o={p(0.02, 0.14)} len={54} />
      <ScanBeam theme={T} x={370} y={340} w={1180} h={390} color={color} o={p(0.05, 0.2)} speed={1.6} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 388, textAlign: "center" }}>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 32, color, letterSpacing: 10, opacity: p(0.05, 0.15) }}>
          PART {"0" + n}
        </div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 92, color: T.text, letterSpacing: -2, marginTop: 18,
          opacity: p(0.12, 0.24), transform: `translateY(${(1 - p(0.12, 0.24)) * 26}px)` }}>{title}</div>
        <div style={{ height: 5, width: under, background: color, borderRadius: 3, margin: "24px auto" }} />
        <div style={{ fontFamily: SANS, fontSize: 33, color: T.muted, opacity: p(0.3, 0.45) }}>{sub}</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 830, display: "flex", justifyContent: "center", gap: 16, opacity: p(0.3, 0.45) }}>
        {Array.from({ length: pips }).map((_, idx) => {
          const i = idx + 1;
          return (
            <div key={i} style={{ width: i === n ? 44 : 14, height: 14, borderRadius: 8,
              background: i <= n ? color : pmix(T.panel, color, 0.15), border: `1.5px solid ${i <= n ? color : T.line}`,
              opacity: i === n ? 0.7 + Math.sin(frame * 0.1) * 0.3 : 1 }} />
          );
        })}
      </div>
    </Stage>
  );
};

// ---------------------------------------------------------------- RECAP
export const RecapScene: React.FC<{ dur?: number; items?: string[]; closer?: string }> = ({ dur, items = [], closer = "" }) => {
  const frame = useCurrentFrame(); const p = useP(dur);
  return (
    <Stage>
      <TapeStrip x={120} y={110} w={1680} h={70} o={0.35} seed={3} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 120, textAlign: "center", opacity: p(0.04, 0.14) }}>
        <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 23, letterSpacing: 7, color: A.main, textTransform: "uppercase" }}>
          Recap · the whole plan in one breath
        </span>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 168, textAlign: "center", opacity: p(0.1, 0.2) }}>
        <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 58, color: T.text, letterSpacing: -1.5 }}>
          The staggered GTT buy-schedule
        </span>
      </div>
      <div style={{ position: "absolute", left: 290, top: 268, width: 1340 }}>
        {items.map((it, i) => {
          const at = 0.14 + i * 0.075;
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 13,
              opacity: p(at, at + 0.05), transform: `translateX(${(1 - p(at, at + 0.05)) * -14}px)` }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: pmix(T.panel, A.main, 0.16),
                border: `2px solid ${A.main}`, display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: MONO, fontWeight: 800, fontSize: 19, color: A.main, flexShrink: 0 }}>{i + 1}</div>
              <div style={{ borderLeft: `4px solid ${A.main}`, paddingLeft: 14, fontFamily: SANS, fontSize: 27, color: T.text }}>{it}</div>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 812, textAlign: "center", opacity: p(0.8, 0.9) }}>
        <span style={{ fontFamily: SANS, fontStyle: "italic", fontWeight: 700, fontSize: 34, color: A.main,
          textShadow: `0 0 26px ${pmix(T.bg0, A.main, 0.6)}` }}>{closer}</span>
      </div>
      <div style={{ position: "absolute", left: 940, top: 120, width: 12, height: 12, borderRadius: 8, background: A.buy,
        opacity: 0.5 + Math.sin(frame * 0.14) * 0.5, boxShadow: `0 0 14px ${A.buy}` }} />
    </Stage>
  );
};
