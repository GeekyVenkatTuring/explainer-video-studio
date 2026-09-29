# Mem0 — research notes (verified 2026-09-23)

Primary sources:
- Paper: Chhikara, Khant, Aryan, Singh, Yadav — "Mem0: Building Production-Ready AI Agents with Scalable Long-Term
  Memory", arXiv:2504.19413v1, 28 Apr 2025 (text extracted to research/paper.txt).
- Code: github.com/mem0ai/mem0 @ 83b07b1 (23 Sep 2026) — research/repo (mem0/memory/main.py, utils/scoring.py,
  utils/entity_extraction.py, utils/lemmatization.py, configs/prompts.py, memory/storage.py).
- Docs: docs.mem0.ai/migration/oss-v2-to-v3 ; blog "Introducing the Token-Efficient Memory Algorithm" (16 Apr 2026).
- Qdrant docs (HNSW defaults m=16, ef_construct=100).

## 2025 paper architecture ("v2", two LLM passes)
- Incremental; triggered per new message pair (m_{t-1}, m_t) — usually user msg + assistant reply.
- Extraction prompt P = (S, {m_{t-m} … m_{t-2}}, m_{t-1}, m_t). S = conversation summary from DB, refreshed by an
  ASYNC summary module (off the hot path). m = 10 recent messages. φ(P) → candidate facts Ω = {ω1…ωn}.
- Update phase: per fact, retrieve top s = 10 similar memories (dense embeddings, vector DB); LLM "tool call" picks
  ADD / UPDATE / DELETE / NOOP (code calls it NONE). No separate classifier. GPT-4o-mini for all LLM ops.
- Algorithm 1 (Appendix B): ClassifyOperation — not SemanticallySimilar → ADD; Contradicts → DELETE; Augments → UPDATE;
  else NOOP. UPDATE replaces only if InformationContent(f) > InformationContent(m_i).
- Code detail: existing memory UUIDs are mapped to "0","1",… before the LLM sees them (anti-hallucination);
  SQLite `history` table logs every event (old_memory, new_memory, event).
## Mem0g (graph variant)
- G = (V, E, L): nodes = entities (type, embedding e_v, created t_v); edges = labeled relations; triplets (v_s, r, v_d).
- Two-stage LLM extraction: entity extractor (entities + types) → relationship generator (triplets, labels like
  lives_in, prefers, owns, happened_on).
- Storage: embed source & destination; find existing nodes with similarity > threshold t; create 0/1/2 nodes; add edge.
- Conflict detection + LLM update resolver: obsolete relations MARKED INVALID, not deleted → temporal reasoning.
- Retrieval (dual): entity-centric (query entities → anchor nodes → incoming+outgoing edges → subgraph) and semantic
  triplet (embed query, score every triplet's text encoding, keep > threshold, sort desc). Neo4j + GPT-4o-mini.
## Evaluation (LOCOMO)
- 10 conversations, ~600 dialogues & ~26,000 tokens each, ~200 questions each; single-hop, multi-hop, temporal,
  open-domain (adversarial excluded). Metrics F1, BLEU-1, LLM-as-a-Judge J (10 runs, mean ± sd).
- Overall J: Mem0 66.88 · Mem0g 68.44 · Zep 65.99 · LangMem 58.10 · OpenAI 52.90 · A-Mem 48.38 · best RAG 60.97
  (k=2, 256) · Full-context 72.90.
- Latency p95 total: Mem0 1.440 s · Mem0g 2.590 · Zep 2.926 · Full-context 17.117 · LangMem 60.40 · OpenAI 0.889.
  Search p50/p95: Mem0 0.148 / 0.200 s. Context tokens per query: Mem0 1,764 · Mem0g 3,616 · Zep 3,911 · Full 26,031.
- Per-category J: temporal Mem0g 58.13 (best), Mem0 55.51, Zep 49.31, OpenAI 21.71; multi-hop Mem0 51.15;
  single-hop Mem0 67.13; open-domain Zep 76.60, Mem0g 75.71, Mem0 72.93.
- Headline claims: ~26% relative J over OpenAI (66.88 vs 52.90); 91% lower p95 latency; >90% token savings vs full.
- Memory footprint: Mem0 ~7k tokens/conversation; Mem0g ~14k; Zep >600k (summary per node + facts on edges);
  Zep retrieval often only correct hours later (async construction); Mem0g graph build < 1 minute worst case.
## 2026 algorithm ("v3", released April 2026; OSS mem0ai ≥ 1.x/2.x — v2.1.0 on 18 Sep 2026)
- Single-pass ADD-only extraction: one LLM call, no UPDATE/DELETE. Rationale (docs): "The model spends its capacity on
  understanding the input rather than diffing against existing state." Old + new facts coexist (history preserved).
- Pipeline (main.py `_add_to_vector_store`): P0 context = last 10 messages of the session scope (SQLite `messages`,
  evicted beyond 10) · P1 embed new messages, retrieve top-10 existing memories (scoped by user/agent/run), map UUIDs
  → "0","1"… · P2 one LLM call with ADDITIVE_EXTRACTION_PROMPT (JSON; extracts from user AND assistant turns; grounds
  relative dates to the Observation Date; returns linked_memory_ids) · P3 batch-embed · P4-5 MD5 hash dedup vs
  existing + within batch · P6 batch insert + history rows (event ADD) · P7 entity linking: spaCy entities (PROPER,
  QUOTED, TOPIC, IDENTIFIER), normalized + deduped, batch-embedded, matched to `{collection}_entities` by exact text
  or cosine ≥ 0.95, linked_memory_ids updated / new entity inserted.
- Search (`_search_vector_store`): lemmatize query (spaCy) · extract query entities · embed · semantic over-fetch
  max(4·limit, 60) · BM25 keyword search (same size) · sigmoid-normalize BM25 · entity boosts · score & rank.
- Scoring (utils/scoring.py): BM25 norm = 1/(1+e^(−s·(raw−mid))), (mid, s) by lemmatized query length:
  ≤3 terms (5, 0.7) · ≤6 (7, 0.6) · ≤9 (9, 0.5) · ≤15 (10, 0.5) · >15 (12, 0.5).
  Entity boost = sim × 0.5 × 1/(1 + 0.001·(n−1)²), sim ≥ 0.5 required, n = memories linked to that entity, max over
  ≤ 8 query entities. combined = min((semantic + bm25 + boost) / max_possible, 1); max_possible = 1 (+1 if BM25)
  (+0.5 if entity). Threshold (default 0.1) gates the SEMANTIC score before fusion; BM25/entity never add candidates.
- Defaults: top_k 100 → 20 · threshold None → 0.1 · rerank True → False. Graph stores (Neo4j, Memgraph, Kuzu…)
  removed from OSS (Platform only); custom_fact_extraction_prompt → custom_instructions.
- Results: migration doc "LoCoMo 71.4 → 91.6 (+20), LongMemEval +26"; blog (Platform): LoCoMo 92.5, LongMemEval 94.4,
  BEAM-1M 64.1, BEAM-10M 48.6, ~6.7–7.0k tokens per query vs 25,000+ full context. Temporal/multi-session reasoning
  still named "open problems". (Two LoCoMo figures differ — say "about 92", cite both.)
- Defaults in code: LLM provider openai, model gpt-5-mini; embedder text-embedding-3-small (1536 dims); vector store
  Qdrant (HNSW, m=16, ef_construct=100, search ef defaults to ef_construct).
