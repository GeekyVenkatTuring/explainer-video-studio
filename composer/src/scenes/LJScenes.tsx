/**
 * LJScenes — Lalithaa Jewellery Mart IPO report explainer (prefix `lj`).
 *
 * Identity: jewellery-gold analysis.
 *   gold  #FBBF24 — the metal, the brand, valuation
 *   ok    #34D399 — growth, fresh money, strengths
 *   bad   #F87171 — risks, OFS, debt, GST
 *   info  #38BDF8 — filing/analysis, the report's lens
 * Motif: viewfinder brackets + scan beam over a gold ring (filing under review).
 */
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import {
  makeTheme, mix, useP, usePop, rnd, MONO, SANS,
  Bg, Stage, Kicker, Head, Foot, Card, Flow, Wire, Counter, Brackets, ScanBeam,
} from "../lib/primitives";

const T = makeTheme({ accent: "#FBBF24" });
const A = { gold: "#FBBF24", ok: "#34D399", bad: "#F87171", info: "#38BDF8" };

const SceneProgress: React.FC<{ dur?: unknown; color?: string }> = ({ dur, color = A.gold }) => {
  const p = useP(dur);
  const w = p(0, 1);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{
        position: "absolute", left: 0, bottom: 0, height: 5, width: `${w * 100}%`,
        background: `linear-gradient(90deg, ${mix("#0A0D18", color, 0.4)}, ${color})`, opacity: 0.75,
      }} />
    </AbsoluteFill>
  );
};

const GoldRing: React.FC<{ x: number; y: number; r: number; o?: number; color?: string }> = ({
  x, y, r, o = 1, color = A.gold,
}) => {
  const frame = useCurrentFrame();
  const rot = frame * 0.4;
  return (
    <div style={{
      position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2,
      borderRadius: r * 2, border: `3px solid ${color}`, opacity: o * 0.35,
      boxShadow: `0 0 24px ${mix("#05060C", color, 0.5)}`,
      transform: `rotate(${rot}deg)`,
    }}>
      <div style={{
        position: "absolute", left: r - 7, top: -7, width: 14, height: 14, borderRadius: 14,
        background: color, boxShadow: `0 0 12px ${color}`,
      }} />
    </div>
  );
};

// Precomputed FY22–FY24 series (₹ million, DRHP restated).
const REV = [
  { y: "FY22", v: 81394.23, c: A.info },
  { y: "FY23", v: 133168.04, c: A.gold },
  { y: "FY24", v: 167880.52, c: A.ok },
];
const PAT = [
  { y: "FY22", v: 1667.74 },
  { y: "FY23", v: 2383.87 },
  { y: "FY24", v: 3598.33 },
];
const REV_MAX = 167880.52;
const revCagr = Math.pow(167880.52 / 81394.23, 1 / 2) - 1; // 0.4362
const patCagr = Math.pow(3598.33 / 1667.74, 1 / 2) - 1;     // 0.4689

// lj_title -----------------------------------------------------------------
const TitleScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const pop = usePop(dur);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <GoldRing x={240} y={220} r={90} o={0.5} />
      <GoldRing x={1680} y={860} r={120} o={0.4} color={A.info} />
      {Array.from({ length: 10 }).map((_, i) => {
        const ang = frame * 0.01 + (i / 10) * Math.PI * 2;
        return (
          <div key={i} style={{
            position: "absolute",
            left: 960 + Math.cos(ang) * (580 + i * 12) - 6,
            top: 540 + Math.sin(ang) * (260 + i * 7) - 6,
            width: 12, height: 12, borderRadius: 12,
            background: i % 2 ? A.gold : A.info,
            opacity: 0.2 + rnd(i, 2) * 0.25,
            boxShadow: `0 0 10px ${i % 2 ? A.gold : A.info}`,
          }} />
        );
      })}
      <div style={{ textAlign: "center", transform: `scale(${0.92 + pop(0) * 0.08})`, zIndex: 2 }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
          <Kicker theme={T} text="IPO RESEARCH · NOT ADVICE" cx />
        </div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 108, lineHeight: 1.02, letterSpacing: -3, color: T.text }}>
          <div>Lalithaa Jewellery</div>
          <div style={{ color: A.gold, textShadow: `0 0 70px ${mix(T.bg0, A.gold, 0.7)}` }}>Mart IPO</div>
        </div>
        <div style={{ height: 5, width: interpolate(p(0.18, 0.45), [0, 1], [0, 520]), background: `linear-gradient(90deg, ${A.gold}, ${A.info})`, borderRadius: 3, margin: "28px auto" }} />
        <div style={{ fontFamily: SANS, fontSize: 34, color: T.muted, opacity: p(0.28, 0.5), maxWidth: 1400, margin: "0 auto" }}>
          Walk the filing report · then the live offer · 18 Aug 2026
        </div>
      </div>
    </AbsoluteFill>
  );
};

// lj_roadmap ---------------------------------------------------------------
const QUESTIONS = [
  { n: "01", q: "Is the business attractive?", v: "Qualified yes", c: A.ok },
  { n: "02", q: "Is financial quality enough?", v: "Mixed", c: A.gold },
  { n: "03", q: "Is leverage acceptable?", v: "Not proven", c: A.bad },
  { n: "04", q: "Can we price the offer?", v: "DRHP: no", c: A.info },
  { n: "05", q: "Are governance risks ok?", v: "Watch closely", c: A.bad },
];
const RoadmapScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const hot = Math.floor(frame / 28) % QUESTIONS.length;
  return (
    <Stage>
      <Head theme={T} kicker="HOW TO READ THE REPORT" title="Five questions. One stance." color={A.info} o={p(0, 0.06)} />
      {QUESTIONS.map((it, i) => {
        const at = 0.08 + i * 0.08;
        const o = p(at, at + 0.08);
        const y = 230 + i * 122;
        const on = hot === i && p(0.55, 0.56) > 0.5;
        return (
          <div key={i} style={{
            position: "absolute", left: 130, top: y, width: 1660, height: 108,
            borderRadius: 16, opacity: o, transform: `translateY(${(1 - o) * 18}px)`,
            background: mix(T.panel, on ? it.c : A.info, on ? 0.18 : 0.07),
            border: `2.5px solid ${on ? it.c : mix("#12172A", it.c, 0.55)}`,
            display: "flex", alignItems: "center", padding: "0 28px", gap: 28, boxSizing: "border-box",
          }}>
            <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 28, color: it.c, width: 70 }}>{it.n}</div>
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 32, color: T.text, flex: 1, width: 1100 }}>{it.q}</div>
            <div style={{
              fontFamily: MONO, fontWeight: 800, fontSize: 24, color: T.bg0, background: it.c,
              borderRadius: 999, padding: "10px 22px",
            }}>{it.v}</div>
          </div>
        );
      })}
      <Foot theme={T} p={p(0.84, 0.93)}>The report answers these from the DRHP — not from grey-market chatter.</Foot>
    </Stage>
  );
};

// lj_stance ----------------------------------------------------------------
const StanceScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const glow = 28 + Math.sin(frame * 0.08) * 10;
  return (
    <Stage>
      <Head theme={T} kicker="RESEARCH STANCE · HIGH CONFIDENCE" title="Wait — and what that word actually means" color={A.gold} o={p(0, 0.06)} />
      <Card theme={T} x={130} y={240} w={820} h={620} color={A.gold} o={p(0.08, 0.18)} glow>
        <div style={{ fontFamily: MONO, fontSize: 22, color: A.gold, letterSpacing: 4, fontWeight: 700 }}>THE CALL</div>
        <div style={{
          fontFamily: SANS, fontWeight: 800, fontSize: 128, color: A.gold, letterSpacing: -3, marginTop: 20,
          textShadow: `0 0 ${glow}px ${mix(T.bg0, A.gold, 0.7)}`,
        }}>WAIT</div>
        <div style={{ fontFamily: SANS, fontSize: 28, color: T.muted, lineHeight: 1.4, marginTop: 18, width: 740 }}>
          Not “avoid forever.” Not “buy.” The filing had no final price, so value could not be judged.
        </div>
      </Card>
      {[
        { at: 0.28, t: "Price band was blank [●]", s: "No P/E. No dilution. No post-offer capital." },
        { at: 0.42, t: "Growth was real — and thin", s: "43.62% revenue CAGR, 2.14% PAT margin." },
        { at: 0.56, t: "Cash and debt needed a test", s: "Negative FY24 operating cash. Floating short-term debt." },
      ].map((r, i) => (
        <Card key={i} theme={T} x={990} y={240 + i * 210} w={800} h={190} color={A.info} o={p(r.at, r.at + 0.1)}>
          <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 30, color: T.text, width: 740 }}>{r.t}</div>
          <div style={{ fontFamily: SANS, fontSize: 26, color: T.muted, marginTop: 12, width: 740, lineHeight: 1.35 }}>{r.s}</div>
        </Card>
      ))}
      <Foot theme={T} p={p(0.84, 0.93)}>Wait = “I cannot price this yet.” That gap later closed in the RHP.</Foot>
    </Stage>
  );
};

// lj_div -------------------------------------------------------------------
const DividerScene: React.FC<{ dur?: number; n?: number; title?: string; sub?: string; color?: string }> = ({
  dur, n = 1, title = "", sub = "", color = A.gold,
}) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  return (
    <Stage>
      <Brackets x={330} y={300} w={1260} h={480} color={color} o={p(0.02, 0.14)} len={54} />
      <ScanBeam theme={T} x={340} y={310} w={1240} h={460} color={color} o={p(0.05, 0.2)} speed={1.6} />
      <GoldRing x={960} y={540} r={210} o={0.25} color={color} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 360, textAlign: "center" }}>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 34, color, letterSpacing: 10, opacity: p(0.05, 0.15) }}>PART {"0" + n}</div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 88, color: T.text, letterSpacing: -2, marginTop: 20, opacity: p(0.12, 0.24), transform: `translateY(${(1 - p(0.12, 0.24)) * 30}px)` }}>{title}</div>
        <div style={{ height: 5, width: interpolate(p(0.2, 0.5), [0, 1], [0, 420]), background: color, borderRadius: 3, margin: "26px auto" }} />
        <div style={{ fontFamily: SANS, fontSize: 32, color: T.muted, opacity: p(0.3, 0.45) }}>{sub}</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 860, display: "flex", justifyContent: "center", gap: 16, opacity: p(0.3, 0.45) }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} style={{
            width: i === n ? 44 : 14, height: 14, borderRadius: 8,
            background: i <= n ? color : mix(T.panel, color, 0.15),
            border: `1.5px solid ${i <= n ? color : T.line}`,
            opacity: i === n ? 0.7 + Math.sin(frame * 0.1) * 0.3 : 1,
          }} />
        ))}
      </div>
    </Stage>
  );
};

// lj_scope -----------------------------------------------------------------
const STATES = [
  { k: "Tamil Nadu", e: "🏛️" },
  { k: "Andhra", e: "🌊" },
  { k: "Telangana", e: "💎" },
  { k: "Karnataka", e: "🌿" },
  { k: "Puducherry", e: "🏖️" },
];
const ScopeScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  return (
    <Stage>
      <Head theme={T} kicker="BUSINESS SCOPE · 31 DEC 2024" title="A southern, store-led gold retailer" color={A.gold} o={p(0, 0.06)} />
      <Card theme={T} x={130} y={250} w={520} h={280} color={A.gold} o={p(0.08, 0.16)} glow>
        <div style={{ fontFamily: MONO, fontSize: 22, color: A.gold }}>STORES</div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 72, color: T.text, marginTop: 8 }}>
          <Counter p={p(0.1, 0.35)} to={56} color={A.gold} size={72} />
        </div>
        <div style={{ fontFamily: SANS, fontSize: 26, color: T.muted, marginTop: 8 }}>in 46 cities · 3 owned, 53 leased</div>
      </Card>
      <Card theme={T} x={680} y={250} w={520} h={280} color={A.ok} o={p(0.18, 0.26)}>
        <div style={{ fontFamily: MONO, fontSize: 22, color: A.ok }}>GOLD MIX · 9M FY25</div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 64, color: T.text, marginTop: 8 }}>94.89%</div>
        <div style={{ fontFamily: SANS, fontSize: 26, color: T.muted, marginTop: 8 }}>of revenue from gold jewellery</div>
      </Card>
      <Card theme={T} x={1230} y={250} w={560} h={280} color={A.info} o={p(0.28, 0.36)}>
        <div style={{ fontFamily: MONO, fontSize: 22, color: A.info }}>FORMAT</div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 36, color: T.text, marginTop: 16, width: 500, lineHeight: 1.3 }}>Brick-and-mortar first. Website and app support schemes.</div>
      </Card>
      {STATES.map((s, i) => {
        const at = 0.18 + i * 0.05;
        const o = p(at, at + 0.08);
        return (
          <div key={i} style={{
            position: "absolute", left: 130 + i * 342, top: 580, width: 318, height: 280,
            borderRadius: 18, opacity: o,
            background: mix(T.panel, A.gold, 0.08), border: `2px solid ${mix("#12172A", A.gold, 0.5)}`,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            transform: `translateY(${Math.sin(frame * 0.05 + i) * 4}px)`,
          }}>
            <div style={{ fontSize: 48 }}>{s.e}</div>
            <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 28, color: T.text, marginTop: 12 }}>{s.k}</div>
          </div>
        );
      })}
      <Foot theme={T} p={p(0.84, 0.93)}>Later coverage cites 61 stores. The report’s 56 is the DRHP date: 31 Dec 2024.</Foot>
    </Stage>
  );
};

// lj_growth ----------------------------------------------------------------
const GrowthScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const X0 = 180, Y0 = 780, W = 220, SCALE = 380 / REV_MAX;
  return (
    <Stage>
      <Head theme={T} kicker="CORE Q1 · OPERATING PROFILE" title="Fast growth. That is not the whole story." color={A.ok} o={p(0, 0.06)} />
      {REV.map((b, i) => {
        const grow = p(0.1 + i * 0.12, 0.22 + i * 0.12);
        const h = b.v * SCALE * grow;
        return (
          <div key={i}>
            <div style={{
              position: "absolute", left: X0 + i * W, top: Y0 - h, width: 150, height: h,
              borderRadius: "12px 12px 0 0",
              background: `linear-gradient(180deg, ${b.c}, ${mix(b.c, T.bg1, 0.45)})`,
              border: `2px solid ${b.c}`, borderBottom: "none",
              boxShadow: `0 0 ${16 + Math.sin(frame * 0.07 + i) * 6}px ${mix(T.bg0, b.c, 0.35)}`,
            }} />
            <div style={{
              position: "absolute", left: X0 + i * W - 30, top: Y0 - h - 52, width: 210, textAlign: "center",
              fontFamily: MONO, fontWeight: 800, fontSize: 22, color: b.c, opacity: grow,
            }}>{(b.v / 10).toFixed(2)} Cr</div>
            <div style={{
              position: "absolute", left: X0 + i * W - 10, top: Y0 + 14, width: 170, textAlign: "center",
              fontFamily: MONO, fontSize: 22, color: T.muted, opacity: grow,
            }}>{b.y}</div>
          </div>
        );
      })}
      <Card theme={T} x={980} y={250} w={810} h={600} color={A.ok} o={p(0.42, 0.54)}>
        <div style={{ fontFamily: MONO, fontSize: 22, color: A.ok }}>REPORTED CAGR · FY22 → FY24</div>
        <div style={{ display: "flex", gap: 40, marginTop: 28 }}>
          <div>
            <div style={{ fontFamily: SANS, fontSize: 26, color: T.muted }}>Revenue</div>
            <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 56, color: A.ok, marginTop: 8 }}>
              {(revCagr * 100).toFixed(2)}%
            </div>
          </div>
          <div>
            <div style={{ fontFamily: SANS, fontSize: 26, color: T.muted }}>Profit after tax</div>
            <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 56, color: A.gold, marginTop: 8 }}>
              {(patCagr * 100).toFixed(2)}%
            </div>
          </div>
        </div>
        <div style={{ marginTop: 36, fontFamily: SANS, fontSize: 28, color: T.text, lineHeight: 1.4, width: 750 }}>
          PAT rose from ₹1,667.74 million to ₹3,598.33 million. Future growth still depends on store productivity — not the old CAGR.
        </div>
        <div style={{ marginTop: 28, fontFamily: MONO, fontSize: 22, color: T.muted }}>
          FY22 PAT ₹166.77 Cr → FY24 PAT ₹359.83 Cr
        </div>
      </Card>
      <Foot theme={T} p={p(0.84, 0.93)}>Verdict: qualified positive operating profile. History is not a forecast.</Foot>
    </Stage>
  );
};

// lj_margins ---------------------------------------------------------------
const MarginsScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const p = useP(dur);
  const rows = [
    { k: "Operating EBITDA margin", fy24: "4.05%", m9: "4.33%", c: A.gold },
    { k: "PAT margin", fy24: "2.14%", m9: "2.08%", c: A.bad },
  ];
  return (
    <Stage>
      <Head theme={T} kicker="CORE Q2 · FINANCIAL QUALITY" title="Jewellery maths: huge sales, thin keep" color={A.gold} o={p(0, 0.06)} />
      {rows.map((r, i) => (
        <Card key={i} theme={T} x={130} y={250 + i * 300} w={1660} h={270} color={r.c} o={p(0.1 + i * 0.18, 0.2 + i * 0.18)}>
          <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 36, color: T.text }}>{r.k}</div>
          <div style={{ display: "flex", gap: 80, marginTop: 28 }}>
            <div>
              <div style={{ fontFamily: MONO, fontSize: 22, color: T.muted }}>FY2024</div>
              <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 72, color: r.c }}>{r.fy24}</div>
            </div>
            <div>
              <div style={{ fontFamily: MONO, fontSize: 22, color: T.muted }}>9M FY25 — not annualised</div>
              <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 72, color: T.text }}>{r.m9}</div>
            </div>
          </div>
        </Card>
      ))}
      <Foot theme={T} p={p(0.84, 0.93)}>On ₹100 of jewellery sold, about ₹2 of profit after tax stayed in FY24.</Foot>
    </Stage>
  );
};

// lj_cash ------------------------------------------------------------------
const CashScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  return (
    <Stage>
      <Head theme={T} kicker="THE CASH TEST" title="Profit is not cash. This year proved it." color={A.bad} o={p(0, 0.06)} />
      <Card theme={T} x={130} y={250} w={800} h={600} color={A.ok} o={p(0.08, 0.18)}>
        <div style={{ fontFamily: MONO, fontSize: 22, color: A.ok }}>FY2024 PAT</div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 64, color: A.ok, marginTop: 16 }}>₹3,598.33 mn</div>
        <div style={{ fontFamily: SANS, fontSize: 28, color: T.muted, marginTop: 8 }}>₹359.83 crore of reported profit</div>
        <div style={{
          marginTop: 40, height: 220, borderRadius: 16,
          background: `linear-gradient(180deg, ${mix(T.panel, A.ok, 0.55)}, ${mix(T.panel, A.ok, 0.2)})`,
          border: `2px solid ${A.ok}`,
          boxShadow: `0 0 ${20 + Math.sin(frame * 0.08) * 8}px ${mix(T.bg0, A.ok, 0.4)}`,
        }} />
      </Card>
      <Wire x1={940} y1={540} x2={1080} y2={540} p={p(0.28, 0.38)} color={A.bad} w={4} />
      <Flow x1={940} y1={540} x2={1080} y2={540} color={A.bad} n={6} o={p(0.38, 0.48)} />
      <Card theme={T} x={990} y={250} w={800} h={600} color={A.bad} o={p(0.32, 0.44)} glow>
        <div style={{ fontFamily: MONO, fontSize: 22, color: A.bad }}>FY2024 OPERATING CASH FLOW</div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 64, color: A.bad, marginTop: 16 }}>−₹180.02 mn</div>
        <div style={{ fontFamily: SANS, fontSize: 28, color: T.muted, marginTop: 8 }}>cash went OUT while PAT was in</div>
        <div style={{ marginTop: 36, fontFamily: SANS, fontSize: 28, color: T.text, width: 740, lineHeight: 1.4 }}>
          9M FY25 then flipped to +₹2,363.45 million. Cash conversion is the test — not one year of profit.
        </div>
      </Card>
      <Foot theme={T} p={p(0.84, 0.93)}>Inventory-heavy jewellery: earnings can look fine while working capital eats cash.</Foot>
    </Stage>
  );
};

// lj_inventory -------------------------------------------------------------
const InventoryScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const p = useP(dur);
  const days = 93 + (155 - 93) * p(0.2, 0.72);
  const wFill = (days / 180) * 1480;
  return (
    <Stage>
      <Head theme={T} kicker="WORKING CAPITAL" title="Inventory days: 93 → 155. That is the squeeze." color={A.gold} o={p(0, 0.06)} />
      <div style={{ position: "absolute", left: 220, top: 280, opacity: p(0.08, 0.16) }}>
        <div style={{ fontFamily: MONO, fontSize: 22, color: T.muted }}>INVENTORY · 31 DEC 2024</div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 72, color: A.gold }}>₹53,325.92 mn</div>
        <div style={{ fontFamily: SANS, fontSize: 28, color: T.muted }}>₹5,332.59 crore sitting in gold and jewellery stock</div>
      </div>
      <div style={{ position: "absolute", left: 220, top: 520, width: 1480, height: 36, borderRadius: 18, background: T.panel, border: `2px solid ${T.line}`, opacity: p(0.18, 0.28) }}>
        <div style={{
          width: wFill, height: "100%", borderRadius: 16,
          background: `linear-gradient(90deg, ${A.gold}, ${A.bad})`,
        }} />
      </div>
      <div style={{ position: "absolute", left: 220, top: 580, fontFamily: MONO, fontWeight: 800, fontSize: 40, color: A.gold, opacity: p(0.22, 0.32) }}>
        {days.toFixed(0)} inventory days
      </div>
      <div style={{ position: "absolute", left: 220, top: 680, display: "flex", gap: 24, opacity: p(0.45, 0.55) }}>
        {[
          { l: "FY24", v: "93 days", c: A.ok },
          { l: "9M FY25", v: "155 days", c: A.bad },
          { l: "Do not annualise 9M", v: "partial year", c: A.info },
        ].map((c, i) => (
          <div key={i} style={{
            width: 470, padding: "22px 26px", borderRadius: 16,
            background: mix(T.panel, c.c, 0.1), border: `2px solid ${c.c}`,
          }}>
            <div style={{ fontFamily: MONO, fontSize: 21, color: c.c }}>{c.l}</div>
            <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 32, color: T.text, marginTop: 8 }}>{c.v}</div>
          </div>
        ))}
      </div>
      <Foot theme={T} p={p(0.84, 0.93)}>More days in stock = more gold to finance. That is why cash conversion is central.</Foot>
    </Stage>
  );
};

// lj_debt ------------------------------------------------------------------
const DebtScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const p = useP(dur);
  const segs = [
    { at: 0.14, h: 390, label: "Current  ₹8,651.95 mn", c: A.bad },
    { at: 0.32, h: 48, label: "Non-current  ₹319.17 mn", c: A.info },
  ];
  return (
    <Stage>
      <Head theme={T} kicker="CORE Q3 · LEVERAGE" title="Almost all the debt is short-term and floating" color={A.bad} o={p(0, 0.06)} />
      <div style={{
        position: "absolute", left: 160, top: 250, width: 520, height: 460,
        border: `2.5px solid ${T.line}`, borderRadius: 18, background: T.panel,
        display: "flex", flexDirection: "column-reverse", overflow: "hidden",
        opacity: p(0.08, 0.16),
      }}>
        {segs.map((s, i) => (
          <div key={i} style={{
            height: s.h * p(s.at, s.at + 0.12),
            background: `linear-gradient(90deg, ${mix(T.panel, s.c, 0.75)}, ${mix(T.panel, s.c, 0.45)})`,
            borderTop: `2px solid ${s.c}`, display: "flex", alignItems: "center", paddingLeft: 18,
          }}>
            <span style={{ fontFamily: MONO, fontSize: 21, color: T.text, opacity: p(s.at + 0.04, s.at + 0.12) }}>{s.label}</span>
          </div>
        ))}
      </div>
      <Card theme={T} x={760} y={250} w={1030} h={280} color={A.bad} o={p(0.36, 0.48)}>
        <div style={{ fontFamily: MONO, fontSize: 22, color: A.bad }}>AS OF 30 APRIL 2025</div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 44, color: T.text, marginTop: 14 }}>Total debt ₹12,149.89 mn</div>
        <div style={{ fontFamily: SANS, fontSize: 28, color: T.muted, marginTop: 12, width: 960 }}>
          of which ₹11,785.30 million is floating-rate short-term borrowings
        </div>
      </Card>
      <Card theme={T} x={760} y={560} w={1030} h={290} color={A.info} o={p(0.52, 0.64)}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 32, color: T.text, width: 960 }}>
          Covenants, security and refinancing risk are disclosed. Maturity schedule and covenant headroom are not.
        </div>
        <div style={{ fontFamily: SANS, fontSize: 26, color: T.muted, marginTop: 18, width: 960 }}>
          Verdict: leverage is not conclusively established as safe.
        </div>
      </Card>
      <Foot theme={T} p={p(0.84, 0.93)}>31 Dec 2024: current ₹8,651.95 mn vs non-current ₹319.17 mn.</Foot>
    </Stage>
  );
};

// lj_ofs -------------------------------------------------------------------
const OfsScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const p = useP(dur);
  const fresh = p(0.18, 0.5);
  const ofs = p(0.32, 0.58);
  return (
    <Stage>
      <Head theme={T} kicker="CORE Q4 · WHERE THE MONEY GOES" title="Fresh issue funds the company. OFS does not." color={A.info} o={p(0, 0.06)} />
      <div style={{ position: "absolute", left: 160, top: 280, width: 1600, height: 70, borderRadius: 14, overflow: "hidden", display: "flex", opacity: p(0.08, 0.16) }}>
        <div style={{ width: `${70.59 * fresh}%`, background: A.ok, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontWeight: 800, fontSize: 24, color: T.bg0 }}>FRESH 70.59%</div>
        <div style={{ width: `${29.41 * ofs}%`, background: A.bad, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontWeight: 800, fontSize: 24, color: T.bg0 }}>OFS 29.41%</div>
      </div>
      <Card theme={T} x={160} y={400} w={760} h={430} color={A.ok} o={p(0.22, 0.34)} glow>
        <div style={{ fontFamily: MONO, fontSize: 22, color: A.ok }}>FRESH ISSUE · INTO COMPANY</div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 56, color: A.ok, marginTop: 16 }}>up to ₹1,200 Cr</div>
        <div style={{ fontFamily: SANS, fontSize: 28, color: T.muted, marginTop: 8 }}>₹12,000 million</div>
        <div style={{ fontFamily: SANS, fontSize: 28, color: T.text, marginTop: 28, width: 700, lineHeight: 1.4 }}>
          You are funding new stores and general corporate purposes.
        </div>
      </Card>
      <Card theme={T} x={980} y={400} w={760} h={430} color={A.bad} o={p(0.38, 0.5)}>
        <div style={{ fontFamily: MONO, fontSize: 22, color: A.bad }}>OFFER FOR SALE · TO PROMOTER</div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 56, color: A.bad, marginTop: 16 }}>up to ₹500 Cr</div>
        <div style={{ fontFamily: SANS, fontSize: 28, color: T.muted, marginTop: 8 }}>₹5,000 million · Kiran Kumar Jain</div>
        <div style={{ fontFamily: SANS, fontSize: 28, color: T.text, marginTop: 28, width: 700, lineHeight: 1.4 }}>
          This cash leaves with the selling shareholder. It does not expand the chain.
        </div>
      </Card>
      <Foot theme={T} p={p(0.84, 0.93)}>Honesty lens: who gets the money? The company gets only the fresh issue.</Foot>
    </Stage>
  );
};

// lj_proceeds --------------------------------------------------------------
const ProceedsScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const items = [
    { e: "🏬", k: "DRHP: 12 new stores", v: "₹10,145.04 million identified as store capex", c: A.gold },
    { e: "📄", k: "RHP update: 10 stores", v: "Inventory ₹998.68 Cr + fit-outs ₹34.55 Cr", c: A.info },
    { e: "❓", k: "Missing: payback maths", v: "No store-level ramp, margin, or return assumptions", c: A.bad },
  ];
  return (
    <Stage>
      <Head theme={T} kicker="USE OF PROCEEDS" title="Expansion is the story. Payback is not shown." color={A.gold} o={p(0, 0.06)} />
      {items.map((it, i) => {
        const at = 0.1 + i * 0.16;
        const o = p(at, at + 0.1);
        const hot = Math.floor(frame / 26) % 3 === i;
        return (
          <Card key={i} theme={T} x={130 + i * 575} y={280} w={530} h={520} color={hot ? it.c : mix("#12172A", it.c, 0.8)} o={o} glow={hot}>
            <div style={{ fontSize: 56 }}>{it.e}</div>
            <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 32, color: T.text, marginTop: 20, width: 480 }}>{it.k}</div>
            <div style={{ fontFamily: SANS, fontSize: 26, color: T.muted, marginTop: 18, width: 480, lineHeight: 1.4 }}>{it.v}</div>
          </Card>
        );
      })}
      <Foot theme={T} p={p(0.84, 0.93)}>DRHP said 12 stores. The live RHP objects table lists 10. Both can be true at different filing dates.</Foot>
    </Stage>
  );
};

// lj_priced ----------------------------------------------------------------
const PricedScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const p = useP(dur);
  return (
    <Stage>
      <Head theme={T} kicker="THEN VS NOW · 18 AUG 2026" title="The blank cells that forced WAIT got filled" color={A.info} o={p(0, 0.06)} />
      <Card theme={T} x={130} y={240} w={800} h={620} color={A.gold} o={p(0.08, 0.18)}>
        <div style={{ fontFamily: MONO, fontSize: 22, color: A.gold }}>DRHP — WHAT THE REPORT SAW</div>
        {[
          "Price band  [●]",
          "Share counts  [●]",
          "Company P/E  [●]",
          "Peer P/E span  12.35× – 98.07×",
        ].map((t, i) => (
          <div key={i} style={{
            fontFamily: MONO, fontSize: 28, color: T.text, marginTop: 28, opacity: p(0.16 + i * 0.08, 0.24 + i * 0.08),
          }}>{t}</div>
        ))}
      </Card>
      <Card theme={T} x={990} y={240} w={800} h={620} color={A.ok} o={p(0.4, 0.52)} glow>
        <div style={{ fontFamily: MONO, fontSize: 22, color: A.ok }}>RHP / LIVE ISSUE</div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 40, color: T.text, marginTop: 22 }}>₹190 – ₹201</div>
        <div style={{ fontFamily: SANS, fontSize: 26, color: T.muted, marginTop: 8 }}>lot 74 · min ₹14,874 · 17–19 Aug</div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 32, color: A.ok, marginTop: 28 }}>Post-issue P/E 11.14×</div>
        <div style={{ fontFamily: SANS, fontSize: 26, color: T.muted, marginTop: 8 }}>Pre-issue 9.95× at ₹201 · Chittorgarh</div>
        <div style={{ fontFamily: SANS, fontSize: 26, color: T.text, marginTop: 28, width: 740, lineHeight: 1.35 }}>
          Promoter 97.72% → 82.85%. Listing tentative 24 Aug 2026.
        </div>
      </Card>
      <Foot theme={T} p={p(0.84, 0.93)}>ET cites industry peer P/E 29.69× for FY26. DRHP’s 12.35–98.07 span was too wide to use alone.</Foot>
    </Stage>
  );
};

// lj_gov -------------------------------------------------------------------
const GovScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const p = useP(dur);
  const fill = p(0.12, 0.45);
  return (
    <Stage>
      <Head theme={T} kicker="CORE Q5 · GOVERNANCE" title="Concentrated control, with related-party traffic" color={A.bad} o={p(0, 0.06)} />
      <Card theme={T} x={130} y={240} w={720} h={620} color={A.gold} o={p(0.08, 0.18)} glow>
        <div style={{ fontFamily: MONO, fontSize: 22, color: A.gold }}>PRE-OFFER PROMOTER HOLDING</div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 88, color: A.gold, marginTop: 20 }}>97.72%</div>
        <div style={{ height: 22, width: 640, borderRadius: 12, background: T.bg2, marginTop: 24, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${97.72 * fill}%`, background: A.gold, borderRadius: 12 }} />
        </div>
        <div style={{ fontFamily: SANS, fontSize: 26, color: T.muted, marginTop: 28, width: 650, lineHeight: 1.4 }}>
          Principal promoter is Chairman and Managing Director. Auditors reported no qualifications.
        </div>
      </Card>
      <Card theme={T} x={900} y={240} w={890} h={620} color={A.info} o={p(0.3, 0.42)}>
        <div style={{ fontFamily: MONO, fontSize: 22, color: A.info }}>RELATED PARTIES DISCLOSED</div>
        {["Rent", "Brand-ambassador fees", "Security deposits", "Remuneration"].map((t, i) => (
          <div key={i} style={{
            marginTop: 22, fontFamily: SANS, fontSize: 30, color: T.text, opacity: p(0.32 + i * 0.06, 0.40 + i * 0.06),
          }}>→  {t}</div>
        ))}
        <div style={{ fontFamily: SANS, fontSize: 26, color: T.muted, marginTop: 36, width: 820, lineHeight: 1.4 }}>
          The filing warns terms may be less favourable than third-party deals. Audit Committee safeguards are disclosed — not proof of arm’s-length outcomes.
        </div>
      </Card>
      <Foot theme={T} p={p(0.84, 0.93)}>Verdict: material monitoring concern — not an automatic disqualifier.</Foot>
    </Stage>
  );
};

// lj_gst -------------------------------------------------------------------
const GstScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  return (
    <Stage>
      <Head theme={T} kicker="LEGAL · TAX" title="A pending GST demand the company admitted" color={A.bad} o={p(0, 0.06)} />
      <Card theme={T} x={200} y={260} w={1520} h={560} color={A.bad} o={p(0.1, 0.22)} glow>
        <div style={{ fontFamily: MONO, fontSize: 22, color: A.bad }}>GST ITC ERROR · ORDER DATED 8 JAN 2025</div>
        <div style={{
          fontFamily: SANS, fontWeight: 800, fontSize: 80, color: A.bad, marginTop: 18,
          textShadow: `0 0 ${24 + Math.sin(frame * 0.1) * 8}px ${mix(T.bg0, A.bad, 0.5)}`,
        }}>₹1,066.38 million</div>
        <div style={{ fontFamily: SANS, fontSize: 32, color: T.text, marginTop: 8 }}>₹106.64 crore stated total liability — matter pending</div>
        <div style={{ fontFamily: SANS, fontSize: 28, color: T.muted, marginTop: 36, width: 1420, lineHeight: 1.4 }}>
          Excess input-tax-credit availment, plus other tax proceedings and pending promoter matters. A clean auditor letter does not make contingent liabilities disappear.
        </div>
      </Card>
      <Foot theme={T} p={p(0.84, 0.93)}>Treat this as a watch-item, not a solved line. Outcome is unknown.</Foot>
    </Stage>
  );
};

// lj_sector ----------------------------------------------------------------
const SectorScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const p = useP(dur);
  const items = [
    { e: "📈", k: "Gold, FX, demand", v: "Price spikes and a weaker rupee can lift tags and cut volumes. 94.89% gold mix is concentrated risk.", c: A.gold },
    { e: "🧾", k: "Duty, GST, HUID", v: "Import duty, GST and hallmarking can help organised chains vs cash stores — pass-through is not disclosed.", c: A.info },
    { e: "🛒", k: "Omnichannel rivals", v: "Weddings and festivals help. E-commerce schemes started FY2023 — later than some peers. Online mix undisclosed.", c: A.bad },
  ];
  return (
    <Stage>
      <Head theme={T} kicker="SECTOR FORCES" title="The industry can lift — or squeeze — the same P&L" color={A.info} o={p(0, 0.06)} />
      {items.map((it, i) => (
        <Card key={i} theme={T} x={130} y={230 + i * 210} w={1660} h={190} color={it.c} o={p(0.1 + i * 0.14, 0.2 + i * 0.14)}>
          <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
            <div style={{ fontSize: 44 }}>{it.e}</div>
            <div>
              <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 32, color: T.text }}>{it.k}</div>
              <div style={{ fontFamily: SANS, fontSize: 26, color: T.muted, marginTop: 8, width: 1480, lineHeight: 1.35 }}>{it.v}</div>
            </div>
          </div>
        </Card>
      ))}
      <Foot theme={T} p={p(0.84, 0.93)}>Daily gold purchasing is disclosed. The filing does not assure it hedges price moves.</Foot>
    </Stage>
  );
};

// lj_live ------------------------------------------------------------------
const LiveScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const p = useP(dur);
  return (
    <Stage>
      <Head theme={T} kicker="LIVE BOOK · PROVISIONAL" title="Day 2 demand is real. It is not a thesis." color={A.info} o={p(0, 0.06)} />
      <Card theme={T} x={130} y={250} w={800} h={600} color={A.ok} o={p(0.08, 0.18)}>
        <div style={{ fontFamily: MONO, fontSize: 22, color: A.ok }}>SUBSCRIPTION · NSE VIA MONEYCONTROL</div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 36, color: T.text, marginTop: 20, width: 740, lineHeight: 1.35 }}>
          As of about 10:48 IST on 18 Aug 2026, the issue was just fully subscribed.
        </div>
        <div style={{ marginTop: 28, fontFamily: MONO, fontSize: 26, color: T.text, lineHeight: 1.7 }}>
          <div>Retail  1.13×</div>
          <div>NII     1.13×</div>
          <div>QIB     0.67×</div>
        </div>
        <div style={{ fontFamily: SANS, fontSize: 24, color: T.muted, marginTop: 24, width: 740 }}>
          Later same-day snapshots were higher. Always re-check NSE before you treat a print as final.
        </div>
      </Card>
      <Card theme={T} x={990} y={250} w={800} h={600} color={A.gold} o={p(0.28, 0.4)}>
        <div style={{ fontFamily: MONO, fontSize: 22, color: A.gold }}>GMP · UNOFFICIAL</div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 64, color: A.gold, marginTop: 18 }}>₹30 – ₹32</div>
        <div style={{ fontFamily: SANS, fontSize: 28, color: T.muted, marginTop: 8 }}>about 15% over ₹201 — grey market</div>
        <div style={{ fontFamily: SANS, fontSize: 26, color: T.text, marginTop: 36, width: 740, lineHeight: 1.4 }}>
          GMP is not an exchange quote and not a listing prediction. It can vanish before Monday.
        </div>
        <div style={{ fontFamily: SANS, fontSize: 26, color: T.muted, marginTop: 28, width: 740 }}>
          FY26 restated: income ₹25,039.80 Cr · PAT ₹1,009.82 Cr · borrowings ₹1,604.14 Cr
        </div>
      </Card>
      <Foot theme={T} p={p(0.84, 0.93)}>Provisional book + unofficial GMP. Neither replaces the five-question framework.</Foot>
    </Stage>
  );
};

// lj_score -----------------------------------------------------------------
const SCORE = [
  { q: "Business", v: "Qualified positive", c: A.ok },
  { q: "Financial quality", v: "Mixed — cash is the test", c: A.gold },
  { q: "Leverage", v: "Not conclusively safe", c: A.bad },
  { q: "Offer / valuation", v: "Now priceable at ~11×", c: A.info },
  { q: "Governance / legal", v: "Material watch", c: A.bad },
];
const ScoreScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const p = useP(dur);
  return (
    <Stage>
      <Head theme={T} kicker="SCORECARD" title="Put the five answers on one page" color={A.gold} o={p(0, 0.06)} />
      {SCORE.map((s, i) => {
        const at = 0.08 + i * 0.1;
        const o = p(at, at + 0.08);
        return (
          <div key={i} style={{
            position: "absolute", left: 140, top: 230 + i * 122, width: 1640, height: 108,
            borderRadius: 16, opacity: o, transform: `translateX(${(1 - o) * -24}px)`,
            background: mix(T.panel, s.c, 0.1), border: `2.5px solid ${s.c}`,
            display: "flex", alignItems: "center", padding: "0 32px", justifyContent: "space-between",
            boxSizing: "border-box",
          }}>
            <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 32, color: T.text }}>{s.q}</div>
            <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 26, color: T.bg0, background: s.c, borderRadius: 999, padding: "10px 22px" }}>{s.v}</div>
          </div>
        );
      })}
      <Foot theme={T} p={p(0.84, 0.93)}>The report’s WAIT was about missing price. The other four answers did not vanish.</Foot>
    </Stage>
  );
};

// lj_decide ----------------------------------------------------------------
const DecideScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const p = useP(dur);
  const cols = [
    { k: "If you want a flip", v: "You are betting GMP and day-1 demand. That is a lottery on unofficial premium — not on store economics.", c: A.gold },
    { k: "If you want to own it", v: "You need comfort with thin margins, gold inventory, short-term floating debt, and GST overhang — at ~11× FY26 earnings.", c: A.info },
    { k: "What nobody can claim", v: "This video cannot tell you to apply or skip. SEBI-registered advice is personal. The filing is public.", c: A.bad },
  ];
  return (
    <Stage>
      <Head theme={T} kicker="HOW TO THINK · NOT A CALL" title="Is it “good to buy”? Split the question." color={A.info} o={p(0, 0.06)} />
      {cols.map((c, i) => (
        <Card key={i} theme={T} x={120 + i * 575} y={250} w={530} h={580} color={c.c} o={p(0.1 + i * 0.14, 0.22 + i * 0.14)}>
          <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 32, color: c.c, width: 480 }}>{c.k}</div>
          <div style={{ fontFamily: SANS, fontSize: 26, color: T.text, marginTop: 24, width: 480, lineHeight: 1.4 }}>{c.v}</div>
        </Card>
      ))}
      <Foot theme={T} p={p(0.84, 0.93)}>Honest read: cheaper than many listed jewellers — with real cash, debt and legal caveats.</Foot>
    </Stage>
  );
};

// lj_recap -----------------------------------------------------------------
const RecapScene: React.FC<{ dur?: number; items?: string[]; closer?: string }> = ({
  dur, items = [], closer = "",
}) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  return (
    <AbsoluteFill style={{ padding: "60px 130px", justifyContent: "center" }}>
      <GoldRing x={1660} y={140} r={70} o={0.4} />
      <div style={{ opacity: p(0, 0.06), textAlign: "center", marginBottom: 22 }}>
        <Kicker theme={T} text="RECAP — THE WHOLE MAP" cx />
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 52, color: T.text, marginTop: 12, letterSpacing: -1 }}>Lalithaa IPO in one breath</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 1540, margin: "0 auto", width: "100%" }}>
        {items.map((it, i) => {
          const at = 0.06 + i * 0.09;
          const o = p(at, at + 0.07);
          return (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 18, opacity: o,
              transform: `translateX(${(1 - o) * -26}px)`,
              background: mix(T.panel, A.gold, 0.05), border: `1.5px solid ${T.line}`,
              borderLeft: `4px solid ${A.gold}`, borderRadius: 12, padding: "14px 24px",
            }}>
              <span style={{ color: A.gold, fontFamily: MONO, fontWeight: 700, fontSize: 24 }}>{i + 1}</span>
              <span style={{ fontFamily: SANS, fontSize: 28, color: T.text, lineHeight: 1.25, width: 1400 }}>{it}</span>
            </div>
          );
        })}
      </div>
      <div style={{ textAlign: "center", marginTop: 28, opacity: p(0.8, 0.9) }}>
        <div style={{
          fontFamily: SANS, fontWeight: 800, fontStyle: "italic", fontSize: 32, color: A.gold,
          textShadow: `0 0 ${30 + Math.sin(frame * 0.06) * 14}px ${mix(T.bg0, A.gold, 0.7)}`,
          maxWidth: 1500, margin: "0 auto", lineHeight: 1.35,
        }}>{closer}</div>
      </div>
    </AbsoluteFill>
  );
};

const ACCENT: Record<string, string> = {
  lj_title: A.gold, lj_roadmap: A.info, lj_stance: A.gold, lj_div: A.gold,
  lj_scope: A.gold, lj_growth: A.ok, lj_margins: A.gold, lj_cash: A.bad,
  lj_inventory: A.gold, lj_debt: A.bad, lj_ofs: A.info, lj_proceeds: A.gold,
  lj_priced: A.info, lj_gov: A.bad, lj_gst: A.bad, lj_sector: A.info,
  lj_live: A.info, lj_score: A.gold, lj_decide: A.info, lj_recap: A.gold,
};

export const LJScene: React.FC<{ variant: string;[key: string]: unknown }> = ({ variant, ...rest }) => {
  let content: React.ReactNode;
  switch (variant) {
    case "lj_title": content = <TitleScene {...(rest as object)} />; break;
    case "lj_roadmap": content = <RoadmapScene {...(rest as object)} />; break;
    case "lj_stance": content = <StanceScene {...(rest as object)} />; break;
    case "lj_div": content = <DividerScene {...(rest as object)} />; break;
    case "lj_scope": content = <ScopeScene {...(rest as object)} />; break;
    case "lj_growth": content = <GrowthScene {...(rest as object)} />; break;
    case "lj_margins": content = <MarginsScene {...(rest as object)} />; break;
    case "lj_cash": content = <CashScene {...(rest as object)} />; break;
    case "lj_inventory": content = <InventoryScene {...(rest as object)} />; break;
    case "lj_debt": content = <DebtScene {...(rest as object)} />; break;
    case "lj_ofs": content = <OfsScene {...(rest as object)} />; break;
    case "lj_proceeds": content = <ProceedsScene {...(rest as object)} />; break;
    case "lj_priced": content = <PricedScene {...(rest as object)} />; break;
    case "lj_gov": content = <GovScene {...(rest as object)} />; break;
    case "lj_gst": content = <GstScene {...(rest as object)} />; break;
    case "lj_sector": content = <SectorScene {...(rest as object)} />; break;
    case "lj_live": content = <LiveScene {...(rest as object)} />; break;
    case "lj_score": content = <ScoreScene {...(rest as object)} />; break;
    case "lj_decide": content = <DecideScene {...(rest as object)} />; break;
    case "lj_recap": content = <RecapScene {...(rest as object)} />; break;
    default: content = <TitleScene {...(rest as object)} />;
  }
  return (
    <AbsoluteFill>
      <Bg theme={T} accent={ACCENT[variant] || A.gold} />
      {content}
      <SceneProgress dur={rest.dur} color={ACCENT[variant] || A.gold} />
    </AbsoluteFill>
  );
};

export default LJScene;
