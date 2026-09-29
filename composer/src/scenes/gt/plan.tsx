import React from "react";
import { useCurrentFrame } from "remotion";
import { Card, Flow, Stage } from "../../lib/primitives";
import { A, Chip, DefBadge, GTHead, mix, MONO, rupee, SANS, SceneProgress, T, useP, Verdict } from "./kit";

type ScheduleRow = { tk: string; m: number; cap: string; sector: string; color: string; leg1: number; leg2: number; avg: number; stop: number; tgt: number; rr: number; outlay: number };
const DEFAULT_ROWS: ScheduleRow[] = [
  { tk: "HAL", m: 1, cap: "Large", sector: "Defence", color: A.main, leg1: 4760, leg2: 4560, avg: 4675, stop: 4090, tgt: 5099, rr: 3.8, outlay: 37400 },
  { tk: "DIXON", m: 2, cap: "Mid", sector: "EMS", color: A.buy, leg1: 14300, leg2: 13700, avg: 13960, stop: 12100, tgt: 18177, rr: 3.6, outlay: 41880 },
  { tk: "KEI", m: 3, cap: "Mid", sector: "Cables", color: A.main, leg1: 5420, leg2: 5150, avg: 5310, stop: 4780, tgt: 5873, rr: 4.7, outlay: 42480 },
  { tk: "SYRMA", m: 4, cap: "Small", sector: "EMS", color: A.trig, leg1: 1420, leg2: 1320, avg: 1376, stop: 1190, tgt: 1516, rr: 3.5, outlay: 39912 },
  { tk: "DATAPATTNS", m: 5, cap: "Small", sector: "Defence elec.", color: A.trig, leg1: 4480, leg2: 4200, avg: 4349, stop: 3920, tgt: 4866, rr: 4.7, outlay: 39145 },
];

export const RRScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const p = useP(dur);
  const risk = p(0.14, 0.34), reward = p(0.3, 0.5);
  return <Stage>
    <SceneProgress p={p} color={A.main} />
    <GTHead kicker="THE PLAN · WEIGH IT" title="Reward against risk — honestly" color={A.main} p={p} />
    <div style={{ position: "absolute", left: 160, top: 330, width: 1600, height: 160, opacity: p(0.08, 0.16) }}>
      <div style={{ position: "absolute", left: 800, top: 14, height: 132, borderLeft: `3px solid ${A.price}` }} />
      <div style={{ position: "absolute", left: 800 - 610 * risk, top: 58, width: 610 * risk, height: 42, borderRadius: "22px 0 0 22px", background: `linear-gradient(90deg, ${A.stop}, ${mix(A.stop, T.bg1, 0.18)})`, boxShadow: `0 0 20px ${A.stop}` }} />
      <div style={{ position: "absolute", left: 800, top: 58, width: 610 * reward, height: 42, borderRadius: "0 22px 22px 0", background: `linear-gradient(90deg, ${mix(A.main, T.bg1, 0.18)}, ${A.main})`, boxShadow: `0 0 20px ${A.main}` }} />
      <div style={{ position: "absolute", left: 88, top: 3, width: 360, textAlign: "center", fontFamily: MONO, fontSize: 24, fontWeight: 800, color: A.stop, opacity: risk }}>−13.2% · {rupee(4090)}</div>
      <div style={{ position: "absolute", left: 1160, top: 3, width: 380, textAlign: "center", fontFamily: MONO, fontSize: 24, fontWeight: 800, color: A.main, opacity: reward }}>+9.1% · {rupee(5099)}</div>
      <div style={{ position: "absolute", left: 688, top: -34, width: 224, textAlign: "center", fontFamily: MONO, fontSize: 22, color: T.muted }}>AVG {rupee(4675)}</div>
    </div>
    <div style={{ position: "absolute", left: 770, top: 455, opacity: p(0.45, 0.58) }}><Chip label="reward : risk" value="R:R 3.8 : 1" color={A.buy} hero /></div>
    <Card theme={T} x={110} y={560} w={1600} h={150} color={A.stop} o={p(0.55, 0.68)} pad="22px 28px">
      <DefBadge text="REALITY CHECK" color={A.stop} o={p(0.57, 0.64)} />
      <div style={{ width: 1480, marginTop: 14, fontFamily: SANS, fontSize: 30, color: T.text }}>Valuation says HAL is already roughly fairly priced. Bull case +16%, bear −24%.</div>
    </Card>
    <div style={{ position: "absolute", left: 560, top: 740, display: "flex", gap: 24, opacity: p(0.7, 0.82) }}>
      <Chip label="dream case" value={`+50% = ${rupee(7012)}`} color={A.d200} />
      <Chip label="dream case" value={`+100% = ${rupee(9350)}`} color={A.d200} />
    </div>
    <Flow x1={300} y1={805} x2={1620} y2={805} curve={18} color={A.main} n={10} speed={0.011} size={7} o={p(0.62, 0.76)} />
    <Verdict color={A.main} o={p(0.83, 0.9)} text="A double is a bull tail — a lovely maybe, not the base case." />
  </Stage>;
};

export const SizingScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const p = useP(dur);
  const leg1 = p(0.25, 0.42), leg2 = p(0.43, 0.58);
  return <Stage>
    <SceneProgress p={p} color={A.buy} />
    <GTHead kicker="THE PLAN · SIZE IT" title="Fit the budget into whole shares" color={A.buy} p={p} />
    <div style={{ position: "absolute", left: 160, top: 285, width: 580, height: 440, border: `2px solid ${A.buy}`, borderRadius: 20, background: mix(T.panel, A.buy, 0.07), overflow: "hidden", opacity: p(0.1, 0.2) }}>
      <div style={{ position: "absolute", left: 28, top: 24, fontFamily: MONO, fontWeight: 800, fontSize: 21, color: T.muted }}>MONTHLY BUDGET · ₹30–50k</div>
      <div style={{ position: "absolute", left: 28, right: 28, bottom: 28, height: 172 * leg2, background: `linear-gradient(90deg, ${mix(A.buy, T.bg1, 0.2)}, ${A.buy})`, borderTop: `2px solid ${A.buy}`, display: "flex", alignItems: "center", paddingLeft: 20, boxSizing: "border-box", fontFamily: MONO, fontWeight: 800, fontSize: 24, color: T.bg0 }}>LEG 2 · 4 sh @ ₹4,560</div>
      <div style={{ position: "absolute", left: 28, right: 28, bottom: 200, height: 180 * leg1, background: `linear-gradient(90deg, ${mix(A.main, T.bg1, 0.2)}, ${A.main})`, borderTop: `2px solid ${A.main}`, display: "flex", alignItems: "center", paddingLeft: 20, boxSizing: "border-box", fontFamily: MONO, fontWeight: 800, fontSize: 24, color: T.bg0 }}>LEG 1 · 4 sh @ ₹4,760</div>
    </div>
    <div style={{ position: "absolute", left: 810, top: 300, width: 900, display: "flex", flexWrap: "wrap", gap: 18 }}>
      <Chip label="budget" value="₹30–50k" color={A.buy} o={p(0.16, 0.28)} />
      <Chip label="leg 1" value="4 sh" color={A.main} o={p(0.3, 0.42)} />
      <Chip label="leg 2" value="4 sh" color={A.buy} o={p(0.44, 0.56)} />
      <Chip label="whole shares" value="TOTAL 8 sh · ₹37,400" color={A.buy} hero o={p(0.56, 0.68)} />
    </div>
    <Card theme={T} x={810} y={570} w={790} h={116} color={A.trig} o={p(0.6, 0.72)} pad="22px 26px">
      <div style={{ width: 720, fontFamily: SANS, fontSize: 27, color: T.text, lineHeight: 1.35 }}>Dixon at ₹14,650/share → only 2–3 shares fit.</div>
    </Card>
    <Flow x1={190} y1={770} x2={1660} y2={770} curve={-20} color={A.buy} n={11} speed={0.012} size={7} o={p(0.65, 0.78)} />
    <Verdict color={A.buy} o={p(0.82, 0.9)} text="Size to the budget, not to the ego — round to whole shares." />
  </Stage>;
};

export const ScheduleScene: React.FC<{ dur?: number; rows?: any[] }> = ({ dur, rows }) => {
  const p = useP(dur);
  const data = (rows && rows.length ? rows : DEFAULT_ROWS) as ScheduleRow[];
  const columns = [
    { label: "MONTH", x: 18, w: 100 }, { label: "STOCK", x: 130, w: 190 }, { label: "LEG 1", x: 334, w: 170 }, { label: "LEG 2", x: 518, w: 170 },
    { label: "AVG", x: 702, w: 170 }, { label: "STOP", x: 886, w: 180 }, { label: "TARGET", x: 1080, w: 190 }, { label: "R:R", x: 1284, w: 135 },
  ];
  return <Stage>
    <SceneProgress p={p} color={A.main} />
    <GTHead kicker="THE PLAN · 5 MONTHS" title="The staggered schedule" color={A.main} p={p} />
    <div style={{ position: "absolute", left: 140, top: 255, width: 1620, fontFamily: MONO, fontSize: 20, fontWeight: 800, letterSpacing: 1.1, color: T.muted }}>
      {columns.map((c) => <div key={c.label} style={{ position: "absolute", left: c.x, width: c.w }}>{c.label}</div>)}
    </div>
    <div style={{ position: "absolute", left: 140, top: 300, width: 1620 }}>
      {data.slice(0, 5).map((row, i) => {
        const o = p(0.15 + i * 0.11, 0.24 + i * 0.11);
        const y = i * 92;
        const cells = [
          { x: 18, w: 100, value: `0${row.m}`, color: row.color }, { x: 130, w: 190, value: row.tk, color: T.text }, { x: 334, w: 170, value: rupee(row.leg1), color: T.text }, { x: 518, w: 170, value: rupee(row.leg2), color: T.text },
          { x: 702, w: 170, value: rupee(row.avg), color: A.buy }, { x: 886, w: 180, value: rupee(row.stop), color: A.stop }, { x: 1080, w: 190, value: rupee(row.tgt), color: A.main }, { x: 1284, w: 135, value: `${row.rr.toFixed(1)}×`, color: A.buy },
        ];
        return <div key={`${row.tk}-${i}`} style={{ position: "absolute", left: 0, top: y, width: 1620, height: 76, opacity: o, transform: `translateY(${(1 - o) * 14}px)`, background: mix(T.panel, row.color, 0.07), border: `1.5px solid ${mix(T.line, row.color, 0.45)}`, borderRadius: 12 }}>
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 7, borderRadius: "12px 0 0 12px", background: row.color }} />
          {cells.map((cell) => <div key={cell.x} style={{ position: "absolute", left: cell.x, top: 24, width: cell.w, fontFamily: MONO, fontWeight: cell.x === 130 ? 800 : 700, fontSize: 24, color: cell.color, fontVariantNumeric: "tabular-nums" }}>{cell.value}</div>)}
        </div>;
      })}
    </div>
    <Flow x1={170} y1={800} x2={1730} y2={800} curve={14} color={A.main} n={12} speed={0.01} size={7} o={p(0.68, 0.8)} />
    <Verdict color={A.main} o={p(0.82, 0.9)} text="One pick a month — spreading the buys across time is itself a stagger." />
  </Stage>;
};

export const KiteScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const p = useP(dur);
  const frame = useCurrentFrame();
  const rules = [
    { n: "01", color: A.stop, text: "Never buy blind — know your stop first.", at: 0.45 },
    { n: "02", color: A.trig, text: "A GTT lasts up to a year. Review it.", at: 0.58 },
    { n: "03", color: A.main, text: "A plan, not a promise — price can gap through a trigger.", at: 0.7 },
  ];
  return <Stage>
    <SceneProgress p={p} color={A.main} />
    <GTHead kicker="THE PLAN · PLACE IT" title="How it rests in Kite" color={A.main} p={p} />
    <Card theme={T} x={110} y={260} w={790} h={500} color={A.main} o={p(0.12, 0.28)} pad="28px 30px">
      <DefBadge text="BROKER TICKET · MOCK" color={A.main} o={p(0.14, 0.22)} />
      <div style={{ width: 720, marginTop: 30, fontFamily: MONO, fontWeight: 800, fontSize: 24, color: T.text, lineHeight: 1.7, fontVariantNumeric: "tabular-nums" }}>
        <div style={{ color: A.main }}>GTT · SINGLE  |  BUY HAL</div>
        <div>trigger ₹4,775</div><div>limit&nbsp;&nbsp; ₹4,760</div><div>qty&nbsp;&nbsp;&nbsp;&nbsp; 4</div>
        <div style={{ height: 2, margin: "22px 0", background: T.line }} />
        <div style={{ color: A.tgt }}>GTT · OCO  |  SELL HAL</div>
        <div>target ₹5,099  ·  stop ₹4,090</div>
      </div>
      <div style={{ position: "absolute", left: 30, bottom: 28, fontFamily: MONO, fontSize: 20, color: A.buy, opacity: 0.7 + Math.sin(frame * 0.12) * 0.3 }}>STATUS · WAITING FOR TRIGGER</div>
    </Card>
    <>
      {rules.map((rule, i) => {
        const o = p(rule.at, rule.at + 0.1);
        return <Card key={rule.n} theme={T} x={970} y={260 + i * 160} w={740} h={142} color={rule.color} o={o} pad="22px 24px">
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ minWidth: 62, height: 62, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 10, background: rule.color, fontFamily: MONO, fontSize: 24, fontWeight: 800, color: T.bg0 }}>{rule.n}</div>
            <div style={{ width: 590, fontFamily: SANS, fontSize: 27, fontWeight: 700, lineHeight: 1.28, color: T.text }}>{rule.text}</div>
          </div>
        </Card>;
      })}
    </>
    <Flow x1={140} y1={800} x2={1700} y2={800} curve={-18} color={A.main} n={12} speed={0.012} size={7} o={p(0.68, 0.8)} />
    <Verdict color={A.main} o={p(0.82, 0.9)} text="The orders don't predict — they enforce the discipline you set." />
  </Stage>;
};

export const ValuationScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const p = useP(dur);
  const bars = [
    { name: "BEAR", value: 3694, pct: "−24%", color: A.stop, at: 0.2 },
    { name: "BASE", value: 4861, pct: "≈ fair", color: T.muted, at: 0.34 },
    { name: "BULL", value: 5639, pct: "+16%", color: A.main, at: 0.48 },
  ];
  const baseline = 730, scale = 0.085, todayY = baseline - 4861 * scale;
  return <Stage>
    <SceneProgress p={p} color={A.d200} />
    <GTHead kicker="THE PLAN · VALUE IT HONESTLY" title="Three futures, one weighted value" color={A.d200} p={p} />
    <div style={{ position: "absolute", left: 220, top: todayY, width: 1480, borderTop: `2px dashed ${A.d200}`, opacity: p(0.12, 0.22) }} />
    <div style={{ position: "absolute", left: 1450, top: todayY - 30, width: 260, fontFamily: MONO, fontSize: 20, color: A.d200, opacity: p(0.14, 0.24) }}>TODAY {rupee(4861)}</div>
    {bars.map((bar, i) => {
      const grow = p(bar.at, bar.at + 0.16), h = bar.value * scale * grow, x = 300 + i * 470;
      return <div key={bar.name}>
        <div style={{ position: "absolute", left: x, top: baseline - h, width: 290, height: h, borderRadius: "16px 16px 0 0", background: `linear-gradient(180deg, ${bar.color}, ${mix(bar.color, T.bg1, 0.5)})`, border: `2px solid ${bar.color}`, borderBottom: "none", boxShadow: `0 0 28px ${mix(T.bg0, bar.color, 0.28)}` }} />
        <div style={{ position: "absolute", left: x, top: baseline - h - 65, width: 290, textAlign: "center", opacity: grow, fontFamily: MONO, fontWeight: 800, fontSize: 30, color: bar.color }}>{rupee(bar.value)}</div>
        <div style={{ position: "absolute", left: x, top: baseline + 14, width: 290, textAlign: "center", opacity: p(bar.at + 0.05, bar.at + 0.13), fontFamily: MONO, fontWeight: 800, fontSize: 25, color: bar.color }}>{bar.name} · {bar.pct}</div>
      </div>;
    })}
    <div style={{ position: "absolute", left: 760, top: 230, opacity: p(0.54, 0.66) }}><Chip label="WEIGHTED VALUE" value={`≈ ${rupee(4861)} · today`} color={A.d200} hero /></div>
    <Card theme={T} x={350} y={780} w={1220} h={58} color={A.d200} o={p(0.6, 0.72)} pad="13px 22px"><div style={{ width: 1160, textAlign: "center", fontFamily: SANS, fontSize: 26, fontWeight: 700, color: T.text }}>R:R looks great; valuation says fair. Both are true.</div></Card>
    <Verdict color={A.d200} o={p(0.82, 0.9)} text="The growth is already in the price — a double is the bull tail, not the base case." />
  </Stage>;
};

export const MistakesScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const p = useP(dur);
  const frame = useCurrentFrame();
  const cards = [
    { n: "01", title: "GAP RISK", color: A.trig, text: "Bad news can leap the price straight past your trigger. Risk is bounded, not erased." },
    { n: "02", title: "STOP TOO TIGHT", color: A.stop, text: "Set just under the price, normal noise stops you out. Give it room, below real support." },
    { n: "03", title: "CHASING", color: A.trig, text: "Cancel the wait and buy the top, and you've thrown the plan away." },
    { n: "04", title: "NO REVIEW", color: A.main, text: "A GTT lives for a year — revisit it; companies and prices change." },
  ];
  return <Stage>
    <SceneProgress p={p} color={A.stop} />
    <GTHead kicker="THE PLAN · WHAT GOES WRONG" title="Four ways this plan breaks" color={A.stop} p={p} />
    {cards.map((card, i) => {
      const x = i % 2 === 0 ? 130 : 990, y = i < 2 ? 250 : 530, at = 0.14 + i * 0.14, o = p(at, at + 0.11);
      const glow = i === 1 ? 0.14 + (Math.sin(frame * 0.08) + 1) * 0.06 : 0.12;
      return <Card key={card.n} theme={T} x={x} y={y} w={790} h={230} color={card.color} o={o} pad="24px 28px">
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}><div style={{ width: 56, height: 56, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 10, background: card.color, fontFamily: MONO, fontWeight: 800, fontSize: 23, color: T.bg0, boxShadow: `0 0 22px ${mix(T.bg0, card.color, glow)}` }}>{card.n}</div><div style={{ width: 620, fontFamily: MONO, fontWeight: 800, fontSize: 29, color: card.color }}>{card.title}</div></div>
        <div style={{ width: 710, marginTop: 22, fontFamily: SANS, fontSize: 26, lineHeight: 1.34, color: T.text }}>{card.text}</div>
      </Card>;
    })}
    <Flow x1={180} y1={805} x2={1730} y2={805} curve={16} color={A.stop} n={12} speed={0.012} size={7} o={p(0.7, 0.8)} />
    <Verdict color={A.stop} o={p(0.82, 0.9)} text="Avoid these four, and the orders quietly do their job." />
  </Stage>;
};
