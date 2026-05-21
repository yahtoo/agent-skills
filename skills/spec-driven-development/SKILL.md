---
name: spec-driven-development
description: 编码前先创建 spec。Use when 启动新项目、新功能或重大变更且还没有 specification；Use when 需求不清、存在歧义，或只是模糊想法。
---

# Spec-Driven Development（规格驱动开发）

## Overview（概览）

在写任何代码之前，先写结构化 specification。Spec 是你和人类工程师之间共享的事实来源：它定义我们要构建什么、为什么构建，以及如何判断完成。没有 spec 的代码就是猜测。

## When to Use（何时使用）

- 启动新项目或新功能
- 需求含糊或不完整
- 变更触及多个文件或模块
- 你即将做架构决策
- 任务实现会超过 30 分钟

**When NOT to use:** 单行修复、错字更正，或需求明确且自包含的变更。

## The Gated Workflow（带门禁的工作流）

Spec-driven development 有四个阶段。在当前阶段被验证之前，不要进入下一阶段。

```text
SPECIFY --> PLAN --> TASKS --> IMPLEMENT
   |         |        |          |
   v         v        v          v
 Human     Human    Human      Human
 reviews   reviews  reviews    reviews
```

### Phase 1: Specify

从高层 vision 开始。持续向人类提出澄清问题，直到需求变得具体。

**立即暴露 assumptions。** 写任何 spec 内容之前，先列出你的假设：

```text
ASSUMPTIONS I'M MAKING:
1. This is a web application (not native mobile)
2. Authentication uses session-based cookies (not JWT)
3. The database is PostgreSQL (based on existing Prisma schema)
4. We're targeting modern browsers only (no IE11)
→ Correct me now or I'll proceed with these.
```

不要静默补全含糊需求。Spec 的全部目的，是在代码写出来之前暴露误解。Assumptions 是最危险的误解形式。

**写一份覆盖六个核心领域的 spec 文档：**

1. **Objective** - 我们在构建什么，为什么？用户是谁？成功是什么样子？

2. **Commands** - 完整可执行命令及 flags，不只是工具名。
   ```text
   Build: npm run build
   Test: npm test -- --coverage
   Lint: npm run lint --fix
   Dev: npm run dev
   ```

3. **Project Structure** - 源代码在哪里、测试放哪里、文档属于哪里。
   ```text
   src/           -> Application source code
   src/components -> React components
   src/lib        -> Shared utilities
   tests/         -> Unit and integration tests
   e2e/           -> End-to-end tests
   docs/          -> Documentation
   ```

4. **Code Style** - 一个真实代码片段比三段描述更能说明风格。包括命名约定、格式规则和好输出的示例。

5. **Testing Strategy** - 使用什么 framework、测试放哪里、coverage expectations、哪些 concerns 使用哪些 test levels。

6. **Boundaries** - 三层系统：
   - **Always do:** Run tests before commits, follow naming conventions, validate inputs
   - **Ask first:** Database schema changes, adding dependencies, changing CI config
   - **Never do:** Commit secrets, edit vendor directories, remove failing tests without approval

**Spec template:**

```markdown
# Spec: [Project/Feature Name]

## Objective
[What we're building and why. User stories or acceptance criteria.]

## Tech Stack
[Framework, language, key dependencies with versions]

## Commands
[Build, test, lint, dev — full commands]

## Project Structure
[Directory layout with descriptions]

## Code Style
[Example snippet + key conventions]

## Testing Strategy
[Framework, test locations, coverage requirements, test levels]

## Boundaries
- Always: [...]
- Ask first: [...]
- Never: [...]

## Success Criteria
[How we'll know this is done — specific, testable conditions]

## Open Questions
[Anything unresolved that needs human input]
```

**把指令重写成 success criteria。** 收到模糊需求时，把它们转成具体条件：

```text
REQUIREMENT: "Make the dashboard faster"

REFRAMED SUCCESS CRITERIA:
- Dashboard LCP < 2.5s on 4G connection
- Initial data load completes in < 500ms
- No layout shift during load (CLS < 0.1)
→ Are these the right targets?
```

这样你可以围绕清晰目标循环、重试和解决问题，而不是猜测 “faster” 到底是什么意思。

### Phase 2: Plan

有了已验证的 spec 后，生成技术实现计划：

1. 识别主要组件及其依赖
2. 决定实现顺序（必须先构建什么）
3. 记录风险和缓解策略
4. 识别哪些可以并行构建，哪些必须顺序执行
5. 在阶段之间定义 verification checkpoints

计划应可审阅：人类读完后应能说 “yes, that's the right approach” 或 “no, change X.”

### Phase 3: Tasks

把计划拆成离散、可实现的任务：

- 每个任务都应能在一次专注会话中完成
- 每个任务都有明确 acceptance criteria
- 每个任务包含 verification step（test、build、manual check）
- 任务按依赖排序，而不是按感知重要性排序
- 没有任务应要求修改超过约 5 个文件

**Task template:**
```markdown
- [ ] Task: [Description]
  - Acceptance: [What must be true when done]
  - Verify: [How to confirm — test command, build, manual check]
  - Files: [Which files will be touched]
```

### Phase 4: Implement

逐个执行任务，遵循 `skills/incremental-implementation/SKILL.md` (`incremental-implementation`) 和 `skills/test-driven-development/SKILL.md` (`test-driven-development`)。使用 `skills/context-engineering/SKILL.md` (`context-engineering`) 在每一步加载正确的 spec sections 和 source files，而不是把整个 spec 全塞给 agent。

## Keeping the Spec Alive（让 Spec 保持有效）

Spec 是 living document，不是一次性 artifact：

- **Update when decisions change** - 如果发现 data model 需要改变，先更新 spec，再实现。
- **Update when scope changes** - 增加或裁剪功能时，应反映到 spec。
- **Commit the spec** - Spec 应和代码一起进入 version control。
- **Reference the spec in PRs** - 每个 PR 实现的 spec section 都应被链接引用。

## Common Rationalizations（常见合理化）

| Rationalization | Reality |
|---|---|
| "This is simple, I don't need a spec" | 简单任务不需要长 spec，但仍需要 acceptance criteria。两行 spec 可以。 |
| "I'll write the spec after I code it" | 那是 documentation，不是 specification。Spec 的价值在于写代码前强制澄清。 |
| "The spec will slow us down" | 15 分钟 spec 能避免数小时返工。15 分钟 waterfall 胜过 15 小时 debugging。 |
| "Requirements will change anyway" | 这正是 spec 要作为 living document 的原因。过时 spec 仍比没有 spec 好。 |
| "The user knows what they want" | 即使请求很清楚，也有隐含 assumptions。Spec 会暴露这些 assumptions。 |

## Red Flags（危险信号）

- 没有任何书面需求就开始写代码
- 在澄清 “done” 含义之前问 “should I just start building?”
- 实现没有出现在任何 spec 或 task list 中的功能
- 做架构决策但没有记录
- 因为 “it's obvious what to build” 而跳过 spec

## Verification（验证）

进入实现前确认：

- [ ] Spec 覆盖全部六个核心领域
- [ ] 人类已审阅并批准 spec
- [ ] Success criteria 具体且可测试
- [ ] Boundaries（Always/Ask First/Never）已定义
- [ ] Spec 已保存到仓库中的文件
