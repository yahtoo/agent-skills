# Codex Setup

This guide explains how to use `agent-skills` with Codex. The Codex adapter in this repository uses AGENTS.md instructions plus command skills; `agents/*.md` remain portable persona prompts and do not assume every Codex runtime supports custom subagent files.

## Installation Modes

### Global Setup

Use this when you want the skills available across many repositories.

1. Copy the skill directories into the Codex user skill directory:

```bash
mkdir -p "$HOME/.agents/skills"
cp -R skills/* "$HOME/.agents/skills/"
cp -R .agents/skills/* "$HOME/.agents/skills/"
```

2. Add global instructions in:

```text
~/.codex/AGENTS.md
```

3. Put repository-agnostic rules in that global file. Keep repository-specific rules in each project `AGENTS.md`.

Codex also supports `~/.codex/AGENTS.override.md` for global instructions that intentionally override repository guidance. Use it sparingly.

### Project Setup

Use this when the workflow should travel with a single repository.

1. Keep project command skills under:

```text
$REPO/.agents/skills
```

2. Keep project rules under:

```text
$REPO/AGENTS.md
```

3. Keep portable personas under:

```text
$REPO/agents
```

4. Keep reusable workflow skills under:

```text
$REPO/skills
```

## Codex Workflow Shape

Codex orchestration in this repository has three layers:

- `AGENTS.md` and `.agents/skills/source-command-*` decide when a workflow runs.
- `skills/*/SKILL.md` define how each phase is performed.
- `agents/*.md` define who performs a phase when a runtime supports custom agent roles or when a prompt is copied into a separate reviewer session.

Do not add `agents/orchestrator.md`. The orchestrator is the main Codex agent, the project instructions, or a command skill. Personas should not invoke other personas.

## Command Skills

The Codex adapter skills are:

- `source-command-feature` - maps feature requests to requirements, spec, plan, architecture, implementation, verification, and review.
- `source-command-bugfix` - maps bug reports to reproduce, failing test, fix, regression verification, and review.
- `source-command-ship` - maps release readiness checks to reviewer, security, and test fan-out, then a go/no-go summary.

These command skills invoke `multi-agent-orchestration` to keep role boundaries consistent.

## Multi-Role Rules

- Use sequential handoffs for ordered work: requirements analyst, architect, implementation engineer, then reviewers.
- Use single writer, many reviewers: only one implementation role edits code in a phase.
- Use parallel fan-out only for independent read-only review work.
- Merge review reports in the main Codex thread; do not let one persona route or command another persona.

## Official Codex Paths

The documented Codex user skill path is `$HOME/.agents/skills`. The documented global instruction path is `~/.codex/AGENTS.md`.

Do not document `~/.codex/skills` as the Codex user skill directory unless Codex documentation changes.

References:

- [AGENTS.md guide](https://developers.openai.com/codex/guides/agents-md)
- [Codex skills](https://developers.openai.com/codex/skills)
