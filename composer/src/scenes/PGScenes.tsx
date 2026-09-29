/**
 * PGScenes.tsx — "Payment Gateways for Developers" scene set (prefix `pg`).
 *
 * Identity: checkout / payment-terminal. Motif = a transaction-flow rail
 * (Checkout → Gateway → Bank → Settled) with marching dots + a card-swipe.
 * Semantic accents: B blue=cards · U violet=UPI · G green=success/you-keep/free ·
 * Y amber=settlement/warn · R rose=fees/cost/not-published · TEAL=docs/api.
 *
 * DIFFERENT FROM TTScenes: every archetype is DATA-DRIVEN via props, because the
 * same scene renders once per gateway. chapters.py owns every number (traceable to
 * projects/payments-en/research/<gateway>.md). Each gateway passes its own `accent`.
 *
 * Contract rules honored: useP(dur) phasing (no fixed-frame reveals), continuous
 * motion + a scene-progress bar in EVERY scene, deterministic (rnd, no Math.random).
 */
import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import {
  makeTheme, mix, MONO, SANS, useP, usePop,
  Stage, Bg, Head, Foot, Wire, Flow, Counter, Type, ScanBeam, Brackets,
} from "../lib/primitives";

const T = makeTheme({ accent: "#3B82F6" });
const B = "#3B82F6", U = "#A855F7", G = "#34D399", Y = "#FBBF24", R = "#FB7185", TEAL = "#22D3EE";
const ac = (a?: string) => a || B;

// ---------------------------------------------------------------- shared: progress bar (every scene)
const PGBar: React.FC<{ dur?: number; color: string }> = ({ dur, color }) => {
  const p = useP(dur);
  return (
    <div style={{ position: "absolute", left: 0, bottom: 0, height: 6, width: `${p(0, 1) * 100}%`,
      background: `linear-gradient(90deg, ${mix(color, T.bg0, 0.4)}, ${color})`, opacity: 0.6 }} />
  );
};

// ---------------------------------------------------------------- shared: transaction rail motif (ambient)
const Rail: React.FC<{ y: number; color: string; o?: number; labels?: boolean }> = ({ y, color, o = 1, labels }) => {
  const frame = useCurrentFrame();
  const nodes = ["Checkout", "Gateway", "Bank", "Settled"];
  const xs = [360, 760, 1160, 1560];
  return (
    <div style={{ opacity: o }}>
      {xs.slice(0, -1).map((x, i) => (
        <React.Fragment key={i}>
          <div style={{ position: "absolute", left: x + 24, top: y - 1, width: xs[i + 1] - x - 48, height: 3,
            background: mix(T.line, color, 0.5) }} />
          <Flow x1={x + 24} y1={y} x2={xs[i + 1] - 24} y2={y} color={color} n={3} o={0.9} size={8} speed={0.014} />
        </React.Fragment>
      ))}
      {xs.map((x, i) => (
        <React.Fragment key={i}>
          <div style={{ position: "absolute", left: x - 11, top: y - 11, width: 22, height: 22, borderRadius: 22,
            background: mix(T.bg0, color, 0.5), border: `2.5px solid ${color}`,
            boxShadow: `0 0 ${10 + Math.sin(frame * 0.08 + i) * 6}px ${color}` }} />
          {labels && (
            <div style={{ position: "absolute", left: x - 70, top: y + 18, width: 140, textAlign: "center",
              fontFamily: MONO, fontSize: 19, color: T.muted }}>{nodes[i]}</div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

// ---------------------------------------------------------------- shared: browser chrome (docs / code)
const Browser: React.FC<{
  url: string; color: string; o: number; x?: number; y?: number; w?: number; h?: number; tag?: string; children?: React.ReactNode;
}> = ({ url, color, o, x = 210, y = 205, w = 1500, h = 690, tag = "OFFICIAL", children }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: 20,
      background: mix(T.bg1, color, 0.04), border: `2.5px solid ${mix(T.line, color, 0.5)}`,
      boxShadow: `0 0 ${30 + Math.sin(frame * 0.05) * 10}px ${mix(T.bg0, color, 0.32)}`,
      opacity: o, transform: `translateY(${(1 - o) * 22}px)`, overflow: "hidden" }}>
      <div style={{ height: 52, background: mix(T.bg0, color, 0.08), borderBottom: `2px solid ${mix(T.line, color, 0.4)}`,
        display: "flex", alignItems: "center", gap: 10, padding: "0 22px" }}>
        {[R, Y, G].map((c, i) => <div key={i} style={{ width: 13, height: 13, borderRadius: 7, background: mix(c, T.bg0, 0.25) }} />)}
        <div style={{ marginLeft: 16, flex: 1, maxWidth: 660, height: 30, borderRadius: 999,
          background: mix(T.bg0, color, 0.14), border: `1.5px solid ${mix(T.line, color, 0.45)}`,
          display: "flex", alignItems: "center", gap: 10, padding: "0 16px" }}>
          <span style={{ fontSize: 14, color }}>🔒</span>
          <span style={{ fontFamily: MONO, fontSize: 19, color: mix(T.muted, color, 0.45) }}>{url}</span>
        </div>
        <div style={{ marginLeft: "auto", fontFamily: MONO, fontWeight: 700, fontSize: 18, color: T.bg0,
          background: mix(color, T.bg0, 0.12), borderRadius: 8, padding: "4px 12px", letterSpacing: 2 }}>{tag}</div>
      </div>
      <div style={{ position: "relative", height: h - 52 }}>{children}</div>
    </div>
  );
};

// ================================================================ pg_title
const TitleScene: React.FC<{ dur?: number; gateway?: string; tagline?: string; accent?: string; kicker?: string }> = ({
  dur, gateway = "Razorpay", tagline = "Docs, pricing, support & a real integration — end to end", accent, kicker = "PAYMENT GATEWAYS · DEVELOPER GUIDE",
}) => {
  const p = useP(dur); const frame = useCurrentFrame(); const pop = usePop(dur);
  const A = ac(accent);
  const swipe = interpolate((frame % 150) / 150, [0, 1], [-140, 1400]); // card sliding through reader
  return (
    <Stage>
      <Bg theme={T} accent={A} />
      {/* ambient card-swipe near top edge, away from center text */}
      <div style={{ position: "absolute", left: 760, top: 150, width: 400, height: 8, borderRadius: 6, background: mix(T.line, A, 0.4), opacity: p(0.1, 0.3) }} />
      <div style={{ position: "absolute", left: 760 + Math.max(0, Math.min(360, swipe / 4)), top: 120, width: 92, height: 60, borderRadius: 10,
        background: `linear-gradient(135deg, ${mix(T.panel, A, 0.5)}, ${mix(T.bg1, A, 0.2)})`, border: `2px solid ${A}`,
        opacity: p(0.12, 0.32) }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 300, textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 14, opacity: p(0.05, 0.16) }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: A }} />
          <span style={{ fontFamily: MONO, letterSpacing: 6, fontSize: 24, color: A, fontWeight: 700 }}>{kicker}</span>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: A }} />
        </div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 132, letterSpacing: -3, color: T.text, marginTop: 26,
          transform: `scale(${0.9 + pop(0.08) * 0.1})`,
          textShadow: `0 0 42px ${mix(T.bg0, A, 0.55)}` }}>
          <span style={{ color: A }}>{gateway}</span>
        </div>
        <div style={{ height: 5, width: interpolate(p(0.2, 0.46), [0, 1], [0, 560]), background: A, borderRadius: 3, margin: "24px auto" }} />
        <div style={{ fontFamily: SANS, fontSize: 38, color: T.muted, opacity: p(0.3, 0.5), maxWidth: 1200, margin: "0 auto", lineHeight: 1.35 }}>{tagline}</div>
      </div>
      <Rail y={806} color={A} o={p(0.5, 0.66)} labels />
      <PGBar dur={dur} color={A} />
    </Stage>
  );
};

// ================================================================ pg_div
const DivScene: React.FC<{ dur?: number; n?: number; title?: string; sub?: string; color?: string }> = ({
  dur, n = 1, title = "", sub = "", color,
}) => {
  const frame = useCurrentFrame(); const p = useP(dur); const A = ac(color);
  return (
    <Stage>
      <Bg theme={T} accent={A} />
      <Brackets x={330} y={300} w={1260} h={480} color={A} o={p(0.02, 0.14)} len={54} />
      <ScanBeam theme={T} x={340} y={310} w={1240} h={460} color={A} o={p(0.05, 0.2)} speed={1.6} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 360, textAlign: "center" }}>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 34, color: A, letterSpacing: 10, opacity: p(0.05, 0.15) }}>SECTION {"0" + n}</div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 92, color: T.text, letterSpacing: -2, marginTop: 20, opacity: p(0.12, 0.24), transform: `translateY(${(1 - p(0.12, 0.24)) * 30}px)` }}>{title}</div>
        <div style={{ height: 5, width: interpolate(p(0.2, 0.5), [0, 1], [0, 420]), background: A, borderRadius: 3, margin: "26px auto" }} />
        <div style={{ fontFamily: SANS, fontSize: 34, color: T.muted, opacity: p(0.3, 0.45) }}>{sub}</div>
      </div>
      <Rail y={880} color={A} o={p(0.3, 0.45)} />
      <PGBar dur={dur} color={A} />
    </Stage>
  );
};

// ================================================================ pg_docs
type Doc = { gateway?: string; accent?: string; url?: string; docsUrl?: string; signupUrl?: string; sandbox?: boolean; kyc?: string[]; methods?: string[] };
const DocsScene: React.FC<{ dur?: number } & Doc> = ({
  dur, gateway = "Razorpay", accent, url = "razorpay.com", docsUrl = "razorpay.com/docs", signupUrl = "dashboard.razorpay.com/signup",
  sandbox = true, kyc = ["Business PAN + signatory PAN", "Bank proof (cancelled cheque)", "GST / incorporation proof", "Live site with policies"],
  methods = ["Cards", "UPI", "Net banking", "Wallets", "EMI"],
}) => {
  const p = useP(dur); const frame = useCurrentFrame(); const A = ac(accent);
  return (
    <Stage>
      <Bg theme={T} accent={A} />
      <Head theme={T} kicker="DOCUMENTATION & ACCESS" title={`${gateway} — Docs, KYC & Sandbox`} color={A} />
      <Browser url={url} color={A} o={p(0.02, 0.1)}>
        {/* left: KYC checklist */}
        <div style={{ position: "absolute", left: 40, top: 26, width: 780 }}>
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 23, color: A, letterSpacing: 2, marginBottom: 16 }}>GO-LIVE KYC — TYPICAL</div>
          {kyc.map((k, i) => {
            const at = 0.12 + i * 0.06; const on = p(at, at + 0.05);
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16, opacity: p(at - 0.04, at),
                transform: `translateX(${(1 - p(at - 0.04, at)) * -24}px)` }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: on > 0.5 ? G : mix(T.panel, G, 0.15),
                  border: `2px solid ${on > 0.5 ? G : mix(T.line, G, 0.5)}`, display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: MONO, fontWeight: 800, fontSize: 20, color: on > 0.5 ? T.bg0 : T.muted }}>{on > 0.5 ? "✓" : ""}</div>
                <span style={{ fontFamily: SANS, fontWeight: 600, fontSize: 27, color: T.text }}>{k}</span>
              </div>
            );
          })}
        </div>
        {/* right: access chips */}
        <div style={{ position: "absolute", left: 858, top: 26, width: 600 }}>
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 23, color: TEAL, letterSpacing: 2, marginBottom: 16 }}>ACCESS</div>
          {[{ ic: "📘", l: "Dev docs", v: docsUrl, c: TEAL }, { ic: "🔑", l: "Sign up", v: signupUrl, c: B }].map((r, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", marginBottom: 14, borderRadius: 12,
              background: mix(T.panel, r.c, 0.08), border: `2px solid ${mix(T.line, r.c, 0.5)}`, opacity: p(0.22 + i * 0.06, 0.3 + i * 0.06) }}>
              <span style={{ fontSize: 26 }}>{r.ic}</span>
              <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 23, color: T.text, width: 130 }}>{r.l}</span>
              <span style={{ fontFamily: MONO, fontSize: 21, color: r.c }}>{r.v}</span>
            </div>
          ))}
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", marginTop: 6, borderRadius: 12,
            background: mix(T.panel, sandbox ? G : R, 0.1), border: `2px solid ${sandbox ? G : R}`, opacity: p(0.4, 0.48) }}>
            <span style={{ fontSize: 26 }}>{sandbox ? "🧪" : "🚫"}</span>
            <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 24, color: T.text }}>
              Test / sandbox: <b style={{ color: sandbox ? G : R }}>{sandbox ? "available" : "not available"}</b>
            </span>
          </div>
          {/* methods row */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 22, opacity: p(0.5, 0.6) }}>
            {methods.map((m, i) => (
              <span key={i} style={{ fontFamily: MONO, fontWeight: 700, fontSize: 20, color: A,
                background: mix(T.panel, A, 0.12), border: `1.5px solid ${mix(T.line, A, 0.5)}`, borderRadius: 999, padding: "8px 16px",
                transform: `translateY(${Math.floor(frame / 22) % Math.max(1, methods.length) === i ? -4 : 0}px)` }}>{m}</span>
            ))}
          </div>
        </div>
      </Browser>
      <Foot theme={T} p={p(0.86, 0.94)}>Test keys are instant; live keys unlock after KYC / account activation.</Foot>
      <PGBar dur={dur} color={A} />
    </Stage>
  );
};

// ================================================================ pg_support
type Chan = { icon: string; label: string; value: string; live?: boolean };
const SupportScene: React.FC<{ dur?: number; gateway?: string; accent?: string; channels?: Chan[] }> = ({
  dur, gateway = "Razorpay", accent,
  channels = [
    { icon: "📞", label: "Phone", value: "not published", live: false },
    { icon: "✉️", label: "Email / ticket", value: "razorpay.com/support", live: true },
    { icon: "💬", label: "Dashboard chat", value: "in-dashboard", live: true },
    { icon: "📚", label: "Docs", value: "razorpay.com/docs", live: true },
  ],
}) => {
  const p = useP(dur); const frame = useCurrentFrame(); const A = ac(accent);
  const n = channels.length;
  const cfg = n <= 3 ? { w: 500, gap: 60, x0: 130 } : { w: 390, gap: 53, x0: 130 };
  return (
    <Stage>
      <Bg theme={T} accent={A} />
      <Head theme={T} kicker="SUPPORT CHANNELS" title={`How you reach ${gateway}`} color={A} />
      {channels.map((c, i) => {
        const at = 0.1 + i * 0.1; const o = p(at, at + 0.08);
        const x = cfg.x0 + i * (cfg.w + cfg.gap);
        const dead = c.live === false;
        const col = dead ? R : A;
        const hot = Math.floor(frame / 26) % n === i && p(0.7, 0.71) > 0.5 && !dead;
        return (
          <div key={i} style={{ position: "absolute", left: x, top: 320, width: cfg.w, height: 300, borderRadius: 20, boxSizing: "border-box", padding: "30px 26px",
            background: mix(T.panel, col, dead ? 0.05 : hot ? 0.16 : 0.09), border: `2.5px solid ${dead ? mix(T.line, R, 0.5) : mix(T.line, col, hot ? 1 : 0.6)}`,
            opacity: Math.max(0.001, o), transform: `translateY(${(1 - o) * 20}px) scale(${hot ? 1.03 : 1})` }}>
            <div style={{ fontSize: 52, opacity: dead ? 0.4 : 1 }}>{c.icon}</div>
            <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 30, color: dead ? T.muted : T.text, marginTop: 16 }}>{c.label}</div>
            <div style={{ fontFamily: MONO, fontSize: 22, color: dead ? R : mix(T.muted, col, 0.5), marginTop: 12, lineHeight: 1.35, wordBreak: "break-word" }}>
              {dead ? "✕ " : ""}{c.value}
            </div>
          </div>
        );
      })}
      <Foot theme={T} p={p(0.84, 0.92)}>Most Indian gateways are dashboard / ticket-first — a printed phone line is the exception, not the rule.</Foot>
      <PGBar dur={dur} color={A} />
    </Stage>
  );
};

// ================================================================ pg_metrics
const MetricsScene: React.FC<{
  dur?: number; gateway?: string; accent?: string; settleDay?: number; settleNote?: string; instant?: boolean; settleUnknown?: boolean;
  successNote?: string; complexity?: number; complexityLabel?: string; complexityWhy?: string;
}> = ({
  dur, gateway = "Razorpay", accent, settleDay = 1, settleNote = "standard cycle", instant = true, settleUnknown = false,
  successNote = "No official figure published", complexity = 1, complexityLabel = "Easy", complexityWhy = "Hosted checkout + SDKs + plugins",
}) => {
  const p = useP(dur); const frame = useCurrentFrame(); const A = ac(accent);
  const days = [0, 1, 2, 3];
  return (
    <Stage>
      <Bg theme={T} accent={A} />
      <Head theme={T} kicker="PERFORMANCE" title={`${gateway} — Settlement, Success & Effort`} color={A} />
      {/* 1. settlement timeline */}
      <div style={{ position: "absolute", left: 130, top: 300, width: 500, height: 380, borderRadius: 20, boxSizing: "border-box", padding: "26px 26px",
        background: mix(T.panel, Y, 0.06), border: `2.5px solid ${mix(T.line, Y, 0.6)}`, opacity: p(0.06, 0.16) }}>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 22, color: Y, letterSpacing: 2 }}>SETTLEMENT</div>
        <div style={{ position: "relative", height: 130, marginTop: 60 }}>
          <div style={{ position: "absolute", left: 10, right: 10, top: 24, height: 3, background: mix(T.line, Y, 0.5) }} />
          {days.map((d, i) => {
            const x = 10 + i * 148; const hit = !settleUnknown && d === settleDay; const on = p(0.24 + i * 0.06, 0.3 + i * 0.06);
            return (
              <div key={i} style={{ position: "absolute", left: x, top: 0 }}>
                <div style={{ width: hit ? 30 : 20, height: hit ? 30 : 20, borderRadius: 20, marginLeft: hit ? -5 : 0,
                  background: hit ? Y : mix(T.panel, Y, 0.2), border: `2.5px solid ${Y}`, opacity: on,
                  boxShadow: hit ? `0 0 ${12 + Math.sin(frame * 0.1) * 6}px ${Y}` : "none" }} />
                <div style={{ fontFamily: MONO, fontWeight: hit ? 800 : 600, fontSize: 22, color: hit ? Y : T.muted, marginTop: 14, opacity: on }}>T+{d}</div>
              </div>
            );
          })}
        </div>
        <div style={{ fontFamily: SANS, fontSize: 23, color: settleUnknown ? R : T.muted, marginTop: 8, opacity: p(0.4, 0.5) }}>{settleUnknown ? "⚠ not publicly disclosed" : settleNote}</div>
        {instant && !settleUnknown && <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 20, color: G, marginTop: 12, opacity: p(0.46, 0.56) }}>⚡ instant settlement available</div>}
        {settleUnknown && <div style={{ fontFamily: SANS, fontSize: 21, color: T.muted, marginTop: 12, opacity: p(0.46, 0.56) }}>{settleNote}</div>}
      </div>
      {/* 2. success rate (honest) */}
      <div style={{ position: "absolute", left: 710, top: 300, width: 500, height: 380, borderRadius: 20, boxSizing: "border-box", padding: "26px 26px",
        background: mix(T.panel, TEAL, 0.06), border: `2.5px solid ${mix(T.line, TEAL, 0.6)}`, opacity: p(0.12, 0.22) }}>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 22, color: TEAL, letterSpacing: 2 }}>SUCCESS RATE</div>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", height: 280 }}>
          <div style={{ fontSize: 54, opacity: p(0.2, 0.3) }}>📊</div>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 30, color: T.text, marginTop: 16, lineHeight: 1.3, opacity: p(0.24, 0.36) }}>{successNote}</div>
          <div style={{ fontFamily: MONO, fontSize: 20, color: T.muted, marginTop: 16, opacity: p(0.36, 0.46) }}>we never quote a made-up %</div>
        </div>
      </div>
      {/* 3. integration complexity meter */}
      <div style={{ position: "absolute", left: 1290, top: 300, width: 500, height: 380, borderRadius: 20, boxSizing: "border-box", padding: "26px 26px",
        background: mix(T.panel, A, 0.06), border: `2.5px solid ${mix(T.line, A, 0.6)}`, opacity: p(0.18, 0.28) }}>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 22, color: A, letterSpacing: 2 }}>INTEGRATION EFFORT</div>
        <div style={{ display: "flex", gap: 10, marginTop: 60 }}>
          {[1, 2, 3, 4, 5].map((s) => {
            const filled = s <= complexity; const on = p(0.26 + s * 0.03, 0.32 + s * 0.03);
            const col = complexity <= 2 ? G : complexity <= 3 ? Y : R;
            return <div key={s} style={{ flex: 1, height: 54, borderRadius: 10, background: filled ? col : mix(T.panel, col, 0.12),
              border: `2px solid ${filled ? col : mix(T.line, col, 0.4)}`, opacity: on,
              boxShadow: filled && s === complexity ? `0 0 14px ${col}` : "none" }} />;
          })}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 19, color: T.muted, marginTop: 10, opacity: p(0.36, 0.46) }}>
          <span>easy</span><span>hard</span>
        </div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 32, color: complexity <= 2 ? G : complexity <= 3 ? Y : R, marginTop: 22, opacity: p(0.4, 0.48) }}>{complexityLabel}</div>
        <div style={{ fontFamily: SANS, fontSize: 22, color: T.muted, marginTop: 10, lineHeight: 1.35, opacity: p(0.44, 0.54) }}>{complexityWhy}</div>
      </div>
      <Foot theme={T} p={p(0.86, 0.94)}>Settlement moves your cash-flow; success-rate claims are marketing unless the provider prints a number.</Foot>
      <PGBar dur={dur} color={A} />
    </Stage>
  );
};

// ================================================================ pg_pricing (hero)
type PRow = { icon?: string; label: string; rate: string; feePct?: number; note?: string };
const PricingScene: React.FC<{ dur?: number; gateway?: string; accent?: string; rows?: PRow[]; foot?: string }> = ({
  dur, gateway = "Razorpay", accent,
  rows = [
    { icon: "💳", label: "Credit / debit cards", rate: "2%", feePct: 2 },
    { icon: "🟣", label: "UPI", rate: "2%", feePct: 2, note: "MDR 0 + platform fee" },
    { icon: "🏦", label: "Net banking", rate: "2%", feePct: 2 },
    { icon: "👛", label: "Wallets", rate: "2%", feePct: 2 },
    { icon: "🌐", label: "International cards", rate: "up to 3%", feePct: 3 },
  ],
  foot = "Setup ₹0 · AMC ₹0 · GST 18% on the platform fee",
}) => {
  const p = useP(dur); const frame = useCurrentFrame(); const A = ac(accent);
  const rowH = 78; const y0 = 306;
  const hot = Math.floor(frame / 46) % rows.length;
  const cur = rows[hot] || rows[0];
  const fee = cur.feePct ? Math.round(1000 * cur.feePct / 100) : null;
  return (
    <Stage>
      <Bg theme={T} accent={A} />
      <Head theme={T} kicker="PRICING — PER INSTRUMENT" title={`${gateway} — what each payment costs`} color={A} />
      {/* table header */}
      <div style={{ position: "absolute", left: 110, top: 256, width: 1010, display: "flex", opacity: p(0.06, 0.14) }}>
        <span style={{ fontFamily: MONO, fontSize: 20, color: T.muted, width: 720, paddingLeft: 66 }}>INSTRUMENT</span>
        <span style={{ fontFamily: MONO, fontSize: 20, color: T.muted, width: 220, textAlign: "right" }}>RATE</span>
      </div>
      {rows.map((r, i) => {
        const at = 0.12 + i * 0.07; const o = p(at, at + 0.06); const y = y0 + i * rowH;
        const isHot = i === hot && p(0.5, 0.51) > 0.5;
        return (
          <div key={i} style={{ position: "absolute", left: 110, top: y, width: 1010, height: rowH - 12, display: "flex", alignItems: "center",
            borderRadius: 12, background: isHot ? mix(T.panel, A, 0.16) : i % 2 ? mix(T.bg1, A, 0.03) : "transparent",
            border: `1.5px solid ${isHot ? mix(T.line, A, 0.9) : "transparent"}`, opacity: o, transform: `translateY(${(1 - o) * 14}px)` }}>
            <span style={{ fontSize: 30, width: 66, textAlign: "center" }}>{r.icon || "•"}</span>
            <div style={{ width: 654 }}>
              <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 27, color: T.text }}>{r.label}</div>
              {r.note && <div style={{ fontFamily: MONO, fontSize: 18, color: T.muted, marginTop: 2 }}>{r.note}</div>}
            </div>
            <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: 30, color: A, width: 220, textAlign: "right" }}>{r.rate}</span>
          </div>
        );
      })}
      {/* right: ₹1,000 worked example on the highlighted row */}
      <div style={{ position: "absolute", left: 1250, top: 300, width: 560, height: 470, borderRadius: 20, boxSizing: "border-box", padding: "28px 30px",
        background: mix(T.panel, A, 0.07), border: `2.5px solid ${mix(T.line, A, 0.6)}`, opacity: p(0.3, 0.4) }}>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 22, color: A, letterSpacing: 2 }}>ON A ₹1,000 PAYMENT</div>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 26, color: T.text, marginTop: 14 }}>{cur.icon} {cur.label}</div>
        {fee !== null ? (
          <>
            <div style={{ display: "flex", height: 56, borderRadius: 10, overflow: "hidden", marginTop: 26, border: `2px solid ${T.line}` }}>
              <div style={{ width: `${Math.min(60, cur.feePct! * 6)}%`, background: `linear-gradient(90deg, ${mix(R, T.bg0, 0.3)}, ${R})`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontWeight: 800, fontSize: 20, color: T.bg0 }}>fee</div>
              <div style={{ flex: 1, background: `linear-gradient(90deg, ${mix(G, T.bg0, 0.3)}, ${G})`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontWeight: 800, fontSize: 20, color: T.bg0 }}>you keep</div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 30 }}>
              <div><div style={{ fontFamily: MONO, fontSize: 20, color: R }}>GATEWAY FEE</div><Counter p={p(0.4, 0.52)} to={fee} prefix="₹" color={R} size={48} /></div>
              <div style={{ textAlign: "right" }}><div style={{ fontFamily: MONO, fontSize: 20, color: G }}>YOU KEEP</div><Counter p={p(0.4, 0.52)} to={1000 - fee} prefix="₹" color={G} size={48} /></div>
            </div>
            <div style={{ fontFamily: MONO, fontSize: 19, color: T.muted, marginTop: 22 }}>+ 18% GST on the fee (≈ ₹{(fee * 0.18).toFixed(1)})</div>
          </>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", height: 300 }}>
            <div style={{ fontSize: 48 }}>🧾</div>
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 27, color: Y, marginTop: 16, lineHeight: 1.3 }}>Rate isn't a fixed % — quoted per business / contact sales.</div>
          </div>
        )}
      </div>
      <Foot theme={T} p={p(0.86, 0.94)}>{foot}</Foot>
      <PGBar dur={dur} color={A} />
    </Stage>
  );
};

// ================================================================ pg_flow
type Step = { emoji: string; label: string; sub: string };
const FlowScene: React.FC<{ dur?: number; gateway?: string; accent?: string; steps?: Step[] }> = ({
  dur, gateway = "Razorpay", accent,
  steps = [
    { emoji: "🧾", label: "Create order", sub: "server · Orders API" },
    { emoji: "🛒", label: "Checkout", sub: "client · order_id" },
    { emoji: "💳", label: "Customer pays", sub: "card / UPI / …" },
    { emoji: "🔔", label: "Webhook + verify", sub: "signature check" },
    { emoji: "🏦", label: "Settlement", sub: "T+n to your bank" },
  ],
}) => {
  const p = useP(dur); const frame = useCurrentFrame(); const A = ac(accent);
  const n = steps.length;
  const cfg = n <= 4 ? { w: 360, gapX: 425, x0: 165 } : { w: 300, gapX: 348, x0: 96 };
  const y = 400;
  return (
    <Stage>
      <Bg theme={T} accent={A} />
      <Head theme={T} kicker="INTEGRATION FLOW" title={`${gateway} — from checkout to settlement`} color={A} />
      {steps.map((it, i) => {
        const at = 0.08 + i * (0.42 / n); const o = p(at, at + 0.07); const x = cfg.x0 + i * cfg.gapX;
        const active = Math.floor(frame / 22) % n === i && p(0.62, 0.63) > 0.5;
        return (
          <React.Fragment key={i}>
            {i > 0 && (
              <>
                <Wire x1={cfg.x0 + (i - 1) * cfg.gapX + cfg.w} y1={y + 105} x2={x - 6} y2={y + 105} p={p(at - 0.05, at)} color={A} w={3} />
                <Flow x1={cfg.x0 + (i - 1) * cfg.gapX + cfg.w} y1={y + 105} x2={x - 6} y2={y + 105} color={A} n={4} o={p(at, at + 0.1)} />
              </>
            )}
            <div style={{ position: "absolute", left: x, top: y, width: cfg.w, height: 230, borderRadius: 18, boxSizing: "border-box", padding: "22px 16px", textAlign: "center",
              background: mix(T.panel, A, o > 0.5 ? (active ? 0.18 : 0.09) : 0.02), border: `2.5px solid ${o > 0.5 ? mix(T.line, A, active ? 1 : 0.65) : T.line}`,
              opacity: Math.max(p(0.03, 0.07) * 0.2, o), transform: `translateY(${(1 - o) * 20}px) scale(${active ? 1.04 : 1})` }}>
              <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 20, color: A, opacity: 0.6 }}>{i + 1}</div>
              <div style={{ fontSize: 46, marginTop: 4 }}>{it.emoji}</div>
              <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: n >= 5 ? 24 : 27, color: T.text, marginTop: 8, lineHeight: 1.2 }}>{it.label}</div>
              <div style={{ fontFamily: MONO, fontSize: n >= 5 ? 19 : 21, color: T.muted, marginTop: 8, lineHeight: 1.3 }}>{it.sub}</div>
            </div>
          </React.Fragment>
        );
      })}
      <Foot theme={T} p={p(0.84, 0.92)}>Never trust the browser: always verify the payment on your server (signature / status API) before fulfilling.</Foot>
      <PGBar dur={dur} color={A} />
    </Stage>
  );
};

// ================================================================ pg_code
const CodeScene: React.FC<{
  dur?: number; gateway?: string; accent?: string; lang?: string; file?: string; lines?: string[]; docUrl?: string; caption?: string;
}> = ({
  dur, gateway = "Razorpay", accent, lang = "node", file = "create-order.js", docUrl = "razorpay.com/docs/api/orders",
  lines = [
    'const rzp = new Razorpay({ key_id, key_secret });',
    'const order = await rzp.orders.create({',
    '  amount: 50000,      // paise = ₹500.00',
    '  currency: "INR",',
    '  receipt: "rcpt_11",',
    '});',
    '// send order.id to the client to open Checkout',
  ],
  caption = "Server creates the order; the client only ever sees an order_id.",
}) => {
  const p = useP(dur); const A = ac(accent);
  return (
    <Stage>
      <Bg theme={T} accent={A} />
      <Head theme={T} kicker="SAMPLE INTEGRATION" title={`${gateway} — a real API call`} color={A} />
      <Browser url={docUrl} color={A} o={p(0.02, 0.1)} tag={lang.toUpperCase()}>
        {/* file tab */}
        <div style={{ position: "absolute", left: 30, top: 20, display: "flex", gap: 10 }}>
          <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 20, color: A, background: mix(T.panel, A, 0.14), border: `1.5px solid ${mix(T.line, A, 0.5)}`, borderRadius: "10px 10px 0 0", padding: "10px 20px" }}>{file}</div>
        </div>
        {/* code body */}
        <div style={{ position: "absolute", left: 30, top: 74, right: 30, bottom: 20, borderRadius: 12, background: mix(T.bg0, A, 0.03), border: `1.5px solid ${mix(T.line, A, 0.4)}`, padding: "22px 10px", overflow: "hidden" }}>
          {lines.map((ln, i) => {
            const at = 0.12 + i * (0.62 / lines.length);
            const isComment = ln.trim().startsWith("//");
            return (
              <div key={i} style={{ display: "flex", alignItems: "baseline", height: 46 }}>
                <span style={{ fontFamily: MONO, fontSize: 22, color: mix(T.muted, A, 0.3), width: 56, textAlign: "right", paddingRight: 22, opacity: p(at - 0.03, at) }}>{i + 1}</span>
                <span style={{ fontFamily: MONO, fontSize: 24, color: isComment ? T.muted : mix(T.text, A, 0.1), lineHeight: 1.4, whiteSpace: "pre" }}>
                  <Type text={ln} p={p(at, at + 0.6 / lines.length)} color={isComment ? T.muted : mix(T.text, A, 0.1)} mono size={24} />
                </span>
              </div>
            );
          })}
        </div>
      </Browser>
      <Foot theme={T} p={p(0.86, 0.94)}>{caption}</Foot>
      <PGBar dur={dur} color={A} />
    </Stage>
  );
};

// ================================================================ pg_compare
type CmpRow = { gateway: string; accent: string; cells: string[] };
const CompareScene: React.FC<{ dur?: number; title?: string; cols?: string[]; rows?: CmpRow[]; foot?: string }> = ({
  dur, title = "Eight gateways, side by side",
  cols = ["Cards", "UPI", "Settle", "Setup", "Effort"],
  rows = [
    { gateway: "Razorpay", accent: B, cells: ["2%", "2%", "T+1", "₹0", "Easy"] },
    { gateway: "Cashfree", accent: "#4F46E5", cells: ["1.95%", "1.95%", "T+1", "₹0", "Easy"] },
    { gateway: "PayU", accent: "#10B981", cells: ["2%", "custom", "T+2", "₹0", "Med"] },
    { gateway: "Juspay", accent: "#F97316", cells: ["orch.", "orch.", "via PG", "custom", "Ent."] },
    { gateway: "PhonePe", accent: "#7C3AED", cells: ["1.99%*", "—", "n/d", "₹0", "Easy"] },
    { gateway: "Paytm", accent: "#0EA5E9", cells: ["~1.8%", "0%", "T+1", "₹0", "Med"] },
    { gateway: "CCAvenue", accent: "#EF4444", cells: ["3.75%", "deb.", "~T+2", "₹40k", "Med+"] },
    { gateway: "Instamojo", accent: "#EC4899", cells: ["2%+₹3", "2%+₹3", "T+3", "plan", "Easy"] },
  ],
  foot = "Rates as published Aug 2026 — promos & negotiated slabs vary. Verify on each official site.",
}) => {
  const p = useP(dur); const frame = useCurrentFrame(); const A = B;
  const rowH = 66; const y0 = 300; const nameW = 360; const cellW = (1720 - nameW) / cols.length;
  const hot = Math.floor(frame / 34) % rows.length;
  return (
    <Stage>
      <Bg theme={T} accent={A} />
      <Head theme={T} kicker="SIDE BY SIDE" title={title} color={A} />
      {/* header */}
      <div style={{ position: "absolute", left: 100, top: 250, width: 1720, display: "flex", opacity: p(0.06, 0.14) }}>
        <span style={{ width: nameW, fontFamily: MONO, fontSize: 20, color: T.muted, paddingLeft: 20 }}>GATEWAY</span>
        {cols.map((c, i) => <span key={i} style={{ width: cellW, fontFamily: MONO, fontSize: 20, color: T.muted, textAlign: "center" }}>{c.toUpperCase()}</span>)}
      </div>
      {rows.map((r, i) => {
        const at = 0.1 + i * 0.05; const o = p(at, at + 0.05); const y = y0 + i * rowH; const isHot = i === hot && p(0.55, 0.56) > 0.5;
        return (
          <div key={i} style={{ position: "absolute", left: 100, top: y, width: 1720, height: rowH - 8, display: "flex", alignItems: "center",
            borderRadius: 12, background: isHot ? mix(T.panel, r.accent, 0.18) : i % 2 ? mix(T.bg1, A, 0.03) : "transparent",
            border: `1.5px solid ${isHot ? mix(T.line, r.accent, 0.9) : "transparent"}`, opacity: o, transform: `translateX(${(1 - o) * -20}px)` }}>
            <div style={{ width: nameW, display: "flex", alignItems: "center", gap: 14, paddingLeft: 20 }}>
              <div style={{ width: 14, height: 14, borderRadius: 7, background: r.accent, boxShadow: `0 0 10px ${r.accent}` }} />
              <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 26, color: T.text }}>{r.gateway}</span>
            </div>
            {r.cells.map((cell, j) => (
              <span key={j} style={{ width: cellW, textAlign: "center", fontFamily: MONO, fontWeight: 700, fontSize: 24, color: mix(T.text, r.accent, isHot ? 0.2 : 0) }}>{cell}</span>
            ))}
          </div>
        );
      })}
      <Foot theme={T} p={p(0.86, 0.94)}>{foot}</Foot>
      <PGBar dur={dur} color={A} />
    </Stage>
  );
};

// ================================================================ pg_decision
type Branch = { q: string; pick: string; why: string; accent: string };
const DecisionScene: React.FC<{ dur?: number; title?: string; branches?: Branch[] }> = ({
  dur, title = "Which one should you pick?",
  branches = [
    { q: "Fastest, cleanest DX", pick: "Razorpay / Cashfree", why: "hosted checkout, SDKs, ₹0 fees", accent: B },
    { q: "UPI-heavy, cost-sensitive", pick: "Paytm PG", why: "0% UPI + RuPay", accent: "#0EA5E9" },
    { q: "Many PGs, big scale", pick: "Juspay", why: "orchestrate + least-cost routing", accent: "#F97316" },
    { q: "No website, just a link", pick: "Instamojo", why: "collect with zero site", accent: "#EC4899" },
  ],
}) => {
  const p = useP(dur); const frame = useCurrentFrame(); const A = B;
  const y0 = 280; const rowH = 150;
  return (
    <Stage>
      <Bg theme={T} accent={A} />
      <Head theme={T} kicker="HOW TO CHOOSE" title={title} color={A} />
      {branches.map((b, i) => {
        const at = 0.08 + i * 0.09; const o = p(at, at + 0.07); const y = y0 + i * rowH;
        const active = Math.floor(frame / 30) % branches.length === i && p(0.62, 0.63) > 0.5;
        return (
          <React.Fragment key={i}>
            {/* condition pill */}
            <div style={{ position: "absolute", left: 140, top: y, width: 620, height: 108, borderRadius: 16, boxSizing: "border-box", padding: "0 26px",
              display: "flex", alignItems: "center", background: mix(T.panel, T.text, 0.05), border: `2px solid ${mix(T.line, b.accent, 0.5)}`,
              opacity: o, transform: `translateX(${(1 - o) * -24}px)` }}>
              <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 28, color: T.text }}>{b.q}</span>
            </div>
            <Wire x1={766} y1={y + 54} x2={892} y2={y + 54} p={p(at + 0.02, at + 0.08)} color={b.accent} w={3} />
            <Flow x1={766} y1={y + 54} x2={892} y2={y + 54} color={b.accent} n={3} o={o} />
            {/* pick card */}
            <div style={{ position: "absolute", left: 900, top: y, width: 880, height: 108, borderRadius: 16, boxSizing: "border-box", padding: "0 28px",
              display: "flex", alignItems: "center", gap: 22, background: mix(T.panel, b.accent, active ? 0.2 : 0.11), border: `2.5px solid ${mix(T.line, b.accent, active ? 1 : 0.7)}`,
              opacity: p(at + 0.04, at + 0.1), transform: `scale(${active ? 1.02 : 1})` }}>
              <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 30, color: b.accent, width: 340 }}>{b.pick}</span>
              <span style={{ fontFamily: SANS, fontSize: 24, color: T.muted, lineHeight: 1.3 }}>{b.why}</span>
            </div>
          </React.Fragment>
        );
      })}
      <Foot theme={T} p={p(0.86, 0.94)}>Most teams start with one clean PG and add orchestration only when scale demands it.</Foot>
      <PGBar dur={dur} color={A} />
    </Stage>
  );
};

// ================================================================ pg_disclaimer
const DisclaimerScene: React.FC<{ dur?: number; asOf?: string; points?: string[] }> = ({
  dur, asOf = "August 2026",
  points = [
    "Rates, fees & policies change — treat every number here as a starting point.",
    "Promotional 0% offers have caps and expiry dates.",
    "UPI merchant pricing and enterprise slabs are often quoted per business.",
    "Always confirm the current terms on each provider's official site before you commit.",
  ],
}) => {
  const p = useP(dur); const frame = useCurrentFrame(); const A = Y;
  return (
    <Stage>
      <Bg theme={T} accent={A} />
      <div style={{ position: "absolute", left: 360, top: 250, width: 1200, borderRadius: 24, boxSizing: "border-box", padding: "44px 54px",
        background: mix(T.panel, A, 0.07), border: `3px solid ${mix(T.line, A, 0.5 + Math.sin(frame * 0.08) * 0.25)}`, opacity: p(0.04, 0.14) }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <span style={{ fontSize: 54 }}>⚠️</span>
          <div>
            <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 26, color: A, letterSpacing: 3 }}>BEFORE YOU INTEGRATE</div>
            <div style={{ fontFamily: MONO, fontSize: 22, color: T.muted, marginTop: 4 }}>figures as of {asOf}</div>
          </div>
        </div>
        <div style={{ marginTop: 30 }}>
          {points.map((pt, i) => {
            const at = 0.12 + i * 0.08;
            return (
              <div key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 22, opacity: p(at, at + 0.07), transform: `translateY(${(1 - p(at, at + 0.07)) * 12}px)` }}>
                <span style={{ color: A, fontSize: 26, lineHeight: 1.2 }}>•</span>
                <span style={{ fontFamily: SANS, fontWeight: 600, fontSize: 29, color: T.text, lineHeight: 1.4 }}>{pt}</span>
              </div>
            );
          })}
        </div>
      </div>
      <PGBar dur={dur} color={A} />
    </Stage>
  );
};

// ================================================================ pg_recap
const RecapScene: React.FC<{ dur?: number; title?: string; items?: string[]; closer?: string }> = ({
  dur, title = "The whole map in one breath",
  items = [
    "A gateway = checkout → verify on server → webhook → settlement.",
    "Modern players (Razorpay/Cashfree) are ₹0-fee, ~2%, easiest DX.",
    "Paytm's edge is 0% UPI; CCAvenue is the fee-heavy traditional option.",
    "Juspay isn't a PG — it routes across many for scale.",
    "Always verify payments server-side and confirm live pricing.",
  ],
  closer = "Pick for your payment mix and your scale — not for the logo.",
}) => {
  const p = useP(dur); const frame = useCurrentFrame(); const A = B;
  return (
    <Stage>
      <Bg theme={T} accent={A} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 120, textAlign: "center" }}>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 26, color: A, letterSpacing: 8, opacity: p(0.04, 0.14) }}>RECAP — THE WHOLE MAP</div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 60, color: T.text, letterSpacing: -1.5, marginTop: 16, opacity: p(0.1, 0.2) }}>{title}</div>
      </div>
      <div style={{ position: "absolute", left: 290, top: 300, width: 1340 }}>
        {items.map((it, i) => {
          const at = 0.14 + i * 0.1; const o = p(at, at + 0.07);
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 22, marginBottom: 22, opacity: o, transform: `translateX(${(1 - o) * -22}px)` }}>
              <div style={{ width: 6, height: 46, borderRadius: 3, background: A }} />
              <div style={{ width: 46, height: 46, borderRadius: 12, background: mix(T.panel, A, 0.14), border: `2px solid ${A}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontWeight: 800, fontSize: 24, color: A }}>{i + 1}</div>
              <span style={{ fontFamily: SANS, fontWeight: 600, fontSize: 30, color: T.text, lineHeight: 1.3 }}>{it}</span>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 860, textAlign: "center", opacity: p(0.8, 0.9) }}>
        <span style={{ fontFamily: SANS, fontStyle: "italic", fontWeight: 700, fontSize: 40, color: A, textShadow: `0 0 24px ${mix(T.bg0, A, 0.5)}`, opacity: 0.7 + Math.sin(frame * 0.07) * 0.3 }}>{closer}</span>
      </div>
      <Rail y={800} color={A} o={p(0.5, 0.62)} />
      <PGBar dur={dur} color={A} />
    </Stage>
  );
};

// ================================================================ dispatcher
export const PGScene: React.FC<{ variant: string;[key: string]: unknown }> = ({ variant, ...rest }) => {
  switch (variant) {
    case "pg_title": return <TitleScene {...(rest as any)} />;
    case "pg_div": return <DivScene {...(rest as any)} />;
    case "pg_docs": return <DocsScene {...(rest as any)} />;
    case "pg_support": return <SupportScene {...(rest as any)} />;
    case "pg_metrics": return <MetricsScene {...(rest as any)} />;
    case "pg_pricing": return <PricingScene {...(rest as any)} />;
    case "pg_flow": return <FlowScene {...(rest as any)} />;
    case "pg_code": return <CodeScene {...(rest as any)} />;
    case "pg_compare": return <CompareScene {...(rest as any)} />;
    case "pg_decision": return <DecisionScene {...(rest as any)} />;
    case "pg_disclaimer": return <DisclaimerScene {...(rest as any)} />;
    case "pg_recap": return <RecapScene {...(rest as any)} />;
    default: return null;
  }
};
