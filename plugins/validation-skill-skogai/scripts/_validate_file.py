#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = [
#   "jsonschema>=4.0",
#   "pyyaml>=6.0",
# ]
# ///
"""
Internal helper for validate-schema.sh.
Usage: _validate_file.py <schema_dir> <file>
Exits 0 on pass, 1 on fail. Prints structured findings to stdout.
"""

import sys
import json
import re
import warnings
warnings.filterwarnings("ignore", category=DeprecationWarning)
from pathlib import Path

try:
    import yaml
    import jsonschema
    from jsonschema import RefResolver
except ImportError:
    print("ERROR: missing deps — run via: uv run _validate_file.py  (or: pip install jsonschema pyyaml)")
    sys.exit(2)

SCHEMA_DIR = Path(sys.argv[1]).resolve()
FILE = Path(sys.argv[2]).resolve()

TYPE_TO_SCHEMA = {
    "router":    "router.schema.json",
    "workflow":  "workflow.schema.json",
    "reference": "reference.schema.json",
    "template":  "template.schema.json",
    "script":    "script.schema.json",
    "lesson":    "lesson.schema.json",
    "decision":  "decision.schema.json",
    "pattern":   "pattern.schema.json",
    "principle": "principle.schema.json",
    "list":      "list.schema.json",
}

def parse_frontmatter(text):
    m = re.match(r"^---\s*\n(.*?)\n---\s*\n", text, re.DOTALL)
    if not m:
        return None
    return yaml.safe_load(m.group(1))

def body_without_frontmatter(text):
    m = re.match(r"^---\s*\n(.*?)\n---\s*\n", text, re.DOTALL)
    if not m:
        return text
    return text[m.end():]

def extract_xml_sections(text):
    """Return xml sections present in the document body."""
    sections = []
    seen = set()
    for m in re.finditer(r"<([a-z][a-z0-9_]*)(?:\s[^>]*)?>", text):
        name = m.group(1)
        if name in seen:
            continue
        close = re.search(rf"</{re.escape(name)}>", text[m.end():])
        content = text[m.end():m.end() + close.start()].strip() if close else ""
        sections.append({"kind": "xml", "name": name, "content": content})
        seen.add(name)
    return sections

def build_document(path, fm, raw):
    """Build a minimal document object for schema validation."""
    sections = extract_xml_sections(raw)

    headings = []
    for m in re.finditer(r"^(#{1,6})\s+(.+)$", raw, re.MULTILINE):
        headings.append({"level": len(m.group(1)), "title": m.group(2).strip()})

    doc = {
        "path": str(path),
        "type": fm.get("type", ""),
        "sections": sections,
    }
    if fm:
        doc["frontmatter"] = fm
    if headings:
        doc["headings"] = headings
    return doc

def build_list(raw):
    """Build list entries from a .list checklist body."""
    entries = []
    body = body_without_frontmatter(raw)
    for line in body.splitlines():
        m = re.match(r"^\s*-\s+\[([ xX])\]\s+(.+?)\s*$", line)
        if not m:
            continue
        status = "done" if m.group(1).lower() == "x" else "open"
        entries.append({
            "type": "entry",
            "status": status,
            "message": m.group(2),
        })
    return entries

def build_schema_input(path, fm, raw):
    doc_type = fm.get("type", "")
    if doc_type == "list":
        return build_list(raw)
    return build_document(path, fm, raw)

def load_schema(name):
    p = SCHEMA_DIR / name
    with open(p) as f:
        return json.load(f)

def make_resolver():
    store = {}
    for p in SCHEMA_DIR.glob("*.json"):
        s = json.loads(p.read_text())
        sid = s.get("$id", p.name)
        store[sid] = s
        store[p.name] = s
    base_uri = SCHEMA_DIR.as_uri() + "/"
    return RefResolver(base_uri=base_uri, referrer={}, store=store)

errors = []
warnings = []

raw = FILE.read_text()
fm = parse_frontmatter(raw)

XML_ROOT_TO_TYPE = {
    "workflow":  "workflow",
    "reference": "reference",
    "template":  "template",
    "script":    "script",
    "router":    "router",
    "lesson":    "lesson",
    "principle": "principle",
}

if fm is None:
    # fall back: infer type from first XML root tag
    m = re.match(r"^\s*<([a-z][a-z0-9_]*)[\s>]", raw)
    inferred = XML_ROOT_TO_TYPE.get(m.group(1)) if m else None
    if inferred is None and FILE.suffix == ".list":
        inferred = "list"
    if not inferred:
        warnings.append("no frontmatter and no recognised XML root tag — skipping")
        print(f"WARN  {FILE.name}: " + "; ".join(warnings))
        sys.exit(0)
    fm = {"type": inferred}

doc_type = fm.get("type")
if not doc_type:
    warnings.append("frontmatter missing 'type' field")
    print(f"WARN  {FILE.name}: " + "; ".join(warnings))
    sys.exit(0)

schema_name = TYPE_TO_SCHEMA.get(doc_type)
if not schema_name:
    warnings.append(f"no schema mapped for type '{doc_type}'")
    print(f"WARN  {FILE.name}: " + "; ".join(warnings))
    sys.exit(0)

if FILE.suffix == ".list" and doc_type != "list":
    errors.append(f".list files must use type: list, got '{doc_type}'")

schema = load_schema(schema_name)
resolver = make_resolver()
doc = build_schema_input(FILE, fm, raw)

validator = jsonschema.Draft202012Validator(schema, resolver=resolver)
if not errors:
    for err in sorted(validator.iter_errors(doc), key=lambda e: list(e.path)):
        path = " > ".join(str(p) for p in err.path) or "(root)"
        errors.append(f"{path}: {err.message}")

if errors:
    print(f"FAIL  {FILE.relative_to(FILE.parent.parent) if FILE.parent.name else FILE.name}")
    for e in errors:
        print(f"      {e}")
    sys.exit(1)
else:
    print(f"PASS  {FILE.name}")
    sys.exit(0)
