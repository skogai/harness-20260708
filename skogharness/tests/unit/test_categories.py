from pathlib import Path

import pytest

CATEGORIES = ["agents", "commands", "modes", "mcp"]


def _category_dir(name: str) -> Path:
    package_root = Path(__file__).resolve().parents[2] / "src" / "skogharness"
    return package_root / name


@pytest.mark.parametrize("category", CATEGORIES)
def test_category_dir_exists(category):
    assert _category_dir(category).is_dir()


@pytest.mark.parametrize("category", CATEGORIES)
def test_category_has_example_markdown_file(category):
    md_files = list(_category_dir(category).glob("*.md"))
    assert md_files, f"{category} has no example markdown file"
