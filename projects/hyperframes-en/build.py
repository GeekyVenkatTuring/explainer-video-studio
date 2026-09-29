#!/usr/bin/env python3
"""HyperFrames: Video, Written in HTML — build script (prefix hf).

Kokoro ONNX af_bella (offline, direct). Captions OFF (scenes carry a Foot takeaway).
Per-PART chunked emission (artifacts/ch/pN.json) for disk-safe render + a master
edit_decisions.json. Idempotent: existing WAVs reused; delete a seg's assets/<id>.wav
to regenerate it.

Run with the kokoro-onnx venv:
  projects/midcap5-picks-en/.venv/bin/python3 projects/hyperframes-en/build.py
"""
import json, os, subprocess
import soundfile as sf
from kokoro_onnx import Kokoro

KOKORO_MODEL = os.path.expanduser("~/.cache/hyperframes/tts/models/kokoro-v1.0.onnx")
KOKORO_VOICES = os.path.expanduser("~/.cache/hyperframes/tts/voices/voices-v1.0.bin")
VOICE, LANG = "af_bella", "en-us"
_K = None
def kokoro():
    global _K
    if _K is None: _K = Kokoro(KOKORO_MODEL, KOKORO_VOICES)
    return _K

GAP, PAUSE, ATEMPO = 0.5, 0.6, 0.95
PREFIX = "hf"
ROOT = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(ROOT, "..", ".."))
PUBLIC = os.path.join(REPO, "composer", "public", PREFIX)
RAW, FIN = os.path.join(ROOT, "assets", "raw"), os.path.join(ROOT, "assets")
CHDIR = os.path.join(ROOT, "artifacts", "ch")
for d in (PUBLIC, RAW, os.path.join(ROOT, "artifacts"), CHDIR, os.path.join(ROOT, "renders")):
    os.makedirs(d, exist_ok=True)

HTML, MOT, MEDIA, SHIP, WARN = "#38BDF8", "#A78BFA", "#FBBF24", "#34D399", "#FB7185"
MUT, VAL, TXT = "#8090AE", "#34D399", "#EAF1FC"

PARTS = {0: "Intro", 1: "The Workflows", 2: "The Contract", 3: "Motion",
         4: "Creative Direction", 5: "Media & Audio", 6: "Ship It", 7: "Recap"}

def L(*toks):
    return [list(t) for t in toks]

# ============================================================ SCREENPLAY
# (seg_id, variant, props, narration, part)
SEGMENTS = [

# ------------------------------------------------------------ ch0 · INTRO
("s01_title", "hf_title", {},
 "You already know how to write a web page. [pause] A heading, a paragraph, a box "
 "with a background color. [pause] Now, what if that same page could become a "
 "video? [pause] Not a screen recording of it — an actual rendered video file, "
 "frame by frame. [pause] That is the whole idea behind HyperFrames. [pause] Over "
 "this course, we build it up from the very first tag to a finished, rendered "
 "movie.", 0),

("s02_hook", "hf_hook", {},
 "Here is the core move. [pause] A HyperFrames composition is just an HTML file. "
 "[pause] The elements on the page carry their timing in their data attributes — "
 "when they appear, how long they last. [pause] A runtime reads that file and can "
 "jump to any moment in time. [pause] At each moment, it takes a snapshot — a "
 "single picture of the page at that instant. [pause] Line those pictures up, "
 "thirty a second, and you have video. [pause] So the page describes the movie, "
 "and the renderer turns every instant into a frame. Hold on to that. Everything "
 "else follows from it.", 0),

("s03_why", "hf_bullets",
 {"kicker": "WHY WRITE VIDEO THIS WAY", "title": "Video that behaves like code", "color": HTML,
  "foot": "If you can build a web page, you can already build a frame of video.",
  "items": [
     {"h": "No footage, no assets needed", "sub": "type, shapes and gradients are enough", "icon": "✍️", "c": HTML},
     {"h": "Reuse everything you know", "sub": "HTML, CSS, SVG, the DOM, flexbox", "icon": "\U0001f9f1", "c": HTML},
     {"h": "Plain text you can diff and review", "sub": "a video in a pull request", "icon": "\U0001f500", "c": MOT},
     {"h": "Deterministic — same input, same frames", "sub": "re-render any time, byte for byte", "icon": "\U0001f3af", "c": SHIP}]},
 "So why would you write video this way? [pause] Four reasons. [pause] First, you "
 "need no footage and no stock assets. Typography, shapes and gradients are enough "
 "to make something that looks produced. [pause] Second, you reuse the entire web "
 "stack you already know — H-T-M-L, C-S-S, S-V-G, the whole box model. [pause] "
 "Third, the video is plain text. That means you can diff it, review it in a pull "
 "request, and track its history, like any other code. [pause] And fourth, it is "
 "deterministic. The same file always produces exactly the same frames — so you "
 "can re-render it any time and get an identical result.", 0),

("s04_roadmap", "hf_roadmap", {},
 "Here is where this course is headed. [pause] Six parts. [pause] First, the "
 "workflows — the many kinds of video one engine can make. [pause] Then the "
 "composition contract: the rules of the file itself. [pause] Then motion, and "
 "the one trick that keeps animation seekable. [pause] Then creative direction — "
 "how to make it look produced, not generic. [pause] Then media: voice, music and "
 "captions. [pause] And finally, shipping — how you check your work, preview it, "
 "and render a finished video. [pause] Six layers of the same stack. Let us start "
 "at the top.", 0),

# ------------------------------------------------------------ ch1 · THE WORKFLOWS
("d1", "hf_divider", {"n": 1, "title": "The Workflows", "sub": "one engine, many kinds of video", "color": HTML}, "Part one. The workflows.", 1),

("s05_workflows", "hf_bullets",
 {"kicker": "ONE ENGINE, MANY VIDEOS", "title": "What you can make", "color": HTML,
  "foot": "You describe the intent; a workflow scaffolds the right kind of project.",
  "items": [
     {"h": "Product launch & website videos", "sub": "promos and tours built from a URL", "icon": "\U0001f680", "c": HTML},
     {"h": "Faceless explainers & PR videos", "sub": "explain a topic, or a code change", "icon": "\U0001f4a1", "c": MOT},
     {"h": "Captions & talking-head recuts", "sub": "subtitles or graphics over footage", "icon": "\U0001f9fe", "c": MEDIA},
     {"h": "Motion graphics, music & slideshows", "sub": "logo stings, beat-synced, decks", "icon": "\U0001f39e️", "c": SHIP}]},
 "HyperFrames is one engine, but it drives many kinds of video. [pause] You can "
 "turn a product page into a promo, or a website into a guided tour. [pause] You "
 "can explain a topic with a faceless explainer, where every visual is invented "
 "from scratch. [pause] You can turn a pull request into a changelog video, "
 "straight from the diff. [pause] You can add captions to existing footage, or "
 "package a talking-head clip with lower-thirds and callouts. [pause] And there "
 "are short motion graphics, beat-synced music videos, and even navigable slide "
 "decks. [pause] Same engine underneath. You describe the intent, and a workflow "
 "scaffolds the right project for you.", 1),

("s06_routing", "hf_compare",
 {"kicker": "PICKING A WORKFLOW", "title": "Routing is about the input",
  "foot": "One question settles most cases: is the site selling a product, or not?",
  "left": {"head": "Selling a product", "bad": False, "c": HTML,
           "items": ["A SaaS or app URL → a promo", "The value is the subject", "Product-launch workflow"]},
  "right": {"head": "Just showing a site", "bad": False, "c": MOT,
            "items": ["Portfolio, blog, docs → a tour", "The site itself is the subject", "Website-to-video workflow"]}},
 "How do you pick the right workflow? [pause] It comes down to the input, not the "
 "styling. [pause] Take a URL. One question settles most cases: is the site "
 "selling a product? [pause] If yes — a SaaS, an app, a company site — you want "
 "a promo, where the product's value is the subject. [pause] If it is a portfolio, "
 "a blog, or docs, you want a tour that shows the site itself. [pause] A code "
 "change routes to the pull-request workflow. A topic with no site becomes a "
 "faceless explainer. [pause] Name the input, and the workflow picks itself.", 1),

("s07_devloop", "hf_pipeline",
 {"kicker": "THE DEV LOOP", "title": "How you actually work", "color": SHIP,
  "foot": "Write a little, check a lot, preview, then render. That rhythm is the job.",
  "steps": [
     {"label": "init", "sub": "scaffold a project", "c": HTML},
     {"label": "write", "sub": "author the HTML", "c": HTML},
     {"label": "check", "sub": "lint, validate, inspect", "c": MOT},
     {"label": "preview", "sub": "edit in Studio", "c": MEDIA},
     {"label": "render", "sub": "frames → MP4", "c": SHIP}]},
 "No matter which video you make, the loop is the same. [pause] You init a project "
 "to scaffold it — folders, config, a starter composition. [pause] You write the "
 "H-T-M-L. [pause] You check it, with three tools we will meet later: lint, "
 "validate and inspect. [pause] You preview it in a timeline editor and tweak "
 "whatever needs tweaking. [pause] And only then do you render it to an M-P-4. "
 "[pause] Write a little, check a lot, preview, then render. [pause] That rhythm "
 "is the whole job, and it is the spine of everything in this course.", 1),

# ------------------------------------------------------------ ch2 · THE CONTRACT
("d2", "hf_divider", {"n": 2, "title": "The Contract", "sub": "the rules of the file", "color": HTML}, "Part two. The contract — the rules of the file itself.", 2),

("s08_onefile", "hf_code",
 {"kicker": "THE COMPOSITION", "title": "One file, one composition", "color": HTML, "codeTitle": "composition.html",
  "foot": "The root's data-duration — not the animation length — sets how long it renders.",
  "lines": [
     L(("<div ", MUT), ("data-composition-id", HTML), ("=", MUT), ("\"scene\"", VAL)),
     L(("     ", MUT), ("data-duration", HTML), ("=", MUT), ("\"6\"", VAL), (">", MUT)),
     L(("  ...", MUT)),
     L(("</div>", MUT))],
  "notes": [
     {"text": "The root div IS the composition", "c": HTML},
     {"text": "data-composition-id names it — the timeline key", "c": HTML},
     {"text": "data-duration is the render length in seconds", "c": SHIP}]},
 "Let us open the file. [pause] A composition is a single root element, and it "
 "carries a data-composition-id. [pause] That id is its name — and it matters "
 "more than it looks, because the timeline is registered under exactly that name. "
 "[pause] The root also carries a data-duration. Six seconds, here. [pause] And "
 "this is the part people miss. [pause] The render length comes from data-duration "
 "— not from how long your animation happens to run. [pause] If your animation "
 "finishes in two seconds but data-duration says six, you render six seconds. "
 "[pause] The root declares the length of the movie, out loud, in an attribute.", 2),

("s09_clips", "hf_code",
 {"kicker": "CLIPS", "title": "Elements declare their own timing", "color": HTML, "codeTitle": "composition.html",
  "foot": "Timing lives in the markup — read the HTML, and you can read the schedule.",
  "lines": [
     L(("<h1 ", MUT), ("class", HTML), ("=", MUT), ("\"clip\"", VAL)),
     L(("    ", MUT), ("data-start", HTML), ("=", MUT), ("\"1\"", VAL), (" ", MUT), ("data-duration", HTML), ("=", MUT), ("\"3\"", VAL), (">", MUT)),
     L(("  Hello", TXT)),
     L(("</h1>", MUT))],
  "notes": [
     {"text": "class=\"clip\" marks an animatable element", "c": MOT},
     {"text": "data-start times it on the timeline", "c": HTML},
     {"text": "data-duration is how long it lives", "c": SHIP}]},
 "Inside the composition, elements schedule themselves. [pause] You mark an element "
 "with the class clip. [pause] That tells the framework this thing takes part in "
 "the animation. [pause] Then data-start says when it appears — one second in, "
 "here. [pause] And its own data-duration says how long it stays on screen. "
 "[pause] Notice where the timing lives. Right there, in the markup, next to the "
 "content. [pause] There is no separate timeline file to keep in sync. [pause] "
 "Read the H-T-M-L, and you have read the schedule. That is the whole appeal.", 2),

("s10_tracks", "hf_tracks", {},
 "Clips do not just sit in a line — they stack in layers, on tracks. [pause] "
 "Each clip gets a data-track-index. [pause] Think of it like the layers in a "
 "video editor, or z-index on the web. A higher index sits in front. [pause] Now, "
 "what happens when two clips overlap in time? [pause] The rule is simple, and "
 "worth memorizing. [pause] On the same track, the later clip wins. [pause] On "
 "different tracks, the higher index wins. [pause] So layering is never a guess or "
 "an accident. It is a number you set, and the outcome is completely predictable.", 2),

("s11_seek", "hf_seek", {},
 "Now, the idea that makes all of this actually work. [pause] A composition builds "
 "exactly one timeline — and that timeline is paused. [pause] The renderer never "
 "presses play and records the screen. [pause] Instead, it seeks. It jumps "
 "straight to a moment in time and reads the state of the page there. [pause] "
 "Watch the playhead scrub backward. The picture rewinds perfectly. [pause] Why? "
 "Because every frame is just the timeline sampled at one instant. There is no "
 "history, no momentum — only a function from time to a picture. [pause] That is "
 "the deep reason any frame is reproducible. [pause] Seeking is not playing. Say "
 "that until it feels obvious.", 2),

("s12_subcomp", "hf_subcomp", {},
 "Big videos are built from smaller pieces. [pause] A standalone composition sits "
 "at the top level, on its own. [pause] But a sub-composition — one that another "
 "file pulls in — must be wrapped in a template tag. [pause] And here is the catch "
 "that bites everyone once. [pause] The runtime only clones what is inside that "
 "template. [pause] Everything outside it is thrown away. So your styles and your "
 "scripts must live inside the template too, or they simply vanish at render time. "
 "[pause] One more rule: the host's id must match the inner template's id exactly. "
 "[pause] One name, all the way through — the slot, the template, and the timeline "
 "key.", 2),

("s13_rootforms", "hf_compare",
 {"kicker": "TWO ROOT FORMS", "title": "They are not interchangeable",
  "foot": "Wrapping a standalone hides everything; forgetting to wrap a sub-comp breaks the mount.",
  "left": {"head": "Standalone", "bad": False, "c": HTML,
           "items": ["Top-level index.html", "Root sits directly in the body", "No template wrapper"]},
  "right": {"head": "Sub-composition", "bad": False, "c": MOT,
            "items": ["Loaded by another file", "Root wrapped in <template>", "Styles & scripts go inside"]}},
 "So there are two root forms, and they are not interchangeable. [pause] A "
 "standalone composition is a top-level file. Its root sits directly in the body, "
 "with no template wrapper. [pause] A sub-composition is loaded by another file, "
 "and its root must be wrapped in a template. [pause] Get this backwards and things "
 "break in confusing ways. [pause] Wrap a standalone, and the runtime hides "
 "everything — you get a blank frame. [pause] Forget to wrap a sub-composition, "
 "and the mount fails silently. [pause] Two forms. Match the form to how the file "
 "is used.", 2),

("s14_media", "hf_code",
 {"kicker": "MEDIA & VARIABLES", "title": "The framework owns playback", "color": HTML, "codeTitle": "composition.html",
  "foot": "Let the framework drive video and audio — it keeps them in sync with the seek.",
  "lines": [
     L(("<video ", MUT), ("src", HTML), ("=", MUT), ("\"clip.mp4\"", VAL)),
     L(("       ", MUT), ("data-volume", HTML), ("=", MUT), ("\"0.8\"", VAL), (">", MUT)),
     L(("<!-- a direct child of the root -->", MUT))],
  "notes": [
     {"text": "video and audio go directly under the root", "c": HTML},
     {"text": "the framework owns playback, trim and volume", "c": MOT},
     {"text": "never drive playback yourself", "c": SHIP}]},
 "What about real video and audio inside your composition? [pause] You place a "
 "video or audio element as a direct child of the root — never buried inside a "
 "sub-composition's template. [pause] Then you step back and let go. [pause] The "
 "framework owns playback. It handles trimming, it handles volume, and crucially, "
 "it keeps the media in step with the seek. [pause] Remember, we are seeking, not "
 "playing. If you tried to drive playback yourself, it would drift out of sync the "
 "moment a frame is sampled out of order. [pause] So declare the media, set its "
 "volume, and let the framework run it.", 2),

("s15_variables", "hf_code",
 {"kicker": "PARAMETRIZED RENDERS", "title": "One file, many videos", "color": HTML, "codeTitle": "index.html",
  "foot": "Declare variables once; pass values at render time to reskin the same composition.",
  "lines": [
     L(("<html ", MUT), ("data-composition-variables", HTML)),
     L(("  ", MUT), ("=", MUT), ("'{ \"name\": \"Ada\" }'", VAL), (">", MUT)),
     L(("...", MUT)),
     L(("render --variables ", MUT), ("name=Grace", VAL))],
  "notes": [
     {"text": "declare defaults on the html element", "c": HTML},
     {"text": "override them at render with --variables", "c": MOT},
     {"text": "one composition, a whole batch of videos", "c": SHIP}]},
 "Here is where it gets powerful. [pause] A composition can declare variables. "
 "[pause] You list their default values right on the H-T-M-L element. [pause] Then "
 "at render time, you override them from the command line. [pause] Same "
 "composition, different name, different colors, different numbers. [pause] So one "
 "file can produce a whole batch of personalized videos — a thousand of them, "
 "each with a different customer's name, from one template. [pause] And if you "
 "misspell a variable key, a strict flag can fail the build instead of silently "
 "ignoring it. [pause] Author once, render many.", 2),

("s16_determinism", "hf_determinismgrid", {},
 "Everything we have said depends on one promise. [pause] The same file must "
 "produce the same frames, every single time. [pause] Here is why that promise is "
 "fragile. [pause] Frames are not rendered one after another. They are rendered by "
 "many workers, in parallel, each on a different slice of the timeline. [pause] "
 "Now suppose your code asks for the current clock time, or an unseeded random "
 "number. [pause] Each worker gets a different answer — and the picture flickers "
 "and scatters, because the workers disagree. [pause] The fix is to seed every "
 "random value from a fixed number, so the pattern is identical on every render, "
 "on every worker. [pause] Reach for the clock, and you break the whole guarantee.", 2),

("s17_bans", "hf_compare",
 {"kicker": "WHAT YOU MAY ANIMATE", "title": "Animate transforms, not layout",
  "foot": "Transforms are cheap and stable; layout properties reflow and desync under a parallel seek.",
  "left": {"head": "Animate these", "bad": False, "c": SHIP,
           "items": ["Transforms: x, y, scale, rotation", "opacity and color", "borderRadius"]},
  "right": {"head": "Never these", "bad": True, "c": WARN,
            "items": ["width / height / top / left", "display / visibility", "measuring layout mid-tween"]}},
 "There are firm rules about what you may animate. [pause] Move things with "
 "transforms — x, y, scale and rotation. Fade with opacity and color. Round "
 "corners with border-radius. [pause] But never animate layout properties — "
 "width, height, top or left. [pause] And never toggle display or visibility to "
 "hide something. [pause] Why so strict? [pause] Transforms are cheap, and they do "
 "not disturb the rest of the page. [pause] Layout changes force the whole page to "
 "reflow — and under a parallel seek, that reflow lands differently on different "
 "workers. [pause] Transform, do not re-layout. It is the single most useful "
 "animation rule here.", 2),

("s18_silentbugs", "hf_bullets",
 {"kicker": "THE SILENT BUGS", "title": "What the checkers can't catch", "color": WARN,
  "foot": "So: these pass every static check, then render wrong — learn them once, and move on.",
  "items": [
     {"h": "An unsized root collapses", "sub": "content piles into the top-left corner", "icon": "\U0001f4d0", "c": WARN},
     {"h": "A background on the root renders black", "sub": "put the fill on a full-bleed child", "icon": "⚫", "c": WARN},
     {"h": "Duplicate ids render blank", "sub": "ids must be unique across the whole page", "icon": "\U0001f194", "c": WARN}]},
 "A handful of bugs slip past every automated check. [pause] Learn them once, and "
 "they will never cost you an hour again. [pause] First: if the root has no "
 "explicit size in pixels, it can collapse to nothing, and your content piles into "
 "the top-left corner. [pause] Second: if you put a full-screen background on the "
 "root element itself, the frame can render pure black — so put the fill on a "
 "child that covers everything instead. [pause] Third: duplicate ids render blank, "
 "so keep every id unique across the whole assembled page. [pause] So, to recap "
 "the contract: it is one file, with timing in the markup, one paused seekable "
 "timeline, and a strict determinism promise. Those are the rules. Now let us make "
 "it move.", 2),

# ------------------------------------------------------------ ch3 · MOTION
("d3", "hf_divider", {"n": 3, "title": "Motion", "sub": "animation that stays seekable", "color": MOT}, "Part three. Motion — and how it stays seekable.", 3),

("s19_seeksafe", "hf_code",
 {"kicker": "SEEK-SAFE MOTION", "title": "Compute positions once, up front", "color": MOT, "codeTitle": "scene.js",
  "foot": "The renderer samples in parallel — a mid-tween measurement is a different number each time.",
  "lines": [
     L(("// once, at setup:", MUT)),
     L(("const ", MUT), ("x0", MOT), (" = ", MUT), ("layout", TXT), (".", MUT), ("cardX", TXT), (";", MUT)),
     L(("// then tween to a constant:", MUT)),
     L(("tl", TXT), (".to(", MUT), ("el", TXT), (", { ", MUT), ("x", MOT), (": x0 })", MUT))],
  "notes": [
     {"text": "pre-calculate layout constants at setup", "c": MOT},
     {"text": "never measure the DOM mid-tween", "c": WARN},
     {"text": "parallel workers each read a different value", "c": HTML}]},
 "Motion has one golden rule that follows straight from determinism. [pause] It "
 "must survive seeking. [pause] So compute your positions once, up front, at setup "
 "time, and store them as plain constants. [pause] Never measure an element in the "
 "middle of a tween — never ask the browser where something is while it is "
 "moving. [pause] Remember why. Different workers render different frames at the "
 "same time. [pause] A mid-tween measurement gives each of them a different answer, "
 "and the motion tears apart. [pause] Measure early, animate to fixed numbers. "
 "[pause] Slightly more discipline up front buys you a render that is stable every "
 "single time.", 3),

("s20_atomic", "hf_bullets",
 {"kicker": "HOW MOTION IS BUILT", "title": "Compose small rules", "color": MOT,
  "foot": "Two to four atomic rules on one paused timeline is most scenes you'll ever build.",
  "items": [
     {"h": "Pick two to four atomic rules", "sub": "fade, rise, stagger, draw-on", "icon": "\U0001f9e9", "c": MOT},
     {"h": "Glue them to one paused timeline", "sub": "less code than a template", "icon": "\U0001f9f5", "c": MOT},
     {"h": "Reach for a blueprint only when complex", "sub": "four-to-five phase choreography", "icon": "\U0001f4d0", "c": HTML}]},
 "You do not hand-animate every property from scratch. [pause] Instead, you "
 "compose. [pause] You pick two to four small, atomic rules — a fade in, a rise "
 "from below, a staggered reveal, a line that draws itself on. [pause] You glue "
 "them onto the single paused timeline, and you are done. [pause] That covers most "
 "scenes you will ever build, and it is less code than starting from a template. "
 "[pause] Only when a scene has a long, four or five phase sequence — a "
 "brand reveal, a data story — do you reach for a ready-made blueprint. [pause] "
 "Small pieces, combined, beat one giant custom animation every time.", 3),

("s21_blueprints", "hf_compare",
 {"kicker": "RULES VS BLUEPRINTS", "title": "Two ways to reach for motion",
  "foot": "Start with rules; load a blueprint only when the choreography earns it.",
  "left": {"head": "Atomic rules", "bad": False, "c": MOT,
           "items": ["The default for most scenes", "Compose two to four", "Fastest, least code"]},
  "right": {"head": "Blueprints", "bad": False, "c": HTML,
            "items": ["Pre-designed multi-phase scenes", "Brand reveal, social proof", "Runnable ground truth"]}},
 "It helps to know the two ways motion is offered to you. [pause] On one side, "
 "atomic rules — the small recipes we just met. They are the default, and you "
 "compose a few of them. [pause] On the other side, blueprints. [pause] A blueprint "
 "is a full, pre-designed scene with four or five phases already choreographed — "
 "a brand reveal, a piece of social proof, a stat sequence. [pause] It is runnable "
 "ground truth you adapt, rather than build from nothing. [pause] The guidance is "
 "simple. Start with rules. [pause] Reach for a blueprint only when the "
 "choreography is complex enough to earn it.", 3),

("s22_gsap", "hf_code",
 {"kicker": "THE DEFAULT RUNTIME", "title": "GSAP drives the timeline", "color": MOT, "codeTitle": "scene.js",
  "foot": "One paused timeline, registered where the renderer can find it and seek it.",
  "lines": [
     L(("const ", MUT), ("tl", MOT), (" = ", MUT), ("gsap", TXT), (".timeline({ ", MUT), ("paused", HTML), (": ", MUT), ("true", VAL), (" })", MUT)),
     L(("tl", MOT), (".from(", MUT), ("\".clip\"", VAL), (", { ", MUT), ("y", HTML), (": 40, ", MUT), ("opacity", HTML), (": 0 })", MUT)),
     L(("window", TXT), (".__timelines[", MUT), ("\"scene\"", VAL), ("] = tl", MUT))],
  "notes": [
     {"text": "one gsap.timeline, paused, built synchronously", "c": MOT},
     {"text": "register it on window.__timelines", "c": HTML},
     {"text": "the renderer finds it there and seeks it", "c": SHIP}]},
 "The default engine is G-SAP — a mature animation library. [pause] You build one "
 "timeline, and you build it paused. [pause] You add your tweens. Here, everything "
 "with the class clip rises forty pixels and fades in. [pause] Then comes the "
 "handshake. [pause] You register that timeline on a global object, under the "
 "composition's id. [pause] That is how the two halves meet. [pause] The renderer "
 "looks on that global, finds your one paused timeline, and seeks it to draw each "
 "frame. [pause] Build it synchronously, at load — never inside a callback or a "
 "promise, or the renderer may look before it exists.", 3),

("s23_adapters", "hf_adapters", {},
 "But G-SAP is not your only option. [pause] Seven different runtimes can drive "
 "motion. [pause] G-SAP handles the vast majority of it. [pause] Lottie plays "
 "animations exported from After Effects. Three-J-S does true 3D, cameras and "
 "shaders. [pause] There is Anime-J-S for lighter tweening, plain C-S-S "
 "keyframes for simple loops, the browser's own Web Animations A-P-I, and even "
 "the G-P-U through TypeGPU. [pause] Here is the beautiful part. [pause] They can "
 "all live in one composition at the same time. [pause] Each one registers itself "
 "on its own global, and a single seek pass drives every one of them together, "
 "perfectly in step.", 3),

("s24_transitions", "hf_bullets",
 {"kicker": "BETWEEN & WITHIN SCENES", "title": "Transitions and text effects", "color": MOT,
  "foot": "So: motion carries the eye — scene to scene, and word to word — and all of it seeks.",
  "items": [
     {"h": "Scene-to-scene transitions", "sub": "CSS-driven, layered between two clips", "icon": "\U0001f39e️", "c": MOT},
     {"h": "Named text-animation effects", "sub": "reveal, decode, kinetic type", "icon": "\U0001f524", "c": HTML},
     {"h": "An audit tool checks the choreography", "sub": "dead zones, stagger, liveness", "icon": "\U0001f4ca", "c": SHIP}]},
 "Motion also lives between scenes, and inside text. [pause] Scene transitions are "
 "C-S-S driven, layered in the handoff as one clip gives way to the next — a "
 "fade, a wipe, a slide. [pause] And there is a whole library of named text "
 "effects: words that reveal, decode character by character, or fly in as kinetic "
 "type. [pause] There is even an audit tool that reads your timeline and flags "
 "problems — dead zones where nothing moves, inconsistent staggers, elements "
 "that never come alive. [pause] So the takeaway for motion: it carries the eye, "
 "scene to scene and word to word — and because it is all one timeline, every "
 "bit of it can be seeked.", 3),

# ------------------------------------------------------------ ch4 · CREATIVE DIRECTION
("d4", "hf_divider", {"n": 4, "title": "Creative Direction", "sub": "make it look produced", "color": MEDIA}, "Part four. Creative direction — making it look produced.", 4),

("s25_designspec", "hf_code",
 {"kicker": "THE DESIGN SPEC", "title": "One source of brand truth", "color": MEDIA, "codeTitle": "frame.md",
  "foot": "Set the palette, type and tone once; every scene reads from the same tokens.",
  "lines": [
     L(("---", MUT)),
     L(("palette", HTML), (": ", MUT), ("[ink, cyan, amber]", VAL)),
     L(("font", HTML), (": ", MUT), ("Space Grotesk", VAL)),
     L(("tone", HTML), (": ", MUT), ("confident, technical", VAL)),
     L(("---", MUT))],
  "notes": [
     {"text": "frame.md holds colors, fonts, tone", "c": MEDIA},
     {"text": "frontmatter tokens are brand truth", "c": HTML},
     {"text": "every scene reads from one place", "c": SHIP}]},
 "Good video looks like one authored piece, not a pile of slides. [pause] That "
 "consistency starts with a design spec — a small file, usually called frame dot "
 "m-d. [pause] Its frontmatter holds your palette, your fonts, and your tone of "
 "voice. [pause] Treat those tokens as brand truth — normative, not suggestions. "
 "[pause] Every scene reads from that one place. [pause] So when you decide the "
 "accent is cyan and the headline font is Space Grotesk, that decision holds from "
 "the first frame to the last, automatically. [pause] Define the look once. Then "
 "stop re-deciding it on every scene.", 4),

("s26_housestyle", "hf_compare",
 {"kicker": "THE HOUSE STYLE", "title": "A frame is not a web page",
  "foot": "Video wants density and detail — interpret the prompt, don't just restyle the words.",
  "left": {"head": "Produced video", "bad": False, "c": SHIP,
           "items": ["Eight to ten elements per scene", "Data readouts, marks, mono detail", "Something moving in every frame"]},
  "right": {"head": "Looks generic", "bad": True, "c": WARN,
            "items": ["One headline on empty space", "A literal restyle of the text", "A frozen, static frame"]}},
 "Here is the biggest mindset shift in the whole course. [pause] A video frame is "
 "not a web page. [pause] Web pages breathe with whitespace and one idea per "
 "screen. Video wants density. [pause] Aim for eight to ten elements in a scene — "
 "data readouts, little registration marks, monospace labels, supporting detail. "
 "[pause] It should look produced, like a motion-graphics studio made it, not "
 "generated. [pause] The trap is taking the prompt literally and just restyling "
 "the words on a slide. [pause] Interpret it instead. Turn the idea into a real "
 "composition — and always keep something moving. [pause] A frozen frame is the "
 "tell of an amateur render.", 4),

("s27_typography", "hf_bullets",
 {"kicker": "TYPE FOR THE SCREEN", "title": "Typography that survives motion", "color": MEDIA,
  "foot": "Big, few, and hierarchical — type is most of the design in a faceless video.",
  "items": [
     {"h": "One clear hierarchy", "sub": "one hero element per scene", "icon": "\U0001f170️", "c": MEDIA},
     {"h": "Big enough to read on a phone", "sub": "video is watched small", "icon": "\U0001f4f1", "c": HTML},
     {"h": "One pairing, used consistently", "sub": "a display face and a mono", "icon": "\U0001f5da️", "c": MOT}]},
 "In a faceless video, type is most of the design — so treat it carefully. "
 "[pause] Give every scene one clear hierarchy, with a single hero element that is "
 "obviously the biggest thing. [pause] If two things compete at the same size, "
 "demote one. [pause] Make it big. Video gets watched on phones, and text that "
 "looks fine on your monitor can be unreadable there. [pause] And pick one pairing "
 "— a strong display face for headlines, a monospace for labels and data — "
 "then use it everywhere. [pause] Big, few, and hierarchical. That alone lifts a "
 "video from homemade to produced.", 4),

("s28_beats", "hf_pipeline",
 {"kicker": "PLANNING A PIECE", "title": "From palette to a plan", "color": MEDIA,
  "foot": "So: decide the look and the rhythm before you write a single line of HTML.",
  "steps": [
     {"label": "palette", "sub": "colors that mean things", "c": MEDIA},
     {"label": "type", "sub": "one pairing, clear hierarchy", "c": HTML},
     {"label": "narration", "sub": "the spine of the piece", "c": MOT},
     {"label": "beats", "sub": "plan the rhythm", "c": SHIP}]},
 "Before you write a line of H-T-M-L, you plan. [pause] You choose a palette — "
 "and not just pretty colors, but colors that mean something, used consistently. "
 "[pause] You pick your type: one pairing, a clear hierarchy. [pause] You write "
 "the narration, because in an explainer the narration is the spine that "
 "everything hangs on. [pause] And you plan the beats — the rhythm of the piece, "
 "scene by scene, so it has momentum and never drags. [pause] So the creative "
 "takeaway: decide the look and the pacing first. [pause] The building goes fast, "
 "and stays consistent, once those decisions are made.", 4),

# ------------------------------------------------------------ ch5 · MEDIA & AUDIO
("d5", "hf_divider", {"n": 5, "title": "Media & Audio", "sub": "voice, music, captions", "color": MEDIA}, "Part five. Media — voice, music, and captions.", 5),

("s29_preflight", "hf_bullets",
 {"kicker": "BEFORE ANY AUDIO", "title": "Check sign-in first", "color": MEDIA,
  "foot": "No credential isn't a silent green light for local — recommend signing in, then let the user choose.",
  "items": [
     {"h": "Run the auth status preflight", "sub": "before generating voice or music", "icon": "\U0001f511", "c": MEDIA},
     {"h": "Signed in → use the hosted providers", "sub": "best quality, word timestamps", "icon": "☁️", "c": SHIP},
     {"h": "Not signed in → offer the choice", "sub": "sign in, or continue offline", "icon": "\U0001f504", "c": HTML}]},
 "Before you generate any audio, there is a preflight. [pause] You check whether "
 "you are signed in to the hosted service. [pause] If you are, you get the best "
 "voices and music, with word-level timing. [pause] If you are not, that is not a "
 "silent signal to quietly fall back to local engines. [pause] You surface the "
 "status, recommend signing in, and let the person decide — sign in, or "
 "explicitly continue offline. [pause] It is a real decision point, not a footnote. "
 "[pause] Once that is settled, everything downstream just works, either way.", 5),

("s30_audioengine", "hf_audioengine", {},
 "All the audio comes from one engine. [pause] You do not hand-roll voice or "
 "music per project. [pause] You write a simple request file — your lines of "
 "text, and the mood you want for the music. [pause] The engine reads it and "
 "writes back a metadata file, plus the actual audio assets on disk. [pause] And "
 "it turns on a single switch: is a cloud credential available? [pause] If yes, it "
 "uses the hosted voice, the hosted music library, and hosted sound effects. "
 "[pause] If no, it quietly falls back to local engines for all three. [pause] "
 "Same request file, same code path, either way. [pause] That is the whole design "
 "— one engine, one switch.", 5),

("s31_ttschain", "hf_ttschain", {},
 "Let us zoom into the voice. [pause] The text-to-speech follows a ladder, and the "
 "first available provider wins. [pause] The hosted provider sits at the top, and "
 "it returns word-level timestamps for free. [pause] Below it, a second cloud "
 "voice. [pause] And at the very bottom, a local model that always works, with no "
 "key and no internet at all. [pause] Now, why do those timestamps matter so much? "
 "[pause] They tell you exactly when each word is spoken. [pause] And that timing "
 "is what drives captions. [pause] When a provider does not hand you timestamps, "
 "the engine transcribes the audio afterward to recover them.", 5),

("s32_bgmsfx", "hf_bullets",
 {"kicker": "MUSIC & SOUND", "title": "Background music and effects", "color": MEDIA,
  "foot": "Name sound effects concretely; a no-match skips, it never blocks the render.",
  "items": [
     {"h": "Music: retrieve, or generate", "sub": "a hosted library, or local generation", "icon": "\U0001f3b5", "c": MEDIA},
     {"h": "Sound effects: retrieve, or a bundled kit", "sub": "ranked by a text query", "icon": "\U0001f50a", "c": MOT},
     {"h": "Effects sit quietly under the voice", "sub": "low volume, never competing", "icon": "\U0001f39a️", "c": HTML}]},
 "Beyond the voice, there is music and sound. [pause] Background music is either "
 "retrieved from a library, or generated locally from a mood prompt. [pause] Sound "
 "effects work the same way — pulled from a library that ranks them by a text "
 "query, or drawn from a small bundled kit. [pause] Because it is a text search, "
 "name your effects concretely. [pause] Say glass shatter, not dramatic sound. "
 "[pause] And do not worry about a miss — if nothing matches, it simply skips, and "
 "never blocks your render. [pause] One more detail: effects sit at a low volume, "
 "tucked under the voice, so they add texture without ever competing with it.", 5),

("s33_captions", "hf_pipeline",
 {"kicker": "CAPTIONS", "title": "From speech to synced words", "color": MEDIA,
  "foot": "Word timings in, styled captions out — karaoke, per-word, right on the beat.",
  "steps": [
     {"label": "TTS", "sub": "generate the voice", "c": MEDIA},
     {"label": "transcribe", "sub": "Whisper, word times", "c": HTML},
     {"label": "words", "sub": "id, text, start, end", "c": MOT},
     {"label": "captions", "sub": "styled, synced", "c": SHIP}]},
 "Captions close the loop. [pause] You generate the voice. [pause] If you do not "
 "already have word timings from the provider, you transcribe the audio to get "
 "them — using a local speech model. [pause] One rule there: always pin the "
 "language, or it may silently translate your audio into English. [pause] "
 "Transcription gives you a flat list of words, each with a start and an end time. "
 "[pause] From that list, captions render in sync — karaoke style, word by word, "
 "landing right on the beat of the speech. [pause] No manual timing, ever.", 5),

("s34_transcribe", "hf_code",
 {"kicker": "THE WORD FORMAT", "title": "Captions consume a flat word array", "color": MEDIA, "codeTitle": "narration.words.json",
  "foot": "So: one small, boring format — id, text, start, end — powers every caption style.",
  "lines": [
     L(("[", MUT)),
     L(("  { ", MUT), ("\"text\"", HTML), (": ", MUT), ("\"hello\"", VAL), (", ", MUT), ("\"start\"", HTML), (": 0.0 },", MUT)),
     L(("  { ", MUT), ("\"text\"", HTML), (": ", MUT), ("\"world\"", VAL), (", ", MUT), ("\"end\"", HTML), (": 0.6 }", MUT)),
     L(("]", MUT))],
  "notes": [
     {"text": "each word: id, text, start, end", "c": MEDIA},
     {"text": "hosted TTS returns these natively", "c": SHIP},
     {"text": "the others chain a transcription pass", "c": HTML}]},
 "It is worth seeing the format the captions actually consume, because it is "
 "delightfully boring. [pause] A flat array of words. [pause] Each word has its "
 "text, a start time, and an end time. That is it. [pause] The hosted voice "
 "returns this natively. The other providers get it from that transcription pass "
 "we just mentioned. [pause] Because every path produces the same simple shape, "
 "the caption styles do not care where the audio came from. [pause] So the media "
 "takeaway: one small format — text, start, end — powers every caption look, "
 "from a quiet lower third to full karaoke.", 5),

# ------------------------------------------------------------ ch6 · SHIP IT
("d6", "hf_divider", {"n": 6, "title": "Ship It", "sub": "check, preview, render", "color": SHIP}, "Part six. Shipping it — check, preview, and render.", 6),

("s35_checks", "hf_pipeline",
 {"kicker": "THREE CHECKERS", "title": "Each catches what the last can't", "color": SHIP,
  "foot": "Static, then runtime, then visual — run all three before you preview.",
  "steps": [
     {"label": "lint", "sub": "structure & attributes", "c": HTML},
     {"label": "validate", "sub": "runtime errors, contrast", "c": MOT},
     {"label": "inspect", "sub": "text spilling, off-canvas", "c": MEDIA}]},
 "Before you ship, three checkers guard the work, and they are layered on purpose. "
 "[pause] Lint reads the file statically — it catches missing ids, overlapping "
 "tracks, timelines you forgot to register. Fast, no browser. [pause] Validate "
 "goes further. It loads the composition in a real headless browser and reports "
 "runtime errors, plus contrast problems that would fail accessibility. [pause] "
 "And inspect seeks through the whole timeline, looking for text spilling out of "
 "its box or running off the canvas. [pause] Static, then runtime, then visual. "
 "[pause] Each one catches what the others simply cannot see. Run all three.", 6),

("s36_conventions", "hf_bullets",
 {"kicker": "FOR AGENTS & CI", "title": "Conventions that keep it scriptable", "color": SHIP,
  "foot": "Machine-readable output and clear exit codes make the whole loop automatable.",
  "items": [
     {"h": "Ask for JSON output", "sub": "structured results for scripts", "icon": "\U0001f4e6", "c": HTML},
     {"h": "Gate on doctor's ok field", "sub": "it always exits zero on purpose", "icon": "\U0001fa7a", "c": MOT},
     {"h": "Strict flags fail the build", "sub": "turn warnings into hard errors in CI", "icon": "\U0001f6d1", "c": WARN}]},
 "If you are driving this from a script or an agent, a few conventions matter. "
 "[pause] Almost every command can emit structured J-S-O-N, so a program can read "
 "the result instead of scraping text. [pause] The environment check always exits "
 "zero on purpose — so in a script you gate on its ok field, not the exit code. "
 "[pause] And strict flags turn lint warnings into hard failures, which is exactly "
 "what you want in continuous integration. [pause] Little things — but they are "
 "what let the whole write-check-render loop run unattended.", 6),

("s37_snapshot", "hf_bullets",
 {"kicker": "THE VISUAL SMOKE TEST", "title": "When you nest, snapshot", "color": SHIP,
  "foot": "The static checkers test files alone — only a real load catches a broken mount.",
  "items": [
     {"h": "The checkers test files in isolation", "sub": "they never mount sub-compositions", "icon": "\U0001f9e9", "c": WARN},
     {"h": "Snapshot loads it like a real render", "sub": "one frame per sub-comp midpoint", "icon": "\U0001f4f8", "c": SHIP},
     {"h": "Then eyeball every frame", "sub": "missing hero, tiny text = a broken mount", "icon": "\U0001f440", "c": HTML}]},
 "There is one blind spot in those checks. [pause] They test each file in "
 "isolation. They never actually assemble a full project and mount its "
 "sub-compositions. [pause] So the moment you nest compositions, you add one step: "
 "snapshot. [pause] Snapshot loads the project exactly the way a real render does, "
 "but it captures only the few frames you ask for — seconds of work, not a full "
 "render. [pause] Then you look at each one. [pause] A missing hero element, or "
 "tiny unstyled text in the corner, means a mount silently broke. [pause] When you "
 "nest, snapshot, and look at your frames.", 6),

("s38_studio", "hf_studio", {},
 "Now you preview. [pause] Preview opens Studio — a real timeline editor, right "
 "in your browser. [pause] And this is not just a player you watch. [pause] You can "
 "scrub the timeline, select any clip, and edit it directly, by hand. [pause] It "
 "is where you and the tool meet, before anything is final. [pause] Now notice what "
 "does not happen here automatically. [pause] Rendering. [pause] The render never "
 "fires on its own. [pause] It waits for you to look, to approve, and to say go. "
 "[pause] That gate is deliberate — a finished render should be a decision, not a "
 "surprise.", 6),

("s39_render", "hf_compare",
 {"kicker": "THE RENDER", "title": "Pick the render for the job",
  "foot": "Draft while you iterate; high to deliver; strict and docker for CI.",
  "left": {"head": "Everyday", "bad": False, "c": SHIP,
           "items": ["draft — fast, while iterating", "high — the final delivery", "verify the file exists after"]},
  "right": {"head": "For CI", "bad": False, "c": HTML,
            "items": ["strict — fail on lint errors", "docker — a reproducible host", "then report feedback once"]}},
 "When it is finally time, you render — and you pick the right kind for the "
 "moment. [pause] While you are iterating, use draft. It is fast and rough, and "
 "that is fine. [pause] For the final delivery, switch to high quality. [pause] In "
 "continuous integration, add strict, so any lint error fails the build, and add "
 "docker, so the render is reproducible across machines. [pause] And afterwards — "
 "always — confirm the file actually exists and has a sensible size. [pause] A "
 "render command that returns is not the same as a render that worked. [pause] "
 "Trust the file on disk, not the exit code.", 6),

("s40_lambda", "hf_lambda", {},
 "What if the video is long, or four-K, or a big batch? [pause] One machine gets "
 "slow, fast. [pause] So HyperFrames can fan the render out to the cloud. [pause] "
 "From your laptop, you kick off a Lambda render. [pause] It splits the frames "
 "into ranges, and hands each range to its own worker. [pause] The workers render "
 "in parallel and write their frames to shared storage. [pause] Then it is all "
 "muxed, once, into a single M-P-4. [pause] For a big job, many small workers "
 "finish far faster than one machine grinding through every frame in order. [pause] "
 "Deploy the stack, render, and tear it down when you are done.", 6),

("s41_registry", "hf_compare",
 {"kicker": "THE REGISTRY", "title": "Install ready-made pieces",
  "foot": "The add command pulls a piece in; blocks nest on a track, components paste in.",
  "left": {"head": "Blocks", "bad": False, "c": HTML,
           "items": ["Standalone sub-compositions", "Own size, duration, timeline", "Wired in by src, on a track"]},
  "right": {"head": "Components", "bad": False, "c": MOT,
            "items": ["Effect snippets, no size", "Pasted into your markup", "A grain overlay, a shimmer"]}},
 "You do not build every piece from scratch. [pause] There is a registry of "
 "reusable parts, installed with a single add command. [pause] They come in two "
 "kinds, and the difference matters when you wire them. [pause] Blocks are "
 "standalone sub-compositions, with their own size, duration and timeline — you "
 "wire them into a host on a track. [pause] Components are smaller effect snippets, "
 "with no size of their own — you paste them right into your markup, like a "
 "film-grain overlay or a shimmer sweep. [pause] And if you build something good, "
 "you can contribute it back for everyone else. [pause] Borrow the piece; keep "
 "your focus on the story.", 6),

("s42_doctor", "hf_bullets",
 {"kicker": "KEEP IT HEALTHY", "title": "The housekeeping that saves you", "color": SHIP,
  "foot": "So: a minute of housekeeping beats an hour lost to a stale environment.",
  "items": [
     {"h": "doctor checks your environment", "sub": "the right Node, FFmpeg, and more", "icon": "\U0001fa7a", "c": SHIP},
     {"h": "Keep the tools and skills current", "sub": "a quick check before a long build", "icon": "\U0001f504", "c": HTML},
     {"h": "Report feedback after a render", "sub": "the project's main signal channel", "icon": "\U0001f4ac", "c": MEDIA}]},
 "Two last habits keep everything running smoothly. [pause] Run doctor to check "
 "your environment — the right version of Node, F-F-mpeg installed, and so on. "
 "[pause] Keep the tools and the skills current, especially right before a long "
 "build, so you are not surprised halfway through. [pause] And after a successful "
 "render, send one line of feedback on how it went. [pause] It is the project's "
 "main signal channel — the way problems get found and fixed. [pause] So the "
 "shipping takeaway: a single minute of housekeeping beats an hour lost to a stale "
 "setup. Check, preview, render, and tell them how it went.", 6),

# ------------------------------------------------------------ ch7 · RECAP
("s43_recap", "hf_recap",
 {"items": [
     "HyperFrames renders video from a single HTML file",
     "data-* attributes declare duration, timing and tracks",
     "One paused timeline per composition — we seek it, never play it",
     "Determinism: seed randomness, animate transforms, never the clock",
     "GSAP by default, but seven runtimes all seek as one",
     "Design for video: dense, hierarchical, always moving",
     "One audio engine: voice, music, effects and captions — cloud or local",
     "Lint, validate, inspect; preview in Studio; then render"],
  "closer": "Video you can write, diff, review, and render — like any other code."},
 "So let us gather the whole thing in one breath. [pause] HyperFrames renders "
 "video from a single H-T-M-L file. [pause] Data attributes declare the duration, "
 "the timing, and the tracks. [pause] Each composition is one paused timeline — "
 "and we seek it, we never play it. [pause] It stays deterministic: seed your "
 "randomness, animate transforms, and never touch the clock. [pause] G-SAP is the "
 "default, but seven runtimes all seek as one. [pause] You design for video — "
 "dense, hierarchical, always moving — not like a web page. [pause] A single "
 "engine gives you voice, music, effects and captions, cloud or local. [pause] And "
 "you check, preview, and only then render. [pause] That is HyperFrames — video "
 "you can write, diff, review and render, like any other code. [pause] Thanks for "
 "watching.", 7),
]

# ============================================================ TTS + EMIT
def ffdur(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                          "-of", "default=noprint_wrappers=1:nokey=1", path],
                         capture_output=True, text=True, check=True)
    return round(float(out.stdout.strip()), 3)

def tts_chunk(path, text):
    samples, sr = kokoro().create(text, voice=VOICE, speed=1.0, lang=LANG)
    sf.write(path, samples, sr, subtype="PCM_16")

def gen_one(seg_id, text):
    fin = os.path.join(FIN, seg_id + ".wav")
    if os.path.exists(fin):
        return fin, ffdur(fin)
    chunks = [c.strip() for c in text.split("[pause]") if c.strip()]
    paths = []
    for ci, chunk in enumerate(chunks):
        cp = os.path.join(RAW, f"{seg_id}_c{ci}.wav")
        if not os.path.exists(cp):
            tts_chunk(cp, chunk)
        paths.append(cp)
    psil = os.path.join(RAW, "_pause.wav")
    if not os.path.exists(psil):
        subprocess.run(["ffmpeg", "-y", "-f", "lavfi", "-i", "anullsrc=r=24000:cl=mono",
                        "-t", str(PAUSE), psil], check=True, capture_output=True)
    clist = os.path.join(RAW, f"{seg_id}_concat.txt")
    with open(clist, "w") as f:
        for i2, p2 in enumerate(paths):
            f.write(f"file '{p2}'\n")
            if i2 < len(paths) - 1:
                f.write(f"file '{psil}'\n")
    af = f"atempo={ATEMPO}" if ATEMPO != 1.0 else "anull"
    subprocess.run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", clist,
                    "-filter:a", af, fin], check=True, capture_output=True)
    return fin, ffdur(fin)

def make_silence():
    silence = os.path.join(FIN, "_sil.wav")
    if not os.path.exists(silence):
        subprocess.run(["ffmpeg", "-y", "-f", "lavfi", "-i", "anullsrc=r=24000:cl=mono", "-t", str(GAP), silence],
                       check=True, capture_output=True)
    return silence

def concat_wavs(wavs, out):
    silence = make_silence()
    clist = os.path.join(RAW, "_master_concat_%s.txt" % os.path.basename(out).replace(".wav", ""))
    with open(clist, "w") as f:
        for i, w in enumerate(wavs):
            f.write(f"file '{w}'\n")
            if i < len(wavs) - 1:
                f.write(f"file '{silence}'\n")
    subprocess.run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", clist, "-c", "copy", out],
                   check=True, capture_output=True)

built = []
print("== TTS ==")
for sid, variant, props, text, part in SEGMENTS:
    path, dur = gen_one(sid, text)
    built.append((sid, variant, props, part, path, dur))
    warn = "  <-- LONG >95s" if dur > 95 else ""
    print(f"  p{part} {sid:14s} {variant:16s} {dur:6.2f}s{warn}", flush=True)

render_list = []
print("\n== per-part artifacts ==")
for part in sorted(PARTS):
    segs = [b for b in built if b[3] == part]
    if not segs:
        continue
    wavs = [b[4] for b in segs]
    part_wav = os.path.join(PUBLIC, f"narration_p{part}.wav")
    concat_wavs(wavs, part_wav)
    cuts, t = [], 0.0
    for (sid, variant, props, _pt, wav, dur) in segs:
        cuts.append({"id": sid, "type": variant, "in_seconds": round(t, 3),
                     "out_seconds": round(t + dur, 3), "props": {**props, "dur": round(dur + GAP, 3)}})
        t += dur + GAP
    part_json = os.path.join(CHDIR, f"p{part}.json")
    json.dump({"cuts": cuts, "audio": {"narration": {"src": f"{PREFIX}/narration_p{part}.wav", "volume": 1.0}}},
              open(part_json, "w"), indent=1)
    render_list.append({"part": part, "json": part_json, "seconds": round(t - GAP, 2), "title": PARTS.get(part, "")})
    print(f"  p{part}  {t-GAP:6.2f}s  {len(cuts)} scenes  -> {os.path.basename(part_json)}")

concat_wavs([b[4] for b in built], os.path.join(PUBLIC, "narration.wav"))
mcuts, t = [], 0.0
for (sid, variant, props, _pt, wav, dur) in built:
    mcuts.append({"id": sid, "type": variant, "in_seconds": round(t, 3),
                  "out_seconds": round(t + dur, 3), "props": {**props, "dur": round(dur + GAP, 3)}})
    t += dur + GAP
json.dump({"cuts": mcuts, "audio": {"narration": {"src": f"{PREFIX}/narration.wav", "volume": 1.0}}},
          open(os.path.join(ROOT, "artifacts", "edit_decisions.json"), "w"), indent=1)
json.dump(render_list, open(os.path.join(ROOT, "artifacts", "render_list.json"), "w"), indent=1)

total = t - GAP
words = sum(len(x[3].split()) for x in SEGMENTS)
print(f"\nMASTER total {total:.2f}s ({total/60:.2f} min) · {len(mcuts)} scenes · ~{words} words · NO captions")
print(f"parts emitted: {[r['part'] for r in render_list]}")
