"""Validate the legal document template dataset in templates/.

Checks that every template listed in templates/catalog.json exists, that the
placeholders used in each template match the variables declared for it, and
that each template renders with no leftover placeholders when filled with the
example values from the catalog.

Usage: python scripts/validate_templates.py
"""

import json
import re
import sys
from pathlib import Path

TEMPLATES_DIR = Path(__file__).resolve().parent.parent / "templates"
CATALOG_PATH = TEMPLATES_DIR / "catalog.json"

PLACEHOLDER = re.compile(r"\{\{\s*([a-z][a-z0-9_]*)\s*\}\}")
REQUIRED_TEMPLATE_KEYS = {"id", "title", "category", "description", "file", "variables"}
REQUIRED_VARIABLE_KEYS = {"name", "label", "type", "example"}
VARIABLE_TYPES = {"string", "text", "date", "number", "email", "url"}


def render(template_text, values):
    """Replace each {{name}} placeholder with values[name]."""
    return PLACEHOLDER.sub(lambda m: str(values[m.group(1)]), template_text)


def validate_template(entry):
    errors = []
    template_id = entry.get("id", "<missing id>")

    missing = REQUIRED_TEMPLATE_KEYS - entry.keys()
    if missing:
        return [f"{template_id}: missing keys {sorted(missing)}"]

    path = TEMPLATES_DIR / entry["file"]
    if not path.is_file():
        return [f"{template_id}: file {entry['file']} not found"]

    declared = {}
    for variable in entry["variables"]:
        name = variable.get("name", "<missing name>")
        missing = REQUIRED_VARIABLE_KEYS - variable.keys()
        if missing:
            errors.append(f"{template_id}.{name}: missing keys {sorted(missing)}")
        if variable.get("type") not in VARIABLE_TYPES:
            errors.append(f"{template_id}.{name}: unknown type {variable.get('type')!r}")
        if name in declared:
            errors.append(f"{template_id}.{name}: declared more than once")
        declared[name] = variable

    text = path.read_text(encoding="utf-8")
    used = set(PLACEHOLDER.findall(text))
    for name in sorted(used - declared.keys()):
        errors.append(f"{template_id}: placeholder {{{{{name}}}}} is not declared in the catalog")
    for name in sorted(declared.keys() - used):
        errors.append(f"{template_id}: variable {name} is declared but never used")

    if not errors:
        rendered = render(text, {name: v["example"] for name, v in declared.items()})
        if "{{" in rendered or "}}" in rendered:
            errors.append(f"{template_id}: malformed placeholder left after rendering")

    return errors


def main():
    catalog = json.loads(CATALOG_PATH.read_text(encoding="utf-8"))
    entries = catalog["templates"]
    errors = []

    ids = [entry.get("id") for entry in entries]
    for template_id in sorted({i for i in ids if ids.count(i) > 1}):
        errors.append(f"duplicate template id {template_id}")

    listed_files = {entry.get("file") for entry in entries}
    for path in sorted(TEMPLATES_DIR.glob("*.md")):
        if path.name not in listed_files:
            errors.append(f"{path.name} is not listed in catalog.json")

    for entry in entries:
        errors.extend(validate_template(entry))

    if errors:
        print("\n".join(errors))
        print(f"\n{len(errors)} problem(s) found.")
        return 1

    print(f"All {len(entries)} templates are valid.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
