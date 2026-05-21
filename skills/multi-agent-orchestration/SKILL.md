---
name: multi-agent-orchestration
description: Coordinate multi-role coding workflows in Codex or compatible agents. Use when a task should move through requirements, architecture, implementation, testing, review, security, or release roles instead of being handled by one undifferentiated agent.
---

# Multi-Agent Orchestration

## Overview

Use this skill to coordinate specialist personas without turning any persona into an orchestrator. The main agent, a command skill, or `AGENTS.md` owns orchestration. Personas own role-specific analysis and output. Skills define how each role works.

The default operating model is **single writer, many reviewers**: only the implementation role edits code during build work; other roles provide structured read-only findings unless a human explicitly changes the scope.

## When to Use

- A feature spans requirements, architecture, implementation, testing, review, or release steps
- A bug needs separate reproduction, fix, regression testing, and review passes
- A production-bound change needs independent code, security, and test perspectives
- The user asks for multi-role agents, role assignment, collaboration, fan-out, or a Codex workflow
- The work has enough risk that explicit handoff artifacts will reduce ambiguity

Do not use this for a tiny single-file change where one skill can finish the task safely.

## Validated Assets

The repository validation script checks this section. Keep referenced names in sync with actual files.

**Personas:** `requirements-analyst`, `software-architect`, `implementation-engineer`, `test-engineer`, `security-auditor`, `code-reviewer`, `release-manager`

**Skills:** `using-agent-skills`, `interview-me`, `idea-refine`, `spec-driven-development`, `planning-and-task-breakdown`, `api-and-interface-design`, `context-engineering`, `source-driven-development`, `incremental-implementation`, `test-driven-development`, `debugging-and-error-recovery`, `code-review-and-quality`, `security-and-hardening`, `code-simplification`, `shipping-and-launch`, `ci-cd-and-automation`, `documentation-and-adrs`

## Workflow

### 1. Classify the task

Choose the smallest workflow that fits:

| Task type | Required sequence | Optional roles |
|---|---|---|
| New feature | requirements -> architecture -> plan -> implementation -> test/review/security | release |
| Bug fix | reproduce -> failing test -> fix -> regression verification -> review | security if auth/data/integration affected |
| API or contract change | requirements -> architecture -> plan -> implementation -> test -> review/security | release |
| Refactor | architecture or scope check -> implementation -> test -> review/simplify | security if boundaries change |
| Ship | release -> parallel review fan-out -> merge decision | accessibility/performance direct checks |

If the task is unclear, start with `requirements-analyst` and the `interview-me` or `spec-driven-development` skill. If the task is clear but broad, start with `planning-and-task-breakdown`.

### 2. Select roles

Use only roles that materially reduce risk:

- `requirements-analyst`: clarifies goals, non-goals, constraints, and acceptance criteria
- `software-architect`: designs module boundaries, APIs, data flow, and compatibility strategy
- `implementation-engineer`: performs the single code-writing pass, one thin slice at a time
- `test-engineer`: designs or reviews tests and applies the Prove-It pattern for bugs
- `security-auditor`: checks auth, data, secrets, dependency, and exploitability risks
- `code-reviewer`: performs five-axis quality review
- `release-manager`: makes the ship/no-ship call, rollback plan, and release checklist

Never create or invoke an orchestrator persona. The current main agent or command skill is the orchestrator.

### 3. Create handoff artifacts

Use repository-local artifacts when the work spans more than one role or session:

```text
.agent-workflow/
  task.md
  spec.md
  architecture.md
  plan.md
  implementation-log.md
  test-report.md
  security-review.md
  code-review.md
  release-checklist.md
```

For small tasks, an inline structured report is enough. Do not create files only to satisfy ceremony.

### 4. Run sequential work in order

Sequential phases must not be parallelized when one phase depends on another:

1. Requirements define what must be true.
2. Architecture defines safe boundaries and contracts.
3. Planning slices work into verifiable tasks.
4. Implementation edits code in thin vertical slices.
5. Testing proves the changed behavior.
6. Review and security identify blockers.
7. Release decides go/no-go with rollback steps.

Each phase must consume the previous phase's output, not an informal memory of the conversation.

### 5. Fan out only for independent review

Parallel fan-out is allowed when every role can inspect the same artifact independently and return a report without shared mutable state. The standard fan-out is:

```text
code-reviewer + security-auditor + test-engineer -> main-agent merge
```

The merge step stays in the main context. Resolve duplicate findings, promote launch blockers, and decide whether implementation must loop back for fixes.

### 6. Loop on blockers

If any reviewer reports a Critical blocker, return to the smallest earlier phase that can fix it:

- Missing requirement -> requirements
- Broken contract -> architecture
- Test gap -> test-engineer or implementation-engineer
- Vulnerability -> implementation-engineer with security guidance
- Release blocker -> release-manager after fixes

Do not let a reviewer directly rewrite the implementation unless the user explicitly changes that role's scope.

## Role-to-Skill Map

| Role | Primary skills |
|---|---|
| requirements-analyst | `interview-me`, `idea-refine`, `spec-driven-development` |
| software-architect | `api-and-interface-design`, `context-engineering`, `source-driven-development` |
| implementation-engineer | `incremental-implementation`, `test-driven-development`, `debugging-and-error-recovery` |
| test-engineer | `test-driven-development`, `debugging-and-error-recovery` |
| security-auditor | `security-and-hardening` |
| code-reviewer | `code-review-and-quality`, `code-simplification` |
| release-manager | `shipping-and-launch`, `ci-cd-and-automation`, `documentation-and-adrs` |

## Output

For multi-role work, produce a concise orchestration record:

```markdown
## Orchestration Record

**Task type:** feature | bugfix | refactor | review | ship
**Roles used:** requirements-analyst, software-architect, implementation-engineer, ...
**Handoff artifacts:** spec, architecture, plan, test report, review report

### Phase results
- Requirements: [summary or artifact path]
- Architecture: [summary or artifact path]
- Implementation: [summary or artifact path]
- Verification: [tests/build/manual checks]
- Review gates: [blockers and decision]

### Final decision
GO | BLOCKED | NEEDS HUMAN DECISION
```

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "More agents means better work." | More roles add coordination cost. Use only roles that catch distinct risks. |
| "The architect can tell the implementer what to do directly." | Personas do not invoke other personas. The main agent or command skill coordinates. |
| "Reviewers can just fix what they find." | Keep one writer unless the user explicitly authorizes a role change. |
| "Parallelize the whole lifecycle." | Requirements, architecture, planning, and implementation have dependencies. Parallelize only independent review. |
| "The chat transcript is enough handoff." | Multi-session work needs explicit artifacts or structured reports. |

## Red Flags

- An orchestrator persona is added under `agents/`
- A persona tells another persona to run work
- Multiple implementation roles edit the same files in parallel
- A review fan-out starts before there is a concrete diff, plan, or artifact
- A Critical review finding is summarized away instead of blocking or looping back
- Handoff artifacts contain decisions that contradict `AGENTS.md` or the user request

## Verification

Before finishing, confirm:

- [ ] The chosen roles match the task type and no unnecessary roles were introduced
- [ ] Only the implementation role wrote code during build phases
- [ ] Every sequential phase consumed the previous phase's explicit output
- [ ] Any fan-out was independent and merged by the main agent
- [ ] Critical findings became blockers or explicit user-accepted risks
- [ ] Final output includes tests, build status, review/security status, and next action
