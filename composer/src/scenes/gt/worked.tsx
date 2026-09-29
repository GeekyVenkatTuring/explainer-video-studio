/**
 * gt/worked.tsx — the two worked examples (Claude-owned), data-driven from build.py `stock`.
 *   HALScene   — the full plan fires end-to-end: legs trigger, fills accumulate, exits rest
 *   SyrmaScene — discipline: extended at highs, wait for the dip, roll forward — don't chase
 */
import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { Stage, Flow, mix as pmix } from "../../lib/primitives";
import {
  T, A, MONO, SANS, useP, usePop, GTHead, SceneProgress, DefBadge, Chip, Verdict,
  CandleChart, OrderTicket, OCOBracket, FillMeter, priceY, stockTape, toCandles, rupee,
} from "./kit";

type Stock = any;
const HAL: Stock = { tk: "HAL", name: "Hindustan Aeronautics", sector: "Defence · aircraft", cap: "Large-cap",
  ltp: 4861.1, d50: 4652.9, d200: 4383, hi52: 5099, leg1: 4760, q1: 4, dip1: -1.8, leg2: 4560, q2: 4, dip2: -5.9,
  avg: 4675, sh: 8, outlay: 37400, stop: 4090, stopPct: -13.2, tgt: 5099, tgtPct: 9.1, rr: 3.8 };
const SYRMA: Stock = { tk: "SYRMA", name: "Syrma SGS", sector: "Small-cap · EMS", cap: "Small-cap",
  ltp: 1474.3, d50: 1411, d200: 1008, hi52: 1516.4, pos52: 95, leg1: 1420, q1: 14, dip1: -3.1, leg2: 1320, q2: 15, dip2: -9.9,
  avg: 1376.3, sh: 29, outlay: 39912, stop: 1190, stopPct: -14.3, tgt: 1516.4, tgtPct: 10.2, rr: 3.5 };

// ---------------------------------------------------------------- HAL — full plan fires
export const HALScene: React.FC<{ dur?: number; stock?: Stock }> = ({ dur, stock }) => {
  const s = stock || HAL;
  const p = useP(dur); const pop = usePop(dur);
  const cx = 110, cy = 300, cw = 1040, ch = 470;
  const lo = s.stop - 130, hi = s.tgt + 120;
  const C = toCandles(stockTape(s.ltp, lo, hi, 11), 4);
  // descending price marker: ltp -> leg1 -> leg2, then settle
  const CLc = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
  const ph: number = p(0, 1);
  const price: number = ph < 0.32
    ? interpolate(p(0.12, 0.3), [0, 1], [s.ltp, s.leg1], CLc)
    : interpolate(p(0.34, 0.5), [0, 1], [s.leg1, s.leg2], CLc);
  const fire1 = p(0.28, 0.36), fire2 = p(0.48, 0.56);
  const y1 = priceY(s.leg1, lo, hi, cy, ch), y2 = priceY(s.leg2, lo, hi, cy, ch);
  const yAvg = priceY(s.avg, lo, hi, cy, ch), yTgt = priceY(s.tgt, lo, hi, cy, ch), yStop = priceY(s.stop, lo, hi, cy, ch);
  const filled = fire2 > 0.5 ? s.sh : fire1 > 0.5 ? s.q1 : 0;
  const runAvg = fire2 > 0.5 ? s.avg : s.leg1;
  return (
    <Stage>
      <SceneProgress p={p} color={A.main} />
      <GTHead kicker={`IN ACTION · ${s.tk}`} title="Watch the whole plan fire" color={A.main} p={p} />
      <CandleChart x={cx} y={cy} w={cw} h={ch} candles={C} lo={lo} hi={hi} reveal={p(0.06, 0.48)} o={p(0.05, 0.14)}
        rails={[
          { price: s.leg1, label: `LEG 1 ${rupee(s.leg1)}`, color: A.buy, dashed: true, fired: fire1 },
          { price: s.leg2, label: `LEG 2 ${rupee(s.leg2)}`, color: A.buy, dashed: true, fired: fire2 },
          { price: s.tgt, label: `TARGET ${rupee(s.tgt)}`, color: A.tgt, dashed: true, fired: 0 },
          { price: s.stop, label: `STOP ${rupee(s.stop)}`, color: A.stop, dashed: true, fired: 0 },
        ]}
        marker={{ price, o: p(0.16, 0.26), color: A.price }} axis={false} />
      {/* OCO bracket on the right rail (resting) */}
      <div style={{ opacity: p(0.6, 0.7) }}>
        <OCOBracket x={cx + cw} yEntry={yAvg} yTgt={yTgt} yStop={yStop}
          tgtLabel={`+${s.tgtPct}%`} stopLabel={`${s.stopPct}%`} fired={null} o={p(0.6, 0.7)} />
      </div>
      {/* order tickets */}
      {fire1 > 0.15 && <OrderTicket x={cx + 150} y={y1 - 58} side="BUY" qty={s.q1} price={s.leg1} o={p(0.3, 0.4)} />}
      {fire2 > 0.15 && <OrderTicket x={cx + 150} y={y2 + 20} side="BUY" qty={s.q2} price={s.leg2} o={p(0.5, 0.6)} />}
      {/* fill meter */}
      <div style={{ transform: `scale(${0.96 + pop(0.5) * 0.04})` }}>
        <FillMeter x={1370} y={330} qty={filled} total={s.sh} avg={runAvg} o={p(0.34, 0.44)} />
      </div>
      <div style={{ position: "absolute", left: 1370, top: 500, width: 430, opacity: p(0.62, 0.74) }}>
        <DefBadge text="TWO EXITS REST" color={A.tgt} />
        <div style={{ marginTop: 12, fontFamily: SANS, fontSize: 23, color: T.text, lineHeight: 1.4 }}>
          If it climbs, the target sells and the stop cancels. If it breaks, the stop sells and the target cancels.
        </div>
      </div>
      <Flow x1={cx + cw - 120} y1={y1} x2={cx + cw - 120} y2={y2} color={A.buy} n={6} speed={0.014} size={7} o={0.5} />
      <Verdict color={A.main} o={p(0.83, 0.9)} text={`One plan, placed once — ${s.sh} shares averaging ${rupee(s.avg)}, bracketed by a stop and a target. Then you let it work.`} />
    </Stage>
  );
};

// ---------------------------------------------------------------- DIXON — scale + beta
const DIXON: Stock = { tk: "DIXON", name: "Dixon Technologies", sector: "Electronics · EMS", cap: "Mid-cap",
  ltp: 14650, d50: 13689, d200: 12230, hi52: 18177, beta: 1.53, leg1: 14300, q1: 1, dip1: -2.0, leg2: 13700, q2: 2, dip2: -6.1,
  avg: 13960, sh: 3, outlay: 41880, stop: 12100, stopPct: -14.0, tgt: 18177, tgtPct: 30.2, rr: 3.6 };

export const DixonScene: React.FC<{ dur?: number; stock?: Stock }> = ({ dur, stock }) => {
  const s = stock || DIXON;
  const p = useP(dur);
  const cx = 110, cy = 300, cw = 1020, ch = 470;
  const lo = 11900, hi = 15400; // target (18,177) sits far above — shown as an off-chart chip
  const C = toCandles(stockTape(s.ltp, lo, hi, 31), 5);
  return (
    <Stage>
      <SceneProgress p={p} color={A.buy} />
      <GTHead kicker={`IN ACTION · ${s.tk}`} title="Same method, a very different scale" color={A.buy} p={p} />
      <CandleChart x={cx} y={cy} w={cw} h={ch} candles={C} lo={lo} hi={hi} reveal={p(0.06, 0.5)} o={p(0.05, 0.14)}
        rails={[
          { price: s.ltp, label: `NOW ${rupee(s.ltp)}`, color: A.price, fired: p(0.16, 0.24) },
          { price: s.leg1, label: `LEG 1 ${rupee(s.leg1)} · 1 sh`, color: A.buy, dashed: true, fired: p(0.34, 0.44) },
          { price: s.leg2, label: `LEG 2 ${rupee(s.leg2)} · 2 sh`, color: A.buy, dashed: true, fired: p(0.46, 0.56) },
          { price: s.stop, label: `STOP ${rupee(s.stop)}`, color: A.stop, dashed: true, fired: p(0.6, 0.68) },
        ]}
        marker={{ price: s.ltp, o: p(0.16, 0.26), color: A.price }} axis />
      <div style={{ position: "absolute", left: 1300, top: 300, width: 500 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, opacity: p(0.3, 0.42) }}>
          <Chip label="per share" value={rupee(s.ltp)} color={A.trig} />
          <Chip label="budget → shares" value="₹40k → 3 sh" color={A.buy} hero />
          <Chip label="volatility" value={`β ${s.beta}`} color={A.stop} sub="wilder than market" />
        </div>
        <div style={{ marginTop: 20, background: pmix(T.panel, A.buy, 0.09), border: `2px solid ${pmix(T.line, A.buy, 0.5)}`, borderRadius: 14, padding: "15px 20px", opacity: p(0.5, 0.62) }}>
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 21, color: A.buy }}>WIDER LEGS, ROOMIER STOP</div>
          <div style={{ fontFamily: SANS, fontSize: 22, color: T.text, marginTop: 6, lineHeight: 1.35 }}>
            A high-beta name swings hard, so the legs sit a little wider and the stop gives it room to breathe.
          </div>
        </div>
        <div style={{ marginTop: 18, display: "flex", alignItems: "center", gap: 10, opacity: p(0.66, 0.78) }}>
          <Chip label="first objective" value={`TGT ${rupee(s.tgt)}`} color={A.tgt} sub={`+${s.tgtPct}% ↑ above`} />
        </div>
      </div>
      <Verdict color={A.buy} o={p(0.82, 0.9)} text={`Same four numbers — two legs, a stop, a target — sized and spaced for a pricier, wilder stock.`} />
    </Stage>
  );
};

// ---------------------------------------------------------------- SYRMA — discipline
export const SyrmaScene: React.FC<{ dur?: number; stock?: Stock }> = ({ dur, stock }) => {
  const s = stock || SYRMA;
  const p = useP(dur); const frame = useCurrentFrame();
  const cx = 110, cy = 300, cw = 1030, ch = 470;
  const lo = s.stop - 60, hi = s.hi52 + 55;
  const C = toCandles(stockTape(s.ltp, lo, hi, 23), 6);
  const fire1 = p(0.5, 0.58); // only leg 1 might fill
  return (
    <Stage>
      <SceneProgress p={p} color={A.trig} />
      <GTHead kicker={`IN ACTION · ${s.tk}`} title="The one that tests your discipline" color={A.trig} p={p} />
      <CandleChart x={cx} y={cy} w={cw} h={ch} candles={C} lo={lo} hi={hi} reveal={p(0.06, 0.5)} o={p(0.05, 0.14)}
        rails={[
          { price: s.hi52, label: `52-WK HIGH ${rupee(s.hi52)}`, color: A.stop, fired: p(0.18, 0.28) },
          { price: s.leg1, label: `LEG 1 ${rupee(s.leg1)} · −3%`, color: A.buy, dashed: true, fired: fire1 },
          { price: s.leg2, label: `LEG 2 ${rupee(s.leg2)} · −10%`, color: A.buy, dashed: true, fired: 0 },
        ]}
        marker={{ price: s.ltp, o: p(0.16, 0.26), color: A.price, label: `${rupee(s.ltp)} · at the top` }} axis={false} />
      {/* don't-chase warning */}
      <div style={{ position: "absolute", left: 1340, top: 300, width: 460 }}>
        <div style={{ background: pmix(T.panel, A.stop, 0.12), border: `2px solid ${A.stop}`, borderRadius: 14, padding: "15px 20px",
          opacity: p(0.28, 0.38), boxShadow: `0 0 30px ${pmix(T.bg0, A.stop, 0.3 + Math.sin(frame * 0.1) * 0.1)}` }}>
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 23, color: A.stop }}>⚠ AT 52-WEEK HIGH</div>
          <div style={{ fontFamily: SANS, fontSize: 23, color: T.text, marginTop: 6 }}>
            {s.pos52}% up its yearly range, RSI hot. Chase here and you're buying the very top.
          </div>
        </div>
        <div style={{ marginTop: 18, background: pmix(T.panel, A.buy, 0.09), border: `2px solid ${A.buy}`, borderRadius: 14, padding: "15px 20px", opacity: p(0.5, 0.6) }}>
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 22, color: A.buy }}>SO THE PLAN WAITS</div>
          <div style={{ fontFamily: SANS, fontSize: 22, color: T.text, marginTop: 6 }}>Leg 1 waits −3%; leg 2 waits nearly −10%, on a real correction.</div>
        </div>
        <div style={{ marginTop: 18, display: "flex", alignItems: "center", gap: 12, opacity: p(0.68, 0.78) }}>
          <Chip label="if only leg 1 fills" value="ROLL FORWARD →" color={A.trig} hero />
        </div>
      </div>
      <Verdict color={A.trig} o={p(0.82, 0.9)} text="Don't chase leg 2 higher — let it go, and roll that budget to next month. The plan protects you from your own excitement." />
    </Stage>
  );
};
