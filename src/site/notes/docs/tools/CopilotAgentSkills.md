---
{"dg-publish":true,"permalink":"/docs/tools/copilot-agent-skills/","tags":["github-copilot","cli","ai","tools","skills"]}
---

# GitHub Copilot Agent Skills

## Overview

Agent Skills are Markdown files that teach Copilot how your team writes code. Instead of a generic response, Copilot follows your conventions, uses your libraries, and produces output that matches your patterns from line one.

Skills live in `.github/skills/` inside your repository — version-controlled, shared, and owned by the team. They load automatically when your prompt is relevant to them.

> **Minimum version required:** GitHub Copilot CLI `0.0.420+`
> Upgrade: `npm install -g @github/copilot@latest` or `winget upgrade GitHub.Copilot`

---

## How Skills Work

```
.github/skills/<skill-name>/SKILL.md  ←  one directory per skill
```

Each skill has two parts:

1. **Frontmatter** — `name` and `description`. The description is what triggers automatic activation; Copilot reads it to decide if the skill is relevant to your prompt.
2. **Body** — the instructions, rules, and code templates Copilot follows when the skill is active.

### Minimal example

```markdown
---
name: my-skill
description: Guide for doing X. Use this when asked to do X.
---

When asked to do X, follow these steps:
1. ...
2. ...
```

---

## Directory Structure

```
.github/skills/
  <skill-name>/
    SKILL.md          ← required, must be named exactly SKILL.md
    example.py        ← optional supporting files
    schema.sql        ← optional supporting files
```

- The directory name becomes the skill's slug (used in `/skill-name` invocations)
- Only `SKILL.md` is required — additional files in the directory are available as context
- Multiple skills can coexist; each lives in its own subdirectory

---

## How to Invoke

Invoke a skill by name with a `/` prefix in your prompt:

```
Use the /my-skill to <describe what you need>
```

### Useful commands

```
/skills list      # show all detected skills and their status
/skills info      # details and file location of a specific skill
```

Skills can also be toggled on/off with `/skills` using arrow keys and spacebar.

---

## SKILL.md Frontmatter

| Field | Required | Description |
|---|---|---|
| `name` | Yes | Unique identifier — lowercase, hyphens for spaces |
| `description` | Yes | What the skill does and when Copilot should use it |
| `license` | No | License that applies to this skill |

The `description` field is the most important — write it as a trigger: *"Use this when asked to…"*

---

## Writing Good Skills

### Structure your body in three sections

1. **Context** — what problem this skill solves and when to use it
2. **Rules** — conventions, patterns, and things to avoid
3. **Template** — a concrete code or output example to follow

### Tips

- Be explicit about what **not** to generate — constraints are as valuable as examples
- Use tables for conventions and decision rules (e.g. when to pick option A vs B)
- Include a code template even if partial — it anchors the output more than prose alone
- Keep the `description` concise and action-oriented; it's used for automatic matching

---

## Where Skills Work

| Surface | Support |
|---|---|
| GitHub Copilot CLI (terminal) | ✅ `0.0.420+` |
| Copilot Chat in VS Code | ✅ via `#file:` reference or agent mode |
| Copilot Coding Agent | ✅ |
| Copilot Chat on github.com | Partial — attach the file manually |

---

## Related Docs

- [[docs/tools/ClaudeGettingStarted\|Claude Code Getting Started]]

---

## Sources

- [Creating agent skills for GitHub Copilot CLI — GitHub Docs](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/create-skills)
- [GitHub Copilot now supports Agent Skills — Changelog](https://github.blog/changelog/2025-12-18-github-copilot-now-supports-agent-skills/)
- [GitHub Copilot CLI — Generally Available](https://github.blog/changelog/2026-02-25-github-copilot-cli-is-now-generally-available/)

---

#github-copilot #cli #ai #tools #skills
