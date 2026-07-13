"""skogharness CLI entry point."""

import os
from pathlib import Path

import click

from .install_skill import install_skills


def _default_skills_target() -> Path:
    project_dir = os.environ.get("CLAUDE_PROJECT_DIR")
    if project_dir:
        return Path(project_dir) / ".claude" / "skills"
    return Path.cwd() / ".claude" / "skills"


@click.group()
def main():
    """skogharness — installs this repo's .claude/ content from source categories."""


@main.group()
def install():
    """Install a content category into a target .claude/ directory."""


@install.command("skills")
@click.option(
    "--target",
    type=click.Path(path_type=Path),
    default=None,
    help="Target skills directory (default: $CLAUDE_PROJECT_DIR/.claude/skills).",
)
@click.option(
    "--dry-run",
    is_flag=True,
    default=False,
    help="Preview what would be installed without writing anything.",
)
def install_skills_command(target: Path, dry_run: bool):
    """Copy every skill under src/skogharness/skills/ into the target directory."""
    target = target or _default_skills_target()
    results = install_skills(target, dry_run=dry_run)

    if not results:
        click.echo("No skills found to install.")
        return

    for result in results:
        prefix = "OK" if result.installed else "FAIL"
        click.echo(f"[{prefix}] {result.skill_name}: {result.message}")

    if any(not r.installed for r in results):
        raise SystemExit(1)


if __name__ == "__main__":
    main()
