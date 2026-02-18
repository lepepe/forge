---
{"dg-publish":true,"permalink":"/docs/tools/pacman-paru-getting-started/","tags":["pacman","paru","arch","package-manager","tools"]}
---

# Pacman & Paru Getting Started Guide

## Overview

**Pacman** is the default package manager for Arch Linux and its derivatives. It handles packages from the official repositories.

**Paru** is an AUR (Arch User Repository) helper built on top of pacman. It can do everything pacman can, plus install and manage community-maintained AUR packages.

> **Rule of thumb:** Use `pacman` for official repo packages (requires `sudo`). Use `paru` for AUR packages (runs as your user, calls `sudo` internally when needed).

---

## Installation

### Pacman

Pacman comes pre-installed on Arch Linux. To ensure it's up to date:

```bash
sudo pacman -Syu
```

### Paru

Paru itself is an AUR package, so you need to bootstrap it manually once:

```bash
sudo pacman -S --needed base-devel git
git clone https://aur.archlinux.org/paru.git
cd paru
makepkg -si
```

---

## Installing Packages

| Task | Pacman | Paru |
|------|--------|------|
| Install a package | `sudo pacman -S pkg` | `paru -S pkg` |
| Install without confirmation | `sudo pacman -S --noconfirm pkg` | `paru -S --noconfirm pkg` |
| Install a group | `sudo pacman -S gnome` | `paru -S gnome` |
| Search before installing | `pacman -Ss keyword` | `paru -Ss keyword` |
| Show package info | `pacman -Si pkg` | `paru -Si pkg` |

```bash
# Install a single package
sudo pacman -S htop

# Install multiple packages
sudo pacman -S git curl wget

# Search for a package
pacman -Ss video player

# Show detailed info about a package
pacman -Si vlc
```

---

## Updating Packages

| Task | Pacman | Paru |
|------|--------|------|
| Sync database + upgrade all | `sudo pacman -Syu` | `paru -Syu` |
| Force database refresh | `sudo pacman -Syyu` | `paru -Syyu` |
| Upgrade only AUR packages | — | `paru -Sua` |
| Upgrade only repo packages | `sudo pacman -Syu` | `paru --repo -Syu` |

```bash
# Full system update (repo + AUR)
paru -Syu

# Force refresh even if up to date (useful after mirror changes)
sudo pacman -Syyu
```

> **Tip:** On Arch, always do a full `-Syu` before installing new packages to avoid partial upgrade issues.

---

## Removing Packages

| Flag | Meaning |
|------|---------|
| `-R` | Remove package only |
| `-Rs` | Remove package + unneeded dependencies |
| `-Rns` | Remove package + unneeded deps + config files |

```bash
# Remove a package and its unneeded dependencies (recommended)
sudo pacman -Rns package-name

# Remove multiple packages
sudo pacman -Rns pkg1 pkg2 pkg3

# Same with paru (for AUR packages)
paru -Rns package-name
```

---

## Querying Installed Packages

| Task | Command |
|------|---------|
| List all installed packages | `pacman -Q` |
| List explicitly installed | `pacman -Qe` |
| List AUR / foreign packages | `pacman -Qm` |
| List AUR package names only | `pacman -Qmq` |
| Search installed packages | `pacman -Qs keyword` |
| Show info on installed pkg | `pacman -Qi pkg` |
| List files owned by pkg | `pacman -Ql pkg` |
| Find which pkg owns a file | `pacman -Qo /path/to/file` |

```bash
# See all AUR packages you have installed
pacman -Qm

# Find what installed a binary
pacman -Qo /usr/bin/vlc

# List files installed by a package
pacman -Ql firefox
```

---

## Cleaning Up

### Remove Orphaned Packages

Orphans are packages that were installed as dependencies but are no longer needed by anything.

```bash
# List orphans
pacman -Qdt

# Remove all orphans
sudo pacman -Rns $(pacman -Qdtq)

# With paru
paru -Rns $(paru -Qdtq)
```

### Clean the Package Cache

Pacman keeps downloaded packages in `/var/cache/pacman/pkg/`. This can grow large over time.

```bash
# Remove all cached packages except the 3 most recent versions
sudo paccache -r

# Remove all cached packages except the last 1 version
sudo paccache -rk1

# Remove all cached versions of uninstalled packages
sudo paccache -ruk0

# Nuclear option: clear entire cache (not recommended)
sudo pacman -Scc
```

> **Tip:** Install `pacman-contrib` to get the `paccache` utility: `sudo pacman -S pacman-contrib`

### Clean AUR Build Cache (Paru)

```bash
# Remove unneeded build files
paru -Sc

# Clear all paru cache
paru -Scc
```

---

## Common Workflows

### Safe Full Cleanup Routine

```bash
# 1. Update everything
paru -Syu

# 2. Remove orphans
sudo pacman -Rns $(pacman -Qdtq)

# 3. Clean old cached package versions
sudo paccache -r

# 4. Clean AUR build cache
paru -Sc
```

### Review AUR Packages Before Removing

```bash
# List all AUR packages
pacman -Qm

# Selectively remove ones you no longer need
paru -Rns old-package-name
```

### Downgrade a Package

```bash
# Install a specific version from cache
sudo pacman -U /var/cache/pacman/pkg/package-version.pkg.tar.zst

# Or use downgrade (AUR)
paru -S downgrade
sudo downgrade package-name
```

---

## Quick Reference

| Task | Command |
|------|---------|
| Install package | `sudo pacman -S pkg` / `paru -S pkg` |
| Update all | `paru -Syu` |
| Remove + deps + configs | `sudo pacman -Rns pkg` |
| List AUR packages | `pacman -Qm` |
| List orphans | `pacman -Qdt` |
| Remove orphans | `sudo pacman -Rns $(pacman -Qdtq)` |
| Clean package cache | `sudo paccache -r` |
| Search repos | `pacman -Ss keyword` |
| Search AUR | `paru -Ss keyword` |
| Who owns a file | `pacman -Qo /path/to/file` |

---

## Related Topics

- [[docs/tools/TmuxGettingStarted\|Tmux Getting Started]]
- [[docs/tools/ClaudeGettingStarted\|Claude Code Getting Started]]

---

## Sources

- [Pacman - ArchWiki](https://wiki.archlinux.org/title/Pacman)
- [Paru GitHub Repository](https://github.com/Morganamilo/paru)
- [AUR - ArchWiki](https://wiki.archlinux.org/title/Arch_User_Repository)

---

#pacman #paru #arch #package-manager #tools
