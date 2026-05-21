---
name: git-workflow-and-versioning
description: 规范 git 工作流实践。Use when making any code change. Use when committing, branching, resolving conflicts, or when you need to organize work across multiple parallel streams.
---

# Git Workflow and Versioning

## Overview（概览）

Git 是你的安全网。把提交当作保存点，把分支当作沙盒，把历史当作文档。AI 代理能高速生成代码，严格的版本控制就是让变更可管理、可审查、可回滚的机制。

## When to Use（何时使用）

始终使用。每一次代码变更都应该经过 git。

## Core Principles（核心原则）

### Trunk-Based Development (Recommended)（基于主干开发，推荐）

保持 `main` 始终可部署。使用短生命周期的 feature branches 工作，并在 1-3 天内合回主干。长期存在的开发分支是隐藏成本：它们会分叉、制造合并冲突，并延迟集成。DORA 研究持续表明，trunk-based development 与高绩效工程团队相关。

```
main ──●──●──●──●──●──●──●──●──●──  (always deployable)
        ╲      ╱  ╲    ╱
         ●──●─╱    ●──╱    ← short-lived feature branches (1-3 days)
```

这是推荐默认做法。使用 gitflow 或长期分支的团队也可以把这些原则（原子提交、小变更、描述性消息）应用到自己的分支模型中。提交纪律比具体分支策略更重要。

- **Dev branches are costs.** 分支每多存在一天，就会多积累一天的合并风险。
- **Release branches are acceptable.** 当需要在 main 继续前进的同时稳定某个发布版本时，release branches 是可以接受的。
- **Feature flags > long branches.** 优先把未完成工作放在 feature flags 后部署，而不是把它留在分支上数周。

### 1. Commit Early, Commit Often（尽早提交，经常提交）

每个成功的增量都有自己的提交。不要积累大块未提交变更。

```
Work pattern:
  Implement slice → Test → Verify → Commit → Next slice

Not this:
  Implement everything → Hope it works → Giant commit
```

提交是保存点。如果下一个变更破坏了什么，你可以立即回到上一个已知良好状态。

### 2. Atomic Commits（原子提交）

每个提交只做一件逻辑上的事：

```
# Good: Each commit is self-contained
git log --oneline
a1b2c3d Add task creation endpoint with validation
d4e5f6g Add task creation form component
h7i8j9k Connect form to API and add loading state
m1n2o3p Add task creation tests (unit + integration)

# Bad: Everything mixed together
git log --oneline
x1y2z3a Add task feature, fix sidebar, update deps, refactor utils
```

### 3. Descriptive Messages（描述性消息）

提交消息解释 *why*，不只是说明 *what*：

```
# Good: Explains intent
feat: add email validation to registration endpoint

Prevents invalid email formats from reaching the database.
Uses Zod schema validation at the route handler level,
consistent with existing validation patterns in auth.ts.

# Bad: Describes what's obvious from the diff
update auth.ts
```

**格式：**
```
<type>: <short description>

<optional body explaining why, not what>
```

**类型：**
- `feat` — 新功能
- `fix` — Bug 修复
- `refactor` — 既不修复 bug 也不增加功能的代码变更
- `test` — 添加或更新测试
- `docs` — 仅文档
- `chore` — 工具、依赖、配置

### 4. Keep Concerns Separate（保持关注点分离）

不要把格式化变更和行为变更合在一起。不要把重构和功能合在一起。每类变更都应该是独立提交，理想情况下也是独立 PR：

```
# Good: Separate concerns
git commit -m "refactor: extract validation logic to shared utility"
git commit -m "feat: add phone number validation to registration"

# Bad: Mixed concerns
git commit -m "refactor validation and add phone number field"
```

**把重构和功能工作分开。** 重构变更和功能变更是两种不同的变更，应该分别提交。这会让每个变更更容易审查、回滚，并在历史中被理解。很小的清理（例如重命名变量）可以由审查者自行判断是否放进功能提交。

### 5. Size Your Changes（控制变更大小）

目标是每个提交/PR 约 100 行。超过约 1000 行的变更应该拆分。如何拆分大型变更，参见 `code-review-and-quality` 中的拆分策略。

```
~100 lines  → Easy to review, easy to revert
~300 lines  → Acceptable for a single logical change
~1000 lines → Split into smaller changes
```

## Branching Strategy（分支策略）

### Feature Branches（功能分支）

```
main (always deployable)
  │
  ├── feature/task-creation    ← One feature per branch
  ├── feature/user-settings    ← Parallel work
  └── fix/duplicate-tasks      ← Bug fixes
```

- 从 `main`（或团队默认分支）创建分支
- 保持分支短生命周期（1-3 天内合并）；长期分支是隐藏成本
- 合并后删除分支
- 对未完成功能，优先使用 feature flags，而不是长期分支

### Branch Naming（分支命名）

```
feature/<short-description>   → feature/task-creation
fix/<short-description>       → fix/duplicate-tasks
chore/<short-description>     → chore/update-deps
refactor/<short-description>  → refactor/auth-module
```

## Working with Worktrees（使用 Worktrees）

对于并行 AI 代理工作，使用 git worktrees 同时运行多个分支：

```bash
# Create a worktree for a feature branch
git worktree add ../project-feature-a feature/task-creation
git worktree add ../project-feature-b feature/user-settings

# Each worktree is a separate directory with its own branch
# Agents can work in parallel without interfering
ls ../
  project/              ← main branch
  project-feature-a/    ← task-creation branch
  project-feature-b/    ← user-settings branch

# When done, merge and clean up
git worktree remove ../project-feature-a
```

好处：
- 多个代理可以同时处理不同功能
- 不需要切换分支（每个目录都有自己的分支）
- 如果某个实验失败，删除对应 worktree 即可，不会丢失其他内容
- 变更在显式合并前彼此隔离

## The Save Point Pattern（保存点模式）

```
Agent starts work
    │
    ├── Makes a change
    │   ├── Test passes? → Commit → Continue
    │   └── Test fails? → Revert to last commit → Investigate
    │
    ├── Makes another change
    │   ├── Test passes? → Commit → Continue
    │   └── Test fails? → Revert to last commit → Investigate
    │
    └── Feature complete → All commits form a clean history
```

这种模式意味着你最多只会丢失一个增量的工作。如果代理偏离方向，`git reset --hard HEAD` 会把你带回最后一个成功状态。

## Change Summaries（变更摘要）

任何修改之后，都提供结构化摘要。这会让审查更容易，记录范围纪律，并暴露意外变更：

```
CHANGES MADE:
- src/routes/tasks.ts: Added validation middleware to POST endpoint
- src/lib/validation.ts: Added TaskCreateSchema using Zod

THINGS I DIDN'T TOUCH (intentionally):
- src/routes/auth.ts: Has similar validation gap but out of scope
- src/middleware/error.ts: Error format could be improved (separate task)

POTENTIAL CONCERNS:
- The Zod schema is strict — rejects extra fields. Confirm this is desired.
- Added zod as a dependency (72KB gzipped) — already in package.json
```

这个模式能及早发现错误假设，并为审查者提供清晰的变更地图。`DIDN'T TOUCH` 部分尤其重要，它说明你遵守了范围边界，没有进行未经请求的翻修。

## Pre-Commit Hygiene（提交前卫生检查）

每次提交前：

```bash
# 1. Check what you're about to commit
git diff --staged

# 2. Ensure no secrets
git diff --staged | grep -i "password\|secret\|api_key\|token"

# 3. Run tests
npm test

# 4. Run linting
npm run lint

# 5. Run type checking
npx tsc --noEmit
```

用 git hooks 自动化：

```json
// package.json (using lint-staged + husky)
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

## Handling Generated Files（处理生成文件）

- **Commit generated files** 仅在项目期望提交它们时才提交（例如 `package-lock.json`、Prisma migrations）
- **Don't commit** 构建产物（`dist/`、`.next/`）、环境文件（`.env`）或 IDE 配置（除非共享，否则不要提交 `.vscode/settings.json`）
- **Have a `.gitignore`**，覆盖：`node_modules/`、`dist/`、`.env`、`.env.local`、`*.pem`

## Using Git for Debugging（用 Git 调试）

```bash
# Find which commit introduced a bug
git bisect start
git bisect bad HEAD
git bisect good <known-good-commit>
# Git checkouts midpoints; run your test at each to narrow down

# View what changed recently
git log --oneline -20
git diff HEAD~5..HEAD -- src/

# Find who last changed a specific line
git blame src/services/task.ts

# Search commit messages for a keyword
git log --grep="validation" --oneline
```

## Common Rationalizations（常见合理化）

| Rationalization | Reality |
|---|---|
| "I'll commit when the feature is done" | 一个巨大提交无法审查、调试或回滚。每个切片都要提交。 |
| "The message doesn't matter" | 消息就是文档。未来的你（以及未来的代理）需要理解变更内容和原因。 |
| "I'll squash it all later" | Squash 会破坏开发叙事。最好从一开始就保持干净的增量提交。 |
| "Branches add overhead" | 短生命周期分支成本很低，并能防止冲突工作相撞。长期分支才是问题；应在 1-3 天内合并。 |
| "I'll split this change later" | 大变更更难审查、部署风险更高，也更难回滚。提交前拆分，而不是提交后再拆。 |
| "I don't need a .gitignore" | 直到带有生产 secrets 的 `.env` 被提交为止。立即设置。 |

## Red Flags（危险信号）

- 大量未提交变更持续累积
- 提交消息类似 "fix"、"update"、"misc"
- 格式化变更和行为变更混在一起
- 项目没有 `.gitignore`
- 提交 `node_modules/`、`.env` 或构建产物
- 长期分支明显偏离 main
- 对共享分支 force-push

## Verification（验证）

每次提交都检查：

- [ ] 提交只做一件逻辑上的事
- [ ] 消息解释原因，并遵循类型约定
- [ ] 提交前测试通过
- [ ] diff 中没有 secrets
- [ ] 没有把纯格式化变更和行为变更混在一起
- [ ] `.gitignore` 覆盖标准排除项
