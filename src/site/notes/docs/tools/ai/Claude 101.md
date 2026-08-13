---
{"dg-publish":true,"permalink":"/docs/tools/ai/claude-101/","tags":["claude","ai","tools","productivity","prompting"]}
---

# Claude 101: Working with Claude.ai

## Overview

Notes distilled from Anthropic's official **Claude 101** course. This covers Claude as a general-purpose thinking partner on [Claude.ai](https://claude.ai/) (web, desktop, mobile) — prompting well, organizing work with Projects/Artifacts/Skills, connecting your tools, and researching deeply. For the developer-focused CLI tool, see [[docs/tools/ai/Claude Code Getting Started\|Claude Code Getting Started]] instead.

Claude is built to be **helpful, harmless, and honest** (Constitutional AI) and is steerable — it takes direction on tone, personality, and behavior rather than requiring you to work around a fixed style. Your conversations, memory, and preferences sync across web, desktop, and mobile whenever you're signed in.

---

## Writing Effective Prompts

Talk to Claude like a coworker — naturally, concisely, conversationally — not like typing keywords into a search box. A good prompt usually covers three things:

| Element | Question it answers | Example |
|---|---|---|
| **Setting the stage** | What's your role/context? | "I'm the marketing lead at an indie streaming startup..." |
| **Defining the task** | What action do you want done? | "...research the independent film streaming market..." |
| **Specifying rules** | What style/format do you need? | "...structure it as a 5-page report with citations." |

Combine all three and you get a prompt Claude can act on without back-and-forth clarification.

### Fixing common problems

| Problem | Likely cause | Fix |
|---|---|---|
| Response is too generic | Not enough context about your situation | Add audience, role, or constraints |
| Response is too long/short | Claude guessed at length | Be explicit: "two paragraphs" or "under 100 words" |
| Wrong format | Claude knew *what*, not *how* to present it | Show an example, or describe the structure explicitly |
| Confident but wrong facts | Claude occasionally generates plausible-sounding errors | Verify high-stakes facts independently; enable web search |
| Wrong tone | Claude defaults to helpful/professional | Describe the tone you want in plain language, or give an example |

### The iteration mindset

Your first prompt is the start of a conversation, not a final answer. Treat responses as drafts: ask follow-up questions, give specific feedback ("cut the first two paragraphs, make the conclusion more action-oriented" beats "make it shorter"), and know when to just start a fresh chat if things went off track.

### Personalizing Claude

- **Memory** automatically retains context across chats — your role, preferences, past decisions — so you don't re-explain yourself every conversation. Reviewable/editable in Settings.
- **Styles** let you set how Claude communicates (concise, formal, explanatory, or a fully custom description), applied automatically across conversations.

---

## Three Ways You Work with Claude

Knowing which "shape" of work you're in is the core skill — it decides where in the app you should be working.

| You're about to... | Shape | Where it lives |
|---|---|---|
| Ask, brainstorm, draft, or think something through, turn by turn | **Chat** — back-and-forth, you steer every turn | Chat tab |
| Hand off a multi-step task that ends in a real deliverable, spans tools, or runs on a schedule | **Cowork** — describe an outcome, Claude plans and executes it | Cowork tab |
| Write, test, run, and ship code in a codebase | **Code** — Claude works directly in your repo | Code tab (Local or Cloud) |

**Chat** is best when the answer changes what you ask next, or the task is small enough that setting up a hand-off would be overkill. **Cowork** shines for multi-step work ("pull the figures, compare them, draft the summary, format the doc" becomes one instruction), work spanning several of your tools, or recurring scheduled tasks (e.g. a Friday status roll-up). Cowork gives Claude local folder access, subagents for big jobs, and browser/computer use when no connector exists for a tool.

---

## Projects

**Projects are self-contained workspaces** with their own knowledge base, instructions, and chat history — useful for anything ongoing rather than a one-off question.

- **Instructions** apply to every chat in the project (tone, process, format requirements)
- **Knowledge base** holds reference documents Claude uses across all chats in the project — no re-uploading the same file every time
- **Scales automatically**: once uploaded content nears the context limit, Claude switches to retrieval (RAG) — searching and pulling in only what's relevant — expanding effective capacity up to 10x
- **Sharing** (Team/Enterprise): three permission levels — *Can view* (read-only), *Can edit* (full collaboration), *Owner* (controls visibility and access)

Good candidates for a project: recurring reference materials (brand guidelines, survey results), consistent response requirements, or team collaboration needing shared context.

---

## Artifacts

**Artifacts** are standalone, interactive outputs Claude renders in their own window next to the chat — a working prototype instead of a wall of text or code in the conversation. Claude creates one automatically when content is substantial (roughly 15+ lines), self-contained, and something you'll want to edit or reuse; you can also explicitly ask "create this as an artifact."

**Common types:** documents (markdown/text), code snippets, full HTML pages, SVG images, Mermaid diagrams, and interactive React components. Word/Excel/PowerPoint/PDF files are handled separately, as downloadable files rather than artifacts.

**Sharing:** copy/download for personal use; share internally within your org (Team/Enterprise); or **publish** to make it accessible to anyone with the link (your chat itself stays private, and published artifacts aren't search-indexed).

**Getting good results:** be specific about what you want, describe who the end user is, and iterate one change at a time rather than requesting everything up front.

---

## Skills

**Skills** are folders of instructions/scripts Claude loads dynamically to perform a specialized, repeatable task consistently — think of them as procedural expertise, versus Projects which store reference knowledge.

- **Anthropic Skills** — built-in, e.g. the Excel/Word/PowerPoint/PDF creation capabilities. Invoked automatically, no setup needed.
- **Custom Skills** — created by you or your org for domain-specific workflows (e.g. applying brand guidelines, a QBR methodology). Easiest way to build one: just describe it to Claude in conversation — it interviews you about the workflow and generates the skill file for you.

Enable under **Settings → Capabilities** (requires code execution/file creation on); Enterprise orgs need an Owner to enable it org-wide first.

|             | Projects                                   | Skills                                |
| ----------- | ------------------------------------------ | ------------------------------------- |
| Purpose     | Store knowledge Claude references          | Define a process Claude executes      |
| Best for    | Long-term context, reference materials     | Repeatable, multi-step workflows      |
| Persistence | Available across every chat in the project | Applied whenever the skill is invoked |

> [!note] 
> **Security:** only install custom Skills (and connectors) from trusted sources — they can include executable code. Anthropic's built-in Skills are vetted; your own custom Skills are private to your account.

---

## Connectors and MCP

**Connectors** give Claude access to the tools and data you already use, so it can search files, retrieve documents, and — with permission — take actions in those services, instead of starting every conversation from scratch.

They're powered by the **Model Context Protocol (MCP)** — a universal, open standard for connecting an AI to external tools, so any developer can build a connector that works with Claude (think "USB-C for AI").

- **Web connectors** — cloud services like Google Drive, Notion, Slack, Asana (browse at claude.ai/directory)
- **Desktop extensions** — local tools/apps via the Claude Desktop app, for local file access and native app integration

**Security model:** access is scoped to only what a connector needs; Claude only sees what *you* already have permission to see in the underlying tool; and access is revocable at any time.

---

## Enterprise Search

A pre-built, org-wide project (Team/Enterprise) that shows up as **"Ask {Your Org}"** in the sidebar — your company's connected knowledge (documents, chat, email) is already loaded, so you can ask questions spanning multiple internal sources without hunting through each tool individually. Great for getting up to speed, policy/process questions, and onboarding. It only surfaces what you already have permission to access in the source tool.

---

## Research

**Research** turns Claude into a systematic investigator instead of a single-shot search: it plans an approach, runs many searches that build on each other (sometimes across hundreds of sources), synthesizes the findings, and cites everything so you can verify it. It takes minutes rather than seconds because of the depth involved.

| Use... | When... |
|---|---|
| **Research** | You need a comprehensive, multi-source, citable report (market analysis, vendor comparisons) |
| **Quick web search** | You just need one fast, specific fact |
| **Thinking** | The problem needs deep reasoning, not external information (math, debugging, logic) |
| **Enterprise Search** | The answer lives in your org's internal knowledge, not the public web |

Enable it from the **+** menu (requires web search on). Since it takes real time, a well-specified prompt pays off: be specific about goals, specify the structure/sections you want back, and include constraints like budget or timeline. Connected integrations (Google Workspace, etc.) let Research pull your own emails/calendar/docs into the investigation alongside the web.

---

## AI Fluency: The 4D Framework

A framework (from Anthropic's free [AI Fluency course](https://www.anthropic.com/ai-fluency)) for the judgment behind good AI collaboration, not just which buttons to click:

- **Delegation** — deciding what work goes to you vs. to Claude, and how to split it
- **Description** — communicating clearly: defining the output, guiding the process, specifying behavior (this is what the prompting framework above is built on)
- **Discernment** — critically evaluating Claude's outputs for quality, accuracy, and appropriateness
- **Diligence** — using AI responsibly: transparency and accountability for AI-assisted work

A lightweight way to build Discernment for a recurring task: gather 5-10 real examples of work you've done, write prompts that would produce something similar, compare Claude's output to your originals, and refine your prompting based on the gaps.

---

## Other Ways to Work with Claude

Claude.ai is one surface among several, each suited to different work:

| Tool | Best for | Where it runs |
|---|---|---|
| Claude.ai | General tasks, research, writing, analysis, file creation | Web, desktop, mobile |
| Claude Code | Software development, codebase navigation, git workflows | Terminal, IDE, or browser |
| Cowork | Multi-step tasks: research briefs, document creation, data analysis | Desktop (web/mobile in beta) |
| @Claude | Team collaboration, meeting prep, quick answers in context | Slack |
| Claude Design | UI prototypes, design exploration | Web |
| Claude for Microsoft 365 | Editing in place, carrying context across Excel/PowerPoint/Word/Outlook | M365 sidebars |
| Claude in Chrome | Web research, email management, browser automation | Chrome sidebar (beta) |

See [[docs/tools/ai/Claude Code Getting Started\|Claude Code Getting Started]] for the CLI-specific reference.

---

## Key Takeaways

1. A good prompt sets the stage, defines the task, and specifies rules — and your first response is a draft to iterate on, not a final answer
2. **Chat** is for turn-by-turn thinking; **Cowork** is for handing off multi-step work that ends in a real deliverable; **Code** is for working directly in a codebase
3. **Projects** store knowledge across chats; **Skills** encode repeatable processes; use both together when a skill needs to pull from a project's knowledge base
4. **Connectors** (via MCP) let Claude work with your actual tools and data, scoped to what you already have access to
5. Reach for **Research** when you need a comprehensive, citable, multi-source report — not for quick facts or org-internal questions (that's **Enterprise Search**)
6. AI Fluency's 4D framework — Delegation, Description, Discernment, Diligence — is the underlying judgment behind using any of this well

---

## Related Topics

- [[docs/tools/ai/Claude Code Getting Started\|Claude Code Getting Started]]

---

## Source

- [AI Fluency course](https://www.anthropic.com/ai-fluency)
- [Use Case Gallery](https://claude.com/resources/use-cases)
- [Anthropic Help Center](https://support.anthropic.com/)
- [Prompting documentation](https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/overview)

---

#claude #ai #tools #productivity #prompting
