---
name: skogai-core
description: >
  Skogai plugin marketplace management. Invoke when the user asks about
  available plugins, wants to add or remove the skogai marketplace, or wants
  to install, enable, disable, or update plugins from it.
---

The skogai marketplace is defined in `.claude-plugin/marketplace.json` at the
repo root. Skills in `skills/` are the plugin's components.

## Register the marketplace

```
/plugin marketplace add .
```

Or from outside the repo:

```
/plugin marketplace add /path/to/harness
```

## Install plugins

```
/plugin install skogai-core@skogai
/plugin list
```

## Add a new skill to the marketplace

1. Create `skills/<name>/SKILL.md` with frontmatter `description:`.
2. The skill is immediately available as `skogai-core:<name>` once the
   plugin is installed.
3. No changes to `marketplace.json` needed — skills are discovered from
   the `skills/` directory automatically.
