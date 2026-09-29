#!/usr/bin/env python3
"""STYLE-PACK VIDEO TEMPLATE — copy to projects/<slug>/ and edit PACK / META / BEATS.

Pipeline: narration (Kokoro ONNX af_bella) → per-beat WAVs → captions → AUTO-SYNCED reveal
times → artifacts/chNN.json per chapter (composition `StyleReel`, see skills/14-style-packs.md).

  projects/midcap5-picks-en/.venv/bin/python3 projects/<slug>/build.py        # TTS + JSON
  bash projects/<slug>/render.sh                                             # render + concat

BEATS: (kind, props, narration, chapter). Kinds: title · divider · statement · list · flow ·
chart · versus · recap (props documented in composer/src/styles/core.tsx).
AUTO-SYNC: for list/flow/recap items, bar labels and statement lines, the reveal time is set to
the moment the item is SPOKEN (first word of its heading found in the narration), so visuals
never lag the voice. Give props["ats"] yourself to override. Idempotent: delete a beat's WAV to redo it.
"""
import json, os, re, subprocess
import soundfile as sf
from kokoro_onnx import Kokoro

PACK = "blueprint"                       # system design → blueprint (skills/14)
META = {"brand": "Explainer Forge", "project": "Mem0 memory", "issue": "September 2026", "code": "MEM-0"}
PREFIX = "m0"
CAPTIONS = True
GAP, PAUSE, ATEMPO = 0.5, 0.6, 0.95
PRON = [(r"\bMem0g\b", "mem zero G"), (r"\bMem0\b", "mem zero"), (r"\bLLMs\b", "L L Ms"), (r"\bLLM\b", "L L M"),
        (r"\bBM25\b", "B M twenty five"), (r"\bHNSW\b", "H N S W"), (r"\bMD5\b", "M D five"), (r"\bUUIDs\b", "U U I Ds"),
        (r"\bUUID\b", "U U I D"), (r"\bAPI\b", "A P I"), (r"\bAPIs\b", "A P Is"), (r"\bSQLite\b", "S Q Lite"),
        (r"\bspaCy\b", "spacey"), (r"\bQdrant\b", "quadrant"), (r"\bNeo4j\b", "Neo four J"), (r"\bLoCoMo\b", "Loco mo"),
        (r"\bLongMemEval\b", "Long Mem Eval"), (r"\bBEAM\b", "beam"), (r"\bJSON\b", "jason"), (r"\bids\b", "I Ds"),
        (r"\bid\b", "I D"), (r"\bNOOP\b", "no op"), (r"\bOpenAI's\b", "Open A I's"), (r"\bOpenAI\b", "Open A I"), (r"\bGPT\b", "G P T")]
RUN, OK, BAD = "run", "ok", "bad"

BEATS = [
 # ============================================================ CH0 · INTRO
 ("title", {"kicker": "Agent memory · system design deep dive", "title": "Inside Mem0:\nMemory for AI Agents",
            "subtitle": "architecture · algorithms · benchmarks · the 2026 redesign"},
  "Every conversation with an AI agent starts from zero. It forgets your name, your plans, the bug you fixed yesterday. "
  "[pause] Mem0 is one of the most widely used answers to that problem: a long-term memory layer for agents. [pause] "
  "In the next thirty minutes, we'll take it apart, down to the formulas in the code.", 0),
 ("statement", {"kicker": "The problem", "lines": ["LLMs are stateless.", "Memory is a system", "you have to build."], "accent": 2,
                "sub": "every call starts from an empty context window"},
  "Here's the core problem. [pause] A language model is stateless. Each call sees only what you put into its context "
  "window, and nothing else. [pause] So memory is not something the model has. It's a system you build around the model. "
  "[pause] That system must decide what to remember, how to store it, how to find it again, and what to do when facts "
  "change. [pause] Those four decisions are exactly what this video is about.", 0),
 ("list", {"kicker": "The plan", "title": "Ten parts, one memory system", "items": [
     {"h": "Why memory", "d": "context windows, cost, kinds of memory"}, {"h": "Architecture", "d": "APIs, stores, scopes, data flow"},
     {"h": "Extract and update", "d": "the 2025 two-phase pipeline"}, {"h": "Vectors and HNSW", "d": "how memories are found"},
     {"h": "Graph memory", "d": "entities, triplets, conflicts"}, {"h": "Benchmarks", "d": "accuracy, latency, tokens"},
     {"h": "The 2026 redesign", "d": "add-only writes, hybrid reads"}]},
  "Here's the plan. [pause] First, why agents need memory at all. [pause] Then the architecture: the APIs, the stores, "
  "and how data flows. [pause] Then extract and update, the two-phase pipeline from the twenty twenty five paper. [pause] "
  "Then vectors and HNSW, the algorithm that finds memories fast. [pause] Then graph memory. [pause] Then the benchmarks. "
  "[pause] And finally, the twenty twenty six redesign, which changed almost everything.", 0),

 # ============================================================ CH1 · WHY MEMORY
 ("divider", {"n": 1, "total": 9, "title": "Why Agents Need Memory", "sub": "a context window is not a memory"},
  "Part one. Why agents need memory at all. [pause] Couldn't we just use a bigger context window?", 1),
 ("chart", {"kicker": "Tokens in context per question", "title": "Replaying history is expensive", "type": "bar",
            "bars": [{"label": "Full context", "value": 26031}, {"label": "Mem0", "value": 1764}, {"label": "Mem0 graph", "value": 3616}],
            "note": "LoCoMo benchmark · Chhikara et al., arXiv 2504.19413 (2025)", "ats": [0.3, 0.5, 0.62]},
  "The simplest memory is no memory system at all. Just replay the whole conversation, every time. [pause] It works, and "
  "it's actually the accuracy ceiling in the Mem0 paper. [pause] But look at the cost. On the LoCoMo benchmark, the full "
  "conversation averages about twenty six thousand tokens per question. [pause] Mem0 puts about seventeen hundred tokens "
  "of memories into context instead. Its graph variant, about thirty six hundred. [pause] And conversations only grow. "
  "Replay scales with everything ever said. Memory scales with what actually matters.", 1),
 ("versus", {"kicker": "The trade-off", "title": "Replay everything vs. a memory layer", "winner": "right",
             "left": {"h": "Replay everything", "items": ["cost grows every turn", "latency grows every turn", "details lost in the middle", "empty in a new session"]},
             "right": {"h": "Memory layer", "items": ["distill facts once", "retrieve only what's relevant", "near-constant context size", "persists across sessions"]}},
  "So the trade-off looks like this. [pause] Replaying everything means cost and latency grow with every turn. Long "
  "contexts also bury details in the middle, where models pay less attention. And a new session starts empty anyway. "
  "[pause] A memory layer distills facts once, stores them outside the model, and retrieves only what's relevant, so the "
  "context per question stays roughly constant. [pause] That's the whole bet: pay a little at write time, to save a lot "
  "at read time.", 1),
 ("list", {"kicker": "Borrowed from cognitive science", "title": "Kinds of memory an agent needs", "items": [
     {"h": "Working memory", "d": "the context window itself"}, {"h": "Episodic memory", "d": "what happened, and when"},
     {"h": "Semantic memory", "d": "stable facts and preferences"}, {"h": "Procedural memory", "d": "learned routines, know-how"}]},
  "It helps to borrow from cognitive science. [pause] Working memory is the context window itself: small and fast. "
  "[pause] Episodic memory records what happened, and when, like the trip to Goa last March. [pause] Semantic memory holds "
  "stable facts and preferences: the user is vegetarian, and prefers Python. [pause] Procedural memory is know-how: routines "
  "an agent has learned for doing a task. [pause] Mem0 mostly manages the middle two, and it also offers a procedural "
  "mode that summarizes an agent's execution history.", 1),
 ("list", {"kicker": "The landscape", "title": "Other ways to give agents memory", "items": [
     {"h": "MemGPT / Letta", "d": "OS-style paging; the agent edits its own memory"}, {"h": "Zep", "d": "a temporal knowledge graph of facts"},
     {"h": "A-Mem", "d": "linked, self-organizing notes"}, {"h": "LangMem", "d": "LangChain's memory toolkit"},
     {"h": "RAG over chat logs", "d": "chunk, embed, retrieve raw text"}]},
  "Mem0 isn't the only design. [pause] MemGPT, now called Letta, treats the context window like an operating system "
  "treats RAM, and lets the agent page memories in and out with its own function calls. [pause] Zep builds a temporal "
  "knowledge graph. [pause] A-Mem organizes memories as linked, self-evolving notes. [pause] LangMem is LangChain's "
  "memory toolkit. [pause] And plain RAG simply chunks old conversations and retrieves raw text. [pause] The Mem0 paper "
  "benchmarks against all of these, and we'll see how they compare in part seven.", 1),

 # ============================================================ CH2 · ARCHITECTURE
 ("divider", {"n": 2, "total": 9, "title": "The Architecture", "sub": "one API, several stores"},
  "Part two. The architecture. [pause] Before any algorithm, let's see the moving parts.", 2),
 ("x_diagram", {"kicker": "Components", "title": "What sits behind the Memory API", "nodes": [
     {"id": "app", "h": "Your agent", "d": "chat, tools, workflows", "x": 110, "y": 460, "w": 300},
     {"id": "api", "h": "Memory API", "d": "add · search · get · update · delete · history", "x": 500, "y": 440, "w": 440, "hh": 170},
     {"id": "llm", "h": "LLM", "d": "reads turns, extracts facts", "x": 1180, "y": 220, "w": 560, "hh": 116},
     {"id": "emb", "h": "Embedder", "d": "text → 1,536-dim vector", "x": 1180, "y": 350, "w": 560, "hh": 116},
     {"id": "vec", "h": "Vector store", "d": "the memories · Qdrant by default", "x": 1180, "y": 480, "w": 560, "hh": 116},
     {"id": "ent", "h": "Entity store", "d": "entities → linked memories (2026)", "x": 1180, "y": 610, "w": 560, "hh": 116},
     {"id": "db", "h": "SQLite", "d": "history of changes + last messages", "x": 1180, "y": 740, "w": 560, "hh": 116}],
   "edges": [["app", "api"], ["api", "llm"], ["api", "emb"], ["api", "vec"], ["api", "ent"], ["api", "db"]]},
  "Your agent talks to one object: the Memory API. It exposes add, search, get, update, delete, and history. [pause] "
  "Behind it sit a few components. An LLM, which reads conversations and extracts facts. [pause] An embedder, which turns "
  "text into vectors. By default, OpenAI's text embedding three small, with fifteen hundred and thirty six dimensions. "
  "[pause] A vector store holding the memories themselves: Qdrant by default, with more than twenty alternatives. [pause] "
  "Since twenty twenty six, a second collection holds entity records. [pause] And a small SQLite database keeps the "
  "history of every change, plus the last few messages of each session.", 2),
 ("flow", {"kicker": "Scoping", "title": "Every memory has an owner", "steps": [
     {"h": "User id", "d": "whose memory it is"}, {"h": "Agent id", "d": "which agent owns it"},
     {"h": "Run id", "d": "one session or task"}, {"h": "Metadata", "d": "custom filters on top"}]},
  "Every memory is scoped. [pause] A user id says whose memory it is. An agent id says which agent it belongs to. A run id "
  "narrows it to one session or task. [pause] You can combine them, and add metadata filters on top. [pause] Scoping is "
  "enforced on every read and write, so one user's memories never leak into another user's search. [pause] In the code, "
  "identity can only be set through these parameters, never through free-form metadata.", 2),
 ("x_code", {"kicker": "Data model", "title": "What one stored memory looks like", "file": "vector store point", "lines": [
     "id:        \"8f3c…\"                 # UUID",
     "vector:    [0.021, -0.113, …]       # 1,536 floats",
     "payload:",
     "  data:            \"Lives in Bengaluru\"",
     "  hash:            md5(data)",
     "  text_lemmatized: \"live bengaluru\"",
     "  user_id:         \"riya\"",
     "  created_at / updated_at:  ISO-8601 UTC",
     "  expiration_date: optional",
     "history row: memory_id · old · new · event · time"],
   "notes": [{"a": 0, "b": 1, "at": 0.08, "t": "a UUID and the embedding vector"},
             {"a": 3, "b": 5, "at": 0.28, "t": "the text, its hash, and a lemmatized copy for keyword search"},
             {"a": 6, "b": 8, "at": 0.52, "t": "scope, timestamps, and an optional expiry"},
             {"a": 9, "b": 9, "at": 0.74, "t": "SQLite logs every change"}]},
  "What does one memory actually look like? [pause] In the vector store, it's a point: a UUID, and the embedding vector. "
  "[pause] Its payload holds the text itself, a hash of that text for deduplication, and a lemmatized copy used for "
  "keyword search. [pause] It also stores the scope, like the user id, creation and update timestamps, and an optional "
  "expiration date, after which the memory is hidden from search. [pause] Separately, SQLite logs every change as a "
  "history row: which memory, the old text, the new text, the event, and when.", 2),
 ("flow", {"kicker": "Runtime", "title": "Two paths: write and read", "steps": [
     {"h": "Conversation", "d": "a new turn arrives"}, {"h": "Extract", "d": "facts from the turn"}, {"h": "Store", "d": "embed, save, link"},
     {"h": "Question", "d": "before the agent answers"}, {"h": "Rank", "d": "score stored memories"}, {"h": "Return", "d": "top few into the prompt"}]},
  "At runtime there are two paths. [pause] The write path: after each conversation turn, add extracts facts, embeds them, "
  "and stores them. [pause] The read path: before the agent answers a question, search embeds it, ranks memories, and "
  "returns the top few into the prompt. [pause] Writes can run in the background, off the user's critical path. Reads must "
  "be fast, because the user is waiting. [pause] Keep that asymmetry in mind. It drives nearly every design choice.", 2),

 # ============================================================ CH3 · EXTRACTION (2025)
 ("divider", {"n": 3, "total": 9, "title": "Phase One: Extract", "sub": "the 2025 paper architecture"},
  "Part three. The twenty twenty five architecture, from the Mem0 paper. Phase one: extraction.", 3),
 ("x_diagram", {"kicker": "Extraction phase", "title": "Building the extraction prompt", "nodes": [
     {"id": "pair", "h": "New message pair", "d": "user turn + assistant reply", "x": 120, "y": 250, "w": 380},
     {"id": "sum", "h": "Summary S", "d": "whole conversation · async refresh", "x": 120, "y": 450, "w": 380},
     {"id": "last", "h": "Last 10 messages", "d": "recency window, m = 10", "x": 120, "y": 650, "w": 380},
     {"id": "prompt", "h": "Prompt P", "d": "(S, recent, m t−1, m t)", "x": 680, "y": 450, "w": 360},
     {"id": "llm", "h": "LLM φ", "d": "GPT-4o-mini in the paper", "x": 1150, "y": 450, "w": 300},
     {"id": "facts", "h": "Candidate facts Ω", "d": "ω1, ω2, … ωn", "x": 1540, "y": 450, "w": 290}],
   "edges": [["pair", "prompt"], ["sum", "prompt"], ["last", "prompt"], ["prompt", "llm"], ["llm", "facts"]]},
  "The pipeline is incremental. It runs every time a new message pair arrives, usually the user's message and the "
  "assistant's reply. [pause] To understand that pair, it builds a prompt from three things. [pause] A running summary of "
  "the whole conversation, which gives global context. [pause] The last ten messages, which add local detail the summary "
  "may have dropped. [pause] And the new pair itself. [pause] Then an LLM, GPT four o mini in the paper, reads this prompt "
  "and returns a set of candidate facts. [pause] The summary is refreshed by a separate asynchronous job, so it never "
  "slows extraction down.", 3),
 ("x_code", {"kicker": "Example", "title": "From a conversation to atomic facts", "file": "extract(pair)", "lines": [
     "user:      I moved to Bengaluru for a new job.",
     "assistant: Congratulations! How is the new role?",
     "user:      Busy! I'm vegetarian, so lunch nearby is easy.",
     "", "→ LLM extraction returns:", "{\"facts\": [",
     "   \"Moved to Bengaluru for a new job\",", "   \"Is vegetarian\"", "]}"],
   "notes": [{"a": 0, "b": 2, "at": 0.12, "t": "the new turn, plus summary and recent context"},
             {"a": 5, "b": 8, "at": 0.38, "t": "short, self-contained facts, as JSON"},
             {"a": 1, "b": 1, "at": 0.62, "t": "greetings and small talk are dropped"},
             {"a": 6, "b": 7, "at": 0.8, "t": "atomic: one idea per fact"}]},
  "Here's what that looks like. [pause] The user says they moved to Bengaluru for a new job, and mentions they're "
  "vegetarian. [pause] The extractor returns short, self-contained facts, as JSON. Moved to Bengaluru for a new job. Is "
  "vegetarian. [pause] Notice what it drops: greetings, filler, and the assistant's small talk. [pause] Good facts are "
  "atomic, one idea each, so they can be matched, updated, and deleted independently later.", 3),
 ("list", {"kicker": "The extraction prompt", "title": "What the extractor is told to look for", "items": [
     {"h": "Preferences", "d": "likes, dislikes, food, brands"}, {"h": "Personal details", "d": "names, relationships, key dates"},
     {"h": "Plans and intentions", "d": "trips, goals, upcoming events"}, {"h": "Health and wellness", "d": "diet, fitness, conditions"},
     {"h": "Professional details", "d": "job, skills, career goals"}, {"h": "Everything else", "d": "hobbies, favourite books, services"}]},
  "The extraction prompt is specific about what counts as memorable. [pause] Preferences: likes, dislikes, and "
  "favourites. [pause] Personal details, like names, relationships, and important dates. [pause] Plans and intentions: "
  "upcoming trips, goals, and events. [pause] Health and wellness, like diet and fitness routines. [pause] Professional "
  "details: job titles, skills, and career goals. [pause] And everything else worth keeping, like hobbies or favourite "
  "books. [pause] You can also replace this prompt with your own instructions, to focus on your domain.", 3),

 # ============================================================ CH4 · UPDATE (2025)
 ("divider", {"n": 4, "total": 9, "title": "Phase Two: Update", "sub": "ADD · UPDATE · DELETE · NOOP"},
  "Part four. Phase two: update. This is where the memory stays consistent.", 4),
 ("x_diagram", {"kicker": "Update phase", "title": "One decision per candidate fact", "nodes": [
     {"id": "f", "h": "Candidate fact", "d": "ω from extraction", "x": 110, "y": 430, "w": 300},
     {"id": "emb", "h": "Embed", "d": "fact → vector", "x": 470, "y": 430, "w": 240},
     {"id": "top", "h": "10 most similar", "d": "existing memories, s = 10", "x": 770, "y": 430, "w": 330},
     {"id": "tool", "h": "Tool call", "d": "LLM chooses one operation", "x": 1160, "y": 430, "w": 300},
     {"id": "add", "h": "ADD", "d": "nothing equivalent", "x": 1540, "y": 220, "w": 280},
     {"id": "upd", "h": "UPDATE", "d": "enriches a memory", "x": 1540, "y": 380, "w": 280},
     {"id": "del", "h": "DELETE", "d": "contradicts a memory", "x": 1540, "y": 540, "w": 280},
     {"id": "noop", "h": "NOOP", "d": "known or irrelevant", "x": 1540, "y": 700, "w": 280}],
   "edges": [["f", "emb"], ["emb", "top"], ["top", "tool"], ["tool", "add"], ["tool", "upd"], ["tool", "del"], ["tool", "noop"]]},
  "Each candidate fact is handled on its own. [pause] First it's embedded, and the vector store returns the ten most "
  "similar existing memories. [pause] The fact and those neighbours go to the LLM through a function call. The paper "
  "calls it a tool call. [pause] The LLM picks one of four operations. ADD, when nothing equivalent exists. UPDATE, when "
  "the fact enriches an existing memory. DELETE, when it contradicts one. And NOOP, when it's already known, or "
  "irrelevant. [pause] There's no separate classifier. The LLM's own reasoning makes the decision.", 4),
 ("x_store", {"kicker": "Worked example", "title": "The memory store, turn by turn", "mode": "v2", "steps": [
     {"say": "I live in Pune and I love cricket.", "ops": [["ADD", "m1", "Lives in Pune"], ["ADD", "m2", "Loves cricket"]], "at": 0.08},
     {"say": "My name is Riya.", "ops": [["ADD", "m3", "Name is Riya"]], "at": 0.22},
     {"say": "I've just moved to Bengaluru.", "ops": [["DELETE", "m1", "Lives in Pune"], ["ADD", "m4", "Lives in Bengaluru"]], "at": 0.32},
     {"say": "I love cricket, especially Test matches.", "ops": [["UPDATE", "m2", "Loves cricket, especially Test matches"]], "at": 0.55},
     {"say": "Did I mention I love cricket?", "ops": [["NOOP", "m2", ""]], "at": 0.72}]},
  "Let's run it on a real sequence. [pause] Riya says she lives in Pune and loves cricket. Two ADDs. [pause] She gives her "
  "name. Another ADD. [pause] Later she says she's moved to Bengaluru. That contradicts the Pune memory, so it's deleted, "
  "and the new city is added. [pause] She adds that she especially loves Test matches. That enriches an existing memory, "
  "so it's an UPDATE. [pause] And when she repeats that she loves cricket, nothing changes. NOOP. [pause] Every step is "
  "also written to a history table, so you can see how each memory evolved.", 4),
 ("x_code", {"kicker": "Algorithm 1 + implementation", "title": "The update loop, and one clever trick", "file": "update_memory(F, M)", "lines": [
     "for f in F:                               # each candidate fact",
     "    op = classify_operation(f, M)         # the LLM decides",
     "    if op == ADD:    M.add(new_id(), f)",
     "    if op == UPDATE: m = related(f, M)",
     "        if info(f) > info(m): M.replace(m, f)",
     "    if op == DELETE: M.remove(contradicted(f, M))",
     "    if op == NOOP:   pass",
     "# the LLM sees ids \"0\",\"1\",\"2\", never UUIDs",
     "{\"id\": \"1\", \"text\": \"Loves cricket, esp. Tests\",",
     " \"event\": \"UPDATE\", \"old_memory\": \"Loves cricket\"}"],
   "notes": [{"a": 0, "b": 1, "at": 0.1, "t": "classify each fact against its neighbours"},
             {"a": 3, "b": 4, "at": 0.2, "t": "UPDATE only if the new fact carries more information"},
             {"a": 7, "b": 7, "at": 0.36, "t": "UUIDs → short integers: fewer copying errors"},
             {"a": 8, "b": 9, "at": 0.66, "t": "JSON out: id, text, event, old memory"}]},
  "Here's the logic from the paper's Algorithm One. [pause] For each fact, classify the operation. An UPDATE only "
  "replaces the old memory if the new one carries more information. [pause] Now, one clever implementation detail. "
  "Memory ids are long UUIDs, and LLMs are bad at copying them exactly. So before the prompt, Mem0 maps them to short "
  "integers, zero, one, two, and maps them back afterwards. [pause] The model returns JSON: an id, the new text, the "
  "event, and the old memory, for the audit trail. [pause] A cheap trick, with a big reliability win.", 4),
 ("statement", {"kicker": "A design risk", "lines": ["An LLM decides", "what to forget."], "accent": 1,
                "sub": "DELETE is irreversible in the store · the history table is the only undo"},
  "There's a risk hiding in this design. [pause] An LLM decides what to forget. If it misreads a sarcastic remark, or a "
  "hypothetical, it can delete a true memory. [pause] LLM decisions also vary from run to run, so the same conversation "
  "can produce slightly different memory stores. [pause] The history table is the safety net: every change is recorded, "
  "so a bad delete can be audited, and undone. [pause] Keep this risk in mind. It's one reason the design changed in twenty "
  "twenty six.", 4),

 # ============================================================ CH5 · VECTORS & HNSW
 ("divider", {"n": 5, "total": 9, "title": "Finding Memories", "sub": "embeddings, cosine similarity, HNSW"},
  "Part five. How does the system find the ten most similar memories, fast? Let's go inside the vector search.", 5),
 ("x_cosine", {"kicker": "Embeddings", "title": "Similar meaning, similar direction",
               "query": {"label": "Where does Riya live?", "v": [0.93, 0.36]},
               "mems": [{"label": "Lives in Bengaluru", "v": [0.97, 0.22]}, {"label": "Name is Riya", "v": [0.62, 0.78]},
                        {"label": "Loves cricket", "v": [0.05, 0.99]}, {"label": "Is vegetarian", "v": [-0.45, 0.89]}], "k": 2},
  "An embedding model maps text to a point in space, fifteen hundred and thirty six numbers long, where similar meanings "
  "land close together. [pause] Closeness is measured with cosine similarity: the cosine of the angle between two vectors. "
  "Same direction gives one. Unrelated gives nearly zero. [pause] Here, in a two dimensional sketch, the question, where "
  "does Riya live, points almost the same way as, lives in Bengaluru. [pause] Cricket and vegetarian point elsewhere. "
  "[pause] Rank by cosine, keep the top k, and you have your candidates. The math is simple. The hard part is doing it "
  "over millions of vectors.", 5),
 ("statement", {"kicker": "Why not brute force?", "lines": ["Compare the query", "with every memory?"], "accent": 1,
                "big": "1.5 billion", "sub": "1,000,000 memories × 1,536 dimensions ≈ 1.5 billion multiply-adds, per query"},
  "The naive approach compares the query with every stored vector. [pause] With a million memories of fifteen hundred and "
  "thirty six dimensions, that's about one and a half billion multiply-adds, for a single search. [pause] Fine for a "
  "demo. Too slow for agents answering in real time, across thousands of users. [pause] So vector databases use "
  "approximate nearest neighbour indexes. The most popular is HNSW.", 5),
 ("x_hnsw", {"kicker": "HNSW · computed", "title": "Hierarchical Navigable Small World", "n": 90, "seed": 7},
  "HNSW stands for Hierarchical Navigable Small World. [pause] Picture several layers of graphs. The bottom layer contains "
  "every vector, each linked to its nearest neighbours. [pause] Each layer above keeps a random, much smaller sample, like "
  "express lanes. [pause] A search starts at the top, at a fixed entry point. It greedily hops to whichever neighbour is "
  "closer to the query, until no neighbour improves. [pause] Then it drops a layer, and continues from there. [pause] At "
  "the bottom, it keeps a candidate list of size e f, and returns the best k. [pause] Instead of scanning every point, it "
  "visits only a few dozen. The cost grows roughly with the logarithm of the collection size.", 5),
 ("chart", {"kicker": "HNSW insertion · computed for N = 1,000,000, M = 16", "title": "Expected nodes per layer", "type": "bar",
            "bars": [{"label": "Layer 0", "value": 1000000}, {"label": "Layer 1", "value": 62500}, {"label": "Layer 2", "value": 3906},
                     {"label": "Layer 3", "value": 244}, {"label": "Layer 4", "value": 15}],
            "note": "level = floor(−ln(U) · mL), mL = 1 / ln(M) → P(level ≥ l) = M^−l", "ats": [0.3, 0.42, 0.5, 0.58, 0.64]},
  "How does a vector get into this structure? [pause] When a new vector is inserted, it draws a random top layer, using "
  "minus the log of a uniform random number, scaled by one over the log of M. [pause] The result: the chance of reaching "
  "layer l falls as M to the minus l. [pause] With a million vectors and M of sixteen, every vector is on layer zero. About "
  "sixty two thousand reach layer one. Around thirty nine hundred reach layer two. About two hundred and forty four reach "
  "layer three. And only about fifteen reach layer four. [pause] At each layer, the new vector searches for its nearest "
  "neighbours, and links to up to M of them. That's why lookups take only a handful of hops per layer.", 5),
 ("list", {"kicker": "Qdrant's defaults", "title": "The knobs that trade speed for recall", "items": [
     {"h": "M = 16", "d": "links per node · more = better recall, more RAM"}, {"h": "ef_construct = 100", "d": "candidates while building the graph"},
     {"h": "ef at search", "d": "candidates while searching · defaults to ef_construct"}, {"h": "Payload filters", "d": "user / agent scoping applied inside the search"}],
   "ats": [0.12, 0.34, 0.52, 0.7]},
  "Qdrant, Mem0's default store, exposes a few knobs. [pause] M, the number of links per node: sixteen by default. More "
  "links give better recall, but use more memory. [pause] e f construct, a hundred by default: how many candidates to "
  "consider while building. [pause] e f at search time, which by default matches e f construct. [pause] And payload "
  "filters, which apply the user and agent scoping during the search itself, rather than after it.", 5),

 # ============================================================ CH6 · GRAPH
 ("divider", {"n": 6, "total": 9, "title": "Graph Memory", "sub": "Mem0g: entities, relations, conflicts"},
  "Part six. The graph variant, Mem0g. Flat facts can't express how things relate. Graphs can.", 6),
 ("x_graph", {"kicker": "Mem0g", "title": "Memory as a directed, labeled graph",
              "nodes": [{"id": "riya", "label": "Riya", "type": "Person", "x": 760, "y": 520},
                        {"id": "pune", "label": "Pune", "type": "City", "x": 330, "y": 330},
                        {"id": "blr", "label": "Bengaluru", "type": "City", "x": 1300, "y": 330},
                        {"id": "cricket", "label": "Cricket", "type": "Sport", "x": 330, "y": 760},
                        {"id": "job", "label": "Fintech startup", "type": "Organization", "x": 1300, "y": 760}],
              "edges": [{"a": "riya", "b": "pune", "r": "lives_in", "at": 0.3, "invalid": 0.8},
                        {"a": "riya", "b": "cricket", "r": "loves", "at": 0.34},
                        {"a": "riya", "b": "job", "r": "works_at", "at": 0.55},
                        {"a": "riya", "b": "blr", "r": "lives_in", "at": 0.74}]},
  "Mem0g stores memory as a directed, labeled graph. [pause] Nodes are entities: people, places, objects, events, each "
  "with a type, an embedding, and a creation time. [pause] Edges are relationships, stored as triplets: source, relation, "
  "destination. Riya, lives in, Pune. Riya, loves, cricket. [pause] Extraction happens in two LLM stages. An entity "
  "extractor finds the entities and their types. Then a relationship generator decides which pairs are connected, and "
  "labels the edge. [pause] When Riya moves to Bengaluru, a conflict detector notices the old lives in edge. [pause] It "
  "isn't deleted. It's marked invalid. So the graph still knows where she used to live, which is exactly what temporal "
  "questions need.", 6),
 ("x_diagram", {"kicker": "Graph update", "title": "Entity resolution for each new triplet", "nodes": [
     {"id": "t", "h": "New triplet", "d": "(Riya, lives_in, Bengaluru)", "x": 110, "y": 440, "w": 360},
     {"id": "e", "h": "Embed both ends", "d": "source + destination", "x": 540, "y": 440, "w": 320},
     {"id": "s", "h": "Similarity > t?", "d": "search existing nodes", "x": 930, "y": 440, "w": 320},
     {"id": "r", "h": "Reuse node", "d": "already known", "x": 1330, "y": 280, "w": 280},
     {"id": "c", "h": "Create node", "d": "0, 1 or 2 new nodes", "x": 1330, "y": 600, "w": 280},
     {"id": "a", "h": "Add edge", "d": "with metadata", "x": 1640, "y": 440, "w": 200}],
   "edges": [["t", "e"], ["e", "s"], ["s", "r"], ["s", "c"], ["r", "a"], ["c", "a"]]},
  "Integrating a new triplet is careful work. [pause] Mem0g embeds the source and destination entities, and searches for "
  "existing nodes whose similarity is above a threshold t. [pause] If a node already exists, it's reused. If not, a new "
  "node is created. That can mean zero, one, or two new nodes. [pause] Then the edge is added, with metadata. [pause] This "
  "is entity resolution: Bengaluru and Bangalore should end up as one node, not two.", 6),
 ("versus", {"kicker": "Graph retrieval", "title": "Two strategies, run together",
             "left": {"h": "Entity-centric", "items": ["find entities in the query", "match them to anchor nodes", "walk incoming + outgoing edges", "return the subgraph"]},
             "right": {"h": "Semantic triplet", "items": ["embed the whole query", "score every triplet's text", "keep scores above a threshold", "rank by similarity"]}},
  "Retrieval uses two strategies at once. [pause] Entity-centric search finds the entities mentioned in the question, "
  "matches them to nodes, and walks their incoming and outgoing edges to build a small subgraph. [pause] Semantic triplet "
  "search embeds the whole question, scores it against a text encoding of every triplet, and keeps those above a "
  "relevance threshold. [pause] The first is precise for questions about a specific thing. The second catches broader "
  "questions. [pause] In the paper, the graph lives in Neo4j.", 6),
 ("flow", {"kicker": "Entity-centric retrieval, step by step", "title": "Where does Riya work?", "steps": [
     {"h": "Find entities", "d": "“Riya” in the question"}, {"h": "Match node", "d": "embedding similarity → Riya"},
     {"h": "Walk edges", "d": "lives_in, loves, works_at"}, {"h": "Filter", "d": "skip invalidated edges"}, {"h": "Answer", "d": "works_at → Fintech startup"}]},
  "Let's walk one question through the entity-centric path. Where does Riya work? [pause] First, find entities in the "
  "question: Riya. [pause] Match that name to a node, using embedding similarity. [pause] Walk its edges: lives in, "
  "loves, works at. [pause] Filter out edges that have been invalidated, so the old Pune address doesn't confuse the "
  "answer. [pause] The works at edge leads to the fintech startup, and that small subgraph goes to the answering model as "
  "context.", 6),

 # ============================================================ CH7 · BENCHMARKS
 ("divider", {"n": 7, "total": 9, "title": "Benchmarks", "sub": "what the 2025 paper measured"},
  "Part seven. Does any of this work? Here's how the paper measured it.", 7),
 ("list", {"kicker": "The LoCoMo benchmark", "title": "How memory systems were tested", "items": [
     {"h": "10 long conversations", "d": "~600 turns and ~26,000 tokens each"}, {"h": "~200 questions each", "d": "single-hop · multi-hop · temporal · open-domain"},
     {"h": "LLM-as-a-Judge", "d": "a stronger model grades answers · 10 runs"}, {"h": "Latency and tokens", "d": "p50 / p95 time, context size"}],
   "ats": [0.08, 0.3, 0.52, 0.76]},
  "The benchmark is LoCoMo. [pause] Ten very long conversations, each around six hundred dialogue turns and twenty six "
  "thousand tokens, spread across many sessions. [pause] Each comes with about two hundred questions: single-hop, "
  "multi-hop, temporal, and open-domain. [pause] Word-overlap metrics can't tell, born in March, from, born in July. So "
  "the headline metric is an LLM judge, averaged over ten runs. [pause] They also measured what production cares about: "
  "latency at the median and the ninety fifth percentile, and tokens.", 7),
 ("chart", {"kicker": "LLM-as-a-Judge, overall (%)", "title": "Accuracy on LoCoMo", "type": "bar",
            "bars": [{"label": "OpenAI", "value": 52.9}, {"label": "LangMem", "value": 58.1}, {"label": "Zep", "value": 66.0},
                     {"label": "Mem0", "value": 66.9}, {"label": "Mem0 graph", "value": 68.4}, {"label": "Full context", "value": 72.9}],
            "note": "J score, mean of 10 runs · Chhikara et al. 2025, Table 2", "ats": [0.12, 0.2, 0.27, 0.36, 0.44, 0.58]},
  "Here's accuracy, as graded by the LLM judge. [pause] OpenAI's built-in memory scores fifty two point nine. LangMem, "
  "fifty eight point one. Zep, sixty six. [pause] Mem0 scores sixty six point nine, and the graph variant, sixty eight "
  "point four. [pause] Full context still wins, at seventy two point nine, because it sees everything. [pause] Relative "
  "to OpenAI's memory, Mem0 is about twenty six percent better.", 7),
 ("chart", {"kicker": "p95 total response time (s)", "title": "Latency where users feel it", "type": "bar", "unit": " s",
            "bars": [{"label": "Mem0", "value": 1.44}, {"label": "Mem0 graph", "value": 2.59}, {"label": "Zep", "value": 2.93}, {"label": "Full context", "value": 17.12}],
            "note": "95th-percentile search + answer latency · Chhikara et al. 2025", "ats": [0.18, 0.26, 0.33, 0.44]},
  "Now latency: the time until the user gets an answer, at the ninety fifth percentile. [pause] Mem0: one point four four "
  "seconds. The graph variant: two point five nine. Zep: two point nine three. [pause] Full context: seventeen seconds. "
  "[pause] That's Mem0's real pitch. About ninety one percent lower tail latency than full context, and over ninety "
  "percent fewer tokens, for a few points of accuracy.", 7),
 ("chart", {"kicker": "LLM-as-a-Judge by question type (%)", "title": "Single-hop and multi-hop", "type": "bar",
            "bars": [{"label": "1-hop OpenAI", "value": 63.8}, {"label": "1-hop Mem0", "value": 67.1}, {"label": "Multi OpenAI", "value": 42.9},
                     {"label": "Multi Zep", "value": 41.4}, {"label": "Multi Mem0", "value": 51.2}, {"label": "Multi graph", "value": 47.2}],
            "note": "Chhikara et al. 2025, Table 1 · J scores, mean of 10 runs", "ats": [0.14, 0.24, 0.42, 0.5, 0.58, 0.66]},
  "Break it down by question type. [pause] Single-hop questions need one fact: OpenAI's memory scores sixty three point "
  "eight, and Mem0 sixty seven point one. [pause] Multi-hop questions combine facts from different sessions, and they're "
  "much harder. OpenAI drops to forty two point nine, and Zep to forty one point four. [pause] Mem0 holds fifty one point "
  "two, and the graph variant forty seven point two. [pause] Atomic facts, retrieved together, turn out to be a strong "
  "baseline for combining information.", 7),
 ("statement", {"kicker": "The subtler story", "lines": ["Graphs help with time,", "not always with hops."], "accent": 0,
                "big": "58.1 vs 55.5", "sub": "temporal J: Mem0 graph 58.13 · Mem0 55.51 · Zep 49.31 · OpenAI 21.71"},
  "The categories tell a subtler story. [pause] On temporal questions, the graph variant scores fifty eight point one, "
  "ahead of flat Mem0 at fifty five and a half, and far ahead of OpenAI at twenty one point seven. Invalidated edges keep "
  "the timeline. [pause] But on multi-hop questions, flat Mem0 actually beat the graph, as we just saw. [pause] Explicit "
  "relations help most when the question is about change over time.", 7),
 ("chart", {"kicker": "Memory footprint per conversation (tokens)", "title": "How much each design stores", "type": "bar",
            "bars": [{"label": "Mem0", "value": 7000}, {"label": "Mem0 graph", "value": 14000}, {"label": "Full context", "value": 26000}, {"label": "Zep", "value": 600000}],
            "note": "approximate · Chhikara et al. 2025, section 4.5 · Zep: 'in excess of 600k'", "ats": [0.14, 0.24, 0.36, 0.5]},
  "Storage matters too. [pause] Mem0 stored about seven thousand tokens of memory per conversation. The graph variant, "
  "about fourteen thousand, because of the extra nodes and edges. [pause] The raw conversation itself is about twenty six "
  "thousand. [pause] But Zep's graph exceeded six hundred thousand tokens, because it caches a summary at every node and "
  "facts on every edge. [pause] The paper also found Zep's answers were often only correct hours after ingestion, "
  "while Mem0's graph was ready in under a minute.", 7),

 # ============================================================ CH8 · 2026 REDESIGN
 ("divider", {"n": 8, "total": 9, "title": "The 2026 Redesign", "sub": "add-only writes, hybrid reads"},
  "Part eight. In April twenty twenty six, Mem0 replaced this algorithm. Let's see what changed, and why.", 8),
 ("versus", {"kicker": "Old vs new", "title": "From diffing to appending", "winner": "right",
             "left": {"h": "2025: extract → update", "items": ["two LLM calls per turn", "ADD · UPDATE · DELETE · NOOP", "old facts overwritten or deleted", "external graph database"]},
             "right": {"h": "2026: single pass", "items": ["one LLM call per turn", "ADD only, history kept", "old and new facts coexist", "built-in entity linking"]}},
  "The old pipeline spent two LLM calls per turn: one to extract, one to diff against existing memory. [pause] The new "
  "one makes a single call, and it only ever adds. [pause] Mem0's reasoning: the model spends its capacity on "
  "understanding the input, rather than diffing against existing state. [pause] Nothing is overwritten. When a fact "
  "changes, the new one lives alongside the old one. [pause] And the external graph database is gone from the open "
  "source version, replaced by lightweight, built-in entity linking.", 8),
 ("list", {"kicker": "Why drop the graph from open source?", "title": "The trade-off, as the evidence suggests", "items": [
     {"h": "Cost", "d": "extra LLM calls and a graph database per write"}, {"h": "Mixed results", "d": "helped temporal, not multi-hop, in the paper"},
     {"h": "Entity links", "d": "keep the who-and-what index, cheaply"}, {"h": "Still hosted", "d": "graph memory remains on the Mem0 platform"}]},
  "Why drop the graph from the open source version? Mem0 hasn't published a full rationale, but the evidence points one "
  "way. [pause] Cost: a graph means extra LLM calls and a graph database on every write. [pause] Mixed results: in the "
  "paper, it helped temporal questions, but not multi-hop ones. [pause] Entity links keep the most useful part, an index "
  "from who and what, to memories, at a fraction of the cost. [pause] And graph memory is still available on Mem0's hosted "
  "platform.", 8),
 ("x_diagram", {"kicker": "The new write path (from the code)", "title": "Single-pass, add-only extraction", "nodes": [
     {"id": "a", "h": "Last 10 messages", "d": "session context", "x": 110, "y": 260, "w": 330},
     {"id": "b", "h": "Top 10 memories", "d": "related, for dedup + links", "x": 110, "y": 480, "w": 330},
     {"id": "c", "h": "IDs → 0, 1, 2", "d": "anti-hallucination", "x": 110, "y": 700, "w": 330},
     {"id": "d", "h": "One LLM call", "d": "facts + linked memory ids", "x": 560, "y": 480, "w": 330},
     {"id": "e", "h": "Batch embed", "d": "all new facts at once", "x": 1000, "y": 260, "w": 330},
     {"id": "f", "h": "MD5 dedup", "d": "drop exact duplicates", "x": 1000, "y": 480, "w": 330},
     {"id": "g", "h": "Store + history", "d": "event = ADD", "x": 1000, "y": 700, "w": 330},
     {"id": "h", "h": "Entity linking", "d": "spaCy entities → entity store", "x": 1450, "y": 480, "w": 360}],
   "edges": [["a", "d"], ["b", "d"], ["c", "d"], ["d", "e"], ["e", "f"], ["f", "g"], ["g", "h"]]},
  "Here's the new write path, straight from the code. [pause] Gather context: the last ten messages from this session. "
  "[pause] Retrieve the top ten related memories, and map their ids to small integers. [pause] Then one LLM call extracts "
  "every new fact, from both the user and the assistant, and links each one to related memories. [pause] Relative dates, "
  "like last week, are resolved against the conversation's date, so they stay meaningful forever. [pause] The new facts "
  "are embedded in one batch, and exact duplicates are dropped with an MD5 hash. [pause] They're stored, and logged to "
  "history as ADD events. And finally, entity linking runs.", 8),
 ("statement", {"kicker": "Grounding time", "lines": ["“last week”", "is useless", "six months later."], "accent": 0,
                "big": "week of 15 May", "sub": "relative dates are resolved against the conversation's Observation Date"},
  "One prompt detail deserves its own moment. [pause] A memory that says, went to Paris last week, is useless six months "
  "later. [pause] So the extraction prompt receives an observation date, the day the conversation happened, and must "
  "rewrite every relative time against it. Yesterday, last week, next month. [pause] Went to Paris last week becomes, "
  "went to Paris the week of the fifteenth of May. [pause] It's told explicitly not to use today's date for this, "
  "because memories can be ingested long after the conversation took place.", 8),
 ("flow", {"kicker": "Entity linking", "title": "A lightweight index from things to memories", "steps": [
     {"h": "spaCy", "d": "proper nouns, quotes, noun phrases"}, {"h": "Normalize", "d": "lowercase, dedupe, embed"},
     {"h": "Match", "d": "exact text, or cosine ≥ 0.95"}, {"h": "Link", "d": "append this memory's id"}, {"h": "Create", "d": "no match → new entity"}]},
  "Entity linking replaces the graph. [pause] spaCy pulls entities out of each new memory: proper nouns, quoted titles, "
  "and multi-word noun phrases like machine learning. [pause] Each entity is normalized and embedded, then matched "
  "against a separate entity collection, by exact text, or by a cosine similarity of at least zero point nine five. "
  "[pause] A match gets this memory's id appended to its linked memories. Otherwise, a new entity is created. [pause] The "
  "result is a lightweight index, from things, to the memories that mention them.", 8),
 ("flow", {"kicker": "The new read path", "title": "Three signals, one score", "steps": [
     {"h": "Lemmatize", "d": "attending → attend"}, {"h": "Embed", "d": "semantic search, over-fetch ×4"},
     {"h": "BM25", "d": "keyword scores"}, {"h": "Entity boost", "d": "memories linked to query entities"}, {"h": "Fuse", "d": "normalize, combine, rank"}]},
  "Now the read path. [pause] The query is lemmatized with spaCy, so attending and attend match. [pause] It's embedded, "
  "and semantic search over-fetches: four times the requested results, and at least sixty candidates. [pause] In "
  "parallel, BM25 keyword search scores the same store. [pause] Entity matching adds a boost to memories linked to the "
  "query's entities. [pause] Then the three signals are fused into one score.", 8),
 ("x_code", {"kicker": "BM25, then a sigmoid", "title": "Turning keyword scores into 0 … 1", "file": "utils/scoring.py", "lines": [
     "BM25(q, d) = Σ  IDF(t) · tf·(k1+1) / (tf + k1·(1 − b + b·|d|/avgdl))",
     "",
     "norm = 1 / (1 + exp(−steepness · (raw − midpoint)))",
     "",
     "query terms   ≤3: (5, 0.7)   ≤6: (7, 0.6)   ≤9: (9, 0.5)",
     "              ≤15: (10, 0.5)   more: (12, 0.5)",
     "",
     "raw  3 → 0.083    raw  7 → 0.5",
     "raw  9 → 0.769    raw 12 → 0.953     # 4–6 terms"],
   "notes": [{"a": 0, "b": 0, "at": 0.08, "t": "BM25: rare terms count more; repeats saturate; long docs are normalized"},
             {"a": 2, "b": 2, "at": 0.4, "t": "a logistic squashes unbounded raw scores"},
             {"a": 4, "b": 5, "at": 0.55, "t": "longer queries score higher, so the midpoint moves up"},
             {"a": 7, "b": 8, "at": 0.74, "t": "computed with the code's parameters"}]},
  "BM25 deserves a closer look. [pause] For each query term, it multiplies how rare the term is across all memories by "
  "how often it appears in this one. Repeats saturate, so saying bengaluru five times doesn't win, and long memories are "
  "normalized against the average length. [pause] The raw score has no upper bound, so Mem0 squashes it with a logistic "
  "sigmoid. [pause] Longer queries naturally produce bigger raw scores, so the sigmoid's midpoint moves up with query "
  "length. [pause] For a four to six term query, a raw score of three becomes point zero eight. Seven becomes exactly "
  "one half. Nine becomes point seven seven, and twelve, point nine five.", 8),
 ("x_fusion", {"kicker": "Hybrid scoring · computed with the real formula", "title": "How candidates are scored and ranked",
               "query": "Which city did Riya move to for work?", "terms": 4, "threshold": 0.1,
               "cands": [{"text": "Riya moved to Bengaluru for a fintech job", "sem": 0.62, "bm25": 9.1, "esim": 0.98, "en": 12},
                         {"text": "Riya lived in Pune before 2026", "sem": 0.58, "bm25": 3.8, "esim": 0.98, "en": 12},
                         {"text": "Bengaluru traffic peaks at 6 pm", "sem": 0.60, "bm25": 2.9, "esim": 0, "en": 0},
                         {"text": "Riya loves Test cricket", "sem": 0.31, "bm25": 0, "esim": 0.98, "en": 12},
                         {"text": "User prefers window seats", "sem": 0.07, "bm25": 0, "esim": 0, "en": 0}]},
  "Here's the fusion formula, exactly as it appears in the code. [pause] Take a query: which city did Riya move to, for "
  "work? [pause] First, a gate. Any candidate whose semantic score is below the threshold, zero point one by default, is "
  "dropped, whatever its keywords say. [pause] Raw BM25 scores are unbounded, so they're squashed with a sigmoid. Its "
  "midpoint and steepness depend on query length. For four to six terms: midpoint seven, steepness zero point six. [pause] "
  "The entity boost is the entity similarity, times zero point five, times a small penalty for entities linked to very "
  "many memories. [pause] Add the three, divide by the maximum possible, two and a half with every signal active, and "
  "sort. [pause] Watch how keyword and entity signals lift the right memory to the top. And notice: BM25 can reorder "
  "candidates, but it never adds new ones.", 8),
 ("chart", {"kicker": "Entity boost penalty · 1 / (1 + 0.001·(n − 1)²)", "title": "Hub entities barely boost", "type": "bar",
            "bars": [{"label": "n = 1", "value": 1.0}, {"label": "n = 10", "value": 0.925}, {"label": "n = 30", "value": 0.543},
                     {"label": "n = 60", "value": 0.223}, {"label": "n = 100", "value": 0.093}],
            "note": "n = memories linked to the matched entity · weight multiplies sim × 0.5", "ats": [0.28, 0.36, 0.46, 0.54, 0.62]},
  "One more detail in that entity boost. [pause] The boost is multiplied by one, over one plus a thousandth of n minus "
  "one, squared, where n is how many memories the entity links to. [pause] An entity linked to one memory keeps its full "
  "weight. Ten memories: still point nine two five. Thirty: point five four. Sixty: point two two. A hundred: under "
  "point one. [pause] Why? An entity that appears everywhere, like the user's own name, says almost nothing about which "
  "memory is relevant. It's the same idea as inverse document frequency in BM25.", 8),
 ("chart", {"kicker": "Vendor-reported, April 2026", "title": "What the redesign scored", "type": "bar",
            "bars": [{"label": "LoCoMo old", "value": 71.4}, {"label": "LoCoMo new", "value": 91.6}, {"label": "LongMemEval", "value": 94.4},
                     {"label": "BEAM 1M", "value": 64.1}, {"label": "BEAM 10M", "value": 48.6}],
            "note": "LoCoMo: Mem0 OSS migration docs · others: Mem0 blog (Platform) · not comparable to the paper's J", "ats": [0.12, 0.2, 0.38, 0.5, 0.56]},
  "Mem0 reports big gains. [pause] On LoCoMo, the open-source score rose from seventy one point four to ninety one point "
  "six. The platform blog reports ninety two and a half. [pause] On LongMemEval, ninety four point four. [pause] And on "
  "BEAM, a newer benchmark at one million and ten million tokens, sixty four point one, and forty eight point six, "
  "showing how hard truly huge histories remain. [pause] All at roughly seven thousand tokens per query, versus twenty "
  "five thousand plus for full context. [pause] Two caveats. These are vendor-reported numbers, and they use a different "
  "setup from the paper, so don't compare them directly to its sixty six point nine.", 8),
 ("statement", {"kicker": "What add-only costs", "lines": ["Both facts survive.", "Reads must pick", "the current one."], "accent": 2,
                "sub": "temporal & multi-session reasoning: still 'open problems', per Mem0"},
  "Add-only isn't free. [pause] If Riya lived in Pune and now lives in Bengaluru, both facts are in the store. Retrieval, "
  "and the answering model, must work out which one is current, using timestamps and linked memories. [pause] Mem0 itself "
  "lists temporal reasoning and multi-session reasoning as open problems. [pause] The design moved complexity from write "
  "time to read time. That's a deliberate bet: writes stay cheap and lossless, and reads get smarter.", 8),

 # ============================================================ CH9 · USING IT + RECAP
 ("divider", {"n": 9, "total": 9, "title": "Putting It to Work", "sub": "a few lines of code, and the design lessons"},
  "Part nine. Let's put it to work, and pull out the lessons.", 9),
 ("x_code", {"kicker": "The open-source API", "title": "A memory layer in a few lines", "file": "agent.py", "lines": [
     "from mem0 import Memory", "", "m = Memory()        # Qdrant + text-embedding-3-small",
     "", "m.add(messages, user_id=\"riya\")          # write path", "",
     "hits = m.search(\"where does she live?\",", "                filters={\"user_id\": \"riya\"},",
     "                top_k=5)                      # read path", "", "context = [h[\"memory\"] for h in hits[\"results\"]]"],
   "notes": [{"a": 2, "b": 2, "at": 0.08, "t": "defaults: Qdrant, OpenAI embeddings, an OpenAI LLM"},
             {"a": 4, "b": 4, "at": 0.26, "t": "add(): extraction + dedup + entity linking"},
             {"a": 6, "b": 8, "at": 0.5, "t": "search(): scoped, hybrid-scored, top k"},
             {"a": 10, "b": 10, "at": 0.72, "t": "inject the memories into your prompt"}]},
  "Using it takes a few lines. [pause] Create a Memory object. The defaults are Qdrant, OpenAI embeddings, and an OpenAI "
  "model, and every piece is swappable. [pause] After each turn, call add, with the messages and a user id. That's the "
  "whole write path. [pause] Before answering, call search, with the question, a filter for this user, and how many "
  "results you want. [pause] Then put the returned memories into your prompt. [pause] Everything we've covered happens "
  "inside those two calls.", 9),
 ("list", {"kicker": "Running it in production", "title": "What to design for", "items": [
     {"h": "Async writes", "d": "extract off the critical path"}, {"h": "Latency budget", "d": "search must fit inside the reply"},
     {"h": "Deletion and privacy", "d": "delete by user; expiry dates"}, {"h": "Cost per turn", "d": "one LLM call + embeddings per write"},
     {"h": "Evaluation", "d": "test recall on your own conversations"}]},
  "Running this in production raises a few more questions. [pause] Make writes asynchronous, so extraction never delays "
  "the reply. [pause] Give search a latency budget: it happens before every answer. [pause] Plan for deletion and "
  "privacy. Users will ask to be forgotten, and expiry dates let stale memories disappear on their own. [pause] Track the "
  "cost per turn: at least one LLM call and a few embeddings for every write. [pause] And evaluate on your own "
  "conversations. Benchmarks are a starting point, not a guarantee.", 9),
 ("list", {"kicker": "Design lessons", "title": "What Mem0 teaches about memory systems", "items": [
     {"h": "Distill, don't replay", "d": "write-time extraction buys cheap reads"}, {"h": "Atomic facts", "d": "small units match and dedupe well"},
     {"h": "Make ids easy for LLMs", "d": "integers, not UUIDs"}, {"h": "Hybrid beats pure vectors", "d": "semantic + keyword + entity"},
     {"h": "Keep history", "d": "invalidate or append; never lose the timeline"}, {"h": "Scope everything", "d": "user, agent and run on every call"}]},
  "So what does Mem0 teach about memory systems? [pause] Distill, don't replay: extraction at write time buys cheap reads. "
  "[pause] Atomic facts are easier to match and deduplicate. [pause] Make ids easy for LLMs to copy. [pause] Hybrid "
  "retrieval beats pure vectors: semantic, keyword, and entity signals each catch what the others miss. [pause] Keep "
  "history, whether by invalidating edges or by appending, so the timeline is never lost. [pause] And scope everything, "
  "on every call.", 9),
 ("recap", {"title": "Mem0 in one breath", "items": [
     "Memory is a system around a stateless model", "2025: extract facts, then ADD / UPDATE / DELETE / NOOP",
     "Vectors + HNSW find similar memories in milliseconds", "Mem0g: entity graph, invalidated edges, dual retrieval",
     "Paper: 66.9 J at 1.44 s p95 vs 72.9 at 17.1 s", "2026: one add-only LLM call + entity linking",
     "Reads fuse semantic, BM25 and entity scores"], "closer": "Remember less, but remember the right things."},
  "Let's recap. [pause] Memory is a system you build around a stateless model. [pause] The twenty twenty five design "
  "extracted facts, then chose ADD, UPDATE, DELETE, or NOOP for each. [pause] Vectors and HNSW find similar memories in "
  "milliseconds. [pause] The graph variant added entities, invalidated edges, and dual retrieval. [pause] In the paper, "
  "Mem0 kept most of full context's accuracy, at a fraction of its latency and tokens. [pause] The twenty twenty six "
  "design makes one add-only call, links entities, and fuses three signals when reading. [pause] Good memory isn't "
  "remembering everything. It's remembering less, but the right things. Thanks for watching.", 9),
]


# ---- reveal timing measured against the audio-timed caption cues (skills/06 §4c) ----
TIMING = {
 "Replaying history is expensive": {"ats": [0.42, 0.58, 0.67]},
 "Expected nodes per layer": {"ats": [0.43, 0.53, 0.6, 0.66, 0.71]},
 "Accuracy on LoCoMo": {"ats": [0.13, 0.24, 0.32, 0.38, 0.5, 0.6]},
 "Latency where users feel it": {"ats": [0.23, 0.35, 0.43, 0.51]},
 "Single-hop and multi-hop": {"ats": [0.17, 0.25, 0.44, 0.52, 0.63, 0.72]},
 "How much each design stores": {"ats": [0.05, 0.15, 0.33, 0.46]},
 "Hub entities barely boost": {"ats": [0.36, 0.44, 0.52, 0.56, 0.6]},
 "What the redesign scored": {"ats": [0.05, 0.11, 0.28, 0.4, 0.46]},
 "What to design for": {"ats": [0.12, 0.24, 0.37, 0.62, 0.83]},
 "What one stored memory looks like": {"note_ats": [0.09, 0.24, 0.48, 0.77]},
 "From a conversation to atomic facts": {"note_ats": [0.09, 0.32, 0.58, 0.75]},
 "The update loop, and one clever trick": {"note_ats": [0.1, 0.18, 0.34, 0.7]},
 "Turning keyword scores into 0 … 1": {"note_ats": [0.06, 0.44, 0.57, 0.72]},
 "A memory layer in a few lines": {"note_ats": [0.09, 0.33, 0.55, 0.78]},
 "The memory store, turn by turn": {"step_ats": [0.09, 0.21, 0.29, 0.51, 0.69]},
 "Memory as a directed, labeled graph": {"edge_ats": [0.3, 0.34, 0.55, 0.68]},
 "How candidates are scored and ranked": {"phases": [0.17, 0.33, 0.54, 0.7, 0.8]},
}
def apply_timing(props):
    t = TIMING.get(props.get("title", ""))
    if not t: return props
    p = dict(props)
    if "ats" in t: p["ats"] = t["ats"]
    if "note_ats" in t: p["notes"] = [{**n, "at": a} for n, a in zip(p["notes"], t["note_ats"])]
    if "step_ats" in t: p["steps"] = [{**st, "at": a} for st, a in zip(p["steps"], t["step_ats"])]
    if "edge_ats" in t: p["edges"] = [{**e, "at": a} for e, a in zip(p["edges"], t["edge_ats"])]
    if "phases" in t: p["phases"] = t["phases"]
    return p

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
             [b["label"] for b in props.get("bars", [])] if kind == "chart" else
             [h(n) for n in props.get("nodes", [])] if kind == "x_diagram" else None)   # x_diagram-style custom kinds
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
    pp = PAUSE / ATEMPO; wt = max(0.01, dur - (len(parts) - 1) * pp) / words; ct, out = t0, []
    for i, p in enumerate(parts):
        w = p.split()
        for k in range(0, len(w), 8):
            ch = w[k:k + 8]; out.append([round(ct, 3), round(ct + wt * len(ch), 3), " ".join(ch)]); ct += wt * len(ch)
        if i < len(parts) - 1: ct += pp
    return out

if __name__ == "__main__":
    chapters = {}
    for n, (kind, props, text, ch) in enumerate(BEATS):
        bid = f"b{n:02d}"; wav = tts(bid, text); d = ffdur(wav)
        chapters.setdefault(ch, []).append((bid, kind, autosync(kind, apply_timing(props), text, d), text, wav, d))
        print(f"ch{ch:02d} {bid} {kind:10s} {d:6.2f}s")
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
    words = sum(len(b[2].replace("[pause]", " ").split()) for b in BEATS)
    print(f"TOTAL {total:.1f}s ({total/60:.2f} min) · {len(BEATS)} beats · {words} words · pack={PACK}")
