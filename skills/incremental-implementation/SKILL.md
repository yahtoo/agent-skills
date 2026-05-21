---
name: incremental-implementation
description: 增量交付变更。Use when 实现任何触及多个文件的 feature 或 change；当你准备一次写大量代码，或任务太大无法一步落地时使用。
---

# Incremental Implementation（增量实现）

## Overview（概览）

用薄的 vertical slices 构建：实现一小块、测试、验证，然后再扩展。避免一次性实现整个功能。每个 increment 都应让系统保持可工作、可测试。这是让大型功能可管理的执行纪律。

## When to Use（何时使用）

- 实现任何多文件变更
- 从任务拆解中构建新功能
- 重构现有代码
- 任何你想在测试前写超过约 100 行代码的时候

**When NOT to use:** 单文件、单函数变更，且范围已经最小。

## The Increment Cycle（增量循环）

```text
+--------------------------------------+
|                                      |
|   Implement --> Test --> Verify --+  |
|       ^                           |  |
|       +----- Commit <-------------+  |
|              |                       |
|              v                       |
|          Next slice                  |
|                                      |
+--------------------------------------+
```

对每个 slice：

1. **Implement** 最小完整功能
2. **Test** - 运行测试套件（如果没有测试就写一个）
3. **Verify** - 确认 slice 按预期工作（tests pass、build succeeds、manual check）
4. **Commit** -- 用描述性信息保存进度（atomic commit guidance 见 `git-workflow-and-versioning`）
5. **Move to the next slice** - 继续推进，不要重来

## Slicing Strategies（切片策略）

### Vertical Slices (Preferred)

构建一条贯穿 stack 的完整路径：

```text
Slice 1: Create a task (DB + API + basic UI)
    -> Tests pass, user can create a task via the UI

Slice 2: List tasks (query + API + UI)
    -> Tests pass, user can see their tasks

Slice 3: Edit a task (update + API + UI)
    -> Tests pass, user can modify tasks

Slice 4: Delete a task (delete + API + UI + confirmation)
    -> Tests pass, full CRUD complete
```

每个 slice 都交付可工作的 end-to-end 功能。

### Contract-First Slicing

当前后端需要并行开发时：

```text
Slice 0: Define the API contract (types, interfaces, OpenAPI spec)
Slice 1a: Implement backend against the contract + API tests
Slice 1b: Implement frontend against mock data matching the contract
Slice 2: Integrate and test end-to-end
```

### Risk-First Slicing

先处理风险最高或最不确定的部分：

```text
Slice 1: Prove the WebSocket connection works (highest risk)
Slice 2: Build real-time task updates on the proven connection
Slice 3: Add offline support and reconnection
```

如果 Slice 1 失败，你会在投入 Slices 2 和 3 之前发现。

## Implementation Rules（实现规则）

### Rule 0: Simplicity First

写任何代码之前，先问：“最简单可工作的方案是什么？”

写完代码后，用这些问题审视：
- 这能用更少代码完成吗？
- 这些 abstractions 真的抵消了自身复杂度吗？
- Staff engineer 会不会看了说 “why didn't you just...”？
- 我是在为假想未来需求构建，还是为当前任务构建？

```text
SIMPLICITY CHECK:
✗ Generic EventBus with middleware pipeline for one notification
✓ Simple function call

✗ Abstract factory pattern for two similar components
✓ Two straightforward components with shared utilities

✗ Config-driven form builder for three forms
✓ Three form components
```

三行相似代码比 premature abstraction 更好。先实现朴素、明显正确的版本。只有在正确性被测试证明后再优化。

### Rule 0.5: Scope Discipline

只触碰任务要求的内容。

Do NOT:
- “Clean up” 与变更相邻的代码
- 重构你没有修改的文件中的 imports
- 删除你没有完全理解的 comments
- 因为某功能 “seems useful” 就添加 spec 之外的功能
- 在只读文件中顺手 modernize syntax

如果你注意到任务范围外值得改进的地方，记录下来，不要修：

```text
NOTICED BUT NOT TOUCHING:
- src/utils/format.ts has an unused import (unrelated to this task)
- The auth middleware could use better error messages (separate task)
→ Want me to create tasks for these?
```

### Rule 1: One Thing at a Time

每个 increment 只改变一件逻辑事情。不要混合 concerns：

**Bad:** 一个 commit 同时新增组件、重构现有组件、更新 build config。

**Good:** 三个独立 commits，每个对应一个变更。

### Rule 2: Keep It Compilable

每个 increment 后，项目必须能 build，现有测试必须通过。不要在 slices 之间让 codebase 处于 broken state。

### Rule 3: Feature Flags for Incomplete Features

如果功能还没准备好给用户使用，但你需要 merge increments：

```typescript
// Feature flag for work-in-progress
const ENABLE_TASK_SHARING = process.env.FEATURE_TASK_SHARING === 'true';

if (ENABLE_TASK_SHARING) {
  // New sharing UI
}
```

这让你能把小 increments merge 到 main branch，而不暴露未完成能力。

### Rule 4: Safe Defaults

新代码应默认安全、保守：

```typescript
// Safe: disabled by default, opt-in
export function createTask(data: TaskInput, options?: { notify?: boolean }) {
  const shouldNotify = options?.notify ?? false;
  // ...
}
```

### Rule 5: Rollback-Friendly

每个 increment 都应可独立 revert：

- Additive changes（新文件、新函数）容易 revert
- 对现有代码的修改应最小且聚焦
- Database migrations 应有对应 rollback migrations
- 避免在同一个 commit 里删除某物又替换它；把它们分开

## Working with Agents（与 Agents 协作）

指导 agent 增量实现时：

```text
"Let's implement Task 3 from the plan.

Start with just the database schema change and the API endpoint.
Don't touch the UI yet — we'll do that in the next increment.

After implementing, run `npm test` and `npm run build` to verify
nothing is broken."
```

明确每个 increment 的 scope 和 NOT in scope。

## Increment Checklist（增量检查清单）

每个 increment 后验证：

- [ ] 变更只做一件事，并且完整完成
- [ ] 所有现有测试仍通过（`npm test`）
- [ ] Build 成功（`npm run build`）
- [ ] Type checking 通过（`npx tsc --noEmit`）
- [ ] Linting 通过（`npm run lint`）
- [ ] 新功能按预期工作
- [ ] 变更已用描述性信息 commit

**Note:** 变更可能影响某个验证命令时，运行该命令。一次成功运行后，除非代码又发生变化，否则不要重复同一个命令；在未变更代码上重复运行不会增加信息。

## Common Rationalizations（常见合理化）

| Rationalization | Reality |
|---|---|
| "I'll test it all at the end" | Bugs 会叠加。Slice 1 的 bug 会让 Slices 2-5 都错。每个 slice 都测试。 |
| "It's faster to do it all at once" | 它感觉更快，直到出问题且你无法从 500 行变更中定位原因。 |
| "These changes are too small to commit separately" | 小 commits 几乎免费。大 commits 隐藏 bug，让 rollback 痛苦。 |
| "I'll add the feature flag later" | 如果功能未完成，就不应对用户可见。现在就加 flag。 |
| "This refactor is small enough to include" | 把 refactor 和 feature 混在一起会让两者都更难 review 和 debug。分开。 |
| "Let me run the build command again just to be sure" | 成功运行后，除非代码改变，重复同一命令没有新信息。后续编辑后再运行，而不是为了安心重复运行。 |

## Red Flags（危险信号）

- 写了超过 100 行代码却没有运行测试
- 一个 increment 中包含多个无关变更
- “Let me just quickly add this too” 式 scope expansion
- 为了更快而跳过 test/verify step
- increments 之间 build 或 tests 是 broken
- 大量 uncommitted changes 堆积
- 在第三个 use case 需要之前就构建 abstractions
- “while I'm here” 触碰任务范围外文件
- 为一次性操作创建新的 utility files
- 没有任何中间代码变更就连续运行同一个 build/test 命令两次

## Verification（验证）

完成某个任务的所有 increments 后确认：

- [ ] 每个 increment 都已单独测试并 commit
- [ ] 完整测试套件通过
- [ ] Build 干净
- [ ] Feature 按 spec end-to-end 工作
- [ ] 没有 uncommitted changes 剩余
