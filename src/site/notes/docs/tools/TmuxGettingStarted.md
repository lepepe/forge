---
{"dg-publish":true,"permalink":"/docs/tools/tmux-getting-started/","tags":["tmux","terminal","multiplexer","tools"]}
---

# Tmux Getting Started Guide

## Overview

Tmux (Terminal Multiplexer) is a tool that lets you run multiple terminal sessions inside a single window. It supports splitting panes, managing windows, and detaching/reattaching sessions -- making it essential for remote work, long-running processes, and organized terminal workflows.

> **Prefix key:** All tmux shortcuts start with `Ctrl-a` (the prefix), followed by the command key.

---

## Installation

```bash
# macOS
brew install tmux

# Debian / Ubuntu
sudo apt install tmux

# Arch Linux
sudo pacman -S tmux

# Verify installation
tmux -V
```

---

## Session Management

Sessions are the top-level container in tmux. They persist even after you disconnect.

### Commands from the Shell

| Command | Description |
|---------|-------------|
| `tmux` | Start a new unnamed session |
| `tmux new -s name` | Start a new named session |
| `tmux ls` | List all sessions |
| `tmux attach -t name` | Attach to a named session |
| `tmux kill-session -t name` | Kill a specific session |
| `tmux kill-server` | Kill all sessions and the tmux server |
| `tmux rename-session -t old new` | Rename a session from the shell |

### Keybindings Inside tmux

| Shortcut   | Description                      |
| ---------- | -------------------------------- |
| `Ctrl-a d` | Detach from current session      |
| `Ctrl-a $` | Rename current session           |
| `Ctrl-a s` | List and switch between sessions |
| `Ctrl-a (` | Switch to previous session       |
| `Ctrl-a )` | Switch to next session           |

---

## Windows (Tabs)

Windows act as tabs within a session. Each window contains one or more panes.

| Shortcut     | Description                              |
| ------------ | ---------------------------------------- |
| `Ctrl-a c`   | Create a new window                      |
| `Ctrl-a ,`   | Rename current window                    |
| `Ctrl-a n`   | Next window                              |
| `Ctrl-a p`   | Previous window                          |
| `Ctrl-a w`   | List all windows (interactive picker)    |
| `Ctrl-a 0-9` | Jump to window by number                 |
| `Ctrl-a l`   | Toggle to last active window             |
| `Ctrl-a &`   | Close current window (with confirmation) |
| `Ctrl-a f`   | Find window by name                      |

---

## Panes (Splits)

Panes split a window into multiple terminal views.

### Creating and Closing

| Shortcut   | Description                            |
| ---------- | -------------------------------------- |
| `Ctrl-a %` | Split pane vertically (left/right)     |
| `Ctrl-a "` | Split pane horizontally (top/bottom)   |
| `Ctrl-a x` | Close current pane (with confirmation) |

### Navigation

| Shortcut        | Description                              |
| --------------- | ---------------------------------------- |
| `Ctrl-a o`      | Cycle to next pane                       |
| `Ctrl-a ;`      | Toggle to last active pane               |
| `Ctrl-a q`      | Show pane numbers (press number to jump) |
| `Ctrl-a arrows` | Move between panes directionally         |

### Resizing

| Shortcut             | Description                              |
| -------------------- | ---------------------------------------- |
| `Ctrl-a Ctrl-arrows` | Resize pane in arrow direction (1 cell)  |
| `Ctrl-a Alt-arrows`  | Resize pane in arrow direction (5 cells) |

### Layout

| Shortcut       | Description                    |
| -------------- | ------------------------------ |
| `Ctrl-a Space` | Cycle through preset layouts   |
| `Ctrl-a Alt-1` | Even horizontal layout         |
| `Ctrl-a Alt-2` | Even vertical layout           |
| `Ctrl-a Alt-3` | Main horizontal layout         |
| `Ctrl-a Alt-4` | Main vertical layout           |
| `Ctrl-a Alt-5` | Tiled layout                   |
| `Ctrl-a {`     | Swap pane with previous        |
| `Ctrl-a }`     | Swap pane with next            |
| `Ctrl-a z`     | Toggle pane zoom (fullscreen)  |
| `Ctrl-a !`     | Convert pane into a new window |

---

## Copy Mode (Scrollback & Selection)

Copy mode allows scrolling through output and copying text.

| Shortcut                   | Description                       |
| -------------------------- | --------------------------------- |
| `Ctrl-a [`                 | Enter copy mode                   |
| `q`                        | Exit copy mode                    |
| `arrows` / `PgUp` / `PgDn` | Navigate in copy mode             |
| `Space`                    | Start selection (in copy mode)    |
| `Enter`                    | Copy selection and exit copy mode |
| `Ctrl-a ]`                 | Paste copied text                 |
| `/`                        | Search forward (in copy mode)     |
| `?`                        | Search backward (in copy mode)    |
| `n` / `N`                  | Next / previous search match      |
| `g` / `G`                  | Jump to top / bottom              |

> **Tip:** If you set `set-window-option -g mode-keys vi` in your config, copy mode uses vim-style keys (`h/j/k/l`, `v` for selection, `y` to yank).

---

## Command Mode

| Shortcut   | Description                  |
| ---------- | ---------------------------- |
| `Ctrl-a :` | Open the tmux command prompt |
| `Ctrl-a ?` | List all key bindings        |

### Useful Command Mode Examples

```bash
# From the tmux command prompt (Ctrl-a :)
source-file ~/.tmux.conf       # Reload configuration
list-keys                      # Show all bindings
set -g mouse on                # Enable mouse support (current session)
setw -g mode-keys vi           # Set vi copy mode keys
swap-window -t 0               # Swap current window with window 0
move-window -t 3               # Move current window to position 3
```

---

## Configuration

Tmux is configured via `~/.tmux.conf`. Changes apply on new sessions or after reloading.

### Reload Config

```bash
# From the shell
tmux source-file ~/.tmux.conf

# From inside tmux
Ctrl-a :source-file ~/.tmux.conf
```

### Starter Configuration

```bash
# ~/.tmux.conf

# Remap prefix to Ctrl-a (easier to reach)
unbind C-b
set -g prefix C-a
bind C-a send-prefix

# Enable mouse support
set -g mouse on

# Start window numbering at 1
set -g base-index 1
setw -g pane-base-index 1

# Renumber windows when one is closed
set -g renumber-windows on

# Increase scrollback buffer
set -g history-limit 10000

# Vi-style copy mode
setw -g mode-keys vi

# More intuitive split keys
bind | split-window -h -c "#{pane_current_path}"
bind - split-window -v -c "#{pane_current_path}"
unbind %
unbind '"'

# Reload config shortcut
bind r source-file ~/.tmux.conf \; display "Config reloaded"

# Faster escape time (useful for vim/neovim)
set -sg escape-time 10

# True color support
set -g default-terminal "tmux-256color"
set -ag terminal-overrides ",xterm-256color:RGB"
```

---

## Common Workflows

### Keep a Process Running After Disconnect

```bash
# Start a named session and run your process
tmux new -s build
npm run build       # or any long-running command

# Detach with Ctrl-a d
# Later, reattach from anywhere
tmux attach -t build
```

### Side-by-Side Editing

```bash
tmux new -s dev
# Ctrl-a % to split vertically
# Left pane: vim/neovim
# Right pane: tests or logs
```

### Monitoring Multiple Servers

```bash
tmux new -s servers
# Create windows for each server
Ctrl-a c            # New window for server 2
Ctrl-a c            # New window for server 3
Ctrl-a ,            # Rename each window
Ctrl-a w            # Quick switch between them
```

---

## Quick Reference

| Task             | Command / Shortcut                 |
| ---------------- | ---------------------------------- |
| New session      | `tmux new -s name`                 |
| Attach           | `tmux attach -t name`              |
| Detach           | `Ctrl-a d`                         |
| List sessions    | `tmux ls`                          |
| New window       | `Ctrl-a c`                         |
| Split vertical   | `Ctrl-a %`                         |
| Split horizontal | `Ctrl-a "`                         |
| Navigate panes   | `Ctrl-a arrows`                    |
| Zoom pane        | `Ctrl-a z`                         |
| Copy mode        | `Ctrl-a [`                         |
| Paste            | `Ctrl-a ]`                         |
| Kill pane        | `Ctrl-a x`                         |
| Reload config    | `Ctrl-a :source-file ~/.tmux.conf` |

---

## Related Topics

- [[docs/tools/ClaudeGettingStarted\|Claude Code Getting Started]]
- [[docs/tools/QMDGettingStarted\|QMD Getting Started]]

---

## Sources

- [Tmux GitHub Repository](https://github.com/tmux/tmux)
- [Tmux Man Page](https://man7.org/linux/man-pages/man1/tmux.1.html)

---

#tmux #terminal #multiplexer #tools
