---
description: 通过并行分发给专业 personas 运行发布前检查，并综合 go/no-go 决策
---

调用 agent-skills:shipping-and-launch skill。

`/ship` 是一个 **fan-out orchestrator**。它针对当前变更并行运行三个 specialist personas，然后把它们的报告合并为一个 go/no-go 决策和 rollback plan。Personas 彼此独立运行：没有共享状态、没有顺序依赖。这正是并行执行安全且有价值的原因。

## Phase A - Parallel fan-out

使用 Agent tool 并发 spawn 三个 subagents。**必须在同一个 assistant turn 中发出三个 Agent tool calls，让它们并行执行**；顺序调用会破坏这个命令的目的。

在 Claude Code 中，每次调用的 `subagent_type` 与 persona 的 `name` 字段匹配：

1. **`code-reviewer`** - 对 staged changes 或 recent commits 做五轴 review（correctness、readability、architecture、security、performance）。输出标准 review template。
2. **`security-auditor`** - 做 vulnerability 与 threat-model pass。检查 OWASP Top 10、secrets handling、auth/authz、dependency CVEs。输出标准 audit report。
3. **`test-engineer`** - 分析变更的测试覆盖。识别 happy path、edge cases、error paths 和 concurrency scenarios 的缺口。输出标准 coverage analysis。

在没有 Agent tool 的其他 harness 中，按顺序调用每个 persona 的 system prompt，并把它们的输出视为并行返回；merge phase 仍然适用。

约束（来自 Claude Code 的 subagent model）：
- Subagents 不能 spawn 其他 subagents；不要让一个 persona 委派给另一个 persona。
- 每个 subagent 有自己的 context window，只把报告返回给主会话。
- 如果需要能彼此对话的 teammates，而不是只报告回来，请使用 Claude Code Agent Teams，并把这些 personas 作为 teammate types 引用（见 `references/orchestration-patterns.md`）。

**Persona resolution.** 如果你在 `.claude/agents/` 或 `~/.claude/agents/` 中定义了自己的 `code-reviewer`、`security-auditor` 或 `test-engineer`，它们优先于本插件版本；`/ship` 会自动使用你的自定义版本。这是有意设计：plugin subagents 位于 Claude Code scope priority table 底部，因此 user-level definitions 会胜出。

## Phase B - Merge in main context

当三个报告都返回后，由主 agent（不是子 persona）进行综合：

1. **Code Quality** - 聚合 `code-reviewer` 的 Critical/Important findings，以及任何失败的 tests、lint 或 build 输出。合并重复发现。
2. **Security** - 将任何 Critical/High `security-auditor` findings 提升为 launch blockers。与 `code-reviewer` 的 security axis 交叉核对。
3. **Performance** - 从 `code-reviewer` 的 performance axis 提取；适用时交叉检查 Core Web Vitals。
4. **Accessibility** - 验证 keyboard nav、screen reader support、contrast（三个 personas 不覆盖这一项；在这里直接处理，或调用 accessibility checklist）。
5. **Infrastructure** - Env vars、migrations、monitoring、feature flags。直接验证。
6. **Documentation** - README、ADRs、changelog。直接验证。

## Phase C - Decision and rollback

生成单一输出：

```markdown
## Ship Decision: GO | NO-GO

### Blockers (must fix before ship)
- [Source persona: Critical finding + file:line]

### Important Issues
- [Source persona: Important finding + recommendation]

### Test Coverage
- [Summary from test-engineer]

### Security Posture
- [Summary from security-auditor]

### Rollback Plan
- [Specific revert/feature-flag/infra rollback steps]

### Final Recommendation
[One paragraph decision with rationale]
```

如果存在任何 blocker，决策必须是 NO-GO。
