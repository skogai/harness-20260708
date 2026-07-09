---
type: user
permalink: harness/skogix/what-is-a-harness
---

# what is a harness?

a harness is the layer that turns a model into an operating system for work.

it decides:

- how a request is assembled
- how a turn progresses
- what tools exist and how they are governed
- what memory survives which boundary
- what gets logged, resumed, compacted, or escalated
- how a human can still understand and control the system

```mermaid
flowchart lr
    u["user / host"]
    ra["request assembly<br/>instructions + context + tools + history"]
    tl["turn loop<br/>gather → think → act → verify"]
    tp["tool plane<br/>capabilities + permissions"]
    mp["memory plane<br/>context + durable memory + compaction"]
    tr["transcript / recovery<br/>logs + resume + continuity"]
    ep["extension plane<br/>plugins + mcp + subagents"]

    u --> ra --> tl
    tl --> tp
    tl --> mp
    tl --> tr
    tp --> tl
    mp --> tl
    tr --> tl
    ep --> tl
```

## why define this?

most agent projects still stop at one of these weak states:

- a prompt with a tool list
- a loop with no governance
- memory with no boundaries
- autonomy with no control surface
- retries with no recovery model

the question it keeps asking is:

**what is the harness here, exactly?**

## skogai-harness is a blueprint generation framework

harness blueprints for an agentic systems needs to essentially be generated dynamically. it should push to specify the runtime planes that are usually hand-waved away.

| plane            | what you should define                                                            |
| ---------------- | --------------------------------------------------------------------------------- |
| request assembly | instruction sources, system/user context, tool exposure, transcript normalization |
| turn loop        | gather, decide, act, verify, stop/retry/escalate                                  |
| tool plane       | capability contracts, permission gates, success criteria, rollback story          |
| memory plane     | active context, retrieval, durable memory, compaction                             |
| recovery plane   | transcript, resumability, partial work, continuity                                |
| human control    | approvals, visibility, interruption, auditability                                 |
| extension plane  | plugins, mcp, subagents, future expansion points                                  |

## what is the blueprint for the blueprints?

the harness should be able to answer questions like:

- what is the runtime shape of this agent?
- how should we assemble each model request?
- what are the real boundaries between loop, tools, memory, and persistence?
- where should permissions and approvals live?
- how would this system recover from interruption or partial failure?

## skogix

we assume that the end result will have the skogai-pi implementation of the basics.

while we work our way backwards to meet that goal we will focus on `claude code cli` as the base case since it matches skogix/the users knowledge best.

`codex cli` will work as our "beta tester" when it comes to converting harness specific functionality
