# AGENTS.md

This project includes Harness guidance for Codex.

When a user request matches one of the skills below, read the matching local skill file before answering, planning, or editing. Keep the selected skill active only for the current task unless the user asks to continue that workflow.

## Skills

- `harness-creator`: Build, audit, and improve harnesses that make AI coding agents reliable: AGENTS.md/CLAUDE.md instruction files, feature/state tracking, verification gates, scope boundaries, session handoff, memory persistence, context budgets, tool-permission safety, and multi-agent coordination. Use this whenever a coding agent is unreliable across sessions — forgets context, drifts out of scope, claims "done" before tests pass, or starts each session inconsistently — or when creating or assessing AGENTS.md, CLAUDE.md, feature_list.json, init.sh, progress.md, or session-handoff files. Reach for it even if the user never says the word harness.
  Read `.codex/skills/harness-creator/SKILL.md` before using this skill.
- `toon-formatter`: Guidance on when and how to use TOON (Token-Oriented Object Notation) — a compact JSON alternative that typically cuts input tokens 30-50% on tabular data. Use when the user is about to paste or serialize a large JSON array into a prompt, has a payload with ≥5 uniform objects, or is optimizing an LLM pipeline for cost/context. Knows the format shapes (tabular `[N]{a,b}:` rows, inline `[N]: ...`, expanded), when TOON helps vs hurts, and how to invoke installed TOON commands or wrappers when available. Example queries — "convert this API response to TOON", "will this JSON benefit from TOON", "how does TOON handle nested objects".
  Read `.codex/skills/toon-formatter/SKILL.md` before using this skill.
- `agent-entrypoint-design`: Use when designing or refactoring AGENTS.md, CLAUDE.md, GEMINI.md, Cursor rules, GitHub instructions, source-of-truth navigation, or agent onboarding entrypoints.
  Read `.codex/skills/agent-entrypoint-design/SKILL.md` before using this skill.
- `agent-ledger-and-delivery`: Use when designing agent_chats or agents_chat records, delivery evidence summaries, linked tasks or commits, validation notes, risks, review notes, or handoff records.
  Read `.codex/skills/agent-ledger-and-delivery/SKILL.md` before using this skill.
- `atomic-commit-discipline`: Use when splitting changes into atomic commits, preparing commits from mixed worktrees, staging exact paths, including related task-state updates, writing Conventional Commits, or preventing unrelated changes.
  Read `.codex/skills/atomic-commit-discipline/SKILL.md` before using this skill.
- `design-doc-and-task-board`: Use when deciding how requirements should be captured in design docs, tasks.md, external task systems, exec plans, acceptance criteria, status updates, or planning source-of-truth files.
  Read `.codex/skills/design-doc-and-task-board/SKILL.md` before using this skill.
- `quality-gardening`: Use when designing quality snapshots, generated quality reports, structural metrics, debt thresholds, regression budgets, quality gates, or gradual cleanup loops.
  Read `.codex/skills/quality-gardening/SKILL.md` before using this skill.
- `repo-contracts-and-boundaries`: Use when turning architecture, layering, directory ownership, dependency direction, file-size limits, choke points, baselines, or allowlists into repository checks.
  Read `.codex/skills/repo-contracts-and-boundaries/SKILL.md` before using this skill.
- `repo-harness-assessment`: Use when evaluating an existing repository's agent-readiness, harness maturity, validation surfaces, source-of-truth docs, evidence artifacts, or next smallest harness improvement.
  Read `.codex/skills/repo-harness-assessment/SKILL.md` before using this skill.
- `runtime-evidence-and-tracing`: Use when connecting observed behavior, logs, metrics, request IDs, run IDs, screenshots, traces, external dependency results, or artifacts into a runtime evidence loop.
  Read `.codex/skills/runtime-evidence-and-tracing/SKILL.md` before using this skill.
- `validation-harness-design`: Use when designing repository validation commands, doctor scripts, test matrices, JSON or JUnit outputs, CI gates, smoke checks, or harness command surfaces.
  Read `.codex/skills/validation-harness-design/SKILL.md` before using this skill.

## Local Skill Files

Codex skill files are stored under `.codex/skills/<skill-id>/SKILL.md` so project-specific expertise can live with the repository.

<harness:skills>
## Harness skills

When a user request matches one of the skills below, read the matching local skill file before answering, planning, or editing.

- `harness-creator`: Build, audit, and improve harnesses that make AI coding agents reliable: AGENTS.md/CLAUDE.md instruction files, feature/state tracking, verification gates, scope boundaries, session handoff, memory persistence, context budgets, tool-permission safety, and multi-agent coordination. Use this whenever a coding agent is unreliable across sessions — forgets context, drifts out of scope, claims "done" before tests pass, or starts each session inconsistently — or when creating or assessing AGENTS.md, CLAUDE.md, feature_list.json, init.sh, progress.md, or session-handoff files. Reach for it even if the user never says the word harness.
  Read `.codex/skills/harness-creator/SKILL.md` before using this skill.
- `toon-formatter`: Guidance on when and how to use TOON (Token-Oriented Object Notation) — a compact JSON alternative that typically cuts input tokens 30-50% on tabular data. Use when the user is about to paste or serialize a large JSON array into a prompt, has a payload with ≥5 uniform objects, or is optimizing an LLM pipeline for cost/context. Knows the format shapes (tabular `[N]{a,b}:` rows, inline `[N]: ...`, expanded), when TOON helps vs hurts, and how to invoke installed TOON commands or wrappers when available. Example queries — "convert this API response to TOON", "will this JSON benefit from TOON", "how does TOON handle nested objects".
  Read `.codex/skills/toon-formatter/SKILL.md` before using this skill.
- `agent-entrypoint-design`: Use when designing or refactoring AGENTS.md, CLAUDE.md, GEMINI.md, Cursor rules, GitHub instructions, source-of-truth navigation, or agent onboarding entrypoints.
  Read `.codex/skills/agent-entrypoint-design/SKILL.md` before using this skill.
- `agent-ledger-and-delivery`: Use when designing agent_chats or agents_chat records, delivery evidence summaries, linked tasks or commits, validation notes, risks, review notes, or handoff records.
  Read `.codex/skills/agent-ledger-and-delivery/SKILL.md` before using this skill.
- `atomic-commit-discipline`: Use when splitting changes into atomic commits, preparing commits from mixed worktrees, staging exact paths, including related task-state updates, writing Conventional Commits, or preventing unrelated changes.
  Read `.codex/skills/atomic-commit-discipline/SKILL.md` before using this skill.
- `design-doc-and-task-board`: Use when deciding how requirements should be captured in design docs, tasks.md, external task systems, exec plans, acceptance criteria, status updates, or planning source-of-truth files.
  Read `.codex/skills/design-doc-and-task-board/SKILL.md` before using this skill.
- `quality-gardening`: Use when designing quality snapshots, generated quality reports, structural metrics, debt thresholds, regression budgets, quality gates, or gradual cleanup loops.
  Read `.codex/skills/quality-gardening/SKILL.md` before using this skill.
- `repo-contracts-and-boundaries`: Use when turning architecture, layering, directory ownership, dependency direction, file-size limits, choke points, baselines, or allowlists into repository checks.
  Read `.codex/skills/repo-contracts-and-boundaries/SKILL.md` before using this skill.
- `repo-harness-assessment`: Use when evaluating an existing repository's agent-readiness, harness maturity, validation surfaces, source-of-truth docs, evidence artifacts, or next smallest harness improvement.
  Read `.codex/skills/repo-harness-assessment/SKILL.md` before using this skill.
- `runtime-evidence-and-tracing`: Use when connecting observed behavior, logs, metrics, request IDs, run IDs, screenshots, traces, external dependency results, or artifacts into a runtime evidence loop.
  Read `.codex/skills/runtime-evidence-and-tracing/SKILL.md` before using this skill.
- `validation-harness-design`: Use when designing repository validation commands, doctor scripts, test matrices, JSON or JUnit outputs, CI gates, smoke checks, or harness command surfaces.
  Read `.codex/skills/validation-harness-design/SKILL.md` before using this skill.
</harness:skills>
