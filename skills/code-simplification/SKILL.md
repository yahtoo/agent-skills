---
name: code-simplification
description: 简化代码以提升清晰度。Use when refactoring code for clarity without changing behavior. 用于代码能工作但比必要程度更难读、维护或扩展，或评审发现不必要复杂度时。
---

# Code Simplification（代码简化）

> 灵感来自 [Claude Code Simplifier plugin](https://github.com/anthropics/claude-plugins-official/blob/main/plugins/code-simplifier/agents/code-simplifier.md)。这里改写为适用于任何 AI 编码代理的、模型无关的流程型 skill。

## Overview（概览）

在精确保留行为的前提下降低代码复杂度。目标不是更少行数，而是让代码更容易阅读、理解、修改和调试。每次简化都必须通过一个简单测试：“新团队成员会不会比读原代码更快理解它？”

## When to Use（何时使用）

- 功能已经工作且测试通过，但实现比必要程度更重时
- 代码评审中标记了可读性或复杂度问题时
- 遇到深层嵌套逻辑、长函数或命名不清晰时
- 重构在时间压力下写出的代码时
- 合并分散在多个文件中的相关逻辑时
- 合并引入重复或不一致的变更之后

**When NOT to use（何时不要使用）：**

- 代码已经干净可读，不要为了简化而简化
- 你还不理解代码在做什么，先理解再简化
- 代码是性能关键路径，而“更简单”的版本会明显更慢
- 你马上要整体重写该模块，简化即将丢弃的代码是在浪费精力

## The Five Principles（五项原则）

### 1. Preserve Behavior Exactly（精确保留行为）

不要改变代码做什么，只改变它如何表达。所有输入、输出、副作用、错误行为和边界情况都必须保持一致。如果你不确定某个简化是否保留行为，就不要做。

```
ASK BEFORE EVERY CHANGE:
→ Does this produce the same output for every input?
→ Does this maintain the same error behavior?
→ Does this preserve the same side effects and ordering?
→ Do all existing tests still pass without modification?
```

### 2. Follow Project Conventions（遵循项目约定）

简化意味着让代码更符合代码库，而不是强加外部偏好。简化前：

```
1. Read CLAUDE.md / project conventions
2. Study how neighboring code handles similar patterns
3. Match the project's style for:
   - Import ordering and module system
   - Function declaration style
   - Naming conventions
   - Error handling patterns
   - Type annotation depth
```

破坏项目一致性的简化不是简化，而是 churn。

### 3. Prefer Clarity Over Cleverness（清晰优先于聪明）

当紧凑写法需要读者停下来解析时，显式代码优于紧凑代码。

```typescript
// UNCLEAR: Dense ternary chain
const label = isNew ? 'New' : isUpdated ? 'Updated' : isArchived ? 'Archived' : 'Active';

// CLEAR: Readable mapping
function getStatusLabel(item: Item): string {
  if (item.isNew) return 'New';
  if (item.isUpdated) return 'Updated';
  if (item.isArchived) return 'Archived';
  return 'Active';
}
```

```typescript
// UNCLEAR: Chained reduces with inline logic
const result = items.reduce((acc, item) => ({
  ...acc,
  [item.id]: { ...acc[item.id], count: (acc[item.id]?.count ?? 0) + 1 }
}), {});

// CLEAR: Named intermediate step
const countById = new Map<string, number>();
for (const item of items) {
  countById.set(item.id, (countById.get(item.id) ?? 0) + 1);
}
```

### 4. Maintain Balance（保持平衡）

简化有一种失败模式：过度简化。注意这些陷阱：

- **过度内联**：移除一个为概念命名的 helper，会让调用点更难读
- **合并无关逻辑**：两个简单函数合成一个复杂函数，并不会更简单
- **移除“没必要”的抽象**：有些抽象是为可扩展性或可测试性存在，不是为了复杂度
- **按行数优化**：更少行不是目标，更容易理解才是

### 5. Scope to What Changed（限定到已变更范围）

默认只简化最近修改过的代码。除非明确要求扩大范围，否则避免顺手重构无关代码。无边界的简化会制造 diff 噪音，并带来意外回归风险。

## The Simplification Process（简化流程）

### Step 1: Understand Before Touching (Chesterton's Fence)（先理解，再动手）

修改或移除任何东西前，先理解它为什么存在。这就是 Chesterton's Fence：如果你看到路中间有一道栅栏，又不知道它为什么在那里，就不要拆掉。先理解原因，再判断这个原因是否仍然成立。

```
BEFORE SIMPLIFYING, ANSWER:
- What is this code's responsibility?
- What calls it? What does it call?
- What are the edge cases and error paths?
- Are there tests that define the expected behavior?
- Why might it have been written this way? (Performance? Platform constraint? Historical reason?)
- Check git blame: what was the original context for this code?
```

如果答不上这些问题，就还没准备好简化。先读取更多上下文。

### Step 2: Identify Simplification Opportunities（识别简化机会）

扫描这些模式。每一项都是具体信号，而不是模糊的坏味道：

**Structural complexity（结构复杂度）：**

| 模式 | 信号 | 简化方式 |
|---------|--------|----------------|
| 深层嵌套（3+ 层） | 控制流难以跟随 | 将条件提取为 guard clauses 或 helper functions |
| 长函数（50+ 行） | 多个职责 | 拆分成有描述性名称的聚焦函数 |
| 嵌套三元表达式 | 需要脑内栈来解析 | 替换为 if/else 链、switch 或 lookup objects |
| 布尔参数标志 | `doThing(true, false, true)` | 替换为 options objects 或独立函数 |
| 重复条件判断 | 相同 `if` 检查出现在多处 | 提取为命名良好的 predicate function |

**Naming and readability（命名与可读性）：**

| 模式 | 信号 | 简化方式 |
|---------|--------|----------------|
| 泛泛命名 | `data`、`result`、`temp`、`val`、`item` | 重命名为描述内容的名称：`userProfile`、`validationErrors` |
| 缩写命名 | `usr`、`cfg`、`btn`、`evt` | 除非缩写是通用的（`id`、`url`、`api`），否则使用完整单词 |
| 误导性命名 | 名为 `get` 的函数还会改变状态 | 重命名以反映真实行为 |
| 解释“做什么”的注释 | `// increment counter` 写在 `count++` 上方 | 删除注释，代码已经足够清晰 |
| 解释“为什么”的注释 | `// Retry because the API is flaky under load` | 保留，这类注释承载代码无法表达的意图 |

**Redundancy（冗余）：**

| 模式 | 信号 | 简化方式 |
|---------|--------|----------------|
| 重复逻辑 | 相同 5+ 行出现在多处 | 提取为共享函数 |
| 死代码 | 不可达分支、未使用变量、注释掉的代码块 | 移除（确认它确实是死代码之后） |
| 不必要抽象 | 没有增加价值的 wrapper | 内联 wrapper，直接调用底层函数 |
| 过度工程化模式 | Factory-for-a-factory、strategy-with-one-strategy | 替换为简单直接的方法 |
| 冗余类型断言 | 断言到已能推断出的类型 | 移除断言 |

### Step 3: Apply Changes Incrementally（增量应用变更）

一次只做一个简化。每次变更后运行测试。**将重构变更与功能或 bug 修复变更分开提交。** 一个 PR 同时重构并新增功能，就是两个 PR，需要拆分。

```
FOR EACH SIMPLIFICATION:
1. Make the change
2. Run the test suite
3. If tests pass → commit (or continue to next simplification)
4. If tests fail → revert and reconsider
```

避免把多个简化批量放进一个未经测试的变更。如果东西坏了，你需要知道是哪一个简化导致的。

**500 规则：** 如果一次重构会触碰超过 500 行，应投入自动化（codemods、sed scripts、AST transforms），而不是手工改。这个规模的手工编辑容易出错，也很难评审。

### Step 4: Verify the Result（验证结果）

完成所有简化后，退一步整体评估：

```
COMPARE BEFORE AND AFTER:
- Is the simplified version genuinely easier to understand?
- Did you introduce any new patterns inconsistent with the codebase?
- Is the diff clean and reviewable?
- Would a teammate approve this change?
```

如果“简化后”的版本更难理解或更难评审，就回退。不是每次简化尝试都会成功。

## Language-Specific Guidance（语言特定指导）

### TypeScript / JavaScript

```typescript
// SIMPLIFY: Unnecessary async wrapper
// Before
async function getUser(id: string): Promise<User> {
  return await userService.findById(id);
}
// After
function getUser(id: string): Promise<User> {
  return userService.findById(id);
}

// SIMPLIFY: Verbose conditional assignment
// Before
let displayName: string;
if (user.nickname) {
  displayName = user.nickname;
} else {
  displayName = user.fullName;
}
// After
const displayName = user.nickname || user.fullName;

// SIMPLIFY: Manual array building
// Before
const activeUsers: User[] = [];
for (const user of users) {
  if (user.isActive) {
    activeUsers.push(user);
  }
}
// After
const activeUsers = users.filter((user) => user.isActive);

// SIMPLIFY: Redundant boolean return
// Before
function isValid(input: string): boolean {
  if (input.length > 0 && input.length < 100) {
    return true;
  }
  return false;
}
// After
function isValid(input: string): boolean {
  return input.length > 0 && input.length < 100;
}
```

### Python

```python
# SIMPLIFY: Verbose dictionary building
# Before
result = {}
for item in items:
    result[item.id] = item.name
# After
result = {item.id: item.name for item in items}

# SIMPLIFY: Nested conditionals with early return
# Before
def process(data):
    if data is not None:
        if data.is_valid():
            if data.has_permission():
                return do_work(data)
            else:
                raise PermissionError("No permission")
        else:
            raise ValueError("Invalid data")
    else:
        raise TypeError("Data is None")
# After
def process(data):
    if data is None:
        raise TypeError("Data is None")
    if not data.is_valid():
        raise ValueError("Invalid data")
    if not data.has_permission():
        raise PermissionError("No permission")
    return do_work(data)
```

### React / JSX

```tsx
// SIMPLIFY: Verbose conditional rendering
// Before
function UserBadge({ user }: Props) {
  if (user.isAdmin) {
    return <Badge variant="admin">Admin</Badge>;
  } else {
    return <Badge variant="default">User</Badge>;
  }
}
// After
function UserBadge({ user }: Props) {
  const variant = user.isAdmin ? 'admin' : 'default';
  const label = user.isAdmin ? 'Admin' : 'User';
  return <Badge variant={variant}>{label}</Badge>;
}

// SIMPLIFY: Prop drilling through intermediate components
// Before — consider whether context or composition solves this better.
// This is a judgment call — flag it, don't auto-refactor.
```

## Common Rationalizations（常见合理化）

| 常见合理化 | 现实 |
|---|---|
| “它能工作，没必要动它” | 能工作的代码如果难读，出问题时也会难修。现在简化能节省未来每次变更的时间。 |
| “行数更少总是更简单” | 一行嵌套三元表达式不比五行 if/else 更简单。简单看的是理解速度，不是行数。 |
| “我也顺手快速简化一下这段无关代码” | 无边界简化会制造 noisy diff，并在你本不打算修改的代码里引入回归风险。保持聚焦。 |
| “类型让它自文档化了” | 类型说明结构，不说明意图。命名良好的函数解释 *why*，比类型签名解释 *what* 更好。 |
| “这个抽象之后可能有用” | 不要保留投机式抽象。现在没被使用，就是没有价值的复杂度。需要时再加回来。 |
| “原作者一定有他的理由” | 也许有。检查 git blame，应用 Chesterton's Fence。但积累的复杂度往往没有理由，只是压力下迭代的残留。 |
| “我在加这个功能时顺便重构” | 将重构与功能开发分开。混合变更更难评审、回退和理解历史。 |

## Red Flags（危险信号）

- 简化需要修改测试才能通过（你很可能改变了行为）
- “简化后”的代码比原来更长、更难跟随
- 按个人偏好而不是项目约定重命名
- 因为“让代码更干净”而移除错误处理
- 简化你尚未完全理解的代码
- 将许多简化打包成一个很大、难评审的提交
- 未被要求时重构当前任务范围外的代码

## Verification（验证）

完成一轮简化后：

- [ ] 所有既有测试无需修改即可通过
- [ ] build 成功且没有新 warning
- [ ] linter/formatter 通过（没有风格回归）
- [ ] 每个简化都是可评审的增量变更
- [ ] diff 干净，没有混入无关变更
- [ ] 简化后的代码遵循项目约定（已对照 CLAUDE.md 或等价文档）
- [ ] 没有移除或削弱错误处理
- [ ] 没有留下死代码（未使用 import、不可达分支）
- [ ] 队友或 review agent 会认可这个变更是净改善
