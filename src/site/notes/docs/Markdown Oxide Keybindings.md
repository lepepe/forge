---
{"dg-publish":true,"permalink":"/docs/markdown-oxide-keybindings/","tags":["markdown-oxide","neovim","md"]}
---

# Markdown Oxide Keybindings

Quick reference for using markdown-oxide LSP in Neovim with LazyVim.

## Completions

| Trigger | Description |
|---------|-------------|
| `[[` | Complete wiki-links to notes |
| `[[#` | Complete headings in current file |
| `[[note#` | Complete headings in specific note |
| `#` | Complete tags |
| `^` | Complete block references |

## LSP Actions (LazyVim defaults)

| Keybinding | Action |
|------------|--------|
| `gd` | Go to definition (follow link) |
| `gr` | Find references (backlinks) |
| `K` | Hover info (preview linked note) |
| `<leader>cr` | Rename (rename note and update links) |
| `<leader>ca` | Code actions |

## Workspace Commands

| Keybinding | Action |
|------------|--------|
| `<leader>cs` | Document symbols (headings outline) |
| `<leader>cS` | Workspace symbols (search all notes) |

## Daily Notes

With the `.moxide.toml` config, daily notes are stored in `daily/` with format `YYYY-MM-DD.md`.

| Keybinding | Action |
|------------|--------|
| `<leader>nd` | Open/create today's daily note |
| `<leader>nn` | Create new note (prompts for name) |

## Tips

- Use `[[` then type to fuzzy search notes
- Hover (`K`) on a link shows the note preview
- `gr` on any heading shows all notes linking to it
- Tags complete after `#` with fuzzy matching
