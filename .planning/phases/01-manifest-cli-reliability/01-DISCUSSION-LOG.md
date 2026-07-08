# Phase 1: Manifest CLI Reliability - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-08
**Phase:** 1-Manifest CLI Reliability
**Areas discussed:** Harness purpose and turn model, Real usage loop boundary

---

## Harness Purpose and Turn Model

| Option | Description | Selected |
|--------|-------------|----------|
| Core contract | Manifest CLI reliability must be planned around immutable turn JSONL as the system of record. | |
| Near-term direction | Capture it as the architectural north star, but Phase 1 only avoids blocking it. | |
| Separate phase | Keep Phase 1 on current manifest CLI work and add immutable turn logging as a later phase. | |

**User's choice:** The user rejected the framing and clarified the real reason: every hook, action, event, change, or thought is represented by a JSON object appended to an immutable data store / JSONL until a commit and git diff are created representing the message, file state, and actions taken. This is a turn.
**Notes:** The user then clarified this should not change anything in practice for Phase 1 and should involve no implementation or focus on the turn log.

---

## Real Usage Loop Boundary

| Option | Description | Selected |
|--------|-------------|----------|
| Init-sync-status-add | A user can initialize, add MCP/skills, sync, and status-check repeatedly with stable results. | |
| Agent session loop | A user can start an agent session, produce state/handoff/evidence, and verify the session. | |
| Package consumer loop | A user can install/run the CLI globally in another repo and validate generated outputs there. | |

**User's choice:** A turn starts with an agent getting context and ends with a reminder / validation.
**Notes:** This is the actual harness usage loop. Because the current roadmap puts lifecycle brief/verification in a later phase, the user chose to rework the roadmap later rather than expand Phase 1.

---

## the agent's Discretion

- Planner may decide the practical implementation order for MAN-01 through MAN-04, constrained by existing code patterns and the instruction not to implement turn logging in Phase 1.

## Deferred Ideas

- Immutable turn JSONL/event store as the full harness architecture.
- Roadmap rework so the real usage loop is primary: agent gets context at turn start, then reminder / validation closes the turn.
