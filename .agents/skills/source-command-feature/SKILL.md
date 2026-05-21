---
name: "source-command-feature"
description: "Run a Codex-friendly multi-role feature workflow from requirements through implementation and review"
---

# source-command-feature

Use this skill when the user asks to run a migrated source command `feature`, or asks Codex to handle a new feature through the multi-role workflow.

## Command Template

Invoke the agent-skills:multi-agent-orchestration skill.

Run the feature workflow:

1. Classify the request and confirm it is feature work, not a bug fix or release review.
2. Use `requirements-analyst` to produce a requirements brief with acceptance criteria. Apply `spec-driven-development`; use `interview-me` if the request is unclear.
3. Use `software-architect` for non-trivial boundaries, API contracts, data flow, or migration concerns. Apply `api-and-interface-design` as needed.
4. Use `planning-and-task-breakdown` to slice the work into small vertical tasks with verification steps.
5. Use `implementation-engineer` as the single writer. Apply `incremental-implementation` and `test-driven-development` one slice at a time.
6. After implementation, run independent review gates:
   - `test-engineer` for coverage and missing cases
   - `code-reviewer` for five-axis quality review
   - `security-auditor` when the change touches auth, data access, secrets, payments, external integrations, or configuration
7. Merge findings in the main context. Critical issues loop back to `implementation-engineer`; do not let reviewer personas edit directly.

Prefer explicit handoff artifacts in `.agent-workflow/` for multi-session or high-risk work. For small features, inline structured reports are acceptable.
