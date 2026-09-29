/**
 * gt/chart.tsx — the chart-driven teaching scenes (Claude-owned).
 *   AllAtOnceScene — one buy vs averaging in (generic tape)
 *   TwoLegsScene   — two legs below price, avg between (HAL scale)
 *   DMAScene       — computed 50/200-DMA smoothing + support (generic tape)
 *   LegsScene      — derive leg 1 (shallow, at 50-DMA) + leg 2 (deep, toward 200-DMA)
 *   StopTargetScene— stop below 200-DMA, target at 52w-high, +50/+100 honesty
 */
import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { Stage, Flow, mix as pmix } from "../../lib/primitives";
import {
  T, A, MONO, SANS, useP, GTHead, SceneProgress, DefBadge, Chip, Verdict,
  CandleChart, OCOBracket, priceY, stockTape, toCandles, TAPE, TAPE_C, TAPE_50, TAPE_200, rupee,
} from "./kit";

const LO = Math.min(...TAPE) - 3, HI = Math.max(...TAPE) + 3;

// HAL worked scale
const H = { ltp: 4861.1, d50: 4652.9, d200: 4383, hi52: 5099, leg1: 4760, leg2: 4560, avg: 4675, stop: 4090, tgt: 5099 };
const HLO = 3980, HHI = 5180;
const HAL_TAPE = stockTape(H.ltp, HLO, HHI, 11);
const HAL_C = toCandles(HAL_TAPE, 4);

// ---------------------------------------------------------------- ALL-AT-ONCE vs STAGGERED
export const AllAtOnceScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const p = useP(dur);
  const cx = 110, cy = 300, cw = 1010, ch = 470;
  const top = HI - 4, l1 = HI - 13, l2 = HI - 21, savg = (l1 + l2) / 2;
  return (
    <Stage>
      <SceneProgress p={p} color={A.buy} />
      <GTHead kicker="STAGGERED ENTRY · 01" title="One buy is a bet on one moment" color={A.buy} p={p} />
      <CandleChart x={cx} y={cy} w={cw} h={ch} candles={TAPE_C} lo={LO} hi={HI} reveal={p(0.08, 0.5)} o={p(0.06, 0.16)}
        rails={[
          { price: top, label: "ALL-IN AVG", color: A.stop, fired: p(0.2, 0.3) },
          { price: l1, label: "LEG 1", color: A.buy, dashed: true, fired: p(0.5, 0.58) },
          { price: l2, label: "LEG 2", color: A.buy, dashed: true, fired: p(0.6, 0.68) },
          { price: savg, label: "STAGGERED AVG", color: A.main, fired: p(0.7, 0.78) },
        ]}
        axis={false} xlabels={["", ""]} />
      <div style={{ position: "absolute", left: 1330, top: 300, width: 470 }}>
        <div style={{ background: pmix(T.panel, A.stop, 0.1), border: `2px solid ${A.stop}`, borderRadius: 14, padding: "16px 20px", opacity: p(0.24, 0.34) }}>
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 23, color: A.stop }}>ALL AT ONCE</div>
          <div style={{ fontFamily: SANS, fontSize: 23, color: T.text, marginTop: 6, lineHeight: 1.35 }}>
            Average cost = today's price. If it dips, that's pure pain — and no cash left to answer it.
          </div>
        </div>
        <div style={{ marginTop: 22, background: pmix(T.panel, A.buy, 0.1), border: `2px solid ${A.buy}`, borderRadius: 14, padding: "16px 20px", opacity: p(0.52, 0.62) }}>
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 23, color: A.buy }}>STAGGERED</div>
          <div style={{ fontFamily: SANS, fontSize: 23, color: T.text, marginTop: 6, lineHeight: 1.35 }}>
            Buy some lower, some lower still. If the dip comes, your average falls; if not, you still own a starter.
          </div>
        </div>
      </div>
      <Flow x1={cx + cw - 120} y1={priceY(top, LO, HI, cy, ch)} x2={cx + cw - 120} y2={priceY(savg, LO, HI, cy, ch)} color={A.buy} n={7} speed={0.014} size={7} o={0.6} />
      <Verdict color={A.buy} o={p(0.82, 0.9)} text="Split the buy and you win either way — a cheaper average if it dips, a starter position if it doesn't." />
    </Stage>
  );
};

// ---------------------------------------------------------------- TWO LEGS (intro, HAL scale)
export const TwoLegsScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const p = useP(dur);
  const cx = 110, cy = 300, cw = 1020, ch = 470;
  return (
    <Stage>
      <SceneProgress p={p} color={A.buy} />
      <GTHead kicker="STAGGERED ENTRY · 02" title="Two legs, resting below the price" color={A.buy} p={p} />
      <CandleChart x={cx} y={cy} w={cw} h={ch} candles={HAL_C} lo={HLO} hi={HHI} reveal={p(0.08, 0.5)} o={p(0.06, 0.16)}
        rails={[
          { price: H.ltp, label: `NOW ${rupee(H.ltp)}`, color: A.price, fired: p(0.18, 0.26) },
          { price: H.leg1, label: `LEG 1 ${rupee(H.leg1)}`, color: A.buy, dashed: true, fired: p(0.34, 0.44) },
          { price: H.leg2, label: `LEG 2 ${rupee(H.leg2)}`, color: A.buy, dashed: true, fired: p(0.46, 0.56) },
          { price: H.avg, label: `AVG ${rupee(H.avg)}`, color: A.main, fired: p(0.62, 0.72) },
        ]}
        marker={{ price: H.ltp, o: p(0.2, 0.3), color: A.price }} />
      <div style={{ position: "absolute", left: 1360, top: 320, width: 440 }}>
        <DefBadge text="HAL · WORKED" color={A.main} o={p(0.1, 0.18)} />
        <div style={{ marginTop: 16, fontFamily: SANS, fontSize: 26, color: T.text, lineHeight: 1.4, opacity: p(0.3, 0.42) }}>
          Leg 1 is a shallow dip (−1.8%). Leg 2 is a deeper dip (−5.9%). Each is a GTT buy, waiting at its own price.
        </div>
        <div style={{ marginTop: 22, display: "flex", flexWrap: "wrap", gap: 14, opacity: p(0.6, 0.72) }}>
          <Chip label="leg 1" value={rupee(H.leg1)} color={A.buy} sub="−1.8%" />
          <Chip label="leg 2" value={rupee(H.leg2)} color={A.buy} sub="−5.9%" />
          <Chip label="average" value={rupee(H.avg)} color={A.main} hero sub="lands between" />
        </div>
      </div>
      <Verdict color={A.buy} o={p(0.82, 0.9)} text="Buy some higher, more lower — and your average lands below where you started, predicting nothing." />
    </Stage>
  );
};

// ---------------------------------------------------------------- DMA (computed smoothing)
export const DMAScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const p = useP(dur);
  const cx = 110, cy = 300, cw = 1040, ch = 470;
  return (
    <Stage>
      <SceneProgress p={p} color={A.d50} />
      <GTHead kicker="ANCHORS · MOVING AVERAGES" title="The chart chooses the prices" color={A.d50} p={p} />
      <CandleChart x={cx} y={cy} w={cw} h={ch} candles={TAPE_C} lo={LO} hi={HI} reveal={p(0.08, 0.55)} o={p(0.06, 0.16)}
        dmas={[
          { values: TAPE_50, color: A.d50, w: 3 },
          { values: TAPE_200, color: A.d200, w: 3 },
        ]}
        xlabels={["", "NOW"]} />
      <div style={{ position: "absolute", left: 1290, top: 300, width: 510 }}>
        <DefBadge text="DEFINITION" color={A.d50} o={p(0.1, 0.18)} />
        <div style={{ marginTop: 14, fontFamily: SANS, fontSize: 25, color: T.text, lineHeight: 1.4, opacity: p(0.2, 0.32) }}>
          A moving average is the average of the last N closes — a smooth line that follows the trend.
        </div>
        <div style={{ marginTop: 20, display: "flex", gap: 14, opacity: p(0.44, 0.56) }}>
          <Chip label="short trend" value="50-DMA" color={A.d50} />
          <Chip label="long trend" value="200-DMA" color={A.d200} />
        </div>
        <div style={{ marginTop: 20, fontFamily: SANS, fontSize: 24, color: T.muted, lineHeight: 1.4, opacity: p(0.58, 0.7) }}>
          Price falls back to these lines and bounces — so they act as support. For HAL: 50-DMA {rupee(H.d50)}, 200-DMA {rupee(H.d200)}.
        </div>
        <div style={{ marginTop: 18, display: "flex", gap: 14, opacity: p(0.7, 0.82) }}>
          <Chip label="hal · 50-dma" value={rupee(H.d50)} color={A.d50} />
          <Chip label="hal · 200-dma" value={rupee(H.d200)} color={A.d200} />
        </div>
      </div>
      <Verdict color={A.d50} o={p(0.83, 0.9)} text="Leg 1 hangs at the 50-DMA; leg 2 reaches toward the deeper support below. The chart chooses, not us." />
    </Stage>
  );
};

// ---------------------------------------------------------------- LEGS (derivation, HAL)
export const LegsScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const p = useP(dur);
  const cx = 110, cy = 300, cw = 1020, ch = 470;
  const yL1 = priceY(H.leg1, HLO, HHI, cy, ch), yL2 = priceY(H.leg2, HLO, HHI, cy, ch);
  return (
    <Stage>
      <SceneProgress p={p} color={A.buy} />
      <GTHead kicker="ANCHORS · DERIVING THE LEGS" title="Where each leg comes from" color={A.buy} p={p} />
      <CandleChart x={cx} y={cy} w={cw} h={ch} candles={HAL_C} lo={HLO} hi={HHI} reveal={p(0.08, 0.5)} o={p(0.06, 0.16)}
        rails={[
          { price: H.ltp, label: `PRICE ${rupee(H.ltp)}`, color: A.price, fired: p(0.16, 0.24) },
          { price: H.d50, label: `50-DMA ${rupee(H.d50)}`, color: A.d50, dashed: true, fired: p(0.28, 0.36) },
          { price: H.leg1, label: `LEG 1 ${rupee(H.leg1)}`, color: A.buy, fired: p(0.36, 0.46) },
          { price: H.d200, label: `200-DMA ${rupee(H.d200)}`, color: A.d200, dashed: true, fired: p(0.5, 0.58) },
          { price: H.leg2, label: `LEG 2 ${rupee(H.leg2)}`, color: A.buy, fired: p(0.6, 0.7) },
        ]}
        marker={{ price: H.ltp, o: p(0.2, 0.28), color: A.price }} axis={false} />
      {/* leg annotations */}
      <div style={{ position: "absolute", left: 1330, top: 300, width: 470 }}>
        <div style={{ background: pmix(T.panel, A.buy, 0.09), border: `2px solid ${A.buy}`, borderRadius: 14, padding: "15px 20px", opacity: p(0.4, 0.5) }}>
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 22, color: A.buy }}>LEG 1 · shallow −1.8%</div>
          <div style={{ fontFamily: SANS, fontSize: 22, color: T.text, marginTop: 6 }}>A normal pullback — right at the 50-DMA. You'll probably get filled.</div>
        </div>
        <div style={{ marginTop: 18, background: pmix(T.panel, A.buy, 0.09), border: `2px solid ${A.buy}`, borderRadius: 14, padding: "15px 20px", opacity: p(0.6, 0.7) }}>
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 22, color: A.buy }}>LEG 2 · deep −5.9%</div>
          <div style={{ fontFamily: SANS, fontSize: 22, color: T.text, marginTop: 6 }}>A bad-week correction, toward the 200-DMA. Fills only if the market really sells off.</div>
        </div>
      </div>
      <Flow x1={cx + cw - 90} y1={yL1} x2={cx + cw - 90} y2={yL2} color={A.buy} n={6} speed={0.013} size={7} o={0.55} />
      <Verdict color={A.buy} o={p(0.82, 0.9)} text="You're not predicting the dip — you're ready for it, at a price you decided calmly." />
    </Stage>
  );
};

// ---------------------------------------------------------------- STOP + TARGET
export const StopTargetScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const p = useP(dur);
  const cx = 110, cy = 300, cw = 980, ch = 470;
  const railX = cx + cw;
  const yAvg = priceY(H.avg, HLO, HHI, cy, ch);
  const yTgt = priceY(H.tgt, HLO, HHI, cy, ch);
  const yStop = priceY(H.stop, HLO, HHI, cy, ch);
  return (
    <Stage>
      <SceneProgress p={p} color={A.tgt} />
      <GTHead kicker="ANCHORS · THE TWO EXITS" title="Bound the loss, aim at the high" color={A.tgt} p={p} />
      <CandleChart x={cx} y={cy} w={cw} h={ch} candles={HAL_C} lo={HLO} hi={HHI} reveal={p(0.08, 0.5)} o={p(0.06, 0.16)}
        dmas={[{ values: HAL_C.map((_, i) => (i > 40 ? H.d200 : undefined)), color: A.d200, w: 2 }]}
        marker={{ price: H.avg, o: p(0.2, 0.3), color: A.buy, label: `avg ${rupee(H.avg)}` }} axis={false} />
      <div style={{ opacity: p(0.36, 0.46) }}>
        <OCOBracket x={railX} yEntry={yAvg} yTgt={yTgt} yStop={yStop}
          tgtLabel={`TGT +9.1%`} stopLabel={`STOP −13.2%`}
          fired={null} o={p(0.36, 0.46)} />
      </div>
      <div style={{ position: "absolute", left: 1340, top: 300, width: 460 }}>
        <div style={{ background: pmix(T.panel, A.stop, 0.1), border: `2px solid ${A.stop}`, borderRadius: 14, padding: "14px 18px", opacity: p(0.46, 0.56) }}>
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 21, color: A.stop }}>STOP · below the 200-DMA</div>
          <div style={{ fontFamily: SANS, fontSize: 21, color: T.text, marginTop: 5 }}>Sized so the most you lose from your average is ~13% — bounded and known.</div>
        </div>
        <div style={{ marginTop: 16, background: pmix(T.panel, A.tgt, 0.1), border: `2px solid ${A.tgt}`, borderRadius: 14, padding: "14px 18px", opacity: p(0.6, 0.7) }}>
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 21, color: A.tgt }}>TARGET · the 52-week high</div>
          <div style={{ fontFamily: SANS, fontSize: 21, color: T.text, marginTop: 5 }}>The first objective, {rupee(H.tgt)} — about +9%.</div>
        </div>
        <div style={{ marginTop: 16, display: "flex", gap: 12, opacity: p(0.74, 0.84) }}>
          <Chip label="+50%" value={rupee(7012)} color={A.d200} />
          <Chip label="+100%" value={rupee(9350)} color={A.d200} />
        </div>
      </div>
      <Verdict color={A.tgt} o={p(0.83, 0.9)} text="Know the dream honestly: +50% needs ₹7,012, a double ₹9,350 — worth knowing, so the goal stays real." />
    </Stage>
  );
};
