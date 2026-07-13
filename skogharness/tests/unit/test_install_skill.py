from pathlib import Path

import pytest

from skogharness.cli.install_skill import (
    install_skills,
    list_available_skills,
    resolve_target,
)


def test_lists_all_nine_skills():
    skills = list_available_skills()
    assert len(skills) == 10
    assert "harness-creator" in skills


def test_install_copies_all_skills(tmp_path):
    target = tmp_path / ".claude" / "skills"
    results = install_skills(target)

    assert all(r.installed for r in results)
    for name in list_available_skills():
        assert (target / name / "SKILL.md").exists()


def test_install_is_idempotent(tmp_path):
    target = tmp_path / ".claude" / "skills"
    install_skills(target)
    results = install_skills(target)

    assert all(r.installed for r in results)
    for name in list_available_skills():
        assert (target / name / "SKILL.md").exists()


def test_dry_run_writes_nothing(tmp_path):
    target = tmp_path / ".claude" / "skills"
    results = install_skills(target, dry_run=True)

    assert all(r.installed for r in results)
    assert not target.exists()


def test_resolve_target_rejects_filesystem_root():
    with pytest.raises(ValueError):
        resolve_target(Path("/"))
