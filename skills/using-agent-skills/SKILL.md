---
name: using-agent-skills
description: 发现并调用 agent skills。用于开始一个 session，或需要判断当前任务适用哪个 skill 时。这是治理所有其他 skills 如何被发现和调用的 meta-skill；保留触发标识 "agent skills"、"discover skill"、"which skill applies"。
---

# Using Agent Skills

## Overview（概览）

Agent Skills 是一组按开发阶段组织的工程工作流 skills。每个 skill 都编码了高级工程师会遵循的特定流程。这个 meta-skill 帮助你为当前任务发现并应用正确的 skill。

## Skill Discovery（Skill 发现）

当任务到来时，识别开发阶段并应用对应 skill：

```
Task arrives
    │
    ├── Don't know what you want yet? ──────→ interview-me
    ├── Have a rough concept, need variants? → idea-refine
    ├── New project/feature/change? ──→ spec-driven-development
    ├── Have a spec, need tasks? ──────→ planning-and-task-breakdown
    ├── Implementing code? ────────────→ incremental-implementation
    │   ├── UI work? ─────────────────→ frontend-ui-engineering
    │   ├── API work? ────────────────→ api-and-interface-design
    │   ├── Need better context? ─────→ context-engineering
    │   ├── Need doc-verified code? ───→ source-driven-development
    │   └── Stakes high / unfamiliar code? ──→ doubt-driven-development
    ├── Writing/running tests? ────────→ test-driven-development
    │   └── Browser-based? ───────────→ browser-testing-with-devtools
    ├── Something broke? ──────────────→ debugging-and-error-recovery
    ├── Reviewing code? ───────────────→ code-review-and-quality
    │   ├── Security concerns? ───────→ security-and-hardening
    │   └── Performance concerns? ────→ performance-optimization
    ├── Committing/branching? ─────────→ git-workflow-and-versioning
    ├── CI/CD pipeline work? ──────────→ ci-cd-and-automation
    ├── Writing docs/ADRs? ───────────→ documentation-and-adrs
    └── Deploying/launching? ─────────→ shipping-and-launch
```

## Core Operating Behaviors（核心操作行为）

这些行为始终适用于所有 skills。它们不可协商。

### 1. Surface Assumptions（暴露假设）

在实现任何非平凡事项前，明确说出你的假设：

```
ASSUMPTIONS I'M MAKING:
1. [assumption about requirements]
2. [assumption about architecture]
3. [assumption about scope]
→ Correct me now or I'll proceed with these.
```

不要默默补全含糊需求。最常见的失败模式，是作出错误假设并在未检查的情况下继续推进。尽早暴露不确定性；这比返工便宜。

### 2. Manage Confusion Actively（主动管理困惑）

当遇到不一致、冲突需求或不清晰规格时：

1. **STOP。** 不要带着猜测继续。
2. 命名具体的困惑点。
3. 呈现 tradeoff，或提出澄清问题。
4. 等待解决后再继续。

**Bad：** 默默选择一种解释，并希望它是对的。
**Good：** “I see X in the spec but Y in the existing code. Which takes precedence?”

### 3. Push Back When Warranted（必要时提出反对）

你不是 yes-machine。当某个方案有明确问题时：

- 直接指出问题
- 解释具体坏处（能量化就量化，例如 “this adds ~200ms latency”，而不是 “this might be slower”）
- 提出替代方案
- 如果人类在充分知情后仍然覆盖你的判断，接受他们的决定

Sycophancy 是一种失败模式。“Of course!” 后面接着实现一个坏主意，对任何人都没帮助。诚实的技术分歧比虚假同意更有价值。

### 4. Enforce Simplicity（强制简单性）

你的自然倾向是过度复杂化。要主动抵抗它。

完成任何实现前，先问：
- 这能用更少行数完成吗？
- 这些抽象是否配得上它们带来的复杂度？
- staff engineer 看了会不会说 “why didn't you just...”？

如果你写了 1000 行，而 100 行就足够，你就失败了。偏好无聊、显然的方案。聪明是昂贵的。

### 5. Maintain Scope Discipline（保持范围纪律）

只触碰被要求触碰的东西。

不要：
- 移除你不理解的注释
- “Clean up” 与任务正交的代码
- 把重构相邻系统作为副作用
- 未经明确批准就删除看似未使用的代码
- 因为 “seem useful” 而添加 spec 之外的功能

你的工作是外科手术式精准，而不是未经请求的翻新。

### 6. Verify, Don't Assume（验证，不要假设）

每个 skill 都包含验证步骤。验证通过前，任务不算完成。“Seems right” 永远不够；必须有证据（通过的测试、build 输出、运行时数据）。

## Failure Modes to Avoid（要避免的失败模式）

这些细微错误看起来像效率，但会制造问题：

1. 作出错误假设而不检查
2. 不管理自己的困惑，在迷失时硬推进
3. 不暴露你注意到的不一致
4. 在非显然决策上不呈现 tradeoff
5. 对有明确问题的方案 sycophantic（“Of course!”）
6. 过度复杂化代码和 API
7. 修改与任务正交的代码或注释
8. 移除你没有完全理解的东西
9. 因为 “it's obvious” 而在没有 spec 的情况下构建
10. 因为 “it looks right” 而跳过验证

## Skill Rules（Skill 规则）

1. **开始工作前检查是否有适用 skill。** Skills 编码了防止常见错误的流程。

2. **Skills 是工作流，不是建议。** 按顺序遵循步骤。不要跳过验证步骤。

3. **多个 skills 可以同时适用。** 一个功能实现可能按顺序涉及 `idea-refine` → `spec-driven-development` → `planning-and-task-breakdown` → `incremental-implementation` → `test-driven-development` → `code-review-and-quality` → `shipping-and-launch`。

4. **有疑问时，从 spec 开始。** 如果任务非平凡且没有 spec，从 `spec-driven-development` 开始。

## Lifecycle Sequence（生命周期序列）

对一个完整功能，典型 skill 顺序是：

```
1.  interview-me                → Extract what the user actually wants
2.  idea-refine                 → Refine vague ideas
3.  spec-driven-development     → Define what we're building
4.  planning-and-task-breakdown → Break into verifiable chunks
5.  context-engineering         → Load the right context
6.  source-driven-development   → Verify against official docs
7.  incremental-implementation  → Build slice by slice
8.  doubt-driven-development    → Cross-examine non-trivial decisions in-flight
9.  test-driven-development     → Prove each slice works
10. code-review-and-quality     → Review before merge
11. git-workflow-and-versioning → Clean commit history
12. documentation-and-adrs      → Document decisions
13. shipping-and-launch         → Deploy safely
```

不是每个任务都需要每个 skill。一个 bug fix 可能只需要：`debugging-and-error-recovery` → `test-driven-development` → `code-review-and-quality`。

## Quick Reference（快速参考）

| Phase | Skill | One-Line Summary |
|-------|-------|-----------------|
| Define | interview-me | 在任何 plan、spec 或 code 出现前，暴露用户真正想要的东西 |
| Define | idea-refine | 通过结构化的发散与收敛思考打磨想法 |
| Define | spec-driven-development | 在写代码前明确需求和验收标准 |
| Plan | planning-and-task-breakdown | 拆解成小而可验证的任务 |
| Build | incremental-implementation | 薄 vertical slices，扩展前逐片测试 |
| Build | source-driven-development | 实现前对照官方文档验证 |
| Build | doubt-driven-development | 对每个非平凡决策做 fresh-context 对抗审查 |
| Build | context-engineering | 在正确时间加载正确上下文 |
| Build | frontend-ui-engineering | 具备可访问性的生产级 UI |
| Build | api-and-interface-design | 清晰契约下的稳定接口 |
| Verify | test-driven-development | 先写失败测试，再让它通过 |
| Verify | browser-testing-with-devtools | 使用 Chrome DevTools MCP 做运行时验证 |
| Verify | debugging-and-error-recovery | Reproduce → localize → fix → guard |
| Review | code-review-and-quality | 带质量门的五轴 review |
| Review | security-and-hardening | OWASP prevention、input validation、least privilege |
| Review | performance-optimization | 先测量，只优化真正重要的部分 |
| Ship | git-workflow-and-versioning | 原子提交、干净历史 |
| Ship | ci-cd-and-automation | 每次变更都有自动化质量门 |
| Ship | documentation-and-adrs | 记录 why，而不只是 what |
| Ship | shipping-and-launch | 发布前 checklist、monitoring、rollback plan |
