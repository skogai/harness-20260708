# Skogharness Basic Structure Knowledge

## Decisions

- `.example/` is reference material only.
- `skogharness/` is the implementation target equivalent to `.example/superclaude/`.
- Phase 1 is documentation and example shape only.
- The first hook is an example config, not a working automation path.

## Current Boundaries

- Keep this work inside `skogharness/`.
- Do not modify `harness-creator`.
- Do not add installer or test behavior before the basic structure exists.

## Notes

- The `dev/` docs mirror the persistent context pattern from `.example/dev/README.md` in a simpler form.
- The initial agent, command, and hook files should be boring and explicit. Their job is to establish shape, not functionality.
