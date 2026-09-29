/**
 * fq/fund.tsx — FUNDAMENTALS, taught from scratch (green A.fund).
 * Define → formula → worked example. Numbers from VIDEO_SPEC §4 DATA only.
 */
import React from "react";
import { useCurrentFrame } from "remotion";
import { Stage, Card, Wire, Flow, Counter, Type, useP, usePop, rnd } from "../../lib/primitives";
import { T, A, mix, MONO, SANS, FQHead, SceneProgress, Formula, DefBadge, StatChip } from "./kit";

const ACC = A.fund;

/** INFY ROE ≈ 32%: ₹100 compounded (module-scope, deterministic). */
const ROE_STACK = [0, 1, 2, 3, 4].map((yr) => Math.round(100 * Math.pow(1.32, yr)));
const PEG_DIXON = 47.7 / 77; // ≈ 0.619 → teach as ~0.6

function GlowDot({ i, color }: { i: number; color: string }) {
  const frame = useCurrentFrame();
  const x = 140 + rnd(i, 1, 9) * 1640;
  const y = 220 + rnd(i, 2, 9) * 640;
  const s = 5 + rnd(i, 3, 9) * 5;
  const o = 0.12 + Math.sin(frame * 0.04 + i) * 0.06;
  return (
    <div style={{
      position: "absolute", left: x, top: y, width: s, height: s, borderRadius: s,
      background: color, opacity: o, boxShadow: `0 0 ${s * 2}px ${color}`, pointerEvents: "none",
    }} />
  );
}

// NARRATION: A share is a tiny slice of a real company — buy one HDFC Bank share and you own a sliver of that bank. The price of that slice today is ₹720. Market cap is simply price times how many shares exist; that size is how we sort small-cap, mid-cap, and large-cap names. Your whole sample book is ₹59,405 — a bundle of these slices.
export const ShareScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const pop = usePop(dur);
  const caps = [
    { t: "Small-cap", d: "Younger, smaller companies — more room, more bounce." },
    { t: "Mid-cap", d: "In-between: growing, but not giants yet." },
    { t: "Large-cap", d: "HDFC Bank lives here — a huge, widely owned name." },
  ];
  return (
    <Stage>
      <SceneProgress p={p} color={ACC} />
      {[0, 1, 2, 3, 4, 5].map((i) => <GlowDot key={i} i={i} color={ACC} />)}
      <FQHead kicker="FUNDAMENTALS · SHARE" title="A share is a slice of a company" color={ACC} p={p} />

      <Card theme={T} x={100} y={210} w={820} h={250} color={ACC} o={p(0.08, 0.16)} glow>
        <DefBadge text="Definition" color={ACC} o={p(0.1, 0.18)} />
        <div style={{ fontFamily: SANS, fontSize: 28, color: T.text, lineHeight: 1.35, marginTop: 16, width: 760 }}>
          <Type p={p(0.12, 0.32)} color={T.text} size={28}
            text="A share is one tiny piece of a company. Buy it, and you own that sliver — its profits, and its risks." />
        </div>
      </Card>

      <Card theme={T} x={960} y={210} w={760} h={250} color={ACC} o={p(0.18, 0.28)} glow>
        <div style={{ fontFamily: MONO, fontSize: 20, letterSpacing: 2, color: T.muted, marginBottom: 14 }}>THE FORMULA</div>
        <Formula o={p(0.2, 0.32)} size={32} parts={[
          ["Market cap", ACC], ["=", T.text], ["Price", ACC], ["×", T.text], ["Shares", ACC],
        ]} />
        <div style={{ fontFamily: SANS, fontSize: 24, color: T.muted, marginTop: 18, lineHeight: 1.35, width: 700 }}>
          Add up every slice at today's price. That total is how big the company is.
        </div>
      </Card>
      <Wire x1={920} y1={335} x2={960} y2={335} p={p(0.16, 0.24)} color={ACC} w={2} arrow />
      <Flow x1={920} y1={335} x2={960} y2={335} color={ACC} n={5} size={7} o={p(0.24, 0.3)} />

      {caps.map((c, i) => (
        <Card key={c.t} theme={T} x={100 + i * 574} y={490} w={554} h={180} color={ACC}
          o={p(0.38 + i * 0.08, 0.48 + i * 0.08)}>
          <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 30, color: T.text }}>{c.t}</div>
          <div style={{ fontFamily: SANS, fontSize: 24, color: T.muted, marginTop: 10, lineHeight: 1.35, width: 500 }}>{c.d}</div>
        </Card>
      ))}

      <div style={{
        position: "absolute", left: 100, top: 700, width: 1720, height: 180, borderRadius: 20,
        background: mix(T.panel, ACC, 0.12), border: `2.5px solid ${ACC}`, boxSizing: "border-box",
        padding: "22px 32px", display: "flex", alignItems: "center", gap: 28,
        opacity: p(0.52, 0.62), transform: `scale(${0.96 + pop(0.54) * 0.04})`,
        boxShadow: `0 0 ${40 + Math.sin(frame * 0.06) * 12}px ${mix(T.bg0, ACC, 0.35)}`,
      }}>
        <StatChip label="HDFC Bank · 1 share" value="₹720" color={ACC} hero o={1} />
        <StatChip label="Your sample book" value="₹59,405" color={A.main} o={1} />
        <div style={{ fontFamily: SANS, fontSize: 26, color: T.text, lineHeight: 1.35, width: 980 }}>
          That ₹720 is the cash price of one slice today. Your whole book is just a bundle of slices like this.
        </div>
      </div>
    </Stage>
  );
};

// NARRATION: EPS is profit per share — the company's yearly profit, split across every share. P/E is price divided by that EPS: how many rupees you pay for one rupee of yearly profit. HDFC Bank at ₹720 with EPS ₹51.4 is about 14 times — roughly fourteen years to earn the price back. A 70-times name like Data Patterns at 95.8 times is much dearer for each rupee of profit.
export const PEScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const paid = Math.round(p(0.36, 0.50) * 14);
  return (
    <Stage>
      <SceneProgress p={p} color={ACC} />
      <FQHead kicker="FUNDAMENTALS · P/E" title="P/E — rupees you pay per rupee of profit" color={ACC} p={p} />

      <Card theme={T} x={100} y={210} w={1720} h={150} color={ACC} o={p(0.08, 0.16)}>
        <DefBadge text="Definition" color={ACC} />
        <div style={{ fontFamily: SANS, fontSize: 28, color: T.text, marginTop: 12, width: 1640, lineHeight: 1.35 }}>
          EPS is profit per share. P/E asks: how many rupees do I pay today for one rupee of that yearly profit?
        </div>
      </Card>

      <Card theme={T} x={100} y={390} w={820} h={220} color={ACC} o={p(0.2, 0.3)} glow>
        <div style={{ fontFamily: MONO, fontSize: 20, letterSpacing: 2, color: T.muted, marginBottom: 12 }}>THE FORMULA</div>
        <Formula o={1} size={40} parts={[["P/E", ACC], ["=", T.text], ["Price", ACC], ["÷", T.text], ["EPS", ACC]]} />
        <div style={{ fontFamily: SANS, fontSize: 24, color: T.muted, marginTop: 16, width: 760 }}>
          Lower usually means cheaper for the profits you are buying.
        </div>
      </Card>

      <Card theme={T} x={960} y={390} w={760} h={220} color={ACC} o={p(0.32, 0.44)} glow>
        <div style={{ fontFamily: MONO, fontSize: 20, letterSpacing: 2, color: T.muted, marginBottom: 8 }}>HDFC BANK · WORKED</div>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 28, color: T.text }}>
          ₹720 ÷ ₹51.4 ≈{" "}
          <Counter p={p(0.32, 0.46)} to={14} suffix="×" color={ACC} size={36} />
        </div>
        <div style={{ fontFamily: SANS, fontSize: 24, color: T.muted, marginTop: 12, width: 700, lineHeight: 1.35 }}>
          Pay ₹14 for ₹1 of yearly profit → about 14 years to earn the price back.
        </div>
      </Card>
      <Wire x1={920} y1={500} x2={960} y2={500} p={p(0.28, 0.36)} color={ACC} w={2} arrow />
      <Flow x1={920} y1={500} x2={960} y2={500} color={ACC} n={5} size={7} o={p(0.36, 0.42)} />

      <div style={{ position: "absolute", left: 100, top: 640, width: 1720, opacity: p(0.42, 0.52) }}>
        <div style={{ fontFamily: MONO, fontSize: 20, letterSpacing: 1.5, color: T.muted, marginBottom: 12 }}>
          ₹ PAID PER ₹1 PROFIT · {paid} OF 14
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {Array.from({ length: 14 }).map((_, i) => (
            <div key={i} style={{
              width: 108, height: 56, borderRadius: 8,
              background: i < paid ? ACC : mix(T.panel, ACC, 0.12),
              border: `2px solid ${i < paid ? ACC : T.line}`,
              boxShadow: i < paid ? `0 0 14px ${mix(T.bg0, ACC, 0.4)}` : "none",
              opacity: 0.55 + Math.sin(frame * 0.08 + i * 0.4) * 0.12,
            }} />
          ))}
        </div>
      </div>

      <div style={{ position: "absolute", left: 100, top: 780, width: 1720, display: "flex", gap: 18, opacity: p(0.55, 0.65) }}>
        <StatChip label="HDFC Bank P/E" value="14.0×" color={ACC} hero />
        <StatChip label="Infosys P/E" value="14.9×" color={A.main} />
        <StatChip label="Syrma P/E" value="76.5×" color={A.tech} />
        <StatChip label="Data Patterns P/E" value="95.8×" color={A.risk} />
        <div style={{ fontFamily: SANS, fontSize: 24, color: T.text, width: 520, lineHeight: 1.3, paddingTop: 8 }}>
          14× is cheap next to a 70×-style growth name. Dear is not always wrong — wait for PEG.
        </div>
      </div>
    </Stage>
  );
};

// NARRATION: Book value is the net worth on the balance sheet — assets minus debts — per share. P/B is price divided by that book. HDFC Bank at ₹720 over book ₹390 is about 1.85 times. Below 1 means the market prices the stock cheaper than stated net worth; banks are often read this way.
export const PBScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const p = useP(dur);
  const frame = useCurrentFrame();
  const fill = p(0.38, 0.52);
  return (
    <Stage>
      <SceneProgress p={p} color={ACC} />
      <FQHead kicker="FUNDAMENTALS · P/B" title="P/B — price versus the company's net worth" color={ACC} p={p} />

      <Card theme={T} x={100} y={210} w={820} h={280} color={ACC} o={p(0.08, 0.16)} glow>
        <DefBadge text="Definition" color={ACC} o={p(0.1, 0.18)} />
        <div style={{ fontFamily: SANS, fontSize: 27, color: T.text, lineHeight: 1.4, marginTop: 16, width: 760 }}>
          Book value is net worth per share: what is left on paper if you subtract debts from assets, then split by shares.
        </div>
      </Card>
      <Card theme={T} x={960} y={210} w={760} h={280} color={ACC} o={p(0.18, 0.28)} glow>
        <div style={{ fontFamily: MONO, fontSize: 20, letterSpacing: 2, color: T.muted, marginBottom: 14 }}>THE FORMULA</div>
        <Formula o={1} size={36} parts={[["P/B", ACC], ["=", T.text], ["Price", ACC], ["÷", T.text], ["Book", ACC]]} />
        <div style={{ fontFamily: SANS, fontSize: 24, color: T.muted, marginTop: 18, width: 700, lineHeight: 1.35 }}>
          Under 1×: the market pays less than stated net worth. Banks are a classic place to look.
        </div>
      </Card>
      <Wire x1={920} y1={350} x2={960} y2={350} p={p(0.16, 0.24)} color={ACC} w={2} arrow />
      <Flow x1={920} y1={350} x2={960} y2={350} color={ACC} n={5} size={7} o={p(0.24, 0.3)} />

      <Card theme={T} x={100} y={520} w={1720} h={360} color={ACC} o={p(0.38, 0.5)}>
        <div style={{ fontFamily: MONO, fontSize: 20, letterSpacing: 2, color: T.muted }}>HDFC BANK · WORKED</div>
        <div style={{ display: "flex", gap: 40, marginTop: 18, alignItems: "flex-start" }}>
          <div>
            <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 32, color: T.text }}>
              ₹720 ÷ ₹390 ≈ <Counter p={p(0.36, 0.48)} to={1.85} decimals={2} suffix="×" color={ACC} size={40} />
            </div>
            <div style={{ fontFamily: SANS, fontSize: 26, color: T.muted, marginTop: 12, width: 720, lineHeight: 1.35 }}>
              You pay about one-and-eighty-five rupees for each rupee of book. Not a bargain-bin 0.8× — not a 5× either.
            </div>
            <div style={{ marginTop: 22, display: "flex", gap: 14 }}>
              <StatChip label="Price" value="₹720" color={ACC} hero o={p(0.48, 0.56)} />
              <StatChip label="Book / share" value="₹390" color={A.main} o={p(0.50, 0.58)} />
              <StatChip label="P/B" value="1.85×" color={ACC} o={p(0.52, 0.60)} />
            </div>
          </div>
          <div style={{ width: 760 }}>
            <div style={{ fontFamily: MONO, fontSize: 20, color: T.muted, marginBottom: 10 }}>PRICE VS BOOK (SAME SCALE)</div>
            <div style={{ height: 28, borderRadius: 8, background: mix(T.bg0, A.main, 0.25), overflow: "hidden", border: `1.5px solid ${A.main}` }}>
              <div style={{ width: `${fill * (390 / 720) * 100}%`, height: "100%", background: A.main, boxShadow: `0 0 16px ${A.main}` }} />
            </div>
            <div style={{ fontFamily: MONO, fontSize: 20, color: A.main, marginTop: 6 }}>Book = ₹390 · shorter bar</div>
            <div style={{ height: 28, borderRadius: 8, marginTop: 18, background: mix(T.bg0, ACC, 0.2), overflow: "hidden", border: `1.5px solid ${ACC}` }}>
              <div style={{
                width: `${fill * 100}%`, height: "100%", background: ACC,
                boxShadow: `0 0 ${16 + Math.sin(frame * 0.07) * 6}px ${ACC}`,
              }} />
            </div>
            <div style={{ fontFamily: MONO, fontSize: 20, color: ACC, marginTop: 6 }}>Price = ₹720 · 1.85× as long</div>
          </div>
        </div>
      </Card>
    </Stage>
  );
};

// NARRATION: ROE is profit divided by shareholders' equity — how many rupees of profit the business squeezes from each hundred rupees of owners' capital. Infosys at about 32 percent means ₹32 of profit a year on every ₹100 of equity. Stack that ₹100 forward at 32 percent and it compounds fast. HDFC Bank's ROE is 13.6 percent, with ROCE 7.0 percent — still a quality engine, just slower than Infosys.
export const ROEScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const maxH = 170;
  const peak = ROE_STACK[4];
  return (
    <Stage>
      <SceneProgress p={p} color={ACC} />
      <FQHead kicker="FUNDAMENTALS · ROE" title="ROE — profit on the owners' capital" color={ACC} p={p} />

      <Card theme={T} x={100} y={210} w={900} h={200} color={ACC} o={p(0.08, 0.16)}>
        <DefBadge text="Definition" color={ACC} />
        <div style={{ fontFamily: SANS, fontSize: 26, color: T.text, marginTop: 12, lineHeight: 1.35, width: 840 }}>
          ROE is the compounding engine: profit ÷ shareholders' equity. ROCE asks the same of all capital employed.
        </div>
      </Card>
      <Card theme={T} x={1030} y={210} w={690} h={200} color={ACC} o={p(0.18, 0.28)} glow>
        <Formula o={1} size={28} parts={[["ROE", ACC], ["=", T.text], ["Profit", ACC], ["÷", T.text], ["Equity", ACC]]} />
        <div style={{ fontFamily: SANS, fontSize: 22, color: T.muted, marginTop: 14, width: 640 }}>
          INFY: ≈ ₹32 profit a year on every ₹100 of owners' capital.
        </div>
      </Card>
      <Wire x1={1000} y1={310} x2={1030} y2={310} p={p(0.16, 0.24)} color={ACC} w={2} arrow />
      <Flow x1={1000} y1={310} x2={1030} y2={310} color={ACC} n={4} size={7} o={p(0.24, 0.3)} />

      <Card theme={T} x={100} y={440} w={1720} h={440} color={ACC} o={p(0.32, 0.42)}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div style={{ fontFamily: MONO, fontSize: 20, letterSpacing: 2, color: T.muted }}>₹100 AT 32% / YEAR · INFOSYS ROE 31.9%</div>
          <div style={{ display: "flex", gap: 12 }}>
            <StatChip label="INFY ROE" value="31.9%" color={ACC} hero o={p(0.48, 0.56)} />
            <StatChip label="HDFC Bank ROE" value="13.6%" color={A.main} o={p(0.50, 0.58)} />
            <StatChip label="HDFC ROCE" value="7.0%" color={A.tech} o={p(0.52, 0.60)} />
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 22, height: 250, marginTop: 20, paddingLeft: 8 }}>
          {ROE_STACK.map((v, i) => {
            const grow = p(0.30 + i * 0.045, 0.38 + i * 0.045);
            const h = (v / peak) * maxH * grow;
            return (
              <div key={i} style={{ width: 200, textAlign: "center" }}>
                <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 26, color: ACC, marginBottom: 8, opacity: grow }}>
                  ₹{v}
                </div>
                <div style={{
                  width: 200, height: h, borderRadius: "12px 12px 0 0", margin: "0 auto",
                  background: `linear-gradient(180deg, ${ACC}, ${mix(ACC, T.bg1, 0.45)})`,
                  border: `2px solid ${ACC}`, borderBottom: "none",
                  boxShadow: `0 0 ${18 + Math.sin(frame * 0.06 + i) * 8}px ${mix(T.bg0, ACC, 0.4)}`,
                }} />
                <div style={{ fontFamily: MONO, fontSize: 20, color: T.muted, marginTop: 8 }}>Year {i}</div>
              </div>
            );
          })}
        </div>
      </Card>
    </Stage>
  );
};

// NARRATION: Debt to equity is balance-sheet risk — how much the company borrowed versus what owners put in. HDFC Bank's D/E is low; Infosys is even sitting on net cash. Promoter holding is skin in the game: do the founders still own a real stake. Dividend yield is cash while you hold — 1.8 percent at HDFC Bank, 4.2 percent at Infosys.
export const DebtScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const gauges: { label: string; formula: [string, string?][]; body: string; value: string; color: string; at: number }[] = [
    {
      label: "Debt ÷ Equity", formula: [["D/E", ACC], ["=", T.text], ["Debt", A.risk], ["÷", T.text], ["Equity", ACC]],
      body: "Borrowed money versus owners' money. HDFC Bank: D/E is low. Infosys: net cash — no net debt drag.",
      value: "HDFC · low", color: ACC, at: 0.16,
    },
    {
      label: "Promoter holding", formula: [["Skin", ACC], ["in", T.text], ["the game", ACC]],
      body: "Do the people who built it still own a real slice? High holding = they eat the same losses you do.",
      value: "Check filings", color: A.main, at: 0.26,
    },
    {
      label: "Dividend yield", formula: [["Yield", ACC], ["=", T.text], ["Div", ACC], ["÷", T.text], ["Price", T.text]],
      body: "Cash paid to you while you hold. HDFC Bank 1.8%. Infosys 4.2% — more income, same idea.",
      value: "1.8% · 4.2%", color: ACC, at: 0.38,
    },
  ];
  return (
    <Stage>
      <SceneProgress p={p} color={ACC} />
      <FQHead kicker="FUNDAMENTALS · BALANCE SHEET" title="Debt, promoters, and dividend yield" color={ACC} p={p} />

      <Card theme={T} x={100} y={210} w={1720} h={130} color={ACC} o={p(0.08, 0.16)}>
        <DefBadge text="Definition" color={ACC} />
        <div style={{ fontFamily: SANS, fontSize: 26, color: T.text, marginTop: 10, width: 1640, lineHeight: 1.35 }}>
          Three checks besides earnings: how leveraged the sheet is, who still owns it, and whether it pays you cash.
        </div>
      </Card>

      {gauges.map((g, i) => {
        const pulse = 0.55 + Math.sin(frame * 0.07 + i) * 0.12;
        return (
          <Card key={g.label} theme={T} x={100 + i * 574} y={370} w={554} h={380} color={g.color} o={p(g.at, g.at + 0.1)} glow>
            <div style={{ fontFamily: MONO, fontSize: 20, letterSpacing: 1.5, color: T.muted }}>{g.label.toUpperCase()}</div>
            <div style={{ marginTop: 12 }}><Formula o={1} size={22} parts={g.formula} /></div>
            <div style={{
              marginTop: 22, height: 88, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center",
              background: mix(T.bg0, g.color, 0.18), border: `2px solid ${g.color}`,
              boxShadow: `0 0 ${24 * pulse}px ${mix(T.bg0, g.color, 0.45)}`,
            }}>
              <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: 28, color: g.color }}>{g.value}</span>
            </div>
            <div style={{ fontFamily: SANS, fontSize: 22, color: T.text, marginTop: 16, lineHeight: 1.35, width: 500 }}>{g.body}</div>
          </Card>
        );
      })}

      <div style={{
        position: "absolute", left: 100, top: 780, width: 1720, fontFamily: SANS, fontSize: 26, color: T.text,
        opacity: p(0.58, 0.68), lineHeight: 1.35,
      }}>
        Low debt plus a real dividend is a quality tell. Infosys net cash + 4.2% yield is the calmer cousin of a leveraged name.
      </div>
    </Stage>
  );
};

// NARRATION: Growth here means how fast sales and profit have been compounding — CAGR. PEG takes a dear P/E and asks if the growth justifies it: P/E divided by the growth percent. Dixon at 47.7 times earnings with 77 percent profit CAGR gives PEG about 0.6. Under 1 means cheap for that growth; a high P/E is not automatically expensive.
export const GrowthScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const picks = [
    { n: "HAL", pe: "34.9×", roe: "24%" },
    { n: "DIXON", pe: "47.7×", roe: "37%" },
    { n: "KEI", pe: "53.4×", roe: "15%" },
    { n: "SYRMA", pe: "76.5×", roe: "14%" },
    { n: "DATAPATTNS", pe: "95.8×", roe: "15%" },
  ];
  return (
    <Stage>
      <SceneProgress p={p} color={ACC} />
      <FQHead kicker="FUNDAMENTALS · GROWTH" title="Growth rate and the PEG ratio" color={ACC} p={p} />

      <Card theme={T} x={100} y={210} w={820} h={240} color={ACC} o={p(0.08, 0.16)}>
        <DefBadge text="Definition" color={ACC} />
        <div style={{ fontFamily: SANS, fontSize: 26, color: T.text, marginTop: 14, lineHeight: 1.35, width: 760 }}>
          CAGR is the smoothed yearly growth of sales or profit. PEG checks whether a high P/E is still cheap because growth is faster.
        </div>
      </Card>
      <Card theme={T} x={960} y={210} w={760} h={240} color={ACC} o={p(0.18, 0.28)} glow>
        <div style={{ fontFamily: MONO, fontSize: 20, letterSpacing: 2, color: T.muted, marginBottom: 12 }}>THE FORMULA</div>
        <Formula o={1} size={34} parts={[["PEG", ACC], ["=", T.text], ["P/E", ACC], ["÷", T.text], ["growth %", ACC]]} />
        <div style={{ fontFamily: SANS, fontSize: 22, color: T.muted, marginTop: 14, width: 700 }}>PEG under 1 → cheap for the growth.</div>
      </Card>
      <Wire x1={920} y1={330} x2={960} y2={330} p={p(0.16, 0.24)} color={ACC} w={2} arrow />
      <Flow x1={920} y1={330} x2={960} y2={330} color={ACC} n={5} size={7} o={p(0.24, 0.3)} />

      <Card theme={T} x={100} y={480} w={1720} h={200} color={ACC} o={p(0.36, 0.48)} glow>
        <div style={{ fontFamily: MONO, fontSize: 20, letterSpacing: 2, color: T.muted }}>DIXON · WORKED</div>
        <div style={{ display: "flex", alignItems: "center", gap: 28, marginTop: 10 }}>
          <StatChip label="Profit CAGR" value="77%" color={ACC} hero o={p(0.4, 0.5)} />
          <StatChip label="P/E" value="47.7×" color={A.tech} o={p(0.44, 0.54)} />
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 32, color: T.text }}>
            47.7 ÷ 77 ≈ <Counter p={p(0.38, 0.50)} to={Number(PEG_DIXON.toFixed(1))} decimals={1} color={ACC} size={40} />
          </div>
          <div style={{ fontFamily: SANS, fontSize: 26, color: T.text, width: 520, lineHeight: 1.3 }}>
            About 0.6 — a dear 47× multiple that is still cheap for 77% growth.
          </div>
        </div>
      </Card>

      <div style={{ position: "absolute", left: 100, top: 710, width: 1720, display: "flex", gap: 16, opacity: p(0.52, 0.62) }}>
        {picks.map((pk, i) => {
          const on = Math.floor(frame / 28) % 5 === i;
          return (
            <div key={pk.n} style={{
              flex: 1, borderRadius: 16, padding: "16px 18px",
              background: mix(T.panel, on ? ACC : A.val, on ? 0.18 : 0.08),
              border: `2px solid ${on ? ACC : mix(T.line, A.val, 0.5)}`,
              transform: `scale(${on ? 1.04 : 1})`,
            }}>
              <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 22, color: on ? ACC : T.text }}>{pk.n}</div>
              <div style={{ fontFamily: MONO, fontSize: 20, color: T.muted, marginTop: 6 }}>P/E {pk.pe}</div>
              <div style={{ fontFamily: MONO, fontSize: 20, color: T.muted }}>ROE {pk.roe}</div>
            </div>
          );
        })}
      </div>
    </Stage>
  );
};

// NARRATION: Put the six tests on HDFC Bank at once. Price ₹720, P/E 14 times, P/B 1.85, ROE 13.6 percent, ROCE 7.0 percent, dividend yield 1.8 percent, and debt-to-equity low. That is a cheap multiple on a quality bank — not a 77-percent compounder like Dixon, but fairly priced quality. Verdict: cheap, quality.
export const ApplyFAScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const rows: { k: string; v: string; note: string; c: string }[] = [
    { k: "Price", v: "₹720", note: "One share, today", c: A.main },
    { k: "P/E", v: "14.0×", note: "₹14 per ₹1 profit", c: ACC },
    { k: "P/B", v: "1.85×", note: "₹720 ÷ book ₹390", c: ACC },
    { k: "ROE", v: "13.6%", note: "Owners' return", c: ACC },
    { k: "ROCE", v: "7.0%", note: "All-capital return", c: A.tech },
    { k: "Div yield", v: "1.8%", note: "Cash while you hold", c: A.val },
  ];
  return (
    <Stage>
      <SceneProgress p={p} color={ACC} />
      <FQHead kicker="FUNDAMENTALS · APPLY" title="HDFC Bank through all six metrics" color={ACC} p={p} />

      <Card theme={T} x={100} y={210} w={1120} h={130} color={ACC} o={p(0.08, 0.16)}>
        <DefBadge text="Read-through" color={ACC} />
        <div style={{ fontFamily: SANS, fontSize: 26, color: T.text, marginTop: 10, width: 1060 }}>
          Same bank, all six lenses. Infosys sits nearby: P/E 14.9, ROE 31.9%, yield 4.2%, net cash.
        </div>
      </Card>
      <Card theme={T} x={1260} y={210} w={560} h={130} color={ACC} o={p(0.14, 0.24)} glow>
        <div style={{ fontFamily: MONO, fontSize: 20, letterSpacing: 2, color: T.muted }}>D/E</div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 32, color: ACC, marginTop: 6 }}>Low</div>
      </Card>

      {rows.map((r, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const at = 0.20 + i * 0.05;
        const on = Math.floor(frame / 22) % 6 === i;
        return (
          <Card key={r.k} theme={T} x={100 + col * 420} y={370 + row * 200} w={400} h={180}
            color={on ? ACC : r.c} o={p(at, at + 0.08)} glow={on}>
            <div style={{ fontFamily: MONO, fontSize: 20, letterSpacing: 1.5, color: T.muted }}>{r.k.toUpperCase()}</div>
            <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 36, color: r.c, marginTop: 8 }}>{r.v}</div>
            <div style={{ fontFamily: SANS, fontSize: 22, color: T.muted, marginTop: 8 }}>{r.note}</div>
          </Card>
        );
      })}

      <div style={{
        position: "absolute", left: 1360, top: 370, width: 460, height: 380, borderRadius: 20,
        background: mix(T.panel, ACC, 0.16), border: `2.5px solid ${ACC}`, boxSizing: "border-box",
        padding: "28px 30px", opacity: p(0.52, 0.62),
        boxShadow: `0 0 ${36 + Math.sin(frame * 0.06) * 14}px ${mix(T.bg0, ACC, 0.4)}`,
      }}>
        <DefBadge text="Verdict" color={ACC} />
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 36, color: T.text, marginTop: 18, lineHeight: 1.2 }}>
          Cheap, quality.
        </div>
        <div style={{ fontFamily: SANS, fontSize: 24, color: T.muted, marginTop: 16, lineHeight: 1.4, width: 400 }}>
          Low multiple, low debt, a real dividend. Not Dixon's 77% CAGR — a fairly priced bank.
        </div>
        <Flow x1={24} y1={340} x2={410} y2={340} color={ACC} n={6} size={8} o={p(0.58, 0.66)} />
      </div>
    </Stage>
  );
};
