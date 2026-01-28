---
{"dg-publish":true,"permalink":"/docs/tools/qmd-getting-started/","tags":["qmd","search","markdown","obsidian","ai"]}
---

# QMD Getting Started Guide

## Overview

QMD (Quick Markdown Search) is a local, on-device search engine for markdown notes. It combines BM25 full-text search, vector semantic search, and LLM re-ranking to provide powerful search capabilities for your knowledge base.

---

## Installation

### Prerequisites

- Bun >= 1.0.0
- macOS: SQLite with extension support

### Install QMD

```bash
# Install globally via Bun
bun install -g https://github.com/tobi/qmd

# macOS: ensure sqlite extension support
brew install sqlite
```

---

## Initial Setup

### Add Your Notes as Collections

```bash
# Add your docs folder as a collection
qmd collection add ~/Documents/forge/docs --name forge-docs

# Or add specific subfolders separately
qmd collection add ~/Documents/forge/docs/python --name python-docs
qmd collection add ~/Documents/forge/docs/csharp --name csharp-docs

# Verify collections
qmd collection list
```

### Generate Embeddings

The first run downloads approximately 3GB of AI models for semantic search:

```bash
# Index all documents
qmd embed

# Force re-index everything (after major updates)
qmd embed -f
```

> **Note:** Models are cached in `~/.cache/qmd/models/`

---

## Search Commands

### Three Search Modes

| Command | Type | Best For |
|---------|------|----------|
| `qmd search` | BM25 full-text | Exact keyword matches |
| `qmd vsearch` | Vector semantic | Conceptual/similar meaning |
| `qmd query` | Hybrid + reranking | Best overall results |

### Basic Search Examples

```bash
# Keyword search (fast, exact matches)
qmd search "LEFT JOIN polars"

# Semantic search (finds similar concepts)
qmd vsearch "how to filter dataframes"

# Hybrid search with reranking (best results)
qmd query "ETL with SQL Server"
```

### Search Options

```bash
# Limit to specific collection
qmd query -c python-docs "polars transformations"

# Get more results (default is 5)
qmd query -n 10 "airflow DAG examples"

# Show full document content
qmd query --full "UPSERT merge pattern"

# Set minimum score threshold
qmd query --min-score 0.3 "API design patterns"
```

---

## Output Formats

### Available Formats

| Flag | Format | Use Case |
|------|--------|----------|
| (default) | Colorized CLI | Interactive terminal use |
| `--md` | Markdown | Copy to notes |
| `--json` | JSON | Programmatic processing |
| `--csv` | CSV | Spreadsheet export |
| `--xml` | XML | Data interchange |
| `--files` | File list | Quick file paths |

### Examples

```bash
# Markdown output with full content
qmd query --md --full "error handling"

# JSON output for scripting
qmd query --json "quarterly reports"

# Just file paths
qmd search --files "polars join"
```

---

## Score Interpretation

Search results include a relevance score:

| Score Range | Relevance | Color |
|-------------|-----------|-------|
| 0.8 - 1.0 | Highly relevant | Green |
| 0.5 - 0.8 | Moderately relevant | Green |
| 0.4 - 0.5 | Somewhat relevant | Yellow |
| 0.0 - 0.4 | Low relevance | Red |

---

## Document Retrieval

### Get Documents by Path or ID

```bash
# Get by filepath (relative to collection)
qmd get python/polars/JoiningData.md

# Get by docid (shown in search results as #abc123)
qmd get "#abc123"

# Get specific lines (from line 50, max 100 lines)
qmd get python/polars/FilteringData.md:50 -l 100
```

### Get Multiple Documents

```bash
# Using glob patterns
qmd multi-get "python/polars/*.md"

# Multiple specific files
qmd multi-get "doc1.md, doc2.md, #abc123"

# Limit output size
qmd multi-get "*.md" -l 50 --max-bytes 10000
```

---

## Context Management

Context adds descriptive metadata to help search understand your content better:

```bash
# Add context to collections
qmd context add qmd://forge-docs/python/polars "Polars DataFrame library documentation for ETL with SQL Server"
qmd context add qmd://forge-docs/csharp "C# programming language learning notes"

# List all contexts
qmd context list

# Remove context
qmd context rm qmd://forge-docs/old-notes
```

---

## Index Maintenance

### Keep Your Index Updated

```bash
# Re-index after adding/editing notes
qmd update

# Re-index with git pull first (for synced repos)
qmd update --pull

# Check index status
qmd status

# Clean up cache and orphaned data
qmd cleanup
```

### Collection Management

```bash
# List all collections
qmd collection list

# List files in a collection
qmd ls forge-docs

# Remove a collection
qmd collection remove old-notes

# Rename a collection
qmd collection rename notes my-notes
```

---

## Claude Code Integration (MCP)

QMD can be integrated with Claude Code via the Model Context Protocol (MCP), allowing you to search your notes directly during conversations.

### Configuration

Add to `~/.claude/settings.json`:

```json
{
  "mcpServers": {
    "qmd": {
      "command": "qmd",
      "args": ["mcp"]
    }
  }
}
```

### Available MCP Tools

| Tool | Description |
|------|-------------|
| `qmd_search` | Fast BM25 keyword search |
| `qmd_vsearch` | Semantic vector search |
| `qmd_query` | Hybrid search with reranking |
| `qmd_get` | Retrieve document by path or docid |
| `qmd_multi_get` | Retrieve multiple documents |
| `qmd_status` | Index health and collection info |

---

## Data Storage

### File Locations

| Path | Contents |
|------|----------|
| `~/.cache/qmd/index.sqlite` | Search index database |
| `~/.cache/qmd/models/` | Downloaded AI models (~3GB) |

### AI Models Used

| Model | Purpose | Size |
|-------|---------|------|
| `embedding-gemma-300M-Q8_0` | Vector embeddings | ~300MB |
| `qwen3-reranker-0.6b-q8_0` | Result re-ranking | ~640MB |
| `Qwen3-1.7B-Q8_0` | Query expansion | ~2.2GB |

---

## Quick Reference

### Daily Workflow

```bash
# Search your notes
qmd query "your search terms"

# After adding new notes
qmd update

# Check status
qmd status
```

### Initial Setup (Once)

```bash
# 1. Add collections
qmd collection add ~/Documents/forge/docs --name forge-docs

# 2. Add context (optional)
qmd context add qmd://forge-docs "My knowledge base documentation"

# 3. Generate embeddings
qmd embed
```

### Common Commands

| Task | Command |
|------|---------|
| Search (best) | `qmd query "search terms"` |
| Search (keywords) | `qmd search "exact keywords"` |
| Search (semantic) | `qmd vsearch "concept or idea"` |
| Get document | `qmd get path/to/file.md` |
| Update index | `qmd update` |
| Check status | `qmd status` |
| List collections | `qmd collection list` |

---

## Key Takeaways

1. Use `qmd query` for best search results (hybrid + reranking)
2. Use `qmd search` for fast exact keyword matches
3. Use `qmd vsearch` for conceptual/semantic searches
4. Add **context** to help the search understand your content
5. Run `qmd update` after adding or editing notes
6. Integrate with **Claude Code via MCP** for AI-assisted note searching
7. First run downloads ~3GB of models (cached for future use)

---

## Related Topics

- [[docs/python/polars/PolarsGuide\|Polars Guide]]
- [[docs/csharp/LearningCsharp\|C# Learning Guide]]

---

## Sources

- [QMD GitHub Repository](https://github.com/tobi/qmd)
- [Model Context Protocol](https://modelcontextprotocol.io/)

---

#qmd #search #markdown #tools #obsidian #mcp
