import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import {
  useP, usePop, rnd, mix, MONO, SANS, CL,
  Stage, Head, Foot, Card, Flow, Wire, Counter, Type, Kicker, Brackets, ScanBeam,
} from "../lib/primitives";
import { T, A, useR, AngleFrame, TrackBar, TagChip, CodePanel, Tok } from "./HFScenes";

const Label: React.FC<{ x: number; y: number; w: number; text: string; color?: string; o?: number; size?: number }> =
({ x, y, w, text, color = T.muted, o = 1, size = 22 }) => <div style={{ position: "absolute", left: x, top: y, width: w, fontFamily: MONO, fontSize: size, color, opacity: o, lineHeight: 1.3 }}>{text}</div>;

export const TracksScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const p = useR(dur), pf = useP(dur);
  const tracks = [
    { label: "track 0 — background", clips: [{ at: .03, len: .31, c: A.html }, { at: .51, len: .32, c: A.html }] },
    { label: "track 1 — content", clips: [{ at: .16, len: .35, c: A.motion }, { at: .58, len: .28, c: A.media }] },
    { label: "track 2 — overlay", clips: [{ at: .41, len: .29, c: A.html }, { at: .76, len: .16, c: A.motion }] },
  ];
  const head = pf(0, 1);
  return <Stage>
    <Head theme={T} kicker="TIMELINE CONTRACT" title="Tracks stack; z-order is data-track-index" color={A.html} o={p(0, .07)} />
    <div style={{ position: "absolute", left: 1330, top: 116, opacity: p(.08, .15) }}><TagChip text="data-track-index" color={A.html} /></div>
    <AngleFrame x={125} y={236} w={1665} h={555} color={A.html} o={p(.04, .14) * .35} size={42} />
    {tracks.map((t, row) => {
      const at = .08 + row * .15, y = 310 + row * 150, o = p(at, at + .08);
      return <React.Fragment key={t.label}>
        <Label x={180} y={y - 40} w={480} text={t.label} color={row === 2 ? A.html : T.muted} o={o} />
        <div style={{ position: "absolute", left: 180, top: y, width: 1560, height: 70, borderRadius: 12, background: mix(T.panel, A.html, .05), border: `1.5px solid ${T.line}`, opacity: o }} />
        {t.clips.map((cl, i) => <div key={i} style={{ position: "absolute", left: 180 + 1560 * cl.at, top: y + 7, width: 1560 * cl.len, height: 56, borderRadius: 10, opacity: p(at + .06 + i * .04, at + .13 + i * .04), background: `linear-gradient(135deg, ${mix(cl.c, T.panel, .55)}, ${mix(cl.c, T.bg1, .35)})`, border: `2px solid ${cl.c}`, boxShadow: row === 2 && i === 0 ? `0 12px 28px ${mix(T.bg0, cl.c, .6)}` : `0 0 16px ${mix(T.bg0, cl.c, .35)}`, zIndex: row + 2 }} />)}
      </React.Fragment>;
    })}
    <div style={{ position: "absolute", left: 180 + 1560 * head - 2, top: 270, width: 4, height: 505, background: T.text, boxShadow: `0 0 18px ${A.html}`, zIndex: 9 }} />
    <Label x={180 + 1560 * head - 55} y={786} w={130} text="scrub →" color={A.html} o={.7} size={19} />
    <Foot theme={T} p={p(.82, .92)}>Same track = later clip wins; different track = higher index wins.</Foot>
  </Stage>;
};

export const SeekScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const frame = useCurrentFrame(), p = useR(dur);
  const hf = .5 + .42 * Math.sin(frame * .02), seconds = hf * 6.4;
  return <Stage>
    <Head theme={T} kicker="SEEK, DON'T PLAY" title="One paused timeline. We SEEK it, never play it." color={A.html} o={p(0, .07)} />
    <Card theme={T} x={350} y={255} w={1220} h={260} color={A.html} o={p(.1, .2)} glow>
      <Label x={30} y={26} w={420} text="frame state / recomputed" color={A.html} size={22} />
      <div style={{ position: "absolute", left: 32, top: 72, width: 380, fontFamily: MONO, fontWeight: 800, fontSize: 58, color: T.text }}>t = {seconds.toFixed(2)}s</div>
      <div style={{ position: "absolute", left: 510, top: 74, width: 620, height: 112, borderBottom: `2px solid ${T.line}` }}>
        <div style={{ position: "absolute", left: hf * 480, top: 42 - hf * 30, width: 70, height: 70, borderRadius: 16, background: A.motion, boxShadow: `0 0 ${18 + Math.sin(frame * .08) * 8}px ${A.motion}`, opacity: .35 + hf * .65 }} />
        <Label x={0} y={145} w={620} text="x(t), opacity(t) — pure functions of time" color={T.muted} size={20} />
      </div>
    </Card>
    <div style={{ position: "absolute", left: 220, top: 590, width: 560, opacity: p(.27, .36) }}><TagChip text="gsap.timeline({ paused: true })" color={A.motion} /></div>
    <div style={{ position: "absolute", left: 1120, top: 590, width: 560, opacity: p(.38, .48) }}><TagChip text="render length = data-duration" color={A.html} /></div>
    <TrackBar x={220} y={710} w={1480} h={20} head={hf} clips={[{ at: 0, len: 1, c: A.motion, label: "timeline (paused)" }]} o={p(.49, .59)} />
    <ScanBeam theme={T} x={350} y={255} w={1220} h={260} color={A.html} o={p(.2, .3) * .35} speed={.7} />
    <Foot theme={T} p={p(.82, .92)}>Every frame is the timeline sampled at one instant — so any frame is reproducible.</Foot>
  </Stage>;
};

export const SubcompScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const p = useR(dur);
  const host: Tok[][] = [[['<div ', T.muted], ['data-composition-src', A.html], ['="scene.html"', T.text]], [['     ', T.muted], ['data-composition-id', A.html], ['="scene">', T.text]], [['</div>', T.muted]]];
  const inner: Tok[][] = [[['<template ', A.warn], ['id="scene">', T.text]], [['  <style>…</style>', T.muted]], [['  <script>…</script>', T.muted]], [['</template>', A.warn]]];
  return <Stage>
    <Head theme={T} kicker="COMPOSITIONS" title="Standalone vs sub-composition" color={A.html} o={p(0, .07)} />
    <CodePanel x={150} y={280} w={700} lines={host} p={p} title="host index.html" start={.1} step={.06} size={25} />
    <Wire x1={850} y1={435} x2={1060} y2={435} p={p(.3, .39)} color={A.html} w={4} />
    <Flow x1={850} y1={435} x2={1060} y2={435} color={A.html} n={6} o={p(.39, .47)} />
    <CodePanel x={1060} y={280} w={700} lines={inner} p={p} title="scene.html · sub-composition" start={.4} step={.05} size={25} />
    <div style={{ position: "absolute", left: 176, top: 585, opacity: p(.5, .58) }}><TagChip text="data-composition-src" color={A.html} /></div>
    <div style={{ position: "absolute", left: 1360, top: 585, opacity: p(.6, .69) }}><TagChip text="<template>" color={A.warn} /></div>
    <Label x={250} y={720} w={1420} text="host id === inner template id === window.__timelines key" color={T.text} o={p(.7, .8)} size={26} />
    <Foot theme={T} p={p(.84, .94)}>Only &lt;template&gt; contents are cloned — put &lt;style&gt;/&lt;script&gt; inside it.</Foot>
  </Stage>;
};

export const DeterminismGridScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const frame = useCurrentFrame(), p = useR(dur), rows = 9, cols = 16, cell = 42, gap = 7;
  const grid = (x: number, seed: number, unstable: boolean) => <div style={{ position: "absolute", left: x, top: 310, width: cols * (cell + gap), display: "grid", gridTemplateColumns: `repeat(${cols}, ${cell}px)`, gap, opacity: p(unstable ? .12 : .42, unstable ? .22 : .52) }}>
    {Array.from({ length: rows * cols }).map((_, i) => { const r = Math.floor(i / cols), c = i % cols, v = rnd(r, c, unstable ? Math.floor(frame / 3) : seed); const color = unstable ? (v > .5 ? A.warn : A.media) : (v > .5 ? A.ship : A.html); return <div key={i} style={{ width: cell, height: cell, borderRadius: 7, background: mix(T.panel, color, .2 + v * .65), border: `1.5px solid ${mix(T.line, color, .7)}`, boxShadow: unstable && v > .72 ? `0 0 15px ${color}` : "none" }} />; })}
  </div>;
  return <Stage>
    <Head theme={T} kicker="DETERMINISM" title="A hidden clock desyncs parallel workers" color={A.warn} o={p(0, .07)} />
    <Label x={180} y={250} w={650} text="Math.random() / Date.now()" color={A.warn} o={p(.08, .16)} size={27} />
    <Label x={1010} y={250} w={650} text="rnd(i, j, seed)" color={A.ship} o={p(.38, .46)} size={27} />
    {grid(180, 7, true)}{grid(1010, 7, false)}
    <Label x={180} y={800} w={650} text="flickers across workers" color={A.warn} o={p(.25, .34)} size={25} />
    <Label x={1010} y={800} w={650} text="identical every render" color={A.ship} o={p(.55, .65)} size={25} />
    <ScanBeam theme={T} x={1010} y={310} w={777} h={430} color={A.ship} o={p(.54, .65) * .35} speed={.85} />
    <Foot theme={T} p={p(.82, .92)}>Workers render frames in parallel; a hidden clock gives each a different answer.</Foot>
  </Stage>;
};

export const AdaptersScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const frame = useCurrentFrame(), p = useR(dur);
  const items = [["🎯", "GSAP", A.motion], ["🎬", "Lottie", A.html], ["🧊", "Three.js", A.html], ["✨", "Anime.js", A.motion], ["🎨", "CSS", A.html], ["⚙️", "WAAPI", A.motion], ["🔺", "TypeGPU", A.html]] as const;
  return <Stage>
    <Head theme={T} kicker="RUNTIME ADAPTERS" title="Seven runtimes, one seek" color={A.motion} o={p(0, .07)} />
    <Card theme={T} x={760} y={490} w={400} h={145} color={A.motion} o={p(.07, .16)} glow><div style={{ width: 340, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 38, color: T.text }}>one seek()</div><div style={{ width: 340, textAlign: "center", fontFamily: MONO, fontSize: 20, color: A.motion, marginTop: 9 }}>window.__timelines</div></Card>
    {items.map(([emoji, label, color], i) => { const ang = i / items.length * Math.PI * 2 - Math.PI / 2 + Math.sin(frame * .008) * .06; const x = 960 + Math.cos(ang) * 570, y = 562 + Math.sin(ang) * 260, at = .15 + i * .07, active = Math.floor(frame / 26) % items.length === i && p(.62, .63) > .5; return <React.Fragment key={label}>
      <Wire x1={960} y1={562} x2={x} y2={y} p={p(at - .05, at + .01)} color={active ? A.motion : mix(T.muted, T.bg1, .4)} w={active ? 4 : 2} arrow={false} />
      <Flow x1={960} y1={562} x2={x} y2={y} color={color} n={4} o={p(at, at + .08)} />
      <div style={{ position: "absolute", left: x - 125, top: y - 38, width: 250, height: 76, borderRadius: 14, boxSizing: "border-box", padding: "16px 15px", opacity: p(at, at + .08), transform: `scale(${active ? 1.09 : 1})`, background: mix(T.panel, color, active ? .24 : .1), border: `2px solid ${active ? A.motion : color}`, boxShadow: active ? `0 0 25px ${A.motion}` : "none" }}><span style={{ fontSize: 29 }}>{emoji}</span><span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 24, color: T.text, marginLeft: 10 }}>{label}</span></div>
    </React.Fragment>; })}
    <Foot theme={T} p={p(.84, .94)}>Each runtime registers on its own global; one seek pass drives every one.</Foot>
  </Stage>;
};

export const AudioEngineScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const p = useR(dur);
  const columns = [{ x: 1030, title: "YES", c: A.ship, lines: ["TTS: HeyGen Starfish", "BGM: retrieve", "SFX: retrieve"] }, { x: 1410, title: "NO", c: A.warn, lines: ["TTS: ElevenLabs → Kokoro", "BGM: Lyria / MusicGen", "SFX: bundled lib"] }];
  return <Stage>
    <Head theme={T} kicker="AUDIO ENGINE" title="One engine, with a credential switch" color={A.media} o={p(0, .07)} />
    <Wire x1={470} y1={410} x2={740} y2={410} p={p(.12, .2)} color={A.media} /><Flow x1={470} y1={410} x2={740} y2={410} color={A.media} o={p(.2, .28)} />
    <Wire x1={1180} y1={410} x2={1450} y2={410} p={p(.31, .39)} color={A.media} /><Flow x1={1180} y1={410} x2={1450} y2={410} color={A.media} o={p(.39, .47)} />
    <Card theme={T} x={150} y={335} w={320} h={150} color={A.media} o={p(.06, .14)}><Label x={0} y={24} w={260} text="INPUT" color={A.media} size={20} /><Label x={0} y={62} w={280} text="audio_request.json" color={T.text} size={25} /></Card>
    <Card theme={T} x={740} y={300} w={440} h={220} color={A.media} o={p(.22, .31)} glow><div style={{ width: 380, textAlign: "center", fontFamily: MONO, fontSize: 22, color: A.media }}>ONE ENGINE</div><div style={{ width: 380, textAlign: "center", fontFamily: SANS, fontSize: 38, fontWeight: 800, color: T.text, marginTop: 20 }}>scripts/audio.mjs</div></Card>
    <Card theme={T} x={1450} y={335} w={320} h={150} color={A.media} o={p(.41, .5)}><Label x={0} y={24} w={260} text="OUTPUT" color={A.media} size={20} /><Label x={0} y={62} w={280} text="audio_meta.json" color={T.text} size={25} /></Card>
    <div style={{ position: "absolute", left: 918, top: 625, width: 84, height: 84, transform: "rotate(45deg)", background: mix(T.panel, A.media, .2), border: `2px solid ${A.media}`, opacity: p(.53, .62) }} /><Label x={924} y={648} w={78} text="cred?" color={T.text} o={p(.57, .65)} size={19} />
    {columns.map((col, i) => <React.Fragment key={col.title}><Wire x1={960} y1={710} x2={col.x + 150} y2={760} p={p(.62 + i * .06, .7 + i * .06)} color={col.c} /><Flow x1={960} y1={710} x2={col.x + 150} y2={760} color={col.c} o={p(.7 + i * .06, .78 + i * .06)} />
      <Card theme={T} x={col.x} y={740} w={330} h={145} color={col.c} o={p(.7 + i * .06, .79 + i * .06)}><Label x={0} y={18} w={260} text={col.title} color={col.c} size={23} />{col.lines.map((line, j) => <Label key={line} x={0} y={50 + j * 29} w={290} text={line} color={T.text} size={19} />)}</Card></React.Fragment>)}
    <Foot theme={T} p={p(.86, .95)}>One engine, one request file — the same code, credentialed or offline.</Foot>
  </Stage>;
};

export const TtsChainScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const frame = useCurrentFrame(), p = useR(dur), pf = useP(dur);
  const rungs = [{ name: "HeyGen · Starfish", note: "native word timestamps ✓", c: A.ship, yes: true }, { name: "ElevenLabs", note: "no timestamps → chain transcribe", c: A.media, yes: false }, { name: "Kokoro-82M local", note: "always available, no key", c: A.html, yes: false }];
  const probe = interpolate(pf(.25, .75), [0, 1], [0, 2], CL), landed = Math.min(2, Math.floor(probe + .2));
  return <Stage>
    <Head theme={T} kicker="TTS FALLBACK" title="The provider ladder resolves word timestamps" color={A.media} o={p(0, .07)} />
    <Label x={200} y={225} w={800} text="first available provider wins" color={A.media} o={p(.08, .16)} size={26} />
    {rungs.map((r, i) => { const y = 280 + i * 180, o = p(.16 + i * .14, .25 + i * .14), hot = landed === i; return <React.Fragment key={r.name}>
      {i > 0 && <Wire x1={960} y1={y - 30} x2={960} y2={y - 5} p={p(.18 + i * .14, .25 + i * .14)} color={A.media} />}
      <Card theme={T} x={200} y={y} w={1520} h={145} color={hot ? A.ship : r.c} o={o} glow={hot}><div style={{ width: 800, fontFamily: SANS, fontWeight: 800, fontSize: 36, color: T.text }}>{i + 1}. {r.name}</div><div style={{ width: 800, fontFamily: MONO, fontSize: 22, color: r.c, marginTop: 16 }}>{r.note}</div><div style={{ position: "absolute", right: 28, top: 46, width: 260, fontFamily: MONO, fontWeight: 800, fontSize: 25, color: r.yes ? A.ship : T.muted, textAlign: "right" }}>word timestamps? {r.yes ? "✓" : "✗"}</div></Card>
      {Math.abs(probe - i) < .55 && <div style={{ position: "absolute", left: 155, top: y + 52, width: 24, height: 40, borderRadius: 6, background: A.media, boxShadow: `0 0 ${18 + Math.sin(frame * .08) * 8}px ${A.media}`, opacity: o }} />}
    </React.Fragment>; })}
    <Foot theme={T} p={p(.84, .94)}>HeyGen gives word timings natively; the others chain Whisper transcription.</Foot>
  </Stage>;
};

export const StudioScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const frame = useCurrentFrame(), p = useR(dur), pf = useP(dur), head = pf(0, 1);
  return <Stage>
    <Head theme={T} kicker="PREVIEW WORKFLOW" title="Preview opens Studio; render is user-gated" color={A.ship} o={p(0, .07)} />
    <Card theme={T} x={150} y={240} w={1620} h={600} color={A.ship} o={p(.08, .18)} glow>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1620, height: 70, borderBottom: `2px solid ${T.line}`, display: "flex", alignItems: "center", padding: "0 28px", boxSizing: "border-box" }}><span style={{ fontSize: 29, color: A.ship }}>▶</span><span style={{ width: 300, fontFamily: MONO, fontSize: 23, color: T.text, marginLeft: 18 }}>00:03:{String(Math.floor(frame % 30)).padStart(2, "0")}</span><span style={{ width: 900, textAlign: "right", fontFamily: MONO, fontSize: 20, color: T.muted }}>HYPERFRAMES STUDIO</span></div>
      <div style={{ position: "absolute", left: 30, top: 98, width: 910, height: 310, borderRadius: 12, background: mix(T.bg1, A.html, .12), border: `1.5px solid ${A.html}`, opacity: p(.21, .31) }}><AngleFrame x={110} y={55} w={690} h={190} color={A.html} o={.55} size={34} /><div style={{ position: "absolute", left: 150, top: 115, width: 610, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 40, color: T.text }}>seekable frame preview</div></div>
      <div style={{ position: "absolute", left: 1000, top: 110, width: 540, opacity: p(.3, .4) }}><TagChip text="selection: overlay-title" color={A.ship} /><Label x={0} y={64} w={500} text="the user can edit any clip here" color={T.muted} size={25} /></div>
      <div style={{ position: "absolute", left: 30, top: 455, width: 1560, height: 110, borderTop: `1.5px solid ${T.line}`, opacity: p(.43, .54) }}>{[0, 1, 2].map(i => <TrackBar key={i} x={90} y={20 + i * 29} w={1380} h={14} head={head} clips={[{ at: .05 + i * .08, len: .32, c: i === 1 ? A.ship : A.html }, { at: .55, len: .25, c: A.motion }]} />)}</div>
    </Card>
    <Foot theme={T} p={p(.84, .94)}>preview = Studio; render is never automatic — it waits for the user's go.</Foot>
  </Stage>;
};

export const LambdaScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const frame = useCurrentFrame(), p = useR(dur);
  const workers = Array.from({ length: 6 }, (_, i) => ({ y: 245 + i * 94, label: `f${i * 10}–f${i * 10 + 9}` }));
  return <Stage>
    <Head theme={T} kicker="DISTRIBUTED RENDER" title="Cloud fan-out for long, large, or 4K renders" color={A.ship} o={p(0, .07)} />
    <Card theme={T} x={150} y={430} w={430} h={190} color={A.ship} o={p(.08, .18)} glow><Label x={0} y={26} w={340} text="your laptop / CI" color={A.ship} size={25} /><Label x={0} y={78} w={370} text="hyperframes lambda render" color={T.text} size={22} /></Card>
    {workers.map((w, i) => { const at = .2 + i * .07, active = Math.floor(frame / 24) % workers.length === i; return <React.Fragment key={w.label}><Wire x1={580} y1={525} x2={980} y2={w.y + 30} p={p(at - .06, at)} color={active ? A.ship : mix(T.muted, T.bg1, .4)} w={active ? 4 : 2} /><Flow x1={580} y1={525} x2={980} y2={w.y + 30} color={A.ship} n={3} o={p(at, at + .08)} /><Wire x1={1200} y1={w.y + 30} x2={1400} y2={525} p={p(at + .04, at + .1)} color={A.ship} w={2} /><Flow x1={1200} y1={w.y + 30} x2={1400} y2={525} color={A.ship} n={3} o={p(at + .1, at + .16)} /><Card theme={T} x={980} y={w.y} w={220} h={60} color={active ? A.ship : A.html} o={p(at, at + .08)} pad="16px 18px"><Label x={0} y={16} w={200} text={`Lambda · ${w.label}`} color={T.text} size={18} /></Card></React.Fragment>; })}
    <Card theme={T} x={1400} y={440} w={210} h={170} color={A.ship} o={p(.67, .76)} glow><div style={{ width: 150, fontSize: 50, textAlign: "center" }}>🪣</div><Label x={0} y={92} w={150} text="S3 bucket" color={T.text} size={21} /></Card>
    <Wire x1={1610} y1={525} x2={1706} y2={525} p={p(.76, .84)} color={A.ship} /><Flow x1={1610} y1={525} x2={1706} y2={525} color={A.ship} o={p(.84, .92)} />
    <Card theme={T} x={1712} y={478} w={108} h={94} color={A.ship} o={p(.82, .9)} glow pad="16px 12px"><Label x={0} y={30} w={92} text="final.mp4" color={T.text} size={17} /></Card>
    <Foot theme={T} p={p(.9, .98)}>Frames split across many workers, muxed once in the cloud — for multi-minute or 4K renders.</Foot>
  </Stage>;
};
