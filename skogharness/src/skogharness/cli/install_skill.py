"""
Skill installation command.

Copies every skill directory under src/skogharness/skills/ into a target
.claude/skills/ directory. Plain copy — no manifest, sync, or
managed-block tracking.
"""

import shutil
from pathlib import Path
from typing import List, NamedTuple


class InstallResult(NamedTuple):
    skill_name: str
    installed: bool
    message: str


def get_skills_source() -> Path:
    """Directory containing this package's skill source directories."""
    return Path(__file__).resolve().parent.parent / "skills"


def list_available_skills() -> List[str]:
    source = get_skills_source()
    if not source.exists():
        return []
    return sorted(
        item.name
        for item in source.iterdir()
        if item.is_dir() and (item / "SKILL.md").exists()
    )


def resolve_target(target: Path) -> Path:
    """Resolve and validate a target skills directory.

    Refuses targets that resolve above the current working directory's
    parent, as a basic guard against writing outside the intended tree.
    """
    resolved = target.expanduser().resolve()
    cwd_root = Path.cwd().resolve().anchor
    if str(resolved) == cwd_root or resolved == Path(cwd_root):
        raise ValueError(f"Refusing to install into filesystem root: {resolved}")
    return resolved


def install_skills(target: Path, dry_run: bool = False) -> List[InstallResult]:
    """Install every available skill into target, overwriting existing copies."""
    source = get_skills_source()
    target = resolve_target(target)
    results: List[InstallResult] = []

    for skill_name in list_available_skills():
        skill_source = source / skill_name
        skill_target = target / skill_name

        if dry_run:
            results.append(
                InstallResult(skill_name, True, f"Would install to {skill_target}")
            )
            continue

        target.mkdir(parents=True, exist_ok=True)
        if skill_target.exists():
            shutil.rmtree(skill_target)
        try:
            shutil.copytree(skill_source, skill_target)
            results.append(
                InstallResult(skill_name, True, f"Installed to {skill_target}")
            )
        except OSError as e:
            results.append(InstallResult(skill_name, False, f"Failed: {e}"))

    return results
