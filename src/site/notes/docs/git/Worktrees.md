---
{"dg-publish":true,"permalink":"/docs/git/worktrees/","tags":["git","worktree","productivity"]}
---

# Git Worktrees

> A worktree lets you check out multiple branches from the same repository simultaneously, each in its own directory. No more stashing or switching branches — just `cd` between them.

---

## Why Use Worktrees?

**The problem they solve:** You're working on a feature, but need to quickly fix a bug in production. Normally you'd:

1. Stash your changes
2. Switch branches
3. Fix the bug
4. Switch back
5. Pop the stash

**With worktrees:** You just `cd` to a different directory where `main` is already checked out. Fix, commit, push. `cd` back to your feature work. Nothing interrupted.

**Perfect for:**

- Multi-environment workflows (dev/test/prod all checked out at once)
- Running parallel builds or tests
- Code review while keeping your WIP intact
- Comparing branches side-by-side

---

## Core Concepts

```
my-repo/                    ← main worktree (your original clone)
  ├── .git/                 ← the actual repository (shared by all)
  └── src/
  
my-repo-worktrees/          ← additional worktrees
  ├── feature-101/          ← worktree for feature/TICKET-101
  ├── test/                 ← worktree for test branch
  └── hotfix/               ← worktree for urgent fix
```

All worktrees **share the same `.git` directory**. That means:

- ✅ Commits, branches, and remotes are instantly visible in all worktrees
- ✅ You can't have the same branch checked out in two worktrees
- ✅ Much lighter than multiple full clones

---

## Essential Commands

### List all worktrees

```bash
git worktree list
```

Shows all worktrees, their paths, and which branch each has checked out.

### Add a new worktree

```bash
# Create worktree for an existing branch
git worktree add ../my-repo-test test

# Create worktree with a new branch
git worktree add -b feature/TICKET-102 ../my-repo-feature-102

# Shorthand: create branch from current HEAD
git worktree add ../my-repo-hotfix -b hotfix/critical-bug
```

**Path convention:** I use `../repo-name-branch` to keep worktrees as siblings to the main repo. Choose what works for your workflow.

### Remove a worktree

```bash
# Option 1: Remove the worktree (safe, just unlinks it)
git worktree remove ../my-repo-test

# Option 2: Delete directory first, then prune
rm -rf ../my-repo-test
git worktree prune
```

**Note:** Removing a worktree does NOT delete the branch, just the checked-out directory.

### Move a worktree

```bash
git worktree move ../my-repo-test ../my-repo-staging
```

---

## Practical Workflows

### Multi-Environment Development

When you're promoting features across dev → test → prod:

```bash
# One-time setup: create worktrees for each environment
cd ~/projects/my-repo                        # main worktree = develop
git worktree add ../my-repo-test test
git worktree add ../my-repo-prod main

# Daily work:
cd ~/projects/my-repo                        # work on feature
cd ~/projects/my-repo-test                   # cherry-pick to test, run tests
cd ~/projects/my-repo-prod                   # cherry-pick to prod when ready
```

Each environment is always ready. No branch switching, no stashing.

### Code Review Without Interruption

```bash
# You're working on feature/TICKET-101
# PR comes in for review on feature/TICKET-200

git worktree add ../my-repo-review feature/TICKET-200
cd ../my-repo-review
# ... review, test, comment ...
cd -                                          # back to your work
git worktree remove ../my-repo-review
```

### Parallel Testing

```bash
# Run tests on current branch
npm test

# Simultaneously run tests on main to compare
git worktree add ../my-repo-main-test main
cd ../my-repo-main-test
npm test
```

---

## Best Practices

### Naming Convention

Use a consistent pattern for worktree directories:

```bash
# Sibling directories
my-repo/                  # main worktree (develop)
my-repo-test/             # test branch
my-repo-prod/             # main branch
my-repo-feature-101/      # temporary feature work
```

Or nest them:

```bash
my-repo/
  .git/
  src/                    # main worktree
  worktrees/
    test/
    prod/
    feature-101/
```

### Clean Up Regularly

```bash
# List all worktrees
git worktree list

# Remove ones you're done with
git worktree remove ../my-repo-feature-101

# Prune stale references (if you deleted directories manually)
git worktree prune
```

### Branch Protection

You **cannot** check out the same branch in multiple worktrees. Git prevents this:

```bash
git worktree add ../my-repo-dupe test
# fatal: 'test' is already checked out at '.../my-repo-test'
```

This is a feature — prevents you from accidentally committing to the same branch from two places.

---

## Common Gotchas

### Shared `.git` means shared everything

- **Branches:** A branch created in one worktree is visible in all
- **Commits:** A commit made in one worktree appears in all (once you fetch/pull)
- **Stashes:** Shared across worktrees (use `git stash push -m "worktree-specific-name"`)

### Can't delete a branch checked out in a worktree

```bash
git branch -d test
# error: Cannot delete branch 'test' checked out at '.../my-repo-test'
```

Solution: Remove the worktree first, or switch it to a different branch.

### IDE confusion

Some IDEs (VS Code, IntelliJ) might get confused if you open multiple worktrees in the same window. Best practice: open each worktree in its own IDE window.

---

## Quick Reference

|Command|What it does|
|---|---|
|`git worktree add <path> <branch>`|Create worktree for existing branch|
|`git worktree add -b <new-branch> <path>`|Create worktree with new branch|
|`git worktree list`|Show all worktrees|
|`git worktree remove <path>`|Delete a worktree|
|`git worktree prune`|Clean up stale worktree references|
|`git worktree move <old> <new>`|Move a worktree|

---

## When NOT to Use Worktrees

- **Single-branch workflow:** If you rarely switch branches, worktrees add complexity without benefit
- **Large repos:** Each worktree duplicates the working directory (but shares `.git`). For huge repos, this can eat disk space
- **Simple hotfixes:** If `git stash` + branch switch works fine for you, don't overcomplicate it

---

## My Setup (Example)

```bash
~/projects/
  etl-pipeline/                    # main worktree = develop
  etl-pipeline-test/               # test branch (always ready)
  etl-pipeline-prod/               # main branch (always ready)
  etl-pipeline-feature-xyz/        # temporary, deleted after merge
```

When I need to cherry-pick a feature to test, I just `cd ../etl-pipeline-test`, cherry-pick, and test. No stashing, no branch switching, no interruption to my feature work in `etl-pipeline/`.

---

## Related

- [[docs/git/MultiEnvPromotionFlow\|MultiEnvPromotionFlow]] — pairs perfectly with worktrees

---

#git #workflow #productivity