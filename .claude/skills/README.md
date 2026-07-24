# Skills, Commands & Agents

Sourced from [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) (MIT License, Copyright (c) 2025 Addy Osmani), adapted for project-local use in this repo:

- `.claude/skills/` — 23 engineering skills covering the dev lifecycle (spec, plan, build, test, review, ship, and more)
- `.claude/commands/` — slash commands (`/spec`, `/plan`, `/build`, `/test`, `/review`, `/webperf`, `/code-simplify`, `/ship`) that trigger the matching skills
- `.claude/agents/` — subagents: `code-reviewer`, `security-auditor`, `test-engineer`, `web-performance-auditor`
- `.claude/references/` — shared checklists referenced by multiple skills

See `using-agent-skills/SKILL.md` for how the skills compose.
