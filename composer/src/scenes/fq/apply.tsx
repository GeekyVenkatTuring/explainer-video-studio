/**
 * fq/apply.tsx — APPLICATION scenes (Claude). The method applied to the real ₹59k book,
 * the 5 picks, price targets, bear/base/bull valuation, and the GTT buy plan.
 */
import React from "react";
import { useCurrentFrame } from "remotion";
import { Stage, Card, Wire, Flow, Counter, useP, usePop, rnd } from "../../lib/primitives";
import { T, A, mix, MONO, SANS, SceneProgress, FQHead, DefBadge, Formula, StatChip } from "./kit";

// fq_score — four pillar scores become one Buy/Hold/Sell call ------------------
// NARRATION: How do we turn all these numbers into one decision? We score each stock on
// four things — quality, trend, valuation, and risk — each from zero to a hundred. We blend
// them into a single number. Sixty-four or higher, accumulate; in the forties, just hold.
export const ScoreScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const pills = [
    { k: "Quality", w: "30%", v: 85, c: A.fund },
    { k: "Trend", w: "27%", v: 44, c: A.tech },
    { k: "Valuation", w: "25%", v: 68, c: A.val },
    { k: "Risk", w: "18%", v: 41, c: A.risk },
  ];
  const comp = 62;
  return (
    <Stage>
      <SceneProgress p={p} color={A.main} />
      <FQHead kicker="ONE SCORE · THE VERDICT" title="Four scores become one call" color={A.main} p={p} />
      {pills.map((b, i) => {
        const at = 0.12 + i * 0.11;
        const grow = p(at, at + 0.14);
        return (
          <div key={i}>
            <div style={{ position: "absolute", left: 100, top: 262 + i * 96, width: 250, fontFamily: SANS, fontWeight: 700, fontSize: 27, color: T.text, opacity: p(at - 0.03, at) }}>
              {b.k}<span style={{ fontFamily: MONO, fontSize: 20, color: T.muted }}>  · {b.w}</span>
            </div>
            <div style={{ position: "absolute", left: 370, top: 268 + i * 96, width: 640, height: 30, borderRadius: 15, background: mix(T.panel, b.c, 0.06), border: `1.5px solid ${mix(T.line, b.c, 0.4)}` }}>
              <div style={{ height: "100%", width: `${b.v * grow}%`, borderRadius: 15, background: `linear-gradient(90deg, ${mix(b.c, T.bg1, 0.3)}, ${b.c})`, boxShadow: `0 0 14px ${b.c}` }} />
            </div>
            <div style={{ position: "absolute", left: 1030, top: 262 + i * 96, fontFamily: MONO, fontWeight: 800, fontSize: 30, color: b.c, opacity: grow }}>{Math.round(b.v * grow)}</div>
          </div>
        );
      })}
      {/* composite gauge on the right */}
      <div style={{ position: "absolute", left: 1200, top: 258, width: 600, height: 420, borderRadius: 22, background: mix(T.panel, A.main, 0.08), border: `2.5px solid ${A.main}`, boxShadow: `0 0 60px ${mix(T.bg0, A.main, 0.2 + Math.sin(frame * 0.05) * 0.06)}`, opacity: p(0.5, 0.6) }}>
        <div style={{ textAlign: "center", marginTop: 40 }}>
          <div style={{ fontFamily: MONO, fontSize: 20, letterSpacing: 2, textTransform: "uppercase", color: T.muted }}>Composite</div>
          <div style={{ marginTop: 10 }}><Counter p={p(0.58, 0.74)} to={comp} color={A.main} size={130} /></div>
          <div style={{ marginTop: 8, display: "inline-block", fontFamily: MONO, fontWeight: 800, fontSize: 30, color: T.bg0, background: A.fund, borderRadius: 12, padding: "10px 26px", opacity: p(0.78, 0.86) }}>ADD ON DIPS</div>
        </div>
      </div>
      {/* threshold ladder */}
      <div style={{ position: "absolute", left: 100, top: 700, display: "flex", gap: 16, opacity: p(0.72, 0.82) }}>
        {[["≥64", "Accumulate", A.fund], ["54–63", "Add on dips", A.main], ["44–53", "Hold", A.tech], ["<44", "Trim / Reduce", A.risk]].map(([n, l, c], i) => (
          <div key={i} style={{ background: mix(T.panel, c as string, 0.1), border: `2px solid ${c as string}`, borderRadius: 12, padding: "10px 18px" }}>
            <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: 24, color: c as string }}>{n}</span>
            <span style={{ fontFamily: SANS, fontSize: 20, color: T.muted, marginLeft: 10 }}>{l}</span>
          </div>
        ))}
      </div>
    </Stage>
  );
};

// fq_concentration — the diversification lesson (ARDEE 60%) --------------------
// NARRATION: Here is the biggest risk in this real portfolio — and it is not any single stock.
// One holding is almost sixty percent of the money. So even with seven names, you effectively
// hold only about two-and-a-half independent bets. That is concentration, and it can hurt.
export const ConcentrationScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const holds = [
    { k: "ARDEE", w: 59.7, c: A.risk }, { k: "RELIANCE", w: 17.3, c: A.main }, { k: "HDFCBANK", w: 12.1, c: A.main },
    { k: "INFY", w: 7.7, c: A.main }, { k: "JIOFIN", w: 1.6, c: T.muted }, { k: "SBIFUNDS", w: 0.9, c: T.muted }, { k: "ETERNAL", w: 0.6, c: T.muted },
  ];
  const maxW = 59.7;
  return (
    <Stage>
      <SceneProgress p={p} color={A.risk} />
      <FQHead kicker="THE HIDDEN RISK" title="Seven stocks — but really two bets" color={A.risk} p={p} />
      {holds.map((h, i) => {
        const at = 0.12 + i * 0.06;
        const grow = p(at, at + 0.12);
        const w = (h.w / maxW) * 900 * grow;
        const isBig = i === 0;
        return (
          <div key={i}>
            <div style={{ position: "absolute", left: 100, top: 258 + i * 62, width: 210, fontFamily: MONO, fontWeight: 700, fontSize: 24, color: T.text, opacity: p(at - 0.02, at) }}>{h.k}</div>
            <div style={{ position: "absolute", left: 320, top: 254 + i * 62, height: 40, width: Math.max(2, w), borderRadius: 10,
              background: `linear-gradient(90deg, ${mix(h.c as string, T.bg1, 0.35)}, ${h.c})`, border: `2px solid ${h.c}`,
              boxShadow: isBig ? `0 0 ${18 + Math.sin(frame * 0.08) * 8}px ${h.c}` : "none" }} />
            <div style={{ position: "absolute", left: 320 + Math.max(2, w) + 14, top: 260 + i * 62, fontFamily: MONO, fontWeight: 800, fontSize: 24, color: h.c, opacity: grow }}>{h.w}%</div>
          </div>
        );
      })}
      {/* effective-bets callout */}
      <div style={{ position: "absolute", left: 1330, top: 300, width: 470, borderRadius: 20, background: mix(T.panel, A.risk, 0.1), border: `2.5px solid ${A.risk}`, padding: "22px 26px", boxSizing: "border-box", opacity: p(0.58, 0.68) }}>
        <DefBadge text="Concentration" color={A.risk} o={p(0.6, 0.68)} />
        <div style={{ marginTop: 16, opacity: p(0.64, 0.72) }}><Formula parts={[["Eff. bets", A.risk], ["= 1 ÷ Σ w²"]]} size={26} /></div>
        <div style={{ textAlign: "center", marginTop: 14 }}><Counter p={p(0.58, 0.72)} to={2.46} decimals={2} color={A.risk} size={92} /></div>
        <div style={{ fontFamily: SANS, fontSize: 23, color: T.muted, textAlign: "center", marginTop: 4, opacity: p(0.68, 0.78) }}>independent bets, not 7</div>
      </div>
      <div style={{ position: "absolute", left: 100, top: 720, width: 1180, fontFamily: SANS, fontSize: 28, color: A.risk, opacity: p(0.76, 0.86) }}>
        Nearly 60% sits in one stock that listed under 3 weeks ago. Rule one: diversify.
      </div>
    </Stage>
  );
};

// fq_funnel — 2000 -> 23 -> 5 -------------------------------------------------
// NARRATION: With two thousand stocks listed, how do you find five worth adding? A funnel.
// Keep only liquid names, then only sectors that are actually growing, then only proven
// earners. Two thousand becomes twenty-three worth studying — and five worth buying.
export const FunnelScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const p = useP(dur);
  const stages = [
    { n: "~2,000", l: "All NSE listed", w: 1500 },
    { n: "~400", l: "Liquid, tradeable", w: 1180 },
    { n: "~120", l: "Growing sectors", w: 880 },
    { n: "~40", l: "Proven earners", w: 600 },
    { n: "23", l: "Shortlist studied", w: 380, c: A.fund },
    { n: "5", l: "Picks to add", w: 220, c: A.fund },
  ];
  return (
    <Stage>
      <SceneProgress p={p} color={A.main} />
      <FQHead kicker="NARROWING THE FIELD" title="From ~2,000 stocks down to five" color={A.main} p={p} />
      {stages.map((s, i) => {
        const at = 0.1 + i * 0.12;
        const o = p(at, at + 0.1);
        const y = 250 + i * 100;
        const c = s.c || A.main;
        return (
          <div key={i}>
            <div style={{ position: "absolute", left: 960 - s.w / 2, top: y, width: s.w, height: 74, borderRadius: 14,
              background: `linear-gradient(180deg, ${mix(T.panel, c, 0.14)}, ${mix(T.panel, c, 0.06)})`, border: `2.5px solid ${c}`,
              opacity: o, transform: `translateY(${(1 - o) * 14}px)`,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 18, overflow: "hidden" }}>
              <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: 34, color: c, opacity: o }}>{s.n}</span>
              <span style={{ fontFamily: SANS, fontSize: 24, color: T.text, opacity: o, whiteSpace: "nowrap" }}>{s.l}</span>
            </div>
            {i > 0 && <Flow x1={960} y1={y - 26} x2={960} y2={y - 2} color={c} n={4} o={p(at + 0.02, at + 0.1)} />}
          </div>
        );
      })}
    </Stage>
  );
};

// fq_picks — the five, as a scorecard ----------------------------------------
// NARRATION: Here are the five, one to buy each month. A quality defence anchor, an electronics
// leader, a cables compounder, and two small-caps with real momentum. Higher upside — and, being
// honest, higher risk.
export const PicksScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const picks = [
    { t: "HAL", th: "Defence", s: 83, c: A.fund, m: "Tejas jets ship" },
    { t: "DIXON", th: "Electronics", s: 80, c: A.fund, m: "Vivo JV, elite ROE" },
    { t: "KEI", th: "Cables", s: 71, c: A.main, m: "Electrification" },
    { t: "SYRMA", th: "EMS · small", s: 73, c: A.tech, m: "Growth printing" },
    { t: "DATAPATTNS", th: "Defence · small", s: 70, c: A.tech, m: "Order inflows" },
  ];
  const hot = Math.floor(frame / 34) % picks.length;
  return (
    <Stage>
      <SceneProgress p={p} color={A.fund} />
      <FQHead kicker="THE FIVE · A SCORECARD" title="Five to add, one a month" color={A.fund} p={p} />
      {picks.map((pk, i) => {
        const at = 0.12 + i * 0.09;
        const o = p(at, at + 0.1);
        const active = hot === i;
        const x = 100 + i * 344;
        return (
          <div key={i} style={{ position: "absolute", left: x, top: 270, width: 320, height: 430, borderRadius: 20,
            background: mix(T.panel, pk.c, active ? 0.16 : 0.07), border: `2.5px solid ${active ? pk.c : mix(T.line, pk.c, 0.5)}`,
            padding: "22px 20px", boxSizing: "border-box", opacity: o, transform: `translateY(${(1 - o) * 20}px) scale(${active ? 1.03 : 1})`,
            boxShadow: active ? `0 0 40px ${mix(T.bg0, pk.c, 0.4)}` : "none" }}>
            <div style={{ fontFamily: MONO, fontSize: 19, letterSpacing: 1, color: T.muted }}>MONTH {i + 1}</div>
            <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 30, color: T.text, marginTop: 6, lineHeight: 1.05 }}>{pk.t}</div>
            <div style={{ fontFamily: MONO, fontSize: 20, color: pk.c, marginTop: 4 }}>{pk.th}</div>
            <div style={{ marginTop: 24, fontFamily: MONO, fontSize: 20, letterSpacing: 1, color: T.muted }}>SCORE</div>
            <div style={{ marginTop: 6, height: 12, borderRadius: 8, background: mix(T.panel, pk.c, 0.1) }}>
              <div style={{ height: "100%", width: `${pk.s * p(at + 0.04, at + 0.16)}%`, borderRadius: 8, background: pk.c }} />
            </div>
            <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 40, color: pk.c, marginTop: 8 }}>{pk.s}</div>
            <div style={{ fontFamily: SANS, fontSize: 21, color: T.text, marginTop: 22, lineHeight: 1.3 }}>{pk.m}</div>
          </div>
        );
      })}
    </Stage>
  );
};

// fq_targets — how a price target is set -------------------------------------
// NARRATION: Where does a price target come from? Three ways. Multiply a fair price-to-earnings
// by next year's expected profit. Average what many analysts expect. Or read the chart's support
// and resistance. Pros triangulate all three — never trust just one.
export const TargetsScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const cards = [
    { at: 0.12, c: A.val, tag: "Method 1", h: "Fair multiple", body: <Formula parts={[["Target", A.val], ["= P/E × EPS"]]} size={28} />, ex: "e.g. 20 × ₹150 = ₹3,000" },
    { at: 0.34, c: A.main, tag: "Method 2", h: "Analyst consensus", body: <div style={{ fontFamily: SANS, fontSize: 24, color: T.text }}>The average of many brokers' 12-month targets — the spread shows conviction.</div>, ex: "mean of 30+ estimates" },
    { at: 0.56, c: A.tech, tag: "Method 3", h: "Chart levels", body: <div style={{ fontFamily: SANS, fontSize: 24, color: T.text }}>Support below, resistance above — where price has turned before.</div>, ex: "the tradeable range" },
  ];
  return (
    <Stage>
      <SceneProgress p={p} color={A.val} />
      <FQHead kicker="SETTING A TARGET" title="Where does a price target come from?" color={A.val} p={p} />
      {cards.map((cd, i) => {
        const o = p(cd.at, cd.at + 0.1);
        const x = 140 + i * 560;
        return (
          <div key={i} style={{ position: "absolute", left: x, top: 270, width: 520, height: 440, borderRadius: 20,
            background: mix(T.panel, cd.c, 0.08), border: `2.5px solid ${cd.c}`, padding: "26px 28px", boxSizing: "border-box",
            opacity: o, transform: `translateY(${(1 - o) * 22}px)`, boxShadow: `0 0 46px ${mix(T.bg0, cd.c, 0.16 + Math.sin(frame * 0.05 + i) * 0.05)}` }}>
            <DefBadge text={cd.tag} color={cd.c} o={o} />
            <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 34, color: T.text, marginTop: 18 }}>{cd.h}</div>
            <div style={{ marginTop: 22, minHeight: 120 }}>{cd.body}</div>
            <div style={{ position: "absolute", left: 28, bottom: 26, fontFamily: MONO, fontSize: 20, color: cd.c }}>{cd.ex}</div>
          </div>
        );
      })}
    </Stage>
  );
};

// fq_valuation — bear / base / bull ------------------------------------------
// NARRATION: But is the price fair today? Model three futures. A bad case, a middle case, a good
// case — each is a fair price-to-earnings times expected profit. Weight them by likelihood. For
// HAL, the honest average sits near today's price: the growth is already in the price.
export const ValuationScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const cur = 4861;
  const bars = [
    { k: "Bear · 30%", v: 3718, pct: "-24%", c: A.risk },
    { k: "Base · 50%", v: 4758, pct: "-2%", c: A.main },
    { k: "Bull · 20%", v: 5651, pct: "+16%", c: A.fund },
  ];
  const SCALE = 0.075; // px per rupee — keeps the tallest (bull) value label clear of the header
  const Y0 = 770;
  return (
    <Stage>
      <SceneProgress p={p} color={A.val} />
      <FQHead kicker="BEAR · BASE · BULL" title="Three futures for one stock (HAL)" color={A.val} p={p} />
      {/* current-price reference line */}
      <div style={{ position: "absolute", left: 260, top: Y0 - cur * SCALE, width: 1360, borderTop: `2.5px dashed ${T.muted}`, opacity: p(0.14, 0.24) }} />
      <div style={{ position: "absolute", left: 1630, top: Y0 - cur * SCALE - 14, fontFamily: MONO, fontSize: 22, color: T.muted, opacity: p(0.16, 0.26) }}>now ₹{cur.toLocaleString("en-IN")}</div>
      {bars.map((b, i) => {
        const at = 0.24 + i * 0.14;
        const grow = p(at, at + 0.14);
        const h = b.v * SCALE * grow;
        const x = 360 + i * 420;
        return (
          <div key={i}>
            <div style={{ position: "absolute", left: x, top: Y0 - h, width: 280, height: h, borderRadius: "14px 14px 0 0",
              background: `linear-gradient(180deg, ${b.c}, ${mix(b.c, T.bg1, 0.5)})`, border: `2.5px solid ${b.c}`, borderBottom: "none",
              boxShadow: `0 0 26px ${mix(T.bg0, b.c, 0.25)}` }} />
            <div style={{ position: "absolute", left: x, top: Y0 - h - 68, width: 280, textAlign: "center", opacity: grow }}>
              <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 34, color: b.c }}>₹{Math.round(b.v * grow).toLocaleString("en-IN")}</div>
              <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 24, color: b.c }}>{b.pct}</div>
            </div>
            <div style={{ position: "absolute", left: x, top: Y0 + 12, width: 280, textAlign: "center", fontFamily: MONO, fontSize: 22, color: T.muted, opacity: p(at, at + 0.08) }}>{b.k}</div>
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 100, top: 250, width: 1720, fontFamily: SANS, fontSize: 27, color: A.val, opacity: p(0.72, 0.82) }}>
        Probability-weighted fair value ≈ ₹4,625 — the growth is already in the price.
      </div>
    </Stage>
  );
};

// fq_gtt — staggered entry + protective stop ---------------------------------
// NARRATION: Finally, how to actually buy. Don't buy all at once. Place two orders below the
// price, so you average in on dips. That is a G-T-T — an order that only fires when price hits
// your trigger. And always set a stop-loss underneath, so a bad call can only cost so much.
export const GTTScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const levels = [
    { y: 300, price: "₹5,099", tag: "Target — reclaim the high", c: A.fund, at: 0.62 },
    { y: 400, price: "₹4,861", tag: "Price now", c: T.muted, at: 0.1 },
    { y: 520, price: "₹4,760", tag: "Buy leg 1 (GTT trigger)", c: A.tech, at: 0.24 },
    { y: 600, price: "₹4,560", tag: "Buy leg 2 (deeper dip)", c: A.tech, at: 0.36 },
    { y: 720, price: "₹4,090", tag: "Stop-loss — cap the damage", c: A.risk, at: 0.5 },
  ];
  return (
    <Stage>
      <SceneProgress p={p} color={A.tech} />
      <FQHead kicker="BUYING IT · WITH A PLAN" title="Stagger in — and always set a stop" color={A.tech} p={p} />
      {/* definition on the left */}
      <div style={{ position: "absolute", left: 100, top: 300, width: 560 }}>
        <DefBadge text="GTT order" color={A.tech} o={p(0.12, 0.2)} />
        <div style={{ fontFamily: SANS, fontSize: 28, color: T.text, marginTop: 20, lineHeight: 1.4, opacity: p(0.16, 0.28) }}>
          A “good-till-triggered” order sits waiting. It fires <span style={{ color: A.tech, fontWeight: 700 }}>only</span> when the price hits the level you set — so you can plan every entry and exit in advance.
        </div>
        <div style={{ fontFamily: SANS, fontSize: 25, color: A.fund, marginTop: 26, lineHeight: 1.4, opacity: p(0.44, 0.56) }}>
          Two buy legs → you average in on dips.<br />One stop → your loss is capped.
        </div>
      </div>
      {/* the price ladder on the right */}
      <div style={{ position: "absolute", left: 760, top: 260, width: 4, height: 500, background: mix(T.line, A.tech, 0.4), opacity: p(0.1, 0.2) }} />
      {levels.map((l, i) => {
        const o = p(l.at, l.at + 0.1);
        return (
          <div key={i}>
            <div style={{ position: "absolute", left: 760, top: l.y, width: 840, borderTop: `2.5px dashed ${l.c}`, opacity: o }} />
            <div style={{ position: "absolute", left: 560, top: l.y - 16, width: 180, textAlign: "right", fontFamily: MONO, fontWeight: 800, fontSize: 28, color: l.c, opacity: o }}>{l.price}</div>
            <div style={{ position: "absolute", left: 810, top: l.y - 32, fontFamily: SANS, fontSize: 24, color: T.text, opacity: o }}>{l.tag}</div>
          </div>
        );
      })}
      {/* price dot bobbing at "now" */}
      <div style={{ position: "absolute", left: 748, top: 400 + Math.sin(frame * 0.08) * 6 - 9, width: 18, height: 18, borderRadius: 18, background: T.text, boxShadow: `0 0 16px ${T.text}`, opacity: p(0.12, 0.2) }} />
    </Stage>
  );
};
