/**
 * gt/gtt.tsx — Order types + the GTT mechanic (Claude-owned).
 *   OrderTypesScene — market vs limit vs GTT (validity timeline)
 *   GTTMechScene    — HERO: price descends into a trigger rail, fires, ticket pops
 *   TriggerScene    — trigger price vs limit price
 *   OCOScene        — Single vs OCO (one cancels the other)
 */
import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { Stage, Flow, mix as pmix } from "../../lib/primitives";
import {
  T, A, MONO, SANS, useP, usePop, GTHead, SceneProgress, DefBadge, Chip, Verdict,
  CandleChart, OrderTicket, OCOBracket, Ladder, priceY, TAPE_C, TAPE, rupee,
} from "./kit";

const LO = Math.min(...TAPE) - 3, HI = Math.max(...TAPE) + 3;

// ---------------------------------------------------------------- ORDER TYPES
export const OrderTypesScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const p = useP(dur);
  const cards = [
    { name: "MARKET", price: "any price", life: "now", frac: 0.02, c: A.stop, note: "fast — you don't control the price", at: 0.14 },
    { name: "LIMIT", price: "your price", life: "today only", frac: 0.16, c: A.trig, note: "controls price — but dies at the bell", at: 0.32 },
    { name: "GTT", price: "your price", life: "up to 1 YEAR", frac: 1.0, c: A.main, note: "waits patiently until your price is hit", at: 0.52 },
  ];
  const X0 = 130, W = 500, GAP = 30;
  return (
    <Stage>
      <SceneProgress p={p} color={A.main} />
      <GTHead kicker="ORDER TYPES · 01" title="Every order: what price, and for how long?" color={A.main} p={p} />
      {cards.map((c, i) => {
        const x = X0 + i * (W + GAP);
        const o = p(c.at, c.at + 0.09);
        return (
          <div key={i} style={{ position: "absolute", left: x, top: 250, width: W, height: 470, borderRadius: 18,
            background: pmix(T.panel, c.c, i === 2 ? 0.14 : 0.07), border: `2.5px solid ${c.c}`, opacity: o,
            transform: `translateY(${(1 - o) * 22}px)`, padding: "24px 26px", boxSizing: "border-box" }}>
            <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 34, color: c.c }}>{c.name}</div>
            <div style={{ marginTop: 22, fontFamily: MONO, fontSize: 20, color: T.muted }}>PRICE</div>
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 30, color: T.text }}>{c.price}</div>
            <div style={{ marginTop: 18, fontFamily: MONO, fontSize: 20, color: T.muted }}>STAYS ALIVE</div>
            <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 30, color: i === 2 ? c.c : T.text }}>{c.life}</div>
            {/* validity bar */}
            <div style={{ marginTop: 22, height: 12, width: "100%", background: pmix(T.bg0, T.bg2, 0.5), borderRadius: 8, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${interpolate(p(c.at + 0.05, c.at + 0.2), [0, 1], [0, 100]) * c.frac}%`,
                background: c.c, boxShadow: `0 0 12px ${c.c}` }} />
            </div>
            <div style={{ marginTop: 22, fontFamily: SANS, fontSize: 22, color: T.muted, lineHeight: 1.35 }}>{c.note}</div>
          </div>
        );
      })}
      <Flow x1={X0 + W} y1={480} x2={X0 + 2 * (W + GAP)} y2={480} color={A.main} n={9} speed={0.01} size={8} o={0.5} />
      <Verdict color={A.main} o={p(0.8, 0.9)} text="Only the GTT stays alive for months — that patience is what lets you plan an entry in advance." />
    </Stage>
  );
};

// ---------------------------------------------------------------- GTT MECHANIC (hero)
export const GTTMechScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const p = useP(dur); const pop = usePop(dur);
  const cx = 120, cy = 300, cw = 1040, ch = 470;
  // BUY trigger sits BELOW the current price; the marker descends into it and fires.
  const start = HI - 5, trig = LO + (HI - LO) * 0.34;
  const price = interpolate(p(0.2, 0.62), [0, 1], [start, trig - 0.3]);
  const fired = p(0.6, 0.7);
  const railY = priceY(trig, LO, HI, cy, ch);
  const steps = [
    { n: 1, t: "Set a trigger price", c: A.trig, at: 0.12 },
    { n: 2, t: "It waits — dormant, up to a year", c: A.main, at: 0.28 },
    { n: 3, t: "Price touches it → order fires", c: A.buy, at: 0.44 },
  ];
  return (
    <Stage>
      <SceneProgress p={p} color={A.main} />
      <GTHead kicker="ORDER TYPES · 02" title="Good Till Triggered: a resting order" color={A.main} p={p} />
      <CandleChart x={cx} y={cy} w={cw} h={ch} candles={TAPE_C} lo={LO} hi={HI} reveal={p(0.08, 0.55)}
        o={p(0.06, 0.16)}
        rails={[{ price: trig, label: `TRIGGER ${rupee(trig, 0)}`, color: A.trig, dashed: true, fired }]}
        marker={{ price, o: p(0.2, 0.3), color: A.price }} xlabels={["", "NOW"]} />
      {/* fired order ticket, at the rail */}
      <div style={{ opacity: fired > 0.15 ? 1 : 0 }}>
        <OrderTicket x={cx + cw - 300} y={railY + 26} side="BUY" qty={4} price={trig} o={p(0.62, 0.72)} note="auto-placed" />
      </div>
      {/* the 3 steps */}
      <div style={{ position: "absolute", left: 1230, top: 300 }}>
        <DefBadge text="THE MECHANIC" color={A.main} o={p(0.06, 0.14)} />
        {steps.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 22,
            opacity: p(s.at, s.at + 0.08), transform: `translateY(${(1 - p(s.at, s.at + 0.08)) * 14}px)` }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: pmix(T.panel, s.c, 0.16),
              border: `2px solid ${s.c}`, display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: MONO, fontWeight: 800, fontSize: 22, color: s.c, flexShrink: 0 }}>{s.n}</div>
            <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 26, color: T.text, width: 430 }}>{s.t}</div>
          </div>
        ))}
        <div style={{ marginTop: 34, opacity: p(0.7, 0.8), transform: `scale(${0.95 + pop(0.7) * 0.05})` }}>
          <Chip label="stays alive" value="UP TO 1 YEAR" color={A.main} hero />
        </div>
      </div>
      <Flow x1={cx + cw - 200} y1={railY} x2={cx + cw - 60} y2={railY} color={A.trig} n={6} speed={0.02} size={7} o={fired * 0.8} />
      <Verdict color={A.main} o={p(0.82, 0.9)} text="It waits, patiently, until your price is finally touched — then fires automatically. No screen-watching." />
    </Stage>
  );
};

// ---------------------------------------------------------------- ORDER BOOK / where it rests
export const OrderbookScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const p = useP(dur); const frame = useCurrentFrame();
  const hit = p(0.5, 0.6);
  const rows = [
    { price: 4820, label: "asks", color: T.muted },
    { price: 4800, label: "asks", color: T.muted },
    { price: 4780, label: "— last —", color: A.price },
    { price: 4775, label: "GTT rests here", color: A.trig, hit, qty: 4 },
    { price: 4760, label: "limit", color: A.buy },
    { price: 4740, label: "bids", color: T.muted },
  ];
  return (
    <Stage>
      <SceneProgress p={p} color={A.main} />
      <GTHead kicker="ORDER TYPES · WHERE IT RESTS" title="A GTT waits at your broker — not the exchange" color={A.main} p={p} />
      <Ladder x={150} y={300} w={420} rows={rows} title="PRICE LADDER" o={p(0.1, 0.24)} />
      {/* contrast: exchange book vs broker */}
      <div style={{ position: "absolute", left: 660, top: 300, width: 540, height: 190, borderRadius: 16,
        background: pmix(T.panel, A.d200, 0.08), border: `2px solid ${mixLine(A.d200)}`, padding: "20px 24px", boxSizing: "border-box", opacity: p(0.28, 0.4) }}>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 24, color: A.d200 }}>EXCHANGE BOOK</div>
        <div style={{ marginTop: 10, fontFamily: SANS, fontSize: 24, color: T.text, lineHeight: 1.35 }}>
          A limit order joins a public queue — visible to everyone, valid only for today.
        </div>
      </div>
      <div style={{ position: "absolute", left: 1240, top: 300, width: 560, height: 190, borderRadius: 16,
        background: pmix(T.panel, A.trig, 0.1), border: `2px solid ${A.trig}`, padding: "20px 24px", boxSizing: "border-box", opacity: p(0.44, 0.56) }}>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 24, color: A.trig }}>YOUR BROKER</div>
        <div style={{ marginTop: 10, fontFamily: SANS, fontSize: 24, color: T.text, lineHeight: 1.35 }}>
          A GTT waits quietly at your broker — nobody sees it — for up to a year.
        </div>
      </div>
      {/* when triggered, broker sends the real order down to the exchange */}
      <div style={{ position: "absolute", left: 660, top: 540, width: 1140, opacity: p(0.64, 0.76) }}>
        <DefBadge text="WHEN THE LADDER FALLS TO YOUR TRIGGER" color={A.buy} />
        <div style={{ marginTop: 14, fontFamily: SANS, fontSize: 28, color: T.text, lineHeight: 1.4 }}>
          your broker sends the real order down to the exchange — automatically. Until then it simply rests, one rung, waiting for the market to come to it.
        </div>
      </div>
      <Flow x1={620} y1={470} x2={1230} y2={400} color={A.trig} n={8} speed={0.012} size={8} o={0.5 + Math.sin(frame * 0.05) * 0.2} />
      <Verdict color={A.main} o={p(0.82, 0.9)} text="It rests where you chose — private, patient — and only becomes a live order the moment your price is hit." />
    </Stage>
  );
};

// small helper for a muted tinted border
const mixLine = (c: string) => pmix(T.line, c, 0.5);

// ---------------------------------------------------------------- TRIGGER vs LIMIT
export const TriggerScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const p = useP(dur);
  // zoomed vertical price band around HAL's leg-1: trigger 4775 above limit 4760
  const bandTop = 300, bandH = 460, x = 300, w = 520;
  const hiP = 4790, loP = 4745;
  const Y = (pr: number) => bandTop + bandH - ((pr - loP) / (hiP - loP)) * bandH;
  const price = interpolate(p(0.3, 0.7), [0, 1], [hiP - 3, 4757]);
  const fired = p(0.58, 0.66);
  return (
    <Stage>
      <SceneProgress p={p} color={A.trig} />
      <GTHead kicker="ORDER TYPES · 03" title="Two prices: the trigger and the limit" color={A.trig} p={p} />
      {/* vertical price band */}
      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
        <rect x={x} y={bandTop} width={w} height={bandH} fill={pmix(T.bg0, T.bg2, 0.5)} stroke={T.line} rx={12} />
        <line x1={x} y1={Y(4775)} x2={x + w} y2={Y(4775)} stroke={A.trig} strokeWidth={3} opacity={p(0.16, 0.26)} />
        <line x1={x} y1={Y(4760)} x2={x + w} y2={Y(4760)} stroke={A.buy} strokeWidth={3} strokeDasharray="8 8" opacity={p(0.26, 0.36)} />
        <circle cx={x + w - 44} cy={Y(price)} r={11} fill={A.price} opacity={p(0.3, 0.4)} />
        {fired > 0.1 && <rect x={x} y={Y(4760) - 10} width={w} height={20} fill={A.buy} opacity={0.1 + fired * 0.15} />}
      </svg>
      {/* labels ON the band lines (left-inside), so they never reach the right column */}
      <div style={{ position: "absolute", left: x + 16, top: Y(4775) - 34, opacity: p(0.18, 0.28) }}>
        <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: 24, color: A.trig, background: pmix(T.bg0, A.trig, 0.12), borderRadius: 6, padding: "3px 10px" }}>TRIGGER {rupee(4775)}</span>
      </div>
      <div style={{ position: "absolute", left: x + 16, top: Y(4760) + 8, opacity: p(0.28, 0.38) }}>
        <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: 24, color: A.buy, background: pmix(T.bg0, A.buy, 0.12), borderRadius: 6, padding: "3px 10px" }}>LIMIT {rupee(4760)}</span>
      </div>
      {/* right column — chips then the gap explainer, cleanly stacked */}
      <div style={{ position: "absolute", left: 960, top: 300, display: "flex", gap: 16, opacity: p(0.3, 0.42) }}>
        <Chip label="trigger" value={rupee(4775)} color={A.trig} sub="wakes it" />
        <Chip label="limit" value={rupee(4760)} color={A.buy} sub="placed here" />
        <Chip label="gap" value="₹15" color={A.main} hero />
      </div>
      <div style={{ position: "absolute", left: 960, top: 470, width: 780 }}>
        <DefBadge text="WHY A GAP" color={A.trig} o={p(0.5, 0.58)} />
        <div style={{ marginTop: 16, fontFamily: SANS, fontSize: 29, color: T.text, lineHeight: 1.42, opacity: p(0.54, 0.66) }}>
          When the trigger fires, the price is already moving through your limit — so the order actually fills.
          A market that gaps down would blow past a limit set exactly at the trigger.
        </div>
      </div>
      <Flow x1={x + w - 44} y1={Y(4788)} x2={x + w - 44} y2={Y(4760)} color={A.trig} n={5} speed={0.02} size={7} o={0.7} />
      <Verdict color={A.trig} o={p(0.82, 0.9)} text="Trigger a few rupees above your limit — that's what makes a buy order marketable when it fires." />
    </Stage>
  );
};

// ---------------------------------------------------------------- SINGLE vs OCO
export const OCOScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const p = useP(dur);
  const cx = 120, cy = 300, cw = 980, ch = 470;
  const entry = TAPE[TAPE.length - 1];
  const tgt = entry * 1.07, stop = entry * 0.93;
  const railX = cx + cw;
  const yEntry = priceY(entry, LO, HI, cy, ch);
  const yTgt = priceY(tgt, LO, HI, cy, ch);
  const yStop = priceY(stop, LO, HI, cy, ch);
  const fired: "target" | "stop" | null = p(0.72, 0.78) > 0.5 ? "target" : null;
  return (
    <Stage>
      <SceneProgress p={p} color={A.tgt} />
      <GTHead kicker="ORDER TYPES · 04" title="Single vs OCO: one cancels the other" color={A.tgt} p={p} />
      <CandleChart x={cx} y={cy} w={cw} h={ch} candles={TAPE_C} lo={LO} hi={HI} reveal={p(0.08, 0.5)}
        o={p(0.06, 0.16)} marker={{ price: entry, o: p(0.2, 0.3), color: A.price, label: " " }} axis={false} />
      <div style={{ opacity: p(0.4, 0.5) }}>
        <OCOBracket x={railX} yEntry={yEntry} yTgt={yTgt} yStop={yStop}
          tgtLabel={`TARGET ${rupee(tgt)}`} stopLabel={`STOP ${rupee(stop)}`} entryLabel="entry (avg)"
          fired={fired} o={p(0.4, 0.5)} />
      </div>
      {/* explanation column */}
      <div style={{ position: "absolute", left: 1330, top: 300, width: 470 }}>
        <div style={{ background: pmix(T.panel, A.main, 0.08), border: `2px solid ${A.main}`, borderRadius: 14,
          padding: "16px 20px", opacity: p(0.14, 0.24) }}>
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 24, color: A.main }}>SINGLE</div>
          <div style={{ fontFamily: SANS, fontSize: 23, color: T.text, marginTop: 6 }}>one trigger → one order. Your entry.</div>
        </div>
        <div style={{ marginTop: 20, background: pmix(T.panel, A.tgt, 0.1), border: `2px solid ${A.tgt}`, borderRadius: 14,
          padding: "16px 20px", opacity: p(0.3, 0.4) }}>
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 24, color: A.tgt }}>OCO</div>
          <div style={{ fontFamily: SANS, fontSize: 23, color: T.text, marginTop: 6, lineHeight: 1.35 }}>
            two triggers — a target above, a stop below. Whichever fires, the other is cancelled.
          </div>
        </div>
        <div style={{ marginTop: 20, fontFamily: SANS, fontSize: 24, color: A.tgt, opacity: p(0.74, 0.84), fontWeight: 700 }}>
          {fired === "target" ? "▲ target hit → stop auto-cancelled" : "waiting… one exit, two outcomes"}
        </div>
      </div>
      <Verdict color={A.tgt} o={p(0.82, 0.9)} text="Bracket the position once — sell into strength, or let the stop protect you. Never choose in the heat of the moment." />
    </Stage>
  );
};
