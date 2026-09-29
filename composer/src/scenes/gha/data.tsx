// gha/data.tsx — chapters 5–6: marketplace, action types, reusable workflows, expressions (computed),
// env/vars/secrets + masking (computed), outputs & artifacts, cache keys (computed hash).
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { mix, useP, MONO, SANS, Wire, Flow } from "../../lib/primitives";
import { T, A, Win, HeadC, StatusIcon, St, Chip, CodeBlock, clamp01 } from "./core";

// ---------------------------------------------------------------- marketplace
export const MarketplaceScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const acts = [
    { n: "actions/checkout", d: "check out your code", i: "📥", at: 0.1 },
    { n: "actions/setup-node", d: "Node · also Python, Java, Go", i: "🟩", at: 0.15 },
    { n: "actions/setup-python", d: "any Python version", i: "🐍", at: 0.17 },
    { n: "actions/cache", d: "save & restore folders", i: "🗄️", at: 0.22 },
    { n: "actions/upload-artifact", d: "keep build outputs", i: "📦", at: 0.25 },
    { n: "docker/build-push-action", d: "build container images", i: "🐳", at: 0.28 },
    { n: "aws-actions/configure-…", d: "log in to AWS", i: "☁️", at: 0.32 },
    { n: "azure/login", d: "log in to Azure", i: "🔷", at: 0.34 },
  ];
  const hot = Math.floor(frame / 22) % acts.length;
  const parts = [
    { t: "docker", l: "owner", c: A.run, at: 0.44 }, { t: "/build-push-action", l: "repository", c: A.act, at: 0.47 }, { t: "@v6", l: "version", c: A.evt, at: 0.5 },
  ];
  const refs = [
    { t: "@v6", l: "tag — can move", c: A.evt, at: 0.58 }, { t: "@main", l: "branch — always moving", c: A.bad, at: 0.61 },
    { t: "@<full commit SHA>", l: "commit hash — fixed forever 🔒", c: A.ok, at: 0.64 },
  ];
  return (
    <AbsoluteFill>
      <HeadC kicker="THE MARKETPLACE" title="Actions: packaged, reusable steps" color={A.act} o={p(0, 0.04)} />
      {acts.map((a, i) => {
        const x = 130 + (i % 4) * 430, y = 205 + Math.floor(i / 4) * 150;
        const o = p(a.at, a.at + 0.04);
        const on = hot === i && p(0.36, 0.37) > 0.5;
        return (
          <div key={i} style={{ position: "absolute", left: x, top: y, width: 400, height: 132, borderRadius: 16, boxSizing: "border-box", padding: "16px 20px", background: mix(T.panel, A.act, on ? 0.22 : 0.07), border: `2px solid ${on ? A.act : mix(T.line, A.act, 0.45)}`, opacity: o, transform: `translateY(${(1 - o) * 18}px) scale(${on ? 1.03 : 1})` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 36 }}>{a.i}</span>
              <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 21, color: T.text, whiteSpace: "nowrap" }}>{a.n}</span>
            </div>
            <div style={{ fontFamily: SANS, fontSize: 23, color: T.muted, marginTop: 10 }}>{a.d}</div>
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 130, top: 530, display: "flex", alignItems: "flex-start", gap: 0, opacity: p(0.42, 0.45) }}>
        <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: 44, color: A.key, padding: "8px 14px" }}>uses:</span>
        {parts.map((pt, i) => {
          const o = p(pt.at, pt.at + 0.03);
          return (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", opacity: o }}>
              <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: 44, color: pt.c, padding: "8px 6px", background: mix(T.panel, pt.c, 0.14), borderBottom: `4px solid ${pt.c}` }}>{pt.t}</span>
              <span style={{ fontFamily: MONO, fontSize: 22, color: pt.c, marginTop: 8 }}>{pt.l}</span>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 130, top: 700, display: "flex", gap: 22 }}>
        {refs.map((r, i) => {
          const o = p(r.at, r.at + 0.04);
          const glow = i === 2 && p(0.74, 0.76) > 0.5;
          return (
            <div key={i} style={{ width: i === 2 ? 640 : 480, height: 150, borderRadius: 18, boxSizing: "border-box", padding: "18px 24px", background: mix(T.panel, r.c, glow ? 0.2 : 0.08), border: `2.5px solid ${r.c}`, opacity: o, boxShadow: glow ? `0 0 ${24 + Math.sin(frame * 0.12) * 10}px ${r.c}` : "none" }}>
              <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 34, color: r.c }}>{r.t}</div>
              <div style={{ fontFamily: SANS, fontSize: 25, color: T.text, marginTop: 10 }}>{r.l}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- three action types
export const ActionTypesScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const types = [
    { h: "JavaScript", i: "⚡", c: A.evt, using: "node20", pros: ["runs directly with Node", "fastest start", "Linux · Windows · macOS"], at: 0.08 },
    { h: "Docker container", i: "🐳", c: A.run, using: "docker", pros: ["ships its own environment", "fully reproducible", "Linux only · slower start"], at: 0.3 },
    { h: "Composite", i: "🧩", c: A.act, using: "composite", pros: ["a bundle of steps", "run + uses inside", "easiest to write"], at: 0.52 },
  ];
  const loop = (frame % 120) / 120;
  const cyc = Math.floor(frame / 40) % 3;
  return (
    <AbsoluteFill>
      <HeadC kicker="WRITE YOUR OWN" title="Three flavors of action" color={A.act} o={p(0, 0.04)} />
      {types.map((t, i) => {
        const x = 140 + i * 560;
        const o = p(t.at, t.at + 0.05);
        return (
          <div key={i} style={{ position: "absolute", left: x, top: 205, width: 520, height: 500, borderRadius: 22, boxSizing: "border-box", padding: "24px 28px", background: mix(T.panel, t.c, 0.07), border: `2.5px solid ${t.c}`, opacity: o, transform: `translateY(${(1 - o) * 24}px)` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ fontSize: 50 }}>{t.i}</span>
              <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 36, color: t.c }}>{t.h}</span>
            </div>
            {/* mini demo */}
            <div style={{ height: 150, marginTop: 18, borderRadius: 14, background: T.bg1, border: `1.5px solid ${T.line}`, position: "relative", overflow: "hidden" }}>
              {i === 0 && ["🐧", "🪟", "🍎"].map((os, k) => (
                <div key={k} style={{ position: "absolute", left: 30 + k * 150, top: 30, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 44 }}>{os}</span>
                  <StatusIcon s={loop > 0.2 + k * 0.1 ? "ok" : "running"} size={28} />
                </div>
              ))}
              {i === 1 && (
                <>
                  {[0, 1, 2, 3].map((k) => <div key={k} style={{ position: "absolute", left: 30, top: 110 - k * 26, width: 200 * clamp01(loop * 4 - k), height: 20, borderRadius: 5, background: mix(T.panel, A.run, 0.4 + k * 0.12) }} />)}
                  <div style={{ position: "absolute", left: 260, top: 26, fontFamily: MONO, fontSize: 20, color: T.muted }}>pull + build image…</div>
                  <div style={{ position: "absolute", left: 260, top: 70, display: "flex", gap: 14, fontSize: 32 }}>
                    <span>🐧<StatusIcon s="ok" size={20} /></span><span style={{ opacity: 0.35 }}>🪟</span><span style={{ opacity: 0.35 }}>🍎</span>
                  </div>
                </>
              )}
              {i === 2 && ["run: npm ci", "uses: setup-node", "run: npm test"].map((s, k) => {
                const snap = clamp01(loop * 3 - k * 0.6);
                return <div key={k} style={{ position: "absolute", left: 30 + (1 - snap) * (k % 2 ? 120 : -60), top: 18 + k * 42, width: 400, height: 36, borderRadius: 8, background: mix(T.panel, A.act, 0.25), border: `1.5px solid ${A.act}`, fontFamily: MONO, fontSize: 19, color: T.text, display: "flex", alignItems: "center", paddingLeft: 12, boxSizing: "border-box", opacity: 0.4 + 0.6 * snap }}>{s}</div>;
              })}
            </div>
            <div style={{ marginTop: 20 }}>
              {t.pros.map((pr, k) => (
                <div key={k} style={{ fontFamily: SANS, fontSize: 26, color: T.text, marginBottom: 12, opacity: p(t.at + 0.04 + k * 0.04, t.at + 0.07 + k * 0.04) }}>
                  <span style={{ color: t.c, marginRight: 10 }}>›</span>{pr}
                </div>
              ))}
            </div>
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 140, top: 735, width: 1640, height: 140, borderRadius: 20, background: mix(T.panel, A.act, 0.08), border: `2px dashed ${A.act}`, opacity: p(0.72, 0.76), display: "flex", alignItems: "center", gap: 40, padding: "0 36px", boxSizing: "border-box" }}>
        <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: 34, color: A.act }}>action.yml</span>
        <span style={{ fontFamily: MONO, fontSize: 26, color: T.muted }}>inputs · outputs · runs:</span>
        <span style={{ fontFamily: MONO, fontSize: 28, color: A.key }}>using:</span>
        {types.map((t, k) => <Chip key={k} text={t.using} color={t.c} solid={cyc === k} size={25} />)}
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- reusable workflows
export const ReuseScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const callers = ["payments-api", "web-app", "auth-service", "search"];
  const fixed = p(0.46, 0.5) > 0.5;
  const pulse = fixed ? 0.5 + Math.sin(frame * 0.12) * 0.5 : 0;
  const k = Math.floor(frame / 22) % 4;
  return (
    <AbsoluteFill>
      <HeadC kicker="on: workflow_call" title="Reusable workflows: one pipeline, many callers" color={A.act} o={p(0, 0.04)} />
      {callers.map((c, i) => {
        const o = p(0.12 + i * 0.03, 0.15 + i * 0.03);
        return (
          <React.Fragment key={i}>
            <Wire x1={620} y1={265 + i * 100} x2={1000} y2={440} p={p(0.2 + i * 0.02, 0.26 + i * 0.02)} color={fixed ? A.ok : A.act} w={2.5} curve={(i - 1.5) * 20} />
            <Flow x1={620} y1={265 + i * 100} x2={1000} y2={440} curve={(i - 1.5) * 20} color={A.act} n={4} o={p(0.26, 0.3)} />
            <div style={{ position: "absolute", left: 100, top: 220 + i * 100, width: 520, height: 90, borderRadius: 14, boxSizing: "border-box", padding: "10px 18px", background: mix(T.panel, fixed ? A.ok : A.run, 0.08 + pulse * 0.1), border: `2px solid ${fixed ? A.ok : mix(T.line, A.run, 0.6)}`, opacity: o }}>
              <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 25, color: T.text }}>📁 {c}</div>
              <div style={{ fontFamily: MONO, fontSize: 18, color: T.muted, marginTop: 4, whiteSpace: "nowrap" }}>uses: acme/platform/…/deploy.yml@v2</div>
            </div>
          </React.Fragment>
        );
      })}
      <div style={{ position: "absolute", left: 1000, top: 215, width: 820, height: 440, borderRadius: 22, background: mix(T.bg1, A.act, 0.07), border: `3px solid ${A.act}`, opacity: p(0.05, 0.1), boxShadow: `0 0 ${30 + Math.sin(frame * 0.08) * 10}px ${mix(T.bg0, A.act, 0.35)}` }}>
        <div style={{ position: "absolute", left: 24, top: 16, fontFamily: MONO, fontSize: 22, color: A.act }}>acme/platform/.github/workflows/deploy.yml</div>
        <CodeBlock lines={["on:", "  workflow_call:", "    inputs:", "      environment: { type: string }", "    secrets: inherit"]} reveal={p(0.06, 0.14)} x={24} y={56} w={760} size={23} numbers={false} />
        <div style={{ position: "absolute", left: 24, top: 280, display: "flex", gap: 16 }}>
          {["build", "scan", "deploy"].map((j, ji) => {
            const s: St = ji < k ? "ok" : ji === k ? "running" : "queued";
            return <div key={j} style={{ width: 240, height: 70, borderRadius: 12, background: mix(T.panel, A.run, 0.14), border: `2px solid ${A.run}`, display: "flex", alignItems: "center", gap: 12, padding: "0 16px", boxSizing: "border-box", fontFamily: MONO, fontWeight: 700, fontSize: 24, color: T.text }}><StatusIcon s={s} size={26} />{j}</div>;
          })}
        </div>
        <div style={{ position: "absolute", left: 24, top: 370, fontFamily: SANS, fontSize: 25, color: fixed ? A.ok : A.bad, fontWeight: 700, opacity: p(0.4, 0.44) }}>
          {fixed ? "✓ bug fixed once → every caller gets it" : "🐞 bug in the pipeline…"}
        </div>
      </div>
      <div style={{ position: "absolute", left: 100, top: 640, opacity: p(0.34, 0.38) }}><Chip text="50 services → 1 hardened pipeline" color={A.act} size={23} /></div>
      <div style={{ position: "absolute", left: 100, top: 710, width: 1720, display: "flex", gap: 30, opacity: p(0.6, 0.66) }}>
        {[{ h: "Composite action", r: "reuses STEPS", c: A.act }, { h: "Reusable workflow", r: "reuses whole JOBS", c: A.run }].map((b, i) => (
          <div key={i} style={{ flex: 1, height: 90, borderRadius: 16, border: `2.5px solid ${b.c}`, background: mix(T.panel, b.c, 0.1), display: "flex", alignItems: "center", justifyContent: "center", gap: 18 }}>
            <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 30, color: T.text }}>{b.h}</span>
            <span style={{ fontFamily: MONO, fontSize: 26, color: b.c }}>→ {b.r}</span>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 100, top: 820, display: "flex", gap: 14, opacity: p(0.8, 0.84) }}>
        <Chip text="nest up to 10 levels" color={A.evt} size={22} />
        <Chip text="up to 50 workflows per run" color={A.evt} size={22} />
        <Chip text="since Nov 2025" color={A.gray} size={20} />
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- expressions (computed)
const RUNS_EXPR = [
  { ev: "pull_request", ref: "refs/heads/feat", ok: true },
  { ev: "push", ref: "refs/heads/main", ok: true },
  { ev: "push", ref: "refs/heads/dev", ok: true },
  { ev: "push", ref: "refs/heads/main", ok: false },
].map((r) => {
  const c = [r.ev === "push", r.ref === "refs/heads/main", r.ok];
  return { ...r, c, res: c.every(Boolean) };
});
export const ExprScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const ctx = [
    { k: "github", v: "event_name · ref · actor", at: 0.1 }, { k: "env", v: "variables", at: 0.14 }, { k: "secrets", v: "encrypted values", at: 0.17 },
    { k: "matrix", v: "current combo", at: 0.2 }, { k: "needs", v: "upstream jobs", at: 0.21 }, { k: "steps", v: "earlier steps", at: 0.22 }, { k: "inputs", v: "dispatch / call inputs", at: 0.23 },
  ];
  const fns = ["success()", "failure()", "always()", "cancelled()"];
  return (
    <AbsoluteFill>
      <HeadC kicker="EXPRESSIONS · ${{ }}" title="Contexts in, decisions out" color={A.act} o={p(0, 0.04)} />
      <div style={{ position: "absolute", left: 100, top: 205, width: 600 }}>
        {ctx.map((c, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 10, opacity: p(c.at, c.at + 0.03) }}>
            <span style={{ width: 150, fontFamily: MONO, fontWeight: 800, fontSize: 26, color: A.evt }}>{c.k}</span>
            <span style={{ fontFamily: SANS, fontSize: 24, color: T.muted }}>{c.v}</span>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 100, top: 640, width: 600, opacity: p(0.74, 0.78) }}>
        <div style={{ fontFamily: MONO, fontSize: 22, color: T.muted, marginBottom: 12 }}>status functions</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          {fns.map((f, i) => <Chip key={f} text={f} color={i === 2 ? A.ok : A.act} solid={i === 2 && p(0.86, 0.88) > 0.5} size={23} />)}
        </div>
        <div style={{ fontFamily: SANS, fontSize: 23, color: A.ok, marginTop: 14, opacity: p(0.86, 0.9) }}>always() → cleanup that must run no matter what</div>
      </div>
      <Win x={760} y={200} w={1060} h={290} title="deploy step" color={A.act} o={p(0.3, 0.34)}>
        <CodeBlock lines={["- name: Deploy", "  if: >-", "    github.event_name == 'push' &&", "    github.ref == 'refs/heads/main' &&", "    success()"]} reveal={p(0.32, 0.4)} x={24} y={16} w={1000} size={26} hi={p(0.4, 0.41) > 0.5 ? { a: 2, b: 4, c: A.evt } : null} />
      </Win>
      <div style={{ position: "absolute", left: 760, top: 515, width: 1060, opacity: p(0.52, 0.55) }}>
        <div style={{ display: "flex", fontFamily: MONO, fontSize: 20, color: T.muted, padding: "0 16px 8px" }}>
          <span style={{ width: 200 }}>event</span><span style={{ width: 280 }}>ref</span><span style={{ width: 130 }}>before</span><span style={{ width: 230 }}>push · main · ok</span><span>result</span>
        </div>
        {RUNS_EXPR.map((r, i) => {
          const o = p(0.54 + i * 0.03, 0.57 + i * 0.03);
          const lit = r.res && p(0.66, 0.67) > 0.5;
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", height: 70, marginBottom: 8, borderRadius: 12, padding: "0 16px", background: mix(T.panel, r.res ? A.ok : A.bad, lit ? 0.22 : 0.07), border: `2px solid ${lit ? A.ok : T.line}`, opacity: o, fontFamily: MONO, fontSize: 23, color: T.text, boxShadow: lit ? `0 0 ${16 + Math.sin(frame * 0.12) * 6}px ${A.ok}` : "none" }}>
              <span style={{ width: 200 }}>{r.ev}</span>
              <span style={{ width: 280 }}>{r.ref.replace("refs/heads/", "…/")}</span>
              <span style={{ width: 130, color: r.ok ? A.ok : A.bad }}>{r.ok ? "success" : "failure"}</span>
              <span style={{ width: 230, display: "flex", gap: 14 }}>{r.c.map((b, k) => <StatusIcon key={k} s={b ? "ok" : "fail"} size={26} />)}</span>
              <span style={{ fontWeight: 800, color: r.res ? A.ok : A.bad }}>{r.res ? "true → runs" : "false"}</span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- env / vars / secrets + masking (computed)
const SECRET = "sk-live-7f3a9c21";
const B64 = typeof btoa !== "undefined" ? btoa(SECRET) : "c2stbGl2ZS03ZjNhOWMyMQ==";
const mask = (line: string) => line.split(SECRET).join("***");
export const SecretsScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const kinds = [
    { h: "env", i: "📝", d: "plain values, in the YAML file", ex: "NODE_ENV: production", c: A.run, at: 0.06 },
    { h: "vars", i: "⚙️", d: "non-secret config, in Settings", ex: "${{ vars.REGION }}", c: A.act, at: 0.18 },
    { h: "secrets", i: "🔒", d: "encrypted · never shown", ex: "${{ secrets.API_KEY }}", c: A.bad, at: 0.32 },
  ];
  const logs = [
    { raw: `$ ./deploy --key ${SECRET}`, at: 0.64, bad: false },
    { raw: `$ echo $API_KEY | base64`, at: 0.8, bad: false },
    { raw: B64, at: 0.83, bad: true },
  ];
  return (
    <AbsoluteFill>
      <HeadC kicker="CONFIGURATION" title="env · vars · secrets" color={A.act} o={p(0, 0.04)} />
      {kinds.map((k, i) => {
        const o = p(k.at, k.at + 0.04);
        return (
          <div key={i} style={{ position: "absolute", left: 140 + i * 560, top: 205, width: 520, height: 250, borderRadius: 20, boxSizing: "border-box", padding: "20px 26px", background: mix(T.panel, k.c, 0.08), border: `2.5px solid ${k.c}`, opacity: o, transform: `translateY(${(1 - o) * 20}px)` }}>
            <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <span style={{ fontSize: 44 }}>{k.i}</span>
              <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: 40, color: k.c }}>{k.h}</span>
            </div>
            <div style={{ fontFamily: SANS, fontSize: 26, color: T.text, marginTop: 12 }}>{k.d}</div>
            <div style={{ fontFamily: MONO, fontSize: 22, color: A.evt, marginTop: 18, padding: "8px 12px", background: T.bg1, borderRadius: 8 }}>{k.ex}</div>
          </div>
        );
      })}
      {/* scopes */}
      <div style={{ position: "absolute", left: 140, top: 490, width: 780, height: 380, opacity: p(0.4, 0.44) }}>
        {[{ n: "organization", c: A.gray }, { n: "repository", c: A.run }, { n: "environment: production", c: A.bad }].map((s, i) => {
          const lit = Math.floor(frame / 30) % 3 === i;
          return <div key={i} style={{ position: "absolute", left: i * 60, top: i * 90, width: 780 - i * 120, height: 380 - i * 110, borderRadius: 20, border: `2.5px solid ${s.c}`, background: mix(T.bg1, s.c, lit ? 0.1 : 0.04) }}>
            <span style={{ position: "absolute", left: 20, top: 12, fontFamily: MONO, fontSize: 22, color: s.c }}>{s.n}</span>
          </div>;
        })}
        <div style={{ position: "absolute", left: 210, top: 300, fontFamily: SANS, fontWeight: 700, fontSize: 26, color: T.text, opacity: p(0.46, 0.5) }}>narrowest scope wins ↓</div>
      </div>
      {/* masking log */}
      <div style={{ position: "absolute", left: 980, top: 490, width: 840, height: 380, borderRadius: 18, background: T.bg0, border: `1.5px solid ${T.line}`, opacity: p(0.56, 0.6), padding: "22px 26px", boxSizing: "border-box" }}>
        <div style={{ fontFamily: MONO, fontSize: 20, color: T.muted, marginBottom: 14 }}>job log</div>
        {logs.map((l, i) => {
          const o = p(l.at, l.at + 0.03);
          const shown = p(l.at + 0.03, l.at + 0.05) > 0.5 ? mask(l.raw) : l.raw.replace(SECRET, "········");
          return (
            <div key={i} style={{ fontFamily: MONO, fontSize: 25, color: l.bad ? A.bad : T.text, opacity: o, marginBottom: 14, whiteSpace: "nowrap" }}>
              {shown.split("***").map((part, k, arr) => (
                <React.Fragment key={k}>{part}{k < arr.length - 1 && <span style={{ color: A.ok, fontWeight: 800, background: mix(T.bg0, A.ok, 0.2), padding: "0 6px", borderRadius: 4 }}>***</span>}</React.Fragment>
              ))}
            </div>
          );
        })}
        <div style={{ position: "absolute", left: 26, bottom: 22, fontFamily: SANS, fontSize: 25, fontWeight: 700, color: A.bad, opacity: p(0.86, 0.9) * (0.7 + Math.sin(frame * 0.12) * 0.3) }}>⚠ transformed secret → NOT masked. Don't print secrets.</div>
        <div style={{ position: "absolute", left: 26, bottom: 70, fontFamily: SANS, fontSize: 24, color: A.ok, opacity: p(0.7, 0.73) }}>✓ exact value → shown as ***</div>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- outputs & artifacts
export const OutputsScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const lane = (y: number, h: string, c: string, o: number) => (
    <div style={{ position: "absolute", left: 100, top: y, width: 1720, height: 205, borderRadius: 20, border: `2px solid ${mix(T.line, c, 0.5)}`, background: mix(T.bg1, c, 0.04), opacity: o }}>
      <div style={{ position: "absolute", left: 22, top: 12, fontFamily: MONO, fontWeight: 700, fontSize: 21, color: c }}>{h}</div>
    </div>
  );
  const box = (x: number, y: number, w: number, title: string, code: string, c: string, o: number) => (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: 120, borderRadius: 14, boxSizing: "border-box", padding: "12px 18px", background: mix(T.panel, c, 0.12), border: `2px solid ${c}`, opacity: o }}>
      <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 25, color: T.text }}>{title}</div>
      <div style={{ fontFamily: MONO, fontSize: 19, color: A.evt, marginTop: 8, whiteSpace: "nowrap" }}>{code}</div>
    </div>
  );
  return (
    <AbsoluteFill>
      <HeadC kicker="PASSING DATA" title="Step → step, job → job, file → file" color={A.act} o={p(0, 0.04)} />
      {lane(200, "INSIDE A JOB · same machine", A.act, p(0.05, 0.08))}
      {box(140, 250, 560, "step: meta", 'echo "version=1.4.2" >> $GITHUB_OUTPUT', A.act, p(0.08, 0.12))}
      <div style={{ position: "absolute", left: 780, top: 262, width: 260, height: 96, borderRadius: 12, background: T.bg0, border: `2px dashed ${A.act}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontSize: 21, color: A.act, opacity: p(0.12, 0.15) }}>📄 GITHUB_OUTPUT</div>
      {box(1120, 250, 660, "step: tag", "${{ steps.meta.outputs.version }} → 1.4.2", A.act, p(0.18, 0.22))}
      <Flow x1={700} y1={310} x2={780} y2={310} color={A.act} n={3} o={p(0.12, 0.15)} />
      <Flow x1={1040} y1={310} x2={1120} y2={310} color={A.act} n={3} o={p(0.2, 0.22)} />

      {lane(420, "BETWEEN JOBS · different machines", A.run, p(0.3, 0.33))}
      {box(140, 470, 620, "job: build  (VM #1)", "outputs: version: ${{ steps.meta.outputs.version }}", A.run, p(0.33, 0.37))}
      {box(1100, 470, 680, "job: deploy  (VM #2)", "${{ needs.build.outputs.version }}", A.run, p(0.4, 0.44))}
      <Wire x1={760} y1={530} x2={1100} y2={530} p={p(0.37, 0.41)} color={A.run} />
      <Flow x1={760} y1={530} x2={1100} y2={530} color={A.run} n={5} o={p(0.41, 0.44)} />
      <div style={{ position: "absolute", left: 800, top: 480, width: 260, textAlign: "center", fontFamily: MONO, fontSize: 20, color: A.run, opacity: p(0.4, 0.44) }}>needs: build</div>

      {lane(640, "FILES · artifacts", A.ok, p(0.54, 0.57))}
      {box(140, 690, 460, "job: build", "upload-artifact → app.zip", A.ok, p(0.57, 0.6))}
      <div style={{ position: "absolute", left: 760, top: 685, width: 360, height: 130, borderRadius: 18, background: mix(T.panel, A.ok, 0.12), border: `2.5px solid ${A.ok}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: p(0.6, 0.63), boxShadow: `0 0 ${18 + Math.sin(frame * 0.1) * 8}px ${mix(T.bg0, A.ok, 0.4)}` }}>
        <span style={{ fontSize: 40 }}>📦</span>
        <span style={{ fontFamily: MONO, fontSize: 20, color: T.text }}>artifact storage</span>
        <span style={{ fontFamily: MONO, fontSize: 18, color: A.evt, opacity: p(0.78, 0.82) }}>kept 90 days (default)</span>
      </div>
      {box(1280, 690, 500, "job: e2e", "download-artifact → app.zip", A.ok, p(0.64, 0.67))}
      <Flow x1={600} y1={750} x2={760} y2={750} color={A.ok} n={4} o={p(0.6, 0.63)} />
      <Flow x1={1120} y1={750} x2={1280} y2={750} color={A.ok} n={4} o={p(0.66, 0.68)} />
      <div style={{ position: "absolute", left: 1150, top: 800, fontSize: 30, opacity: p(0.74, 0.78), transform: `translateY(${Math.sin(frame * 0.1) * 3}px)` }}>🧑‍💻⬇</div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- cache (computed hash)
const djb2 = (s: string) => { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0; return h.toString(16).padStart(8, "0"); };
const LOCK_A = '"lodash": "4.17.20",\n"react": "18.3.1"';
const LOCK_B = '"lodash": "4.17.21",\n"react": "18.3.1"';
const KEY_A = djb2(LOCK_A), KEY_B = djb2(LOCK_B);
const CRUNS = [
  { lock: "A", key: KEY_A, hit: false, secs: 94, at: 0.36 },
  { lock: "A", key: KEY_A, hit: true, secs: 6, at: 0.46 },
  { lock: "B", key: KEY_B, hit: false, secs: 97, at: 0.58 },
  { lock: "B", key: KEY_B, hit: true, secs: 6, at: 0.68 },
];
export const CacheScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const changed = p(0.56, 0.58) > 0.5;
  const lock = changed ? LOCK_B : LOCK_A;
  const key = changed ? KEY_B : KEY_A;
  const shimmer = (frame * 6) % 900;
  return (
    <AbsoluteFill>
      <HeadC kicker="actions/cache" title="Same lock file → same key → cache hit" color={A.act} o={p(0, 0.04)} />
      <Win x={100} y={200} w={600} h={230} title="package-lock.json" color={changed ? A.evt : A.act} o={p(0.2, 0.24)}>
        <div style={{ position: "absolute", left: 26, top: 22, fontFamily: MONO, fontSize: 25, color: T.text, whiteSpace: "pre", lineHeight: 1.6 }}>
          {lock.split("\n").map((l, i) => <div key={i} style={{ color: changed && i === 0 ? A.evt : A.str, background: changed && i === 0 ? mix(T.bg1, A.evt, 0.15) : "transparent" }}>{l}</div>)}
          <div style={{ color: T.muted }}>… 800 more</div>
        </div>
      </Win>
      <div style={{ position: "absolute", left: 740, top: 200, width: 1080, height: 230, borderRadius: 16, background: T.bg1, border: `2px solid ${mix(T.line, A.act, 0.6)}`, padding: "20px 26px", boxSizing: "border-box", opacity: p(0.22, 0.26) }}>
        <div style={{ fontFamily: MONO, fontSize: 23, color: A.key }}>key: <span style={{ color: A.str }}>linux-npm-</span><span style={{ color: A.evt }}>{"${{ hashFiles('**/package-lock.json') }}"}</span></div>
        <div style={{ fontFamily: MONO, fontSize: 21, color: T.muted, marginTop: 18 }}>computed →</div>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 40, color: changed ? A.evt : A.ok, marginTop: 6 }}>linux-npm-{key}</div>
        <div style={{ position: "absolute", right: 24, top: 20, fontSize: 40, transform: `rotate(${frame * 3}deg)`, opacity: 0.6 }}>#️⃣</div>
      </div>
      {CRUNS.map((r, i) => {
        const o = p(r.at, r.at + 0.03);
        const grow = p(r.at + 0.02, r.at + 0.07);
        const w = Math.max(40, (r.secs / 100) * 900) * grow;
        const c = r.hit ? A.ok : A.bad;
        return (
          <div key={i} style={{ position: "absolute", left: 100, top: 460 + i * 92, width: 1720, height: 80, opacity: o, display: "flex", alignItems: "center", gap: 20 }}>
            <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: 24, color: T.text, width: 90 }}>run {i + 1}</span>
            <span style={{ fontFamily: MONO, fontSize: 20, color: T.muted, width: 250 }}>key …{r.key.slice(-6)}</span>
            <Chip text={r.hit ? "HIT" : "MISS"} color={c} solid size={22} style={{ width: 90, justifyContent: "center" }} />
            <div style={{ position: "relative", width: 900, height: 44, borderRadius: 10, background: T.bg1 }}>
              <div style={{ position: "absolute", left: 0, top: 0, width: w, height: 44, borderRadius: 10, background: `linear-gradient(90deg, ${mix(T.panel, c, 0.5)}, ${c})`, overflow: "hidden" }}>
                <div style={{ position: "absolute", left: shimmer - 200, top: 0, width: 120, height: 44, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)" }} />
              </div>
            </div>
            <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: 26, color: c, width: 110 }}>{Math.round(r.secs * grow)}s</span>
            <span style={{ fontFamily: SANS, fontSize: 21, color: T.muted }}>{r.hit ? "restored" : "install + save"}</span>
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 100, top: 840, display: "flex", gap: 14, opacity: p(0.78, 0.82) }}>
        <Chip text="setup-node: cache: npm" color={A.act} size={21} />
        <Chip text="10 GB free per repo" color={A.run} size={21} o={p(0.84, 0.87)} />
        <Chip text="unused 7 days → evicted" color={A.gray} size={21} o={p(0.88, 0.9)} />
      </div>
    </AbsoluteFill>
  );
};
