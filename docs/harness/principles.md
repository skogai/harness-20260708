---
type: user
permalink: harness/skogix/harness/principles
---

# harness principles

one claim underneath everything here: a strong agent is not a model with a
tool list. it is a model wrapped in a coherent harness.

each principle below pairs the general rule with the lesson claude code
taught us about it — claude code being the base case we work backwards
from (see [what-is-a-harness](../what-is-a-harness.md)).

## 1. the harness is the product

a harness is the runtime layer that makes an agentic system executable,
governable, and recoverable. it owns:

- request assembly
- turn and tool loop execution
- tool exposure and permission gates
- memory and context maintenance
- transcript and recovery behavior
- extension points
- human control surfaces

prompts matter, but the harness determines what information reaches the
model, what actions it can take, what state survives across turns, how
failures are handled, and whether humans can steer the system.

**claude code lesson**: claude code is not "a model plus some tools." it
behaves like a terminal-native agent runtime with a host, request assembly
layer, execution loop, memory handling, persistence, and extension
surfaces. if a system feels unusually capable, look at the runtime around
the model.

## 2. request assembly is architecture, not plumbing

the center of a harness is not only the tool loop. it is the combination of:

- assembling instruction sources (default, custom, agent-specific)
- injecting system and user context
- exposing tools as schemas or affordances
- normalizing message history into a stable model request

this is where product intent becomes machine behavior.

**claude code lesson**: much of the real intelligence comes from how the
request is assembled before the model ever runs.

## 3. the turn loop is necessary but not sufficient

a good turn loop stays legible:

1. gather context
2. produce a model turn
3. execute one or more actions
4. verify what happened
5. continue, compact, escalate, or stop

if the loop cannot be named clearly, it probably cannot be operated safely.

**claude code lesson**: the query/tool loop is only one part. around it sit
permission logic, transcript recording, compaction, tool result repair,
and session continuity. "tool use" alone does not make a harness.

## 4. memory is a control problem

memory is not a yes-or-no feature. it is a boundary design problem:

- what lives only for this turn
- what persists for this task
- what survives across sessions
- what is summarized or compacted
- what must remain auditable

the harness should make those boundaries explicit and govern memory like
compute or permissions.

**claude code lesson**: long context is not a free resource. claude code
actively manages durable memory, nested instruction sources, session
compaction, and re-injection of critical context.

## 5. persistence and recovery are part of the design

any useful agentic product will eventually face partial success,
interrupted work, stale context, missing tool output, and user
redirection. if the design has no transcript, no resumability, and no
recovery story, the harness is incomplete.

**claude code lesson**: transcript files, compact boundaries, sidecars,
and resume flows are what turn a one-shot assistant into an operating
system for work.

## 6. extensions plug into the runtime, not around it

extensibility is strongest when new capabilities enter through the same
control planes as existing ones: the same permission gates, the same
transcript, the same loop.

**claude code lesson**: mcp, plugins, skills, and remote flows all extend
the harness while remaining governed by runtime boundaries. extension
comes after the core loop, not before it.

## 7. human legibility is part of capability

a practical harness makes room for approvals, visibility, interruption,
auditability, and bounded autonomy. this is not safety theater — it is how
people trust and operate real agentic systems.

**claude code lesson**: explicit ui, status surfaces, permissions, and
inspectable transcripts keep the human in the loop. a harness that hides
too much of itself eventually becomes harder to trust, not more powerful.
