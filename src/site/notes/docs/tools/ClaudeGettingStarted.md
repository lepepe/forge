---
{"dg-publish":true,"permalink":"/docs/tools/claude-getting-started/","tags":["claude","cli","ai","tools","coding"]}
---

# Claude Code Getting Started Guide

## Overview

Claude Code is Anthropic's official CLI tool for AI-assisted software development. It provides an interactive terminal experience where Claude can read, write, and execute code in your projects while understanding the full context of your codebase.

---

## Installation

### Native Installation (Recommended)

```bash
# macOS / Linux / WSL
curl -fsSL https://claude.ai/install.sh | bash

# Windows PowerShell
irm https://claude.ai/install.ps1 | iex

# Windows CMD
curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del install.cmd
```

### Alternative Methods

```bash
# Homebrew (macOS/Linux)
brew install --cask claude-code

# WinGet (Windows)
winget install Anthropic.ClaudeCode
```

### System Requirements

| Requirement | Specification |
|-------------|---------------|
| macOS | 13.0+ |
| Linux | Ubuntu 20.04+ / Debian 10+ |
| Windows | 10 1809+ / Server 2019+ |
| RAM | 4GB minimum |
| Shell | Bash or Zsh recommended |

### Authentication

After installation, run `claude` and follow the OAuth flow. Options include:
- **Claude Pro/Max** - Unified subscription (recommended)
- **Claude Console** - API billing
- **Teams/Enterprise** - Centralized billing
- **Cloud Providers** - Amazon Bedrock, Google Vertex AI

---

## Basic Commands

### Starting a Session

| Command | Description |
|---------|-------------|
| `claude` | Start interactive REPL |
| `claude "query"` | Start with an initial prompt |
| `claude -c` | Continue most recent conversation |
| `claude -r "session"` | Resume session by ID or name |

### Non-Interactive Mode

| Command | Description |
|---------|-------------|
| `claude -p "query"` | Print response and exit |
| `cat file \| claude -p "query"` | Process piped content |
| `claude -p "query" --output-format json` | Output as JSON |

### Maintenance

| Command | Description |
|---------|-------------|
| `claude update` | Update to latest version |
| `claude doctor` | Check installation health |
| `claude mcp` | Configure MCP servers |

---

## Slash Commands

### Session & Navigation

| Command | Description |
|---------|-------------|
| `/clear` | Clear conversation history |
| `/resume [session]` | Resume previous conversation |
| `/rename <name>` | Name current session |
| `/exit` | Exit the REPL |

### Configuration & Status

| Command | Description |
|---------|-------------|
| `/config` | Open settings interface |
| `/status` | Show version, model, account info |
| `/model` | Change AI model |
| `/permissions` | View or update permissions |
| `/mcp` | Manage MCP server connections |

### Context & Cost Management

| Command | Description |
|---------|-------------|
| `/context` | Visualize context usage |
| `/cost` | Show token usage statistics |
| `/compact [instructions]` | Compact conversation to save context |
| `/memory` | Edit CLAUDE.md memory files |

### Utilities

| Command | Description |
|---------|-------------|
| `/help` | Get usage help |
| `/init` | Initialize project with CLAUDE.md |
| `/doctor` | Check installation health |
| `/export [filename]` | Export conversation to file |
| `/copy` | Copy last response to clipboard |

### Task Management

| Command | Description |
|---------|-------------|
| `/tasks` | List background tasks |
| `/todos` | List current TODO items |
| `/plan` | Enter plan mode |
| `/rewind` | Rewind to previous state |

---

## Keyboard Shortcuts

### General Controls

| Shortcut | Action |
|----------|--------|
| `Ctrl+C` | Cancel current input or generation |
| `Ctrl+D` | Exit Claude Code |
| `Ctrl+G` | Open prompt in external editor |
| `Ctrl+L` | Clear terminal screen |
| `Ctrl+O` | Toggle verbose output |
| `Ctrl+R` | Reverse search history |
| `Ctrl+V` | Paste image from clipboard |
| `Ctrl+B` | Background running tasks |
| `Ctrl+T` | Toggle task list |
| `Esc+Esc` | Rewind code/conversation |
| `Shift+Tab` | Cycle permission modes |

### Model Controls

| Shortcut | Action |
|----------|--------|
| `Alt+P` / `Option+P` | Switch model |
| `Alt+T` / `Option+T` | Toggle extended thinking |

### Multiline Input

| Method | Shortcut |
|--------|----------|
| Quick escape | `\` + `Enter` |
| macOS | `Option+Enter` |
| Control sequence | `Ctrl+J` |
| Terminal-specific | `Shift+Enter` |

### Special Prefixes

| Prefix | Action |
|--------|--------|
| `/` | Execute slash command |
| `!` | Run bash command directly |
| `@` | File path autocomplete |

---

## Permission Modes

Claude Code has three permission modes, cycled with `Shift+Tab`:

| Mode | Symbol | Behavior |
|------|--------|----------|
| Normal | (default) | Prompts for each action |
| Auto-Accept | ⏵⏵ | Auto-approves tool execution |
| Plan | ⏸ | Read-only analysis mode |

---

## Configuration

### Settings Locations

| Location | Scope | Purpose |
|----------|-------|---------|
| `~/.claude/settings.json` | User | Personal defaults |
| `.claude/settings.json` | Project | Team-shared settings |
| `.claude/settings.local.json` | Local | Personal project overrides |
| `~/.claude/CLAUDE.md` | User | Global memory/instructions |
| `.claude/CLAUDE.md` | Project | Project-specific context |

### Example Settings

```json
{
  "permissions": {
    "allow": ["Bash(npm run test)", "Bash(git commit *)"],
    "deny": ["Bash(curl *)", "Read(.env)"]
  },
  "model": "claude-sonnet-4-5-20250929",
  "sandbox.enabled": true
}
```

### CLAUDE.md Memory File

Create a `CLAUDE.md` in your project root or `~/.claude/` to provide persistent context:

```markdown
# Project Context

## Build Commands
- `npm run dev` - Start development server
- `npm run test` - Run tests

## Code Style
- Use TypeScript strict mode
- Prefer functional components
```

---

## MCP Integration

Model Context Protocol (MCP) connects Claude to external tools and services.

### Adding MCP Servers

```bash
# Remote HTTP server
claude mcp add --transport http my-server https://example.com/mcp

# Local stdio server
claude mcp add --transport stdio my-tool -- npx my-tool-server

# List configured servers
claude mcp list

# Check status in session
/mcp
```

### Project-Scoped MCP

Create `.mcp.json` in project root:

```json
{
  "mcpServers": {
    "my-server": {
      "command": "npx",
      "args": ["my-mcp-server"]
    }
  }
}
```

---

## Common Workflows

### Exploring a Codebase

```
> give me an overview of this codebase
> explain the main architecture
> what are the key data models?
```

### Fixing Bugs

```
> I'm seeing this error when I run npm test
> suggest ways to fix this issue
> update the file to add the fix
> run tests to verify
```

### Working with Files

```
> @src/utils/auth.js explain this file
> refactor to use async/await
> add error handling
```

### Creating Commits

```
> /commit
# or manually:
> summarize changes and create a commit
```

### Resuming Work

```bash
# Resume most recent session
claude -c

# Resume by name
claude -r my-feature

# Interactive session picker
claude --resume
```

---

## Output Formats

For non-interactive use, specify output format:

```bash
# Plain text (default)
claude -p "explain this" --output-format text

# JSON response
claude -p "list files" --output-format json

# Streaming JSON
claude -p "analyze code" --output-format stream-json
```

---

## Tips & Best Practices

1. **Use `@` mentions** - Reference files directly: `@src/app.ts`
2. **Name sessions** - Use `/rename` for easier resumption
3. **Leverage Plan Mode** - Start with `Shift+Tab` for complex analysis
4. **Compact regularly** - Use `/compact` to manage context limits
5. **Set up CLAUDE.md** - Provide project context for better responses
6. **Use MCP** - Integrate external tools for enhanced capabilities
7. **Background long tasks** - Press `Ctrl+B` during execution

---

## Quick Reference

### Daily Workflow

```bash
# Start working
cd /path/to/project
claude

# In session
/status              # Check connection
@file.ts explain     # Analyze files
/compact             # Save context
/rename my-task      # Name session
```

### Common Commands

| Task | Command |
|------|---------|
| Start session | `claude` |
| Continue session | `claude -c` |
| Resume by name | `claude -r "name"` |
| Check health | `claude doctor` |
| Update CLI | `claude update` |
| Show help | `/help` |
| Clear history | `/clear` |
| Show costs | `/cost` |
| Export chat | `/export` |

---

## Related Topics

- [[docs/tools/QMDGettingStarted\|QMD Getting Started]]

---

## Sources

- [Claude Code Documentation](https://docs.anthropic.com/en/docs/claude-code)
- [Model Context Protocol](https://modelcontextprotocol.io/)

---

#claude #cli #ai #tools #coding #mcp
