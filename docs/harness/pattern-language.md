---
type: user
permalink: harness/skogix/harness/pattern-language
---

# harness pattern language

reusable building blocks for a harness. each pattern belongs to one of the
runtime planes from [what-is-a-harness](../what-is-a-harness.md); where a
deep-dive doc exists it is linked, and the relevant failure modes from
[gotchas](gotchas.md) are noted.

| # | pattern | plane | deep dive |
|---|---------|-------|-----------|
| 1 | request assembler | request assembly | [context-engineering](context-engineering-pattern.md) |
| 2 | turn loop | turn loop | — |
| 3 | capability plane | tool plane | [tool-registry](tool-registry-pattern.md) |
| 4 | context governor | memory plane | [context-engineering](context-engineering-pattern.md), [memory-persistence](memory-persistence-pattern.md) |
| 5 | permission gate | tool plane | [tool-registry](tool-registry-pattern.md) |
| 6 | transcript spine | recovery plane | — |
| 7 | recovery plane | recovery plane | [lifecycle-bootstrap](lifecycle-bootstrap-pattern.md) |
| 8 | extension plane | extension plane | [skill-runtime](skill-runtime-pattern.md), [multi-agent](multi-agent-pattern.md), [lifecycle-bootstrap](lifecycle-bootstrap-pattern.md) |
| 9 | human control surface | human control | — |
| 10 | evaluation plane | (cross-cutting) | — |

## 1. request assembler

combine stable instructions, runtime context, user context, tools, and
history into a final model request.

- what sources feed the system prompt
- what sources are per-turn only
- where tool affordances are injected
- whether history needs normalization or repair

gotchas: [#2 priority ordering](gotchas.md), [#9 memoized context builders](gotchas.md)

## 2. turn loop

define the repeated control flow of the harness.

- gather
- think or plan
- act
- verify
- continue or stop

gotchas: [#7 async work skips "pending"](gotchas.md)

## 3. capability plane

expose tools as bounded capabilities rather than raw shell access.

- what each tool is for
- what permission mode it requires
- what output proves success
- how failures or partial results are handled

gotchas: [#5 concurrency is per-call](gotchas.md), [#13 default permission is "allow"](gotchas.md)

## 4. context governor

keep the active context window coherent over time.

- retrieval and grounding
- memory selection
- summarization and compaction
- context-budget decisions

gotchas: [#1 index caps fire silently](gotchas.md), [#3 extraction race window](gotchas.md), [#4 derivable content](gotchas.md), [#15 orphaned topic files](gotchas.md)

## 5. permission gate

align risk with authority.

- read-only mode
- approval-required write mode
- bounded auto mode
- stronger confirmation for destructive actions

gotchas: [#6 permission evaluation has side effects](gotchas.md), [#13 default is "allow"](gotchas.md)

## 6. transcript spine

keep a durable semantic record of what the agent saw, did, and decided.
this is different from raw logs — it should preserve enough structure for:

- debugging
- audits
- resume flows
- post-hoc reasoning

## 7. recovery plane

let the harness survive interruption, partial completion, or context
collapse.

- resumable task state
- compact boundaries
- rehydration of durable instructions
- partial artifact preservation

gotchas: [#11 eviction requires notification](gotchas.md)

## 8. extension plane

let the harness grow without destabilizing the core loop.

- plugins
- mcp integrations
- subagents
- external skills

extension should come after the core loop, not before it.

gotchas: [#8 fork children must not fork](gotchas.md), [#10 hook trust is all-or-nothing](gotchas.md), [#12 skill listing budgets](gotchas.md), [#14 team memory needs auto-memory](gotchas.md)

## 9. human control surface

give users visibility and steering power.

- current plan
- pending approvals
- recent actions
- interruption points
- summaries of what changed

## 10. evaluation plane

measure whether the harness is actually good.

- usefulness
- correctness
- controllability
- recovery quality
- latency
- cost
- operator burden
