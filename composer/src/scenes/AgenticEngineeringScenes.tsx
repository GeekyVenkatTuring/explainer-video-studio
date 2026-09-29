/**
 * Original instructional visuals for the Agentic AI Engineering course.
 * Motif: a bounded cognition loop. Cyan = cognition/context, violet = runtime,
 * amber = trust/governance, green = verified progress, red = failure/escalation.
 */
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Bg, Brackets, Card, Flow, Head, Kicker, MONO, SANS, ScanBeam, Stage, Wire, makeTheme, mix, useP } from "../lib/primitives";

const T = makeTheme({ accent: "#38BDF8", bg0: "#050816", bg1: "#0A1024", bg2: "#111A35", panel: "#121C36" });
const A = { mind: "#38BDF8", runtime: "#A78BFA", trust: "#FBBF24", good: "#34D399", risk: "#FB7185" };
const COLORS = [A.mind, A.runtime, A.trust, A.good, A.risk];

const Progress: React.FC<{ p: number; color: string }> = ({ p, color }) => (
  <div style={{ position: "absolute", left: 100, right: 100, bottom: 42, height: 5, background: T.line, borderRadius: 4 }}>
    <div style={{ width: `${p * 100}%`, height: "100%", borderRadius: 4, background: color }} />
  </div>
);

/** Continuous, conspicuous motion used in every content frame. */
const LoopAmbient: React.FC<{ color: string }> = ({ color }) => {
  const f = useCurrentFrame();
  const cx = 1660, cy = 790;
  return <>
    {Array.from({ length: 4 }).map((_, i) => {
      const a = f * 0.035 + i * Math.PI / 2;
      return <div key={i} style={{ position: "absolute", left: cx + Math.cos(a) * 95 - 10, top: cy + Math.sin(a) * 62 - 10, width: 20, height: 20, borderRadius: 99, background: color, boxShadow: `0 0 18px ${color}`, opacity: 0.6 }} />;
    })}
    <div style={{ position: "absolute", left: cx - 120, top: cy - 78, width: 240, height: 156, border: `2px dashed ${mix(T.line, color, 0.7)}`, borderRadius: "50%", transform: `rotate(${f * 0.7}deg)` }} />
  </>;
};

type CourseProps = { dur?: number; chapter?: number; title?: string; focus?: string; concepts?: string[]; example?: string; trap?: string; takeaway?: string; beat?: string; part?: number };

const Title: React.FC<CourseProps> = ({ dur }) => {
  const p = useP(dur); const f = useCurrentFrame();
  return <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
    <Bg theme={T} />
    {Array.from({ length: 12 }).map((_, i) => <div key={i} style={{ position: "absolute", left: 960 + Math.cos(f * 0.015 + i) * (500 + i * 11), top: 540 + Math.sin(f * 0.017 + i) * (260 + i * 6), width: 10, height: 10, borderRadius: 99, background: COLORS[i % COLORS.length], opacity: 0.45 }} />)}
    <div style={{ textAlign: "center", width: 1500 }}>
      <Kicker theme={T} text="PRODUCTION AGENTS · FULL FIELD-GUIDE COURSE" cx />
      <div style={{ fontFamily: SANS, fontSize: 116, fontWeight: 800, letterSpacing: -4, lineHeight: 0.96, color: T.text, marginTop: 30, opacity: p(0.08, 0.2) }}>Agentic AI</div>
      <div style={{ fontFamily: SANS, fontSize: 116, fontWeight: 800, letterSpacing: -4, lineHeight: 0.96, color: A.mind, textShadow: `0 0 50px ${mix(T.bg0, A.mind, 0.65)}`, opacity: p(0.16, 0.3) }}>Engineering</div>
      <div style={{ margin: "32px auto", height: 6, width: interpolate(p(0.25, 0.46), [0, 1], [0, 620]), background: `linear-gradient(90deg, ${A.mind}, ${A.runtime}, ${A.trust})`, borderRadius: 5 }} />
      <div style={{ fontFamily: SANS, fontSize: 36, color: T.muted, opacity: p(0.36, 0.55) }}>An original, chapter-by-chapter production systems course</div>
    </div>
  </AbsoluteFill>;
};

const Divider: React.FC<CourseProps> = ({ dur, part = 1, title = "", focus = "" }) => {
  const p = useP(dur); const color = COLORS[(part - 1) % COLORS.length];
  return <Stage><Bg theme={T} /><Brackets x={300} y={300} w={1320} h={430} color={color} o={p(0.04, 0.15)} len={56} /><ScanBeam theme={T} x={310} y={310} w={1300} h={410} color={color} o={p(0.08, 0.2)} />
    <div style={{ position: "absolute", left: 220, top: 390, width: 1480, textAlign: "center" }}>
      <div style={{ fontFamily: MONO, fontSize: 30, fontWeight: 800, letterSpacing: 9, color, opacity: p(0.08, 0.18) }}>PART {String(part).padStart(2, "0")}</div>
      <div style={{ fontFamily: SANS, fontSize: 92, fontWeight: 800, letterSpacing: -3, color: T.text, marginTop: 22, opacity: p(0.18, 0.32) }}>{title}</div>
      <div style={{ fontFamily: SANS, fontSize: 31, color: T.muted, marginTop: 28, opacity: p(0.35, 0.5) }}>{focus}</div>
    </div><LoopAmbient color={color} /><Progress p={p(0, 1)} color={color} /></Stage>;
};

const Label: React.FC<{ x: number; y: number; w: number; text: string; color: string; o: number; active?: boolean }> = ({ x, y, w, text, color, o, active }) => <div style={{ position: "absolute", left: x, top: y, width: w, minHeight: 88, padding: "17px 18px", boxSizing: "border-box", borderRadius: 14, background: mix(T.panel, color, active ? 0.25 : 0.1), border: `2px solid ${mix(T.line, color, active ? 0.95 : 0.55)}`, boxShadow: active ? `0 0 28px ${mix(T.bg0, color, 0.6)}` : "none", opacity: o }}><div style={{ fontFamily: MONO, fontSize: 19, color, marginBottom: 7 }}>SYSTEM STATE</div><div style={{ fontFamily: SANS, fontSize: 27, fontWeight: 700, color: T.text, lineHeight: 1.1 }}>{text}</div></div>;

/** Seven genuinely different visual beats; the chapter's example and engineering lenses
 * populate the live system rather than being read as headline cards. */
const ChapterVisual: React.FC<CourseProps & { p: (a: number, b: number) => number; color: string }> = ({ p, color, concepts = [], example = "", trap = "", beat = "" }) => {
  const f = useCurrentFrame(); const [c1 = "input", c2 = "decision", c3 = "evidence"] = concepts;
  // The narration carries the full scenario. The card is a readable scenario tag,
  // not a paragraph squeezed into a 240px panel.
  const exampleTag = example.split(" ").slice(0, 4).join(" ");
  const packetX = 160 + p(0.20, 0.82) * 1390;
  const Packet = ({ x = packetX, y = 488, o = 1, label = "REQUEST" }) => <div style={{ position: "absolute", left: x, top: y, width: 138, height: 58, borderRadius: 12, background: color, color: T.bg0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontWeight: 800, fontSize: 20, opacity: o, transform: `translateY(${Math.sin(f * 0.16) * 5}px)`, boxShadow: `0 0 22px ${color}` }}>{label}</div>;
  if (beat === "foundation") return <>
    <div style={{ position: "absolute", left: 130, top: 290, width: 720, fontFamily: SANS, fontSize: 47, fontWeight: 800, lineHeight: 1.14, color: T.text, opacity: p(0.08, 0.18) }}>“{example}”</div>
    <div style={{ position: "absolute", left: 130, top: 475, width: 680, fontFamily: SANS, fontSize: 28, lineHeight: 1.4, color: T.muted, opacity: p(0.20, 0.31) }}>A useful system turns this vague job into a bounded outcome, evidence, and authority.</div>
    <Label x={1030} y={280} w={550} text={c1} color={color} o={p(0.28, 0.39)} active />
    <Label x={1030} y={400} w={550} text={c2} color={A.runtime} o={p(0.42, 0.53)} />
    <Label x={1030} y={520} w={550} text={c3} color={A.trust} o={p(0.56, 0.67)} />
    <div style={{ position: "absolute", left: 1030, top: 680, width: 550, padding: "18px", boxSizing: "border-box", borderRadius: 14, border: `2px solid ${A.risk}`, color: A.risk, fontFamily: MONO, fontSize: 23, opacity: p(0.70, 0.8) }}>LOCKED: authority beyond the brief</div>
  </>;
  if (beat === "system") return <>
    {[{x:130,t:"CONTEXT",c:color},{x:530,t:"REASON",c:A.runtime},{x:930,t:"ACT",c:A.good},{x:1330,t:"PROVE",c:A.trust}].map((n, i) => <React.Fragment key={n.t}><Label x={n.x} y={420} w={280} text={i === 0 ? c1 : i === 1 ? c2 : i === 2 ? "bounded action" : c3} color={n.c} o={p(0.08 + i*.14, 0.17 + i*.14)} active={i === 1} />{i < 3 && <Wire x1={n.x+280} y1={465} x2={n.x+400} y2={465} p={p(0.16+i*.14,0.24+i*.14)} color={n.c} />}</React.Fragment>)}
    <div style={{ position: "absolute", left: 130, top: 680, width: 1480, height: 90, borderTop: `2px dashed ${A.trust}`, opacity: p(0.62, 0.73) }}><span style={{ fontFamily: MONO, fontSize: 22, color: A.trust }}>TRUST ENVELOPE · policy, identity, and observability surround every transition</span></div>
  </>;
  if (beat === "practice") return <>
    {[160, 510, 860, 1210].map((x, i) => <React.Fragment key={x}><div style={{ position: "absolute", left: x, top: 380, width: 240, height: 240, borderRadius: 24, border: `2px solid ${COLORS[i]}`, background: mix(T.panel, COLORS[i], .1), opacity: p(.08+i*.12,.18+i*.12) }}><div style={{ padding: 24, fontFamily: MONO, fontSize: 20, color: COLORS[i] }}>{["INPUT", "CONTEXT", "TOOL", "RECORD"][i]}</div><div style={{ padding: "0 24px", fontFamily: SANS, fontSize: 28, fontWeight: 700, color: T.text }}>{[exampleTag,c1,c2,c3][i]}</div></div>{i < 3 && <Flow x1={x+240} y1={500} x2={x+350} y2={500} color={COLORS[i]} n={6} o={p(.24+i*.12,.32+i*.12)} />}</React.Fragment>)}<Packet />
  </>;
  if (beat === "failure") return <>
    <Label x={150} y={355} w={470} text={example} color={color} o={p(.08,.18)} /><Wire x1={620} y1={400} x2={820} y2={400} p={p(.2,.29)} color={color} /><div style={{ position: "absolute", left: 820, top: 300, width: 380, height: 210, padding: 28, boxSizing: "border-box", borderRadius: 20, border: `3px solid ${A.risk}`, background: mix(T.panel,A.risk,.15), opacity: p(.3,.42) }}><div style={{ fontFamily: MONO, fontSize: 22, color:A.risk }}>FAULT INJECTED</div><div style={{ fontFamily:SANS,fontSize:31,fontWeight:800,color:T.text,marginTop:20 }}>{trap}</div></div><Wire x1={1200} y1={405} x2={1420} y2={405} p={p(.43,.52)} color={A.trust} /><div style={{ position:"absolute",left:1420,top:345,width:260,height:120,borderRadius:20,border:`3px solid ${A.good}`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:MONO,fontSize:25,fontWeight:800,color:A.good,opacity:p(.50,.62) }}>BLOCK / ESCALATE</div>
  </>;
  if (beat === "evaluation") return <>
    <div style={{ position:"absolute",left:160,top:280,width:720,fontFamily:SANS,fontSize:42,fontWeight:800,color:T.text,opacity:p(.08,.18) }}>Run the system against representative reality.</div>{["normal case","missing evidence","conflicting instruction","safe stop"].map((s,i)=>{const ok=i!==2;return <div key={s} style={{position:"absolute",left:180+i*400,top:480,width:320,height:170,borderRadius:18,border:`2px solid ${ok?A.good:A.risk}`,background:mix(T.panel,ok?A.good:A.risk,.1),padding:24,boxSizing:"border-box",opacity:p(.22+i*.12,.31+i*.12)}}><div style={{fontFamily:MONO,fontSize:19,color:ok?A.good:A.risk}}>{ok?"PASS":"REVIEW"}</div><div style={{fontFamily:SANS,fontSize:28,fontWeight:700,color:T.text,marginTop:20}}>{s}</div></div>})}<div style={{position:"absolute",left:180,top:730,width:1420,height:22,borderRadius:20,background:T.line,opacity:p(.72,.8)}}><div style={{width:`${p(.76,.93)*82}%`,height:"100%",borderRadius:20,background:A.good}} /></div>
  </>;
  if (beat === "handoff") return <>
    <div style={{position:"absolute",left:210,top:280,width:620,height:440,borderRadius:24,border:`2px solid ${color}`,background:mix(T.panel,color,.12),padding:34,boxSizing:"border-box",opacity:p(.08,.2)}}><div style={{fontFamily:MONO,fontSize:22,color}}>HANDOFF PACKAGE</div>{[["GOAL",example],["EVIDENCE",c3],["ATTEMPTED",c2],["REASON",trap]].map(([k,v],i)=><div key={k} style={{fontFamily:SANS,fontSize:25,color:T.text,marginTop:26,opacity:p(.2+i*.11,.28+i*.11)}}><span style={{fontFamily:MONO,fontSize:18,color:A.trust,display:"inline-block",width:130}}>{k}</span>{v}</div>)}</div><Wire x1={830} y1={500} x2={1190} y2={500} p={p(.40,.50)} color={A.trust}/><Flow x1={830} y1={500} x2={1190} y2={500} color={A.trust} n={8} o={p(.48,.56)}/><div style={{position:"absolute",left:1220,top:390,width:380,height:210,borderRadius:28,border:`3px solid ${A.good}`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:SANS,fontSize:36,fontWeight:800,color:T.text,opacity:p(.48,.58)}}>HUMAN<br/>JUDGMENT</div>
  </>;
  return <><div style={{position:"absolute",left:160,top:300,width:600,fontFamily:SANS,fontWeight:800,fontSize:50,lineHeight:1.14,color:T.text,opacity:p(.08,.2)}}>{c1}, {c2}, and {c3} work as one loop.</div><div style={{position:"absolute",left:950,top:290,width:570,height:400,borderRadius:"50%",border:`4px solid ${color}`,opacity:p(.18,.32)}} />{[0,1,2,3].map(i=>{const a=f*.035+i*Math.PI/2;return <div key={i} style={{position:"absolute",left:1235+Math.cos(a)*285-54,top:490+Math.sin(a)*190-54,width:108,height:108,borderRadius:99,background:COLORS[i],color:T.bg0,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:MONO,fontSize:18,fontWeight:800,opacity:p(.28+i*.1,.38+i*.1)}}>{["KNOW","PLAN","ACT","PROVE"][i]}</div>})}<div style={{position:"absolute",left:160,top:760,width:1420,borderLeft:`6px solid ${A.good}`,paddingLeft:24,fontFamily:SANS,fontSize:32,color:T.text,opacity:p(.74,.86)}}>The system earns more autonomy only when its evidence supports it.</div></>;
};

const Chapter: React.FC<CourseProps> = ({ dur, chapter = 1, title = "", focus = "", concepts = [], takeaway = "", beat = "", ...rest }) => {
  const p = useP(dur); const color = COLORS[(chapter - 1) % COLORS.length];
  return <Stage><Bg theme={T} /><Head theme={T} kicker={`CHAPTER ${String(chapter).padStart(2, "0")} · ${beat.toUpperCase()}`} title={title} color={color} o={p(0, 0.07)} /><ChapterVisual p={p} color={color} concepts={concepts} beat={beat} {...rest} />
    <div style={{ position: "absolute", left: 130, top: 850, width: 1420, fontFamily: MONO, fontSize: 22, color: T.muted, opacity: p(.86,.95) }}>{takeaway}</div><LoopAmbient color={color} /><Progress p={p(0, 1)} color={color} />
  </Stage>;
};

const Recap: React.FC<CourseProps> = ({ dur }) => { const p = useP(dur); const items = ["Engineer the context, memory, and reasoning loop.", "Bound tools and runtime behavior with trust controls.", "Operate agents with evaluation, observability, and escalation.", "Design products, teams, and transformation around accountable autonomy."]; return <Stage><Bg theme={T} /><div style={{ position: "absolute", left: 230, top: 190, width: 1460, textAlign: "center" }}><Kicker theme={T} text="RECAP · THE WHOLE MAP" cx /><div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 74, color: T.text, marginTop: 24 }}>From prompts to production systems</div></div>{items.map((x, i) => <div key={x} style={{ position: "absolute", left: 300, top: 385 + i * 100, width: 1320, fontFamily: SANS, fontSize: 33, color: T.text, opacity: p(0.18 + i * 0.13, 0.26 + i * 0.13) }}><span style={{ fontFamily: MONO, color: COLORS[i], marginRight: 24 }}>{String(i + 1).padStart(2, "0")}</span>{x}</div>)}<LoopAmbient color={A.mind} /><Progress p={p(0, 1)} color={A.mind} /></Stage>; };

export const AgenticEngineeringScene: React.FC<{ variant: string } & CourseProps> = ({ variant, ...props }) => {
  if (variant === "aae_title") return <Title {...props} />;
  if (variant === "aae_divider") return <Divider {...props} />;
  if (variant === "aae_recap") return <Recap {...props} />;
  return <Chapter {...props} />;
};
