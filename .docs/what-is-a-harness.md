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

## the documentation set

this file is the front door. the rest lives in [harness/](harness/):

<routes>

- @harness/principles.md - why the harness matters more than the prompt, with the claude code lesson behind each principle
- @harness/pattern-language.md - the ten building blocks, indexed by plane, linked to deep dives and gotchas
- @harness/blueprint-template.md - the template for producing a formal harness design
- @harness/gotchas.md - fifteen non-obvious failure modes that will cause bugs if violated

</routes>

deep-dive patterns (referenced from the pattern language):

<routes>

- @harness/context-engineering-pattern.md - select, write, compress, isolate; context as a budget
- @harness/memory-persistence-pattern.md - layered memory, two-step saves, index caps, priority ordering
- @harness/tool-registry-pattern.md - fail-closed registries, per-call concurrency, permission pipelines
- @harness/multi-agent-pattern.md - coordinator, fork, swarm; synthesize instead of delegating understanding
- @harness/lifecycle-bootstrap-pattern.md - hooks, trust boundaries, background tasks, staged bootstrap
- @harness/skill-runtime-pattern.md - packaging reusable behavior with progressive disclosure
- @harness/modular-automation-pattern.md - deterministic, standalone modules beneath prompts, hooks, and routing

</routes>

## skogai-harness is a blueprint generation framework

harness blueprints for agentic systems need to be generated dynamically.
the framework should push to specify the runtime planes that are usually
hand-waved away.

| plane            | what you should define                                                             | patterns | deep dive |
| ---------------- | ---------------------------------------------------------------------------------- | -------- | --------- |
| request assembly | instruction sources, system/user context, tool exposure, transcript normalization | request assembler | [context-engineering](harness/context-engineering-pattern.md) |
| turn loop        | gather, decide, act, verify, stop/retry/escalate                                   | turn loop | — |
| tool plane       | capability contracts, permission gates, success criteria, rollback story           | capability plane, permission gate | [tool-registry](harness/tool-registry-pattern.md) |
| memory plane     | active context, retrieval, durable memory, compaction                              | context governor | [context-engineering](harness/context-engineering-pattern.md), [memory-persistence](harness/memory-persistence-pattern.md) |
| recovery plane   | transcript, resumability, partial work, continuity                                 | transcript spine, recovery plane | [lifecycle-bootstrap](harness/lifecycle-bootstrap-pattern.md) |
| human control    | approvals, visibility, interruption, auditability                                  | human control surface | — |
| extension plane  | plugins, mcp, subagents, future expansion points                                   | extension plane | [skill-runtime](harness/skill-runtime-pattern.md), [multi-agent](harness/multi-agent-pattern.md) |

## what is the blueprint for the blueprints?

the harness should be able to answer questions like:

- what is the runtime shape of this agent?
- how should we assemble each model request?
- what are the real boundaries between loop, tools, memory, and persistence?
- where should permissions and approvals live?
- how would this system recover from interruption or partial failure?

the [blueprint template](harness/blueprint-template.md) turns those
questions into a fill-in design document, one section per plane.

## skogix

we assume that the end result will have the skogai-pi implementation of the basics.

while we work our way backwards to meet that goal we will focus on
`claude code cli` as the base case since it matches skogix/the users
knowledge best. the [principles](harness/principles.md) doc records what
each claude code behavior generalizes to.

`codex cli` will work as our "beta tester" when it comes to converting
harness specific functionality

to test that harness additions (system prompt, tools, settings, mcp,
skills, hooks, memory) actually change behavior, we keep a literal
zero-configuration claude code instance around as a diff baseline: no
system prompt, no tools, no settings, no mcp, no skills. it is not a
script, just cli flags plus an explicit, empty settings file:
[`.claude/settings.bare.json`](../.claude/settings.bare.json).

```sh
claude \
  --safe-mode \
  --system-prompt "" \
  --tools "" \
  --setting-sources "" \
  --strict-mcp-config \
  --disable-slash-commands \
  --settings .claude/settings.bare.json \
  -p "<prompt>"
```

`--safe-mode` disables all customizations (CLAUDE.md, skills, plugins,
hooks, mcp servers, custom commands/agents, output styles, themes,
keybindings) while leaving auth, model selection, built-in tools, and
permissions working normally — unlike `--bare`, which forces
`ANTHROPIC_API_KEY`/`apiKeyHelper` auth and never reads oauth or the
keychain, breaking normal subscription login. `--system-prompt ""`,
`--tools ""`, `--setting-sources ""`, `--strict-mcp-config`, and
`--disable-slash-commands` zero out the system prompt, tools, settings,
mcp, and skills respectively.
`.claude/settings.bare.json` is `{}` on purpose: the emptiness is the
pinned proof that zero settings are required, not a load-bearing
config.

### harness knobs

the bare baseline is one fixed point (everything off). building an
actual harness means dialing individual pieces back on, one at a time,
to see what each one changes. these `claude` cli flags are the knobs,
each one isolating a single plane from `harness/principles.md`:

| flag | plane | what it isolates |
| --- | --- | --- |
| `--append-system-prompt <prompt>` | system prompt | layers on top of the default prompt instead of replacing it (`--system-prompt` replaces wholesale) — closer to how most harnesses actually customize behavior |
| `--agents <json>` / `--agent <name>` | agents | define or select custom agents inline, without `.claude/agents/*.md` files |
| `--allowedTools` / `--disallowedTools` | tools | subtract or add individual tools instead of all-or-nothing (`--tools ""` / `--tools "default"`) |
| `--mcp-config <configs...>` (with `--strict-mcp-config`) | mcp | inject exactly one mcp server deliberately, instead of none |
| `--permission-mode <mode>` | permissions | toggle `plan` / `bypassPermissions` / `dontAsk` / etc. as its own independent axis |
| `--exclude-dynamic-system-prompt-sections` | prompt cache | strips the per-machine boilerplate (cwd, env, memory paths, git status) out of the system prompt, isolating prompt-cache effects from the rest |

use these against the bare baseline to build a/b comparisons: bare vs.
bare+one-knob, to attribute an observed behavior change to a single
harness addition rather than the whole stack at once.
