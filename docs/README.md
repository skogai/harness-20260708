# Harness documentation

This folder explains why `skogharness` is implemented as a small manifest-driven
CLI and how the major pieces fit together.

## Start here

- [Implementation approach](./implementation.md): the design rationale, data flow,
  and maintenance rules for the current implementation.
- [Project specs](./specs.md): quick-reference runtime, structure, commands,
  and conventions.
- [Features: have, need, want](./features.md): what's implemented, what's
  missing to complete the current design, and what's deliberately out of
  scope or aspirational.

## What belongs here

Use `docs/` for durable implementation notes that are too detailed for the
top-level README:

- why the harness owns a particular behavior;
- how manifest data is translated into agent-native config;
- what boundaries generated files must preserve;
- how templates, skills, MCP servers, and profiles should evolve;
- operational notes that help future maintainers make compatible changes.

Keep the top-level README focused on install and day-to-day usage. Put deeper
maintenance guidance here.
