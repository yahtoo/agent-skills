---
name: "source-command-bugfix"
description: "Run a Codex-friendly bugfix workflow: reproduce, prove with a failing test, fix, verify, and review"
---

# source-command-bugfix

Use this skill when the user asks to run a migrated source command `bugfix`, reports a bug, or describes failing, broken, or unexpected behavior.

## Command Template

Invoke agent-skills:multi-agent-orchestration alongside agent-skills:debugging-and-error-recovery and agent-skills:test-driven-development.

Run the bugfix workflow:

1. Reproduce the bug or failing behavior. Capture the exact command, input, log, or user flow.
2. Use `test-engineer` to define the Prove-It test. The test must fail against current behavior before implementation starts.
3. Use `implementation-engineer` as the single writer to make the smallest fix that passes the failing test.
4. Run targeted tests, then broader regression checks appropriate for the repository.
5. Use `code-reviewer` for correctness and maintainability review.
6. Use `security-auditor` if the bug touches auth, authorization, data exposure, parsing, secrets, permissions, payments, or external callbacks.
7. Merge findings in the main context. If any Critical issue remains, loop back to the smallest phase that can fix it.

If the bug cannot be reproduced, stop with a reproduction gap report instead of guessing at a fix.
