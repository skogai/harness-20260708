# Tech Stack

- Python hook scripts with inline PEP 723 metadata; require Python >=3.11.
- `uv` is required on PATH and is the script runner (`uv run --script` / `uv run ...`).
- No root `pyproject.toml`, lockfile, or repo-wide Python package/test-runner config.
- Claude Code plugin manifests use JSON: root marketplace catalog plus plugin-local `.claude-plugin/plugin.json`.
- Optional local Ollama integration only for `user_prompt_submit.py --name-agent`; env `OLLAMA_MODEL` defaults to `gpt-oss:20b`; unavailable Ollama must degrade silently.
- Validators live in `plugins/skoghooks/scripts/validators/` (`ruff_validator.py`, `ty_validator.py`, `validate_new_file.py`, `validate_file_contains.py`) but are utilities, not a repo-wide configured lint stack.