#!/usr/bin/env python3
"""Lean, Explained — chalkboard pack (~8 min).

What Lean is, how you use it, and a worked example: modeling an agent loop
(tool calls, pending ids, results) the way teams use Lean to understand SDKs.

  projects/midcap5-picks-en/.venv/bin/python3 projects/lean-lang-en/build.py
  bash projects/lean-lang-en/render.sh
"""
import json, os, re, subprocess
import soundfile as sf
from kokoro_onnx import Kokoro

PACK = "chalk"
META = {"brand": "Explainer Forge", "project": "Lean language", "issue": "September 2026", "code": "LEAN-4"}
PREFIX = "ln4"
CAPTIONS = False
GAP, PAUSE, ATEMPO = 0.5, 0.6, 0.95
PRON = [
    (r"\bSDK\b", "S D K"),
    (r"\bSDKs\b", "S D Ks"),
    (r"\bAPI\b", "A P I"),
    (r"\bVS Code\b", "V S Code"),
    (r"\bMathlib\b", "math lib"),
    (r"\bNat\b", "nat"),
    (r"\brfl\b", "R F L"),
    (r"\bsimp\b", "simp"),
    (r"\brw\b", "rewrite"),
    (r"\bAI\b", "A I"),
    (r"\bid\b", "I D"),
    (r"\bids\b", "I Ds"),
    (r"\bLean 4\b", "Lean four"),
    (r"\bClaude Code\b", "Claude Code"),
]

BEATS = [
 # ============================================================ CH0 · INTRO
 ("title", {
     "kicker": "A language that proves",
     "title": "Lean,\nExplained",
     "subtitle": "what it is · how to use it · an agent loop you can prove",
 },
  "An agent can call a tool, wait for a result, and keep going. [pause] "
  "One tiny mismatch in that loop, and the session breaks. [pause] "
  "Lean is a language built to catch that kind of bug, before it ships.", 0),

 ("statement", {
     "kicker": "The puzzle",
     "lines": ["Tests check some runs.", "Proofs check every run."],
     "accent": 1,
     "sub": "Lean is built for the second claim",
 },
  "Here is the puzzle. [pause] Tests show that some runs worked. "
  "They do not show that every run will work. [pause] "
  "Proofs check every run. Lean is built for that second claim. [pause] "
  "You write a small model of the logic. Then you state what must always be true. "
  "[pause] If the proof goes through, it holds for every case in the model. "
  "Not just the ones you tried.", 0),

 ("list", {
     "kicker": "The plan",
     "title": "Three questions",
     "items": [
         {"h": "What is Lean", "d": "language and theorem prover"},
         {"h": "How you use it", "d": "project, tactics, kernel"},
         {"h": "An agent loop", "d": "prove tool results match calls"},
     ],
 },
  "Three questions. [pause] What is Lean, as a language and a theorem prover. "
  "[pause] How you use it: a project, some tactics, and a kernel that checks you. "
  "[pause] Then an agent loop. We will prove that every tool result matches a pending call. "
  "[pause] That last one is the pattern people describe around Claude Code and agent SDKs.", 0),

 # ============================================================ CH1 · WHAT IS LEAN
 ("divider", {"n": 1, "total": 3, "title": "What Lean Is", "sub": "a language, and a proof checker"},
  "Part one. [pause] What Lean actually is. [pause] A language, and a proof checker.", 1),

 ("statement", {
     "kicker": "Two things in one",
     "lines": ["A programming language.", "A theorem prover."],
     "accent": 1,
     "sub": "programs and proofs share one language",
 },
  "Lean is two things in one. [pause] It is a functional programming language. "
  "You write functions, types, and data. [pause] And it is a theorem prover. "
  "You write claims, then proofs, and the computer checks them. [pause] "
  "That mix is the point. Programs and proofs live in the same language.", 1),

 ("versus", {
     "kicker": "How certainty is made",
     "title": "A test vs a proof",
     "winner": "right",
     "left": {"h": "A test", "items": ["pick some inputs", "check the output", "miss one case, miss the bug"]},
     "right": {"h": "A proof", "items": ["state a property", "steps the kernel accepts", "holds for every case"]},
 },
  "Most of us ship software with tests. [pause] A test picks some inputs and checks the output. "
  "Miss a case, miss the bug. [pause] A proof is different. You state a property. "
  "Then you give a sequence of steps. [pause] If the kernel accepts those steps, "
  "the property holds for every case in the model. Not some. All.", 1),

 ("list", {
     "kicker": "The idea under the hood",
     "title": "Propositions as types",
     "items": [
         {"h": "A type", "d": "a kind of thing, like Nat"},
         {"h": "A claim", "d": "is also a type"},
         {"h": "A proof", "d": "a program of that type"},
         {"h": "The kernel", "d": "accepts only a real construction"},
     ],
 },
  "Lean sits on a simple slogan. Propositions as types. [pause] "
  "A type is a kind of thing. Nat is the type of natural numbers. [pause] "
  "A claim is also a type. [pause] A proof is a program of that type. "
  "If you can build the program, the claim is true. [pause] "
  "The kernel accepts only a real construction. You cannot wave your hands. "
  "If the term does not type-check, the theorem is not done.", 1),

 ("statement", {
     "kicker": "In one line of maths",
     "lines": ["A proof of P", "is a value of type P."],
     "accent": 1,
     "tex": r"P \;\;\text{true} \;\iff\; \text{inhabit } P",
     "sub": "if you cannot build it, you cannot claim it",
 },
  "In one line: a proof of P is a value of type P. [pause] "
  "If you cannot inhabit the type, you cannot claim the theorem. [pause] "
  "That is why Lean feels strict. The strictness is the feature.", 1),

 ("flow", {
     "kicker": "What happens when you hit check",
     "title": "Theorem to kernel",
     "steps": [
         {"h": "Theorem", "d": "the claim"},
         {"h": "Tactics", "d": "steps you write"},
         {"h": "Kernel", "d": "yes or no"},
     ],
 },
  "Here is the loop you will live in. [pause] You write a theorem, which is the claim. "
  "[pause] You prove it with tactics, small steps with names. [pause] "
  "Then the kernel checks. [pause] Lean turns those steps into a proof term, and a tiny kernel says yes, or no. "
  "Nothing in between. Trust sits in the kernel, not in the tactics, and not in you.", 1),

 ("list", {
     "kicker": "Lean four, today",
     "title": "What you are looking at",
     "items": [
         {"h": "Lean 4", "d": "rewrite of Lean, in Lean"},
         {"h": "Mathlib", "d": "a huge library of maths"},
         {"h": "Lake", "d": "the project build tool"},
         {"h": "Two jobs", "d": "maths, and software proofs"},
     ],
 },
  "The version you want is Lean 4. It is a rewrite of Lean, written in Lean. [pause] "
  "Mathlib is the community library of formal mathematics. Huge, and growing. [pause] "
  "Lake is the build tool for a Lean project. [pause] "
  "People use this stack for two jobs: formal maths, and proofs about software. "
  "Tonight we care about both, then land on software.", 1),

 # ============================================================ CH2 · HOW TO USE IT
 ("divider", {"n": 2, "total": 3, "title": "How You Use It", "sub": "install, write, let the kernel talk"},
  "Part two. [pause] How you actually use it. [pause] Install, write, and let the kernel talk.", 2),

 ("flow", {
     "kicker": "Start here",
     "title": "A first Lean project",
     "steps": [
         {"h": "Elan", "d": "install Lean"},
         {"h": "Lake", "d": "new project"},
         {"h": "Editor", "d": "Lean 4 plugin"},
     ],
 },
  "Start with Elan. It installs Lean, like a version manager. [pause] "
  "Then Lake, to make a new project. [pause] "
  "Open that folder in an editor with the Lean 4 plugin. VS Code is the usual one. [pause] "
  "If you need real maths, import Mathlib. [pause] "
  "Goals appear in a side panel as you type. That live goal is the whole interface.", 2),

 ("statement", {
     "kicker": "A first theorem",
     "lines": ["Addition commutes", "on natural numbers."],
     "accent": 0,
     "tex": r"a + b = b + a",
     "sub": "one line to state, tactics to prove",
 },
  "Here is a first theorem. Addition commutes on natural numbers. "
  "A plus B equals B plus A. [pause] You state it in one line. "
  "Then you prove it with tactics. [pause] "
  "For numbers, a tactic like ring or omega may close it at once. "
  "[pause] For your own data, you will walk it by hand. Either way, the kernel still checks.", 2),

 ("list", {
     "kicker": "The verbs you type",
     "title": "Four tactics to start",
     "items": [
         {"h": "rfl", "d": "both sides are the same"},
         {"h": "rewrite", "d": "swap using a known fact"},
         {"h": "simp", "d": "unfold and simplify"},
         {"h": "induction", "d": "zero, then successor"},
     ],
 },
  "You do not write the whole proof term by hand. You name tactics. [pause] "
  "rfl says both sides are the same. [pause] "
  "rewrite swaps one side using a known fact. [pause] "
  "simp unfolds definitions and simplifies. [pause] "
  "induction splits a number into zero, then successor. [pause] "
  "Each tactic changes the goal. When no goals remain, you are done.", 2),

 ("list", {
     "kicker": "Three real jobs",
     "title": "Where Lean earns its keep",
     "items": [
         {"h": "Formal maths", "d": "theorems in Mathlib"},
         {"h": "Software proofs", "d": "a small model of a system"},
         {"h": "AI plus kernel", "d": "the model writes, Lean checks"},
     ],
 },
  "Three jobs show up in the wild. [pause] Formal maths: people put theorems into Mathlib, "
  "so a computer has checked them. [pause] Software proofs: you write a small model of a system, "
  "then prove the properties you care about. [pause] And AI plus the kernel. "
  "A model can draft tactics. Lean still decides if they are real. "
  "[pause] That last job is why this language is in the agent conversation.", 2),

 # ============================================================ CH3 · AGENT LOOP
 ("divider", {"n": 3, "total": 3, "title": "Prove an Agent", "sub": "a tiny model of tool calls"},
  "Part three. [pause] Prove an agent. [pause] A tiny model of tool calls, in the Claude Code style.", 3),

 ("statement", {
     "kicker": "The story going around",
     "lines": ["Model the SDK.", "State what must hold."],
     "accent": 1,
     "sub": "the kernel, not the chat, is the judge",
 },
  "Here is the story going around the Claude Code world. [pause] "
  "You write a simplified model of the agent SDK. States, messages, tool calls. [pause] "
  "Then you state properties that should always hold. [pause] "
  "One of them: every tool result matches a pending tool call. [pause] "
  "Claude can help write the Lean. The kernel is still the judge. "
  "If it says no, the claim is not proved. Full stop.", 3),

 ("flow", {
     "kicker": "The loop we will model",
     "title": "Message, call, result",
     "steps": [
         {"h": "Message", "d": "user asks"},
         {"h": "Call", "d": "id sits pending"},
         {"h": "Result", "d": "must match that id"},
     ],
 },
  "The agent loop looks like this. [pause] A user message arrives. [pause] "
  "The model may emit a tool call, with an id. [pause] "
  "That id sits in a pending set. [pause] "
  "The runtime runs the tool and returns a result. That result must carry the same id. "
  "[pause] Then the next turn starts. If the ids do not match, the protocol is already broken.", 3),

 ("list", {
     "kicker": "What we ask Lean to prove",
     "title": "Four invariants",
     "items": [
         {"h": "Match", "d": "every result has a pending call"},
         {"h": "No ghosts", "d": "no result for a never-called tool"},
         {"h": "Drain", "d": "pending empties before user text"},
         {"h": "Shape", "d": "roles and blocks stay legal"},
     ],
 },
  "We ask Lean for four invariants. [pause] Match: every result has a pending call with that id. "
  "[pause] No ghosts: you cannot invent a result for a tool that was never called. [pause] "
  "Drain: the pending set is empty before the next user text. [pause] "
  "Shape: message roles and content blocks stay legal. [pause] "
  "These are the bugs that tests miss, because they hide in odd interleavings.", 3),

 ("flow", {
     "kicker": "How you would write it",
     "title": "Model, then prove",
     "steps": [
         {"h": "State", "d": "messages, pending"},
         {"h": "Step", "d": "call, result, reply"},
         {"h": "Check", "d": "kernel yes or no"},
     ],
 },
  "How you would write it. [pause] Define a State: the message list, and the pending ids. "
  "[pause] Define step functions: call, result, and reply. [pause] "
  "Write theorems for those four laws, for every sequence of steps. [pause] "
  "Then check. The kernel says yes, or it shows you the goal you failed to close. "
  "[pause] The real SDK can be messy. The model is small on purpose. That is how you think with Lean.", 3),

 ("versus", {
     "kicker": "What this is not",
     "title": "Tests still matter",
     "winner": "right",
     "left": {"h": "Only tests", "items": ["fast, and local", "miss odd sequences", "silent on 'always'"]},
     "right": {"h": "Model in Lean", "items": ["slow to write", "covers every path", "always, and means it"]},
 },
  "This does not replace tests. [pause] Tests are fast, and they hit the real code. "
  "They still miss odd sequences, and they stay silent on the word always. [pause] "
  "A Lean model is slower to write. It covers every path in that model. "
  "And it can say always, and mean it. [pause] "
  "Use both. Lean for the protocol. Tests for the messy edges the model left out.", 3),

 # ============================================================ CH4 · RECAP
 ("recap", {
     "title": "Lean in one breath",
     "items": [
         "Lean is a language and a proof checker",
         "A proof is a program the kernel accepts",
         "Tactics write the proof; the kernel judges",
         "Model a system small, then state invariants",
         "Every result matches a pending call",
         "Claude may draft Lean; Lean still decides",
     ],
     "closer": "If it type-checks, you can trust the claim.",
 },
  "Let's recap. [pause] Lean is a language and a proof checker. [pause] "
  "A proof is a program the kernel accepts. [pause] "
  "Tactics write the proof. The kernel judges. [pause] "
  "To use it on software, model the system small, then state invariants. [pause] "
  "For an agent: every result matches a pending call. [pause] "
  "Claude may draft the Lean. Lean still decides. [pause] "
  "If it type-checks, you can trust the claim. Thanks for watching.", 4),
]

ROOT = os.path.dirname(os.path.abspath(__file__))
REPO = subprocess.run(["git", "-C", ROOT, "rev-parse", "--show-toplevel"], capture_output=True, text=True, check=True).stdout.strip()
PUB = os.path.join(REPO, "composer", "public", PREFIX)
RAW, FIN, ART = os.path.join(ROOT, "assets", "raw"), os.path.join(ROOT, "assets"), os.path.join(ROOT, "artifacts")
for d in (PUB, RAW, ART, os.path.join(ROOT, "renders")): os.makedirs(d, exist_ok=True)
_K = None
def kokoro():
    global _K
    if _K is None:
        _K = Kokoro(os.path.expanduser("~/.cache/hyperframes/tts/models/kokoro-v1.0.onnx"), os.path.expanduser("~/.cache/hyperframes/tts/voices/voices-v1.0.bin"))
    return _K
def spoken(t):
    for a, b in PRON: t = re.sub(a, b, t)
    return t
def ffdur(p): return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p], capture_output=True, text=True).stdout)
def silence(path, secs):
    if not os.path.exists(path): subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "lavfi", "-i", "anullsrc=r=24000:cl=mono", "-t", str(secs), path], check=True)
    return path

def tts(bid, text):
    fin = os.path.join(FIN, f"{bid}.wav")
    if os.path.exists(fin): return fin
    parts = [p.strip() for p in text.split("[pause]") if p.strip()]
    lines = []
    for i, p in enumerate(parts):
        cp = os.path.join(RAW, f"{bid}_{i}.wav")
        s, sr = kokoro().create(spoken(p), voice="af_bella", speed=1.0, lang="en-us"); sf.write(cp, s, sr, subtype="PCM_16")
        lines.append(f"file '{cp}'")
        if i < len(parts) - 1: lines.append(f"file '{silence(os.path.join(RAW, '_p.wav'), PAUSE)}'")
    lst = os.path.join(RAW, f"{bid}.txt"); open(lst, "w").write("\n".join(lines))
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", lst, "-filter:a", f"atempo={ATEMPO}", "-ar", "24000", "-ac", "1", fin], check=True)
    return fin

def word_times(text, dur):
    """(word, t_start_fraction) for every narration word — same proportional model as the captions."""
    parts = text.split("[pause]"); words = sum(len(p.split()) for p in parts) or 1
    pp = PAUSE / ATEMPO; wt = max(0.01, dur - (len(parts) - 1) * pp) / words; t, out = 0.0, []
    for i, p in enumerate(parts):
        for w in p.split(): out.append((w, t / dur)); t += wt
        if i < len(parts) - 1: t += pp
    return out

STOP = {"the", "and", "for", "with", "from", "into", "your", "about", "that", "this", "what", "how", "why", "are", "its", "one", "new"}

def autosync(kind, props, text, dur):
    """Set props['ats'] so each item reveals as it is spoken (≈0.03 early). Never overrides a given ats."""
    if "ats" in props: return props
    h = lambda x: x["h"] if isinstance(x, dict) else str(x)
    heads = ([h(i) for i in props.get("items", [])] if kind in ("list", "recap") else
             [h(s) for s in props.get("steps", [])] if kind == "flow" else
             props.get("lines", []) if kind == "statement" else
             [b["label"] for b in props.get("bars", [])] if kind == "chart" else
             [h(n) for n in props.get("nodes", [])] if kind == "x_diagram" else None)
    if not heads: return props
    wt = word_times(text, dur); norm = lambda w: re.sub(r"[^a-z0-9]", "", w.lower())
    ats, cursor = [], 0
    for h in heads:
        key = next((norm(w) for w in h.split() if len(norm(w)) > 2 and norm(w) not in STOP and not norm(w).isdigit()), "")
        hit = next((k for k in range(cursor, len(wt)) if norm(wt[k][0]).startswith(key)), None) if key else None
        if hit is None: ats.append(None); continue
        ats.append(round(max(0.0, wt[hit][1] - 0.03), 3)); cursor = hit + 1
    if all(a is None for a in ats): return props
    return {**props, "ats": [a if a is not None else (ats[i - 1] or 0) + 0.05 for i, a in enumerate(ats)]}

def cues_for(text, dur, t0):
    parts = text.split("[pause]"); words = sum(len(p.split()) for p in parts) or 1
    pp = PAUSE / ATEMPO; wt = max(0.01, dur - (len(parts) - 1) * pp) / words; out = []; ct = t0
    for i, p in enumerate(parts):
        w = p.split()
        for k in range(0, len(w), 8):
            ch = w[k:k + 8]; out.append([round(ct, 3), round(ct + wt * len(ch), 3), " ".join(ch)]); ct += wt * len(ch)
        if i < len(parts) - 1: ct += pp
    return out

if __name__ == "__main__":
    chapters = {}
    words = sum(len(b[2].replace("[pause]", " ").split()) for b in BEATS)
    print(f"WORDS {words}  target ~1320 for 8 min")
    for n, (kind, props, text, ch) in enumerate(BEATS):
        bid = f"b{n:02d}"; wav = tts(bid, text); d = ffdur(wav)
        warn = "  ⚠ LONG >75s" if d > 75 else ""
        chapters.setdefault(ch, []).append((bid, kind, autosync(kind, props, text, d), text, wav, d))
        print(f"ch{ch:02d} {bid} {kind:10s} {d:6.2f}s{warn}")
    gap = silence(os.path.join(RAW, "_g.wav"), GAP); total = 0.0; out = []
    for ch, beats in sorted(chapters.items()):
        lst = os.path.join(RAW, f"_ch{ch:02d}.txt"); open(lst, "w").write("\n".join(f"file '{b[4]}'\nfile '{gap}'" for b in beats))
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", lst, "-c", "copy", os.path.join(PUB, f"ch{ch:02d}.wav")], check=True)
        t, cues, rb = 0.0, [], []
        for bid, kind, props, text, wav, d in beats:
            cues += cues_for(text, d, t); rb.append({"id": bid, "kind": kind, "dur": round(d + GAP, 3), "props": props}); t += d + GAP
        j = os.path.join(ART, f"ch{ch:02d}.json")
        json.dump({"pack": PACK, "meta": META, "beats": rb, "captions": cues if CAPTIONS else [], "audio": f"{PREFIX}/ch{ch:02d}.wav"}, open(j, "w"), indent=1)
        out.append(j); total += t; print(f"  → {os.path.basename(j)}  {t:.1f}s")
    print(f"TOTAL {total:.1f}s ({total/60:.2f} min) · {len(BEATS)} beats · {words} words · pack={PACK}")
