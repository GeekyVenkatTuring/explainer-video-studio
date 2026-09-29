#!/usr/bin/env python3
"""QA test props — exercises EVERY xa_* variant at worst-case text length.

Each scene gets 30s so the mid-animation still for scene i is frame i*900+540.
Strings here are deliberately at (or just over) the character budgets in
SCREENPLAY_SPEC so layout failures show up at QA rather than in the final render.

  python3 qa_props.py && cd ../../composer && \
  for i in $(seq 0 11); do npx remotion still Explainer /tmp/xa_stills/s$i.png \
    --props=../projects/applied-ai-x-en/artifacts/qa_props.json --frame=$((i*900+540)); done
"""
import json, os

ROOT = os.path.dirname(os.path.abspath(__file__))
os.makedirs(os.path.join(ROOT, "artifacts"), exist_ok=True)
SKY, IDEA, MECH, TODO, RISK = "#7DD3FC", "#FBBF24", "#A78BFA", "#34D399", "#FB7185"

# worst-case-length strings (at the documented budgets)
T150 = "Why Multi-Agent Pipelines Fail for Complex Analytics, and the Control Plane Pattern That Replaces Them Entirely In Production Systems Today"  # 139
TH210 = ("Most agent stacks fail not because the model is weak but because the harness around it never "
         "decides what the model should see, when it should stop, and who owns the retry path here.")   # ~193
TAKE95 = "Start with the harness, not the model — decide context, stopping rules and retries first."      # 88
LINE140 = "Keep the system prompt under two thousand tokens and move worked examples into a retrieved skill file loaded only when the task matches."  # 138

COMMON = {"rank": 12, "total": 15, "ch": 5, "chname": "AGENT HARNESS", "title": T150,
          "handle": "@eng_khairallah1", "likes": "24.1K", "thesis": TH210, "take": TAKE95}

CH_ITEMS = [{"n": i + 1, "title": t} for i, t in enumerate([
    "Become an AI engineer in six months", "Master AI in thirty days",
    "Twenty AI concepts for 2026", "Zero to hireable in four months",
    "Agentic engineer in six weeks, part one", "Graph architect from zero",
    "The fourteen-step graph roadmap", "AI agents: the complete course",
    "Agentic engineer in six weeks, part two", "The twenty-five concepts you need",
    "The AI engineering skills map", "Top fifty Claude skills and repos",
    "Skills map: building and deploying", "Sixty-seven skills, one subscription",
    "Skills map: using coding agents", "The MCP gateway iceberg",
    "Agent plugins are the future", "Fifty MCP servers worth trying",
    "Sixty-nine open-source AI repos", "MCP versus CLI was the wrong debate",
    "Seventeen skills for a fresh setup", "The ultimate skill playbook",
])]

SCENES = [
 ("xa_title", {"kicker": "X / APPLIED AI · COMPILED 12 SEP 2026"}),
 ("xa_divider", {"n": 5, "title": "Agent Harness,\nLoops & Orchestration",
                 "sub": "Twenty-two articles on the layer around the model", "color": MECH, "pips": 8}),
 ("xa_chintro", {"ch": 5, "chname": "AGENT HARNESS", "headline": "Twenty-two articles, ranked by reach",
                 "color": MECH, "items": CH_ITEMS}),                      # worst case: 22 items, 3 cols
 ("xa_article", {**COMMON, "color": MECH,
                 "points": [{"label": "Context is the real budget", "line": LINE140},
                            {"label": "Stopping rules beat prompts", "line": LINE140},
                            {"label": "Retries need an owner", "line": LINE140},
                            {"label": "Tools are the interface", "line": LINE140},
                            {"label": "State lives outside the model", "line": LINE140},
                            {"label": "Observability is not optional", "line": LINE140}]}),  # 6 = new cap
 ("xa_roadmap", {**COMMON, "color": SKY,
                 "phases": [{"label": f"Phase {i+1} long label", "line": "Ninety characters of supporting detail that has to wrap cleanly"}
                            for i in range(8)]}),                          # 8 = two rows
 ("xa_stack", {**COMMON, "color": MECH, "topLabel": "closest to the user", "botLabel": "closest to metal",
               "layers": [{"label": "Layer name goes here", "line": "Eighty-four characters of explanation that fits on exactly one line"}
                          for _ in range(5)]}),   # 5 layers, 84-char lines = new cap
 ("xa_flow", {**COMMON, "color": SKY, "note": "A hundred and thirty characters of caveat text sitting under the pipeline, explaining where this breaks down.",
              "nodes": [{"label": "Retrieve chunks", "sub": "Seventy characters of supporting detail for this node", "emoji": "🔎"},
                        {"label": "Rerank results", "sub": "Seventy characters of supporting detail for this node", "emoji": "📊"},
                        {"label": "Compose context", "sub": "Seventy characters of supporting detail for this node", "emoji": "🧩"},
                        {"label": "Call the model", "sub": "Seventy characters of supporting detail for this node", "emoji": "🤖"},
                        {"label": "Verify output", "sub": "Seventy characters of supporting detail for this node", "emoji": "✅"}]}),
 ("xa_compare", {**COMMON, "color": IDEA, "verdict": "Neither wins outright — the gateway matters more than the protocol you argue about.",
                 "cols": [{"title": "MCP servers, the long version", "c": SKY,
                           "items": ["Eighty characters of a comparison bullet that has to wrap to two lines"] * 5},
                          {"title": "Plain CLI tools, the long one", "c": TODO,
                           "items": ["Eighty characters of a comparison bullet that has to wrap to two lines"] * 5},
                          {"title": "A gateway in front of both", "c": MECH,
                           "items": ["Eighty characters of a comparison bullet that has to wrap to two lines"] * 5}]}),
 ("xa_roster", {**COMMON, "color": TODO, "count": 67, "countLabel": "skills catalogued",
                "items": [{"name": f"tool-name-{i:02d}", "note": "Sixty-four characters of note text here"}
                          for i in range(15)]}),                           # 15 = 3 cols x 5
 ("xa_metric", {**COMMON, "color": IDEA, "note": "A hundred and thirty characters of chart caveat explaining what these numbers do and do not measure here.",
                "bars": [{"label": "vLLM continuous", "v": 24.0, "show": "24.0x"},
                         {"label": "Baseline HF", "v": 1.0, "show": "1.0x"},
                         {"label": "TensorRT-LLM", "v": 18.5, "show": "18.5x"},
                         {"label": "llama.cpp Metal", "v": 6.2, "show": "6.2x"},
                         {"label": "SGLang", "v": 21.3, "show": "21.3x"}]}),
 ("xa_recap", {"n": 1, "chname": "LEARNING PATHS", "heading": "What all ten roadmaps agree on", "color": SKY,
               "items": ["Ninety-three characters of a recap line that must fit on exactly one single line here ok"] * 6,
               "closer": "The timelines are marketing. The syllabus underneath is remarkably consistent."}),
 ("xa_end", {"items": ["Ninety characters of an end-card line that has to sit on one line without wrapping"] * 7,
             "closer": "The roadmaps get you started. The tool layer is where the work actually happens."}),
]

cuts, t = [], 0.0
for sid, props in SCENES:
    cuts.append({"id": sid, "type": sid, "in_seconds": round(t, 3), "out_seconds": round(t + 30, 3),
                 "props": {**props, "dur": 30}})
    t += 30
json.dump({"cuts": cuts}, open(os.path.join(ROOT, "artifacts", "qa_props.json"), "w"), indent=1)
for i, (sid, _) in enumerate(SCENES):
    print(f"  {i:2d}  frame {i*900+540:6d}  {sid}")
print(f"\n{len(SCENES)} variants → artifacts/qa_props.json")
