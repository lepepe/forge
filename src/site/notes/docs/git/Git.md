---
{"dg-publish":true,"permalink":"/docs/git/git/","tags":["git","version-control","index"]}
---

# Git

Git is a distributed version control system that tracks changes in your code. It lets you work on features, collaborate with others, and maintain a history of your project.

---

## Notes

### Workflows & Strategies

- [[docs/git/MultiEnvPromotionFlow\|Multi-Environment Promotion Flow]] — A structured approach to promoting code from develop → test → production using squash merges and cherry-picks

### Productivity & Tools

- [[docs/git/Worktrees\|Worktrees]] — Work on multiple branches simultaneously without switching or stashing

---

## Quick Reference

| Command | Description |
|---------|-------------|
| `git status` | Show working tree status |
| `git add .` | Stage all changes |
| `git commit -m "msg"` | Commit staged changes |
| `git push` | Push to remote |
| `git pull` | Fetch and merge from remote |
| `git checkout -b branch` | Create and switch to new branch |
| `git merge branch` | Merge branch into current |
| `git log --oneline` | View commit history (compact) |
| `git stash` | Temporarily save changes |
| `git cherry-pick hash` | Apply a specific commit |

---

## Related

- [[docs/csharp/LearningCsharp\|Learning C#]]
- [[DevOps\|DevOps]]
