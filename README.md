# skills

Lichens Innovation **Agent Skills** repository — reusable instructions to extend coding agents (Cursor, GitHub Copilot, Claude Code, etc.).

## Installation

From a project or any directory:

```bash
npx skills add https://github.com/Lichens-Innovation/skills
```

Or using the short form:

```bash
npx skills add Lichens-Innovation/skills
```

**Useful options:**

- **Project** (default): skills are installed in the project (e.g. `.agents/skills/`, `.cursor/skills/`, `.claude/skills/`) and can be versioned with the repo.
- **Global**: `npx skills add Lichens-Innovation/skills -g` — available across all your projects.
- **Target agents**: `npx skills add Lichens-Innovation/skills -a cursor -a github-copilot -a claude-code`.
- **List skills** without installing: `npx skills add Lichens-Innovation/skills --list`.

## Removing a skill

To uninstall a skill that was previously added:

```bash
# Remove a specific skill by name (e.g. hello-world)
npx skills remove hello-world

# Interactive: choose which skill(s) to remove
npx skills remove

# Remove from global scope (if you installed with -g)
npx skills remove hello-world --global

# Remove from specific agents only
npx skills remove hello-world --agent cursor --agent claude-code
```

You can use the `rm` alias: `npx skills rm hello-world`. To see what is installed: `npx skills list`.

## How a skill becomes active (Cursor, Copilot, Claude Code)

1. **Installation**  
   The `npx skills add` command uses the [open agent skills CLI](https://github.com/vercel-labs/skills). It fetches this repo and copies each skill (folder containing a `SKILL.md` and its files) into the directories expected by each tool:
   - **Cursor**: `.agents/skills/` (project) or `~/.cursor/skills/` (global)
   - **GitHub Copilot**: `.agents/skills/` (project) or `~/.copilot/skills/` (global)
   - **Claude Code**: `.claude/skills/` (project) or `~/.claude/skills/` (global)

2. **Discovery by the agent**  
   Cursor, Copilot, and Claude Code scan these directories and load the `SKILL.md` files (name, description, instructions). They follow the [Agent Skills specification](https://agentskills.io).

3. **Skill activation**  
   When your question or request matches the **usage context** described in the skill (e.g. “When to use”, description), the agent injects that skill into context and follows its **Instructions**. The skill is therefore active whenever it is relevant, with no extra action on your part.

In short: **install** → **files in the right place** → **the agent reads and applies the skill when relevant**.
