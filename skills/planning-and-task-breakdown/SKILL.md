---
name: planning-and-task-breakdown
description: 将工作拆成有序任务。Use when 已有 spec 或清晰需求，需要拆成可实现任务；当任务太大难以下手、需要估算范围，或可能并行工作时使用。
---

# Planning and Task Breakdown（规划与任务拆解）

## Overview（概览）

把工作拆解成小而可验证的任务，并写明 explicit acceptance criteria。好的任务拆解，是 agent 能可靠完成工作和产出一团乱麻之间的差别。每个任务都应小到可以在一次专注会话中实现、测试和验证。

## When to Use（何时使用）

- 你已有 spec，需要拆成可实现单元
- 任务太大或太模糊，无法直接开始
- 工作需要跨多个 agents 或 sessions 并行
- 你需要向人类沟通范围
- 实现顺序并不明显

**When NOT to use:** 范围明显的单文件变更，或 spec 已经包含定义良好的任务。

## The Planning Process（规划流程）

### Step 1: Enter Plan Mode

写任何代码之前，以只读方式工作：

- 阅读 spec 和相关代码区域
- 识别现有模式和约定
- 映射组件之间的依赖
- 记录风险和未知项

**Do NOT write code during planning.** 输出是计划文档，不是实现。

### Step 2: Identify the Dependency Graph

映射什么依赖什么：

```text
Database schema
    |
    +-- API models/types
    |       |
    |       +-- API endpoints
    |       |       |
    |       |       +-- Frontend API client
    |       |               |
    |       |               +-- UI components
    |       |
    |       +-- Validation logic
    |
    +-- Seed data / migrations
```

实现顺序按依赖图自底向上：先构建基础，再构建上层。

### Step 3: Slice Vertically

不要先构建所有 database，再构建所有 API，再构建所有 UI。应一次构建一条完整 feature path：

**Bad (horizontal slicing):**
```text
Task 1: Build entire database schema
Task 2: Build all API endpoints
Task 3: Build all UI components
Task 4: Connect everything
```

**Good (vertical slicing):**
```text
Task 1: User can create an account (schema + API + UI for registration)
Task 2: User can log in (auth schema + API + UI for login)
Task 3: User can create a task (task schema + API + UI for creation)
Task 4: User can view task list (query + API + UI for list view)
```

每个 vertical slice 都交付可工作、可测试的功能。

### Step 4: Write Tasks

每个任务使用这个结构：

```markdown
## Task [N]: [Short descriptive title]

**Description:** One paragraph explaining what this task accomplishes.

**Acceptance criteria:**
- [ ] [Specific, testable condition]
- [ ] [Specific, testable condition]

**Verification:**
- [ ] Tests pass: `npm test -- --grep "feature-name"`
- [ ] Build succeeds: `npm run build`
- [ ] Manual check: [description of what to verify]

**Dependencies:** [Task numbers this depends on, or "None"]

**Files likely touched:**
- `src/path/to/file.ts`
- `tests/path/to/test.ts`

**Estimated scope:** [Small: 1-2 files | Medium: 3-5 files | Large: 5+ files]
```

### Step 5: Order and Checkpoint

安排任务时确保：

1. 依赖已满足（先构建基础）
2. 每个任务完成后系统都保持可工作状态
3. 每 2-3 个任务设置一次 verification checkpoint
4. 高风险任务靠前（fail fast）

添加明确 checkpoints：

```markdown
## Checkpoint: After Tasks 1-3
- [ ] All tests pass
- [ ] Application builds without errors
- [ ] Core user flow works end-to-end
- [ ] Review with human before proceeding
```

## Task Sizing Guidelines（任务大小指南）

| Size | Files | Scope | Example |
|------|-------|-------|---------|
| **XS** | 1 | 单函数或配置变更 | Add a validation rule |
| **S** | 1-2 | 一个组件或 endpoint | Add a new API endpoint |
| **M** | 3-5 | 一个 feature slice | User registration flow |
| **L** | 5-8 | 多组件功能 | Search with filtering and pagination |
| **XL** | 8+ | **太大，继续拆分** | - |

如果任务是 L 或更大，应继续拆成更小任务。Agent 最适合执行 S 和 M 任务。

**何时继续拆分任务：**
- 需要超过一次专注会话（大约 2+ 小时 agent 工作）
- 你无法用 3 条或更少 bullet 描述 acceptance criteria
- 它触及两个或更多独立子系统（例如 auth 和 billing）
- 你在任务标题中写了 “and”（通常说明这是两个任务）

## Plan Document Template（计划文档模板）

```markdown
# Implementation Plan: [Feature/Project Name]

## Overview
[One paragraph summary of what we're building]

## Architecture Decisions
- [Key decision 1 and rationale]
- [Key decision 2 and rationale]

## Task List

### Phase 1: Foundation
- [ ] Task 1: ...
- [ ] Task 2: ...

### Checkpoint: Foundation
- [ ] Tests pass, builds clean

### Phase 2: Core Features
- [ ] Task 3: ...
- [ ] Task 4: ...

### Checkpoint: Core Features
- [ ] End-to-end flow works

### Phase 3: Polish
- [ ] Task 5: ...
- [ ] Task 6: ...

### Checkpoint: Complete
- [ ] All acceptance criteria met
- [ ] Ready for review

## Risks and Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| [Risk] | [High/Med/Low] | [Strategy] |

## Open Questions
- [Question needing human input]
```

## Parallelization Opportunities（并行机会）

当有多个 agents 或 sessions 可用时：

- **Safe to parallelize:** 独立 feature slices、已实现功能的测试、文档
- **Must be sequential:** Database migrations、共享状态变更、依赖链
- **Needs coordination:** 共享 API contract 的功能（先定义 contract，再并行）

## Common Rationalizations（常见合理化）

| Rationalization | Reality |
|---|---|
| "I'll figure it out as I go" | 这会导致混乱和返工。10 分钟规划能节省数小时。 |
| "The tasks are obvious" | 仍然写下来。显式任务会暴露隐藏依赖和被忘掉的边界情况。 |
| "Planning is overhead" | 规划就是任务的一部分。没有计划的实现只是打字。 |
| "I can hold it all in my head" | Context windows 是有限的。书面计划能跨 session 和 compaction 存活。 |

## Red Flags（危险信号）

- 没有书面任务列表就开始实现
- 任务写的是 “implement the feature”，但没有 acceptance criteria
- 计划中没有 verification steps
- 所有任务都是 XL
- 主要阶段之间没有 checkpoints
- 没有考虑依赖顺序

## Verification（验证）

开始实现前确认：

- [ ] 每个任务都有 acceptance criteria
- [ ] 每个任务都有 verification step
- [ ] 任务依赖已识别并正确排序
- [ ] 没有任务触及超过约 5 个文件
- [ ] 主要阶段之间有 checkpoints
- [ ] 人类已审阅并批准计划
