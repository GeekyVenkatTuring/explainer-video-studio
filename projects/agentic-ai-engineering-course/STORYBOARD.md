# Agentic AI Engineering — Visual Screenplay

This is an original companion course to Yi Zhou's public 24-topic catalogue. It is not a read-aloud or visual summary of the book. Each chapter has a single running enterprise case and seven short visual beats: problem, system map, a worked execution, a failure, evaluation, human handoff, and takeaway. The narration must name an object only as it appears and explain the change the viewer sees.

## Recurring visual language

- Cyan is the cognition and context path; violet is runtime and orchestration; amber is policy and approval; green is verified progress; pink/red is a blocked or failed action.
- The recurring motif is a packet travelling around a bounded cognition loop. A packet never travels through a static diagram: it carries its state, evidence, or refusal reason.
- Every chapter has a live worked example, not a list of concepts. The agent’s state changes on screen as the narrator explains why.

## Chapter visual map

| Ch. | Running example | Visual that develops over the narration |
|---:|---|---|
| 1 | Claims triage | A vague “handle this claim” request becomes a scoped outcome, authority badge, and measurable exit condition. A red “submit payment” path stays locked. |
| 2 | Support agent runtime | A request packet enters a sandbox, gets a scoped credential, calls a mock ticket tool, writes state, then exits with a trace. |
| 3 | Poisoned vendor document | An injection string attempts to unlock a payment tool. The visual highlights the hostile instruction, isolates it, and blocks privilege escalation. |
| 4 | Incident diagnosis | A waterfall trace builds left to right: user input, retrieval, tool call, malformed result, fallback, and user-facing explanation. |
| 5 | Travel booking protocol | Typed request and response envelopes handshake between planner, availability tool, and booking adapter; a schema mismatch returns a visible error. |
| 6 | Loan policy | A decision tree animates from amount and risk score to delegated approval, human approval, or hard stop; policy is shown as executable gates. |
| 7 | Clinical knowledge | A knowledge graph filters unapproved notes, retrieves an approved guideline, attaches provenance, and shows stale evidence expiring. |
| 8 | Contract reviewer | A large document stack compresses into a precise context packet: task, clauses, retrieval evidence, and tool result; irrelevant pages fall away. |
| 9 | Concierge memory | A memory timeline separates turn memory, durable preferences, and a quarantined unverified claim; expiry sweeps remove stale travel intent. |
| 10 | Expense investigation | Planner cards expand into tool actions. A verifier checks arithmetic and sends an uncertain branch to a human instead of looping. |
| 11 | Model routing | A router measures task risk and confidence, dispatching rules, a small model, or a strong model; costs and error bars move with each route. |
| 12 | Research workflow | A graph scheduler fans work to evidence specialists, joins sources, rejects a failed branch, then retries through a fallback path. |
| 13 | Customer operations system | A boundary map separates deterministic services, model judgment, policy guardrails, and a human escalation lane. |
| 14 | Transfer preview | A user sees intent, assumptions, live progress, and a reversible preview. The approval button only unlocks after the visual reconciliation. |
| 15 | Shipment update | An idempotency key travels with a tool request. A simulated timeout triggers a safe retry, while duplicate writes collapse into one final state. |
| 16 | Maintenance loop | Sensor readings alter an agent’s world model. The plan changes, an action is proposed, feedback returns, and the loop updates without rewriting history. |
| 17 | HR policy assistant | Confidence and evidence gauges rise or fall together. Low-confidence cases surface a cited policy and a “review required” card instead of a confident answer. |
| 18 | Release operation | A staged rollout dashboard runs shadow evaluation, canary traffic, alert threshold, rollback, and a versioned improvement loop. |
| 19 | Authorization red team | A scenario harness injects ambiguous requests and adversarial payloads; a score board separates task completion, safe abstention, and unsafe action. |
| 20 | Change lifecycle | A rail carries a change from discovery through specification, tests, approval, rollout, monitoring, and retirement; each artifact attaches to the same version. |
| 21 | Service desk product | An autonomy dial moves from draft to recommend to execute. Outcome metrics compare safe resolution, time saved, and escalation quality—not chat volume. |
| 22 | Product squad | A responsibility map connects product, domain, model, security, operations, and a decision owner. An accountability gap flashes until an owner is assigned. |
| 23 | Maturity ladder | A team climbs supervised pilot, production, enterprise, and regulatory levels only when evidence cards satisfy the next gate. |
| 24 | Claims transformation | A before/after workflow morphs: manual document hunting becomes machine preparation plus human judgment, with outcomes measured at the workflow level. |

## Scene contract

For every chapter, the seven cuts are not interchangeable cards:

1. **Problem:** show a failure or ambiguity in the running example.
2. **System map:** build the actual loop left-to-right and attach the authority boundary.
3. **Worked execution:** animate a request or state packet through the system.
4. **Failure:** inject the chapter’s realistic fault and visibly block, retry, or quarantine it.
5. **Evaluation:** run several deterministic scenario states and update a score or trace.
6. **Human handoff:** package the live goal, evidence, prior actions, and reason for escalation.
7. **Takeaway:** return to the final state and show the engineering rule proven by the example.

No chapter can ship until its mid-animation still confirms that the objects named in narration are already visible, its late still shows a completed state or live process, and the visual is distinct from the previous chapter.
