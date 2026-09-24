/**
 * 3D STUDIO — a product-film identity. Charcoal cyclorama backdrop, real Three.js objects
 * (@remotion/three + react-three-fiber) under studio key/rim lighting, Sora type + JetBrains Mono.
 * Every archetype has a 3D hero that DEVELOPS with the narration (stacks drop in, orbs travel
 * tubes, columns rise, spheres assemble). HTML labels are aligned to 3D positions by projecting
 * through a camera identical to the canvas camera (deterministic, no read-back).
 * Fits: hardware, GPUs, infrastructure, products, space/science. Render with --gl=angle.
 */
import React from "react";
import { useCurrentFrame, useVideoConfig, spring } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import * as THREE from "three";
import { useP, rnd } from "../../lib/primitives";
import { StylePack, SceneProps, spreadAts, TitleProps, DividerProps, StatementProps, ListProps, FlowProps, ChartProps, VersusProps, RecapProps } from "../core";

export const C = { bg0: "#07080C", bg1: "#171B25", text: "#F3F5F9", muted: "#8C95A8", cyan: "#4DD6FF", pink: "#FF5AA8", amber: "#FFB547", violet: "#9C8CFF", steel: "#AEB6C6" };
export const SANS = "Sora, Inter, 'Helvetica Neue', sans-serif";
export const MONO = "'JetBrains Mono', Menlo, monospace";
const ACC = [C.cyan, C.pink, C.amber, C.violet];
type P<T> = SceneProps & T;

// ---------------------------------------------------------------- camera + projection (HTML ↔ 3D alignment)
// The canvas camera and PROJ are identical (same position/fov, both look straight down -z), so any
// world point can be converted to stage pixels deterministically for HTML labels.
const CAM = { pos: [0, 0.6, 12] as [number, number, number], fov: 35 };
const PROJ = (() => { const c = new THREE.PerspectiveCamera(CAM.fov, 1920 / 1080, 0.1, 100); c.position.set(...CAM.pos); c.updateMatrixWorld(); c.updateProjectionMatrix(); return c; })();
/** world → stage pixels */
const proj = (x: number, y: number, z = 0) => { const v = new THREE.Vector3(x, y, z).project(PROJ); return [((v.x + 1) / 2) * 1920, ((1 - v.y) / 2) * 1080] as [number, number]; };
const Scene3D: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080 }}>
    <ThreeCanvas width={1920} height={1080} style={{ width: 1920, height: 1080 }} camera={{ position: CAM.pos, fov: CAM.fov, near: 0.1, far: 100 }} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={0.35} />
      <directionalLight position={[5, 7, 6]} intensity={1.6} color="#FFF4E6" />
      <pointLight position={[-7, 3, -3]} intensity={60} color={C.cyan} />
      <pointLight position={[7, -2, 4]} intensity={30} color={C.pink} />
      {children}
    </ThreeCanvas>
  </div>
);

const Mat: React.FC<{ color: string; glow?: number; metal?: number; rough?: number }> = ({ color, glow = 0, metal = 0.25, rough = 0.32 }) => (
  <meshStandardMaterial color={color} metalness={metal} roughness={rough} emissive={color} emissiveIntensity={glow} />
);
const useSpr = (dur: number, at: number, cfg = { damping: 12, stiffness: 120 }) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  return spring({ frame: frame - Math.round(at * dur * fps), fps, config: cfg });
};
const Fade: React.FC<{ o: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ o, children, style }) => (
  <div style={{ opacity: o, transform: `translateY(${(1 - o) * 26}px)`, ...style }}>{children}</div>
);
const Kick: React.FC<{ text?: string; o: number; x?: number; y?: number; color?: string }> = ({ text, o, x = 120, y = 120, color = C.cyan }) =>
  text ? <div style={{ position: "absolute", left: x, top: y, fontFamily: MONO, fontSize: 24, letterSpacing: 6, color, opacity: o, textTransform: "uppercase" }}>{text}</div> : null;
const H: React.FC<{ text: string; o: number; x?: number; y?: number; size?: number; w?: number }> = ({ text, o, x = 120, y = 160, size = 64, w = 1500 }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, fontFamily: SANS, fontWeight: 700, fontSize: size, letterSpacing: -1.5, color: C.text, opacity: o, transform: `translateY(${(1 - o) * 20}px)` }}>{text}</div>
);

// ---------------------------------------------------------------- background: the cyclorama
const Background: React.FC<{ beat: number }> = ({ beat }) => {
  const frame = useCurrentFrame();
  const sx = 960 + Math.sin(frame * 0.01 + beat) * 260;
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${C.bg0} 0%, ${C.bg1} 62%, #0E1118 63%, ${C.bg0} 100%)` }} />
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 900px 520px at ${sx}px 560px, rgba(255,255,255,0.10), transparent 70%)` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 676, height: 2, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)" }} />
      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
        {Array.from({ length: 40 }).map((_, i) => {
          const y = (1080 - ((frame * (0.6 + rnd(i, 2) * 0.8) + rnd(i, 3) * 1080) % 1080));
          return <circle key={i} cx={rnd(i, 1) * 1920} cy={y} r={1 + rnd(i, 4) * 1.6} fill="#fff" opacity={0.08 + rnd(i, 5) * 0.1} />;
        })}
      </svg>
    </>
  );
};

// ---------------------------------------------------------------- the 8 archetypes
const Title: React.FC<P<TitleProps>> = ({ dur, kicker, title, subtitle }) => {
  const p = useP(dur); const frame = useCurrentFrame();
  const s = useSpr(dur, 0.02);
  const lines = title.split("\n");
  return (
    <>
      <Scene3D>
        <group position={[3.6, 0.4, 0]} scale={0.6 + 0.4 * s} rotation={[frame * 0.004, frame * 0.012, 0]}>
          <mesh><torusKnotGeometry args={[1.25, 0.38, 220, 32]} /><Mat color={C.cyan} metal={0.35} rough={0.22} glow={0.12} /></mesh>
        </group>
        {Array.from({ length: 6 }).map((_, i) => {
          const a = frame * 0.02 + (i / 6) * Math.PI * 2;
          return <mesh key={i} position={[3.6 + Math.cos(a) * 2.3, 0.4 + Math.sin(a * 1.3) * 0.8, Math.sin(a) * 2.3]} scale={s}><sphereGeometry args={[0.16, 24, 24]} /><Mat color={ACC[i % 4]} glow={0.6} /></mesh>;
        })}
      </Scene3D>
      <Kick text={kicker} o={p(0, 0.08)} y={300} />
      {lines.map((l, i) => (
        <Fade key={i} o={p(0.04 + i * 0.1, 0.16 + i * 0.1)} style={{ position: "absolute", left: 115, top: 350 + i * 130, fontFamily: SANS, fontWeight: 800, fontSize: 124, letterSpacing: -4, color: i === lines.length - 1 && lines.length > 1 ? C.cyan : C.text, whiteSpace: "nowrap" }}>{l}</Fade>
      ))}
      {subtitle && <Fade o={p(0.3, 0.45)} style={{ position: "absolute", left: 122, top: 380 + lines.length * 130, fontFamily: SANS, fontSize: 38, color: C.muted, width: 1000 }}>{subtitle}</Fade>}
    </>
  );
};

const Divider: React.FC<P<DividerProps>> = ({ dur, n, total, title, sub }) => {
  const p = useP(dur); const frame = useCurrentFrame();
  const s = useSpr(dur, 0.0);
  return (
    <>
      <Scene3D>
        <group position={[0, 0.9, -2]} rotation={[1.2 + Math.sin(frame * 0.01) * 0.06, 0, 0]} scale={0.4 + 0.6 * s}>
          <group rotation={[0, 0, frame * 0.01]}>
            <mesh><torusGeometry args={[3.4, 0.12, 24, 160]} /><Mat color={ACC[n % 4]} glow={0.35} metal={0.4} rough={0.25} /></mesh>
            {Array.from({ length: 5 }).map((_, i) => { const a = (i / 5) * Math.PI * 2; return <mesh key={i} position={[Math.cos(a) * 3.4, Math.sin(a) * 3.4, 0]}><sphereGeometry args={[0.2, 20, 20]} /><Mat color={C.steel} glow={0.3} /></mesh>; })}
          </group>
          <group rotation={[0, 0, -frame * 0.02]}><mesh><torusGeometry args={[4.1, 0.03, 12, 160]} /><Mat color={C.steel} /></mesh></group>
        </group>
      </Scene3D>
      <div style={{ position: "absolute", left: 0, right: 0, top: 250, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 190, color: ACC[n % 4], opacity: p(0.04, 0.14), letterSpacing: -6 }}>{String(n).padStart(2, "0")}</div>
      <Fade o={p(0.12, 0.26)} style={{ position: "absolute", left: 0, right: 0, top: 560, textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: 92, color: C.text, letterSpacing: -2 }}>{title}</Fade>
      {sub && <Fade o={p(0.3, 0.44)} style={{ position: "absolute", left: 0, right: 0, top: 690, textAlign: "center", fontFamily: SANS, fontSize: 36, color: C.muted }}>{sub}</Fade>}
      <div style={{ position: "absolute", left: 0, right: 0, top: 770, textAlign: "center", fontFamily: MONO, fontSize: 22, letterSpacing: 6, color: C.muted, opacity: p(0.35, 0.5) }}>PART {n} / {total}</div>
    </>
  );
};

const Statement: React.FC<P<StatementProps>> = ({ dur, kicker, lines, accent = -1, big, sub, ats }) => {
  const p = useP(dur); const frame = useCurrentFrame();
  const at = spreadAts(lines.length, 0.03, 0.4, ats);
  const m = p(0.2, 0.6);
  return (
    <>
      <Scene3D>
        <group position={[3.6, 0.3, 0]} rotation={[0, frame * 0.01, 0]}>
          {Array.from({ length: 42 }).map((_, i) => {
            const phi = Math.acos(1 - (2 * (i + 0.5)) / 42), th = Math.PI * (1 + Math.sqrt(5)) * i;
            const ordered = [Math.sin(phi) * Math.cos(th) * 1.8, Math.cos(phi) * 1.8, Math.sin(phi) * Math.sin(th) * 1.8];
            const loose = [(rnd(i, 1) - 0.5) * 7, (rnd(i, 2) - 0.5) * 5, (rnd(i, 3) - 0.5) * 5];
            const q = ordered.map((v, k) => loose[k] + (v - loose[k]) * m) as [number, number, number];
            return <mesh key={i} position={q}><sphereGeometry args={[0.16, 18, 18]} /><Mat color={ACC[i % 4]} glow={0.3 + 0.3 * m} /></mesh>;
          })}
        </group>
      </Scene3D>
      <Kick text={kicker} o={p(0, 0.06)} y={220} />
      {lines.map((l, i) => (
        <Fade key={i} o={p(at[i], at[i] + 0.1)} style={{ position: "absolute", left: 115, top: 270 + i * 118, width: 1150, fontFamily: SANS, fontWeight: 800, fontSize: 100, letterSpacing: -3, color: i === accent ? C.cyan : C.text, whiteSpace: "nowrap" }}>{l}</Fade>
      ))}
      {big && <Fade o={p(0.34, 0.46)} style={{ position: "absolute", left: 115, top: 300 + lines.length * 118 + 120, width: 1100, textAlign: "left", fontFamily: SANS, fontWeight: 800, fontSize: Math.min(96, Math.floor(1100 / big.length)), color: C.amber, whiteSpace: "nowrap" }}>{big}</Fade>}
      {sub && <Fade o={p(0.5, 0.62)} style={{ position: "absolute", left: 120, top: 290 + lines.length * 118 + 40, width: 1100, fontFamily: SANS, fontSize: 36, color: C.muted }}>{sub}</Fade>}
    </>
  );
};

const List: React.FC<P<ListProps>> = ({ dur, kicker, title, items, ats }) => {
  const p = useP(dur); const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const at = spreadAts(items.length, 0.1, 0.72, ats);
  const n = items.length, rowH = Math.min(118, Math.floor(600 / n));
  let cur = -1; at.forEach((a, i) => { if (p(a, a + 0.01) > 0.5) cur = i; });
  return (
    <>
      <Scene3D>
        <group position={[3.6, -1.5, 0]} scale={0.85} rotation={[0.25, frame * 0.008 - 0.5, 0]}>
          {items.map((_, i) => {
            const s = spring({ frame: frame - Math.round(at[i] * dur * fps), fps, config: { damping: 14, stiffness: 110 } });
            return <mesh key={i} position={[0, i * 0.62 + (1 - s) * 6, 0]} rotation={[0, i * 0.18, 0]} visible={s > 0.001}><boxGeometry args={[2.6, 0.5, 2.6]} /><Mat color={ACC[i % 4]} glow={i === cur ? 0.55 : 0.08} /></mesh>;
          })}
        </group>
      </Scene3D>
      <Kick text={kicker} o={p(0, 0.05)} y={110} />
      <H text={title} o={p(0, 0.06)} y={150} />
      {items.map((it, i) => (
        <Fade key={i} o={p(at[i], at[i] + 0.06)} style={{ position: "absolute", left: 120, top: 290 + i * rowH, width: 1100, display: "flex", alignItems: "center", gap: 26 }}>
          <div style={{ width: 16, height: 16, borderRadius: 8, background: ACC[i % 4], boxShadow: i === cur ? `0 0 18px ${ACC[i % 4]}` : "none" }} />
          <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 46, color: C.text }}>{it.h}</span>
          {it.d && <span style={{ fontFamily: SANS, fontSize: 28, color: C.muted }}>{it.d}</span>}
        </Fade>
      ))}
    </>
  );
};

const Flow: React.FC<P<FlowProps>> = ({ dur, kicker, title, steps, ats }) => {
  const p = useP(dur); const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const n = steps.length; const at = spreadAts(n, 0.1, 0.72, ats);
  const xs = steps.map((_, i) => -4.8 + (9.6 * i) / Math.max(1, n - 1));
  const curve = React.useMemo(() => new THREE.CatmullRomCurve3(xs.map((x, i) => new THREE.Vector3(x, 0.2 + (i % 2 ? 0.5 : -0.2), 0))), [n]);
  const drawn = p(at[0], at[n - 1] + 0.06);
  const tube = React.useMemo(() => new THREE.TubeGeometry(curve, 160, 0.05, 10, false), [curve]);
  const orbT = (frame * 0.006) % 1; const orb = curve.getPoint(orbT);
  return (
    <>
      <Scene3D>
        {drawn > 0.01 && <mesh geometry={tube} scale={[1, 1, 1]}><Mat color={C.steel} glow={0.15} /></mesh>}
        {drawn >= 1 && <mesh position={orb}><sphereGeometry args={[0.2, 24, 24]} /><Mat color={C.amber} glow={1.2} /></mesh>}
        {steps.map((_, i) => {
          const s = spring({ frame: frame - Math.round(at[i] * dur * fps), fps, config: { damping: 13, stiffness: 120 } });
          const pt = curve.getPoint(i / Math.max(1, n - 1));
          return <mesh key={i} position={[pt.x, pt.y - 0.2 - (1 - s) * 3, 0]} scale={[1, s, 1]} visible={s > 0.001}><cylinderGeometry args={[0.7, 0.8, 0.5, 48]} /><Mat color={ACC[i % 4]} glow={0.2} /></mesh>;
        })}
      </Scene3D>
      <Kick text={kicker} o={p(0, 0.05)} y={110} />
      <H text={title} o={p(0, 0.06)} y={150} />
      {steps.map((s, i) => {
        const pt = curve.getPoint(i / Math.max(1, n - 1)); const [sx, sy] = proj(pt.x, pt.y - 0.5, 0);
        const w = Math.min(340, 1600 / n);
        return (
          <Fade key={i} o={p(at[i] + 0.02, at[i] + 0.08)} style={{ position: "absolute", left: sx - w / 2, top: sy + 60, width: w, textAlign: "center" }}>
            <div style={{ fontFamily: MONO, fontSize: 20, color: ACC[i % 4], letterSpacing: 4 }}>STEP {String(i + 1).padStart(2, "0")}</div>
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 38, color: C.text, marginTop: 6 }}>{s.h}</div>
            {s.d && <div style={{ fontFamily: SANS, fontSize: 24, color: C.muted, marginTop: 6, lineHeight: 1.3 }}>{s.d}</div>}
          </Fade>
        );
      })}
    </>
  );
};

const Chart: React.FC<P<ChartProps>> = ({ dur, kicker, title, type, unit = "", note, points = [], bars = [], marks = [], ats }) => {
  const p = useP(dur); const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const head = (<><Kick text={kicker} o={p(0, 0.05)} y={110} /><H text={title} o={p(0, 0.06)} y={150} />{note && <div style={{ position: "absolute", left: 122, top: 240, fontFamily: MONO, fontSize: 21, color: C.muted, opacity: p(0.1, 0.2) }}>{note}</div>}</>);
  if (type === "bar") {
    const at = spreadAts(bars.length, 0.12, 0.7, ats);
    const max = Math.max(...bars.map((b) => b.value), 1); const n = bars.length;
    const xs = bars.map((_, i) => -5 + (10 * i) / Math.max(1, n - 1));
    const H3 = 4.2;
    return (
      <>
        <Scene3D>
          <group rotation={[0, Math.sin(frame * 0.006) * 0.12, 0]}>
            {bars.map((b, i) => {
              const s = spring({ frame: frame - Math.round(at[i] * dur * fps), fps, config: { damping: 14, stiffness: 90 } });
              const h = Math.max(0.01, (b.value / max) * H3 * s);
              return <mesh key={i} position={[xs[i], -2.2 + h / 2, 0]}><boxGeometry args={[1.1, h, 1.1]} /><Mat color={ACC[i % 4]} glow={0.15 + 0.1 * Math.sin(frame * 0.08 + i)} /></mesh>;
            })}
            <mesh position={[0, -2.25, 0]}><boxGeometry args={[13, 0.08, 2.4]} /><Mat color="#2A3040" metal={0.2} rough={0.6} /></mesh>
          </group>
        </Scene3D>
        {head}
        {bars.map((b, i) => {
          const h = (b.value / max) * H3; const [lx, ly] = proj(xs[i], -2.2 + h, 0); const [bx, by] = proj(xs[i], -2.35, 0.6);
          return (
            <React.Fragment key={i}>
              <Fade o={p(at[i] + 0.06, at[i] + 0.12)} style={{ position: "absolute", left: lx - 150, top: ly - 70, width: 300, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 48, color: C.text }}>{b.value.toLocaleString("en-IN")}{unit}</Fade>
              <Fade o={p(at[i], at[i] + 0.06)} style={{ position: "absolute", left: bx - 150, top: by + 10, width: 300, textAlign: "center", fontFamily: MONO, fontSize: 24, color: C.muted }}>{b.label}</Fade>
            </React.Fragment>
          );
        })}
      </>
    );
  }
  const xmin = Math.min(...points.map((q) => q.x)), xmax = Math.max(...points.map((q) => q.x)), ymax = Math.max(...points.map((q) => q.y));
  const wx = (v: number) => -5.5 + ((v - xmin) / (xmax - xmin || 1)) * 11, wy = (v: number) => -1.6 + (v / (ymax || 1)) * 4.0;
  const draw = p(0.1, 0.7);
  const k = Math.max(2, Math.round(points.length * draw));
  const curve = new THREE.CatmullRomCurve3(points.slice(0, k).map((q) => new THREE.Vector3(wx(q.x), wy(q.y), 0)));
  const tube = new THREE.TubeGeometry(curve, Math.max(8, k * 6), 0.07, 10, false);
  const mAt = spreadAts(marks.length, 0.35, 0.75, marks.map((m) => m.at) as number[]);
  const yAt = (xv: number) => points.reduce((b, q) => (Math.abs(q.x - xv) < Math.abs(b.x - xv) ? q : b), points[0]).y;
  const tip = points[k - 1];
  return (
    <>
      <Scene3D>
        <group rotation={[0, Math.sin(frame * 0.006) * 0.1, 0]}>
          <mesh geometry={tube}><Mat color={C.cyan} glow={0.45} /></mesh>
          <mesh position={[wx(tip.x), wy(tip.y), 0]}><sphereGeometry args={[0.18, 24, 24]} /><Mat color={C.amber} glow={1} /></mesh>
          {marks.map((m, i) => p(mAt[i], mAt[i] + 0.01) > 0.5 && <mesh key={i} position={[wx(m.x), wy(yAt(m.x)), 0]}><sphereGeometry args={[0.22, 24, 24]} /><Mat color={C.pink} glow={0.8} /></mesh>)}
        </group>
      </Scene3D>
      {head}
      {marks.map((m, i) => { const [sx, sy] = proj(wx(m.x), wy(yAt(m.x)), 0); return <Fade key={i} o={p(mAt[i], mAt[i] + 0.05)} style={{ position: "absolute", left: sx - 290, top: sy - 120, width: 220, textAlign: "right", fontFamily: SANS, fontWeight: 800, fontSize: 40, color: C.pink }}>{m.label}</Fade>; })}
      {[xmin, xmax].map((v, i) => { const [sx, sy] = proj(wx(v), -1.9, 0); return <div key={i} style={{ position: "absolute", left: sx - 60, top: sy + 6, width: 120, textAlign: "center", fontFamily: MONO, fontSize: 22, color: C.muted, opacity: p(0.05, 0.12) }}>{v}</div>; })}
    </>
  );
};

const Versus: React.FC<P<VersusProps>> = ({ dur, kicker, title, left, right, winner }) => {
  const p = useP(dur); const frame = useCurrentFrame();
  const sl = useSpr(dur, 0.08), sr = useSpr(dur, 0.4), win = p(0.78, 0.9);
  const lift = (side: "left" | "right") => (winner === side ? 0.9 * win : 0);
  const col = (s: { h: string; items: string[] }, x: number, a: number, isWin: boolean) => (
    <div style={{ position: "absolute", left: x, top: 250, width: 640 }}>
      <Fade o={p(a, a + 0.06)} style={{ fontFamily: SANS, fontWeight: 800, fontSize: 62, color: isWin ? C.cyan : C.text }}>{s.h}{isWin ? "  ★" : ""}</Fade>
      {s.items.map((it, i) => <Fade key={i} o={p(a + 0.08 + i * 0.05, a + 0.13 + i * 0.05)} style={{ fontFamily: SANS, fontSize: 30, color: C.muted, marginTop: 18 }}>{it}</Fade>)}
    </div>
  );
  return (
    <>
      <Scene3D>
        {([["left", -4, sl, C.steel], ["right", 4, sr, C.cyan]] as const).map(([side, x, s, col2]) => (
          <group key={side} position={[x * 0.9, -1.85 + lift(side), 0]} scale={Math.max(0.001, s) * 0.72}>
            <mesh position={[0, -0.3, 0]}><cylinderGeometry args={[1.5, 1.7, 0.5, 64]} /><Mat color="#2A3040" metal={0.3} rough={0.5} /></mesh>
            <mesh position={[0, 0.9, 0]} rotation={[frame * 0.01, frame * 0.015, 0]}>
              {side === "left" ? <boxGeometry args={[1.4, 1.4, 1.4]} /> : <icosahedronGeometry args={[1, 1]} />}
              <Mat color={col2} glow={winner === side ? 0.3 + 0.3 * win : 0.05} />
            </mesh>
          </group>
        ))}
      </Scene3D>
      <Kick text={kicker} o={p(0, 0.05)} y={110} />
      <H text={title} o={p(0, 0.06)} y={150} size={56} />
      {col(left, 120, 0.08, winner === "left")}
      {col(right, 1180, 0.4, winner === "right")}
    </>
  );
};

const Recap: React.FC<P<RecapProps>> = ({ dur, title, items, closer, ats }) => {
  const p = useP(dur); const frame = useCurrentFrame();
  const at = spreadAts(items.length, 0.06, 0.7, ats);
  const done = at.filter((a) => p(a, a + 0.01) > 0.5).length;
  const rowH = Math.min(78, 460 / Math.max(1, items.length));
  return (
    <>
      <Scene3D>
        <group position={[3.9, 0.2, -1.5]} rotation={[0.3, frame * 0.012, 0]}>
          {Array.from({ length: 10 }).map((_, i) => {
            const a = (i / 10) * Math.PI * 2;
            return <mesh key={i} position={[Math.cos(a) * 2.0, 0, Math.sin(a) * 2.0]} rotation={[0, -a, 0]}><boxGeometry args={[0.8, 1.1, 0.08]} /><Mat color={i < done * 2 ? ACC[i % 4] : "#3A4050"} glow={i < done * 2 ? 0.35 : 0} /></mesh>;
          })}
        </group>
      </Scene3D>
      <Kick text="Recap" o={p(0, 0.05)} y={150} />
      <H text={title} o={p(0, 0.06)} y={190} size={64} w={1100} />
      {items.map((it, i) => (
        <Fade key={i} o={p(at[i], at[i] + 0.05)} style={{ position: "absolute", left: 120, top: 320 + i * rowH, width: 1050, display: "flex", gap: 22, fontFamily: SANS, fontSize: 36, color: C.text }}>
          <span style={{ fontFamily: MONO, color: ACC[i % 4], width: 50 }}>{String(i + 1).padStart(2, "0")}</span><span>{it}</span>
        </Fade>
      ))}
      {closer && <Fade o={p(0.8, 0.9)} style={{ position: "absolute", left: 120, top: 360 + items.length * rowH, width: 1100, fontFamily: SANS, fontWeight: 800, fontSize: 52, color: C.cyan }}>{closer}</Fade>}
    </>
  );
};

export const studio: StylePack = {
  id: "studio",
  name: "3D Studio",
  Background: Background as StylePack["Background"],
  scenes: { title: Title as any, divider: Divider as any, statement: Statement as any, list: List as any, flow: Flow as any, chart: Chart as any, versus: Versus as any, recap: Recap as any },
  caption: { font: SANS, size: 32, weight: 600, color: C.text, bg: "rgba(7,8,12,0.72)", border: "1px solid rgba(255,255,255,0.14)", radius: 999, bottom: 40, pad: "12px 34px" },
  transition: (i) => (i % 2 ? slide({ direction: "from-bottom" }) : fade()) as never,
  transitionFrames: 16,
};
