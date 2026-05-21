---
name: deprecation-and-migration
description: 管理弃用与迁移。Use when removing old systems, APIs, or features. Use when migrating users from one implementation to another. Use when deciding whether to maintain or sunset existing code.
---

# Deprecation and Migration

## Overview（概览）

代码是负债，不是资产。每一行代码都有持续维护成本：要修 bug、更新依赖、打安全补丁，还要让新工程师理解它。弃用是一门移除不再值得维护的代码的纪律；迁移则是把用户从旧实现安全转移到新实现的过程。

大多数工程组织擅长构建东西。很少有组织擅长移除东西。这个 skill 就是为弥补这个缺口而存在。

## When to Use（何时使用）

- 用新系统、API 或库替换旧系统、API 或库
- 下线不再需要的功能
- 合并重复实现
- 移除没人拥有但人人依赖的死代码
- 规划新系统生命周期（弃用规划从设计时就开始）
- 决定是维护 legacy system，还是投入迁移

## Core Principles（核心原则）

### Code Is a Liability（代码是负债）

每一行代码都有持续成本：它需要测试、文档、安全补丁、依赖更新，也会给附近工作的人增加认知负担。代码的价值来自它提供的功能，而不是代码本身。当相同功能可以用更少代码、更低复杂度或更好的抽象提供时，旧代码就应该离开。

### Hyrum's Law Makes Removal Hard（Hyrum 定律让移除变难）

只要用户足够多，每一个可观察行为都会被依赖，包括 bug、时序怪癖和未文档化副作用。这就是为什么弃用需要主动迁移，而不只是发布公告。用户依赖了替代方案没有复现的行为时，不能“直接切换”。

### Deprecation Planning Starts at Design Time（弃用规划从设计时开始）

构建新东西时，问自己：“3 年后我们会怎样移除它？” 具有清晰接口、feature flags 和最小暴露面的系统，比到处泄漏实现细节的系统更容易弃用。

## The Deprecation Decision（弃用决策）

弃用任何东西之前，回答这些问题：

```
1. Does this system still provide unique value?
   → If yes, maintain it. If no, proceed.

2. How many users/consumers depend on it?
   → Quantify the migration scope.

3. Does a replacement exist?
   → If no, build the replacement first. Don't deprecate without an alternative.

4. What's the migration cost for each consumer?
   → If trivially automated, do it. If manual and high-effort, weigh against maintenance cost.

5. What's the ongoing maintenance cost of NOT deprecating?
   → Security risk, engineer time, opportunity cost of complexity.
```

## Compulsory vs Advisory Deprecation（强制弃用与建议弃用）

| Type | When to Use | Mechanism |
|------|-------------|-----------|
| **Advisory** | 迁移是可选的，旧系统稳定 | 警告、文档、提醒。用户按自己的时间线迁移。 |
| **Compulsory** | 旧系统有安全问题、阻碍进展，或维护成本不可持续 | 硬截止日期。旧系统会在 X 日期移除。提供迁移工具。 |

**默认使用 advisory。** 只有当维护成本或风险足以证明强制迁移合理时，才使用 compulsory。强制弃用必须提供迁移工具、文档和支持，不能只宣布一个截止日期。

## The Migration Process（迁移过程）

### Step 1: Build the Replacement（第一步：构建替代方案）

不要在没有可用替代方案时弃用。替代方案必须：

- 覆盖旧系统的所有关键用例
- 有文档和迁移指南
- 已在生产中被证明可用，而不只是“理论上更好”

### Step 2: Announce and Document（第二步：公告并记录）

```markdown
## Deprecation Notice: OldService

**Status:** Deprecated as of 2025-03-01
**Replacement:** NewService (see migration guide below)
**Removal date:** Advisory — no hard deadline yet
**Reason:** OldService requires manual scaling and lacks observability.
            NewService handles both automatically.

### Migration Guide
1. Replace `import { client } from 'old-service'` with `import { client } from 'new-service'`
2. Update configuration (see examples below)
3. Run the migration verification script: `npx migrate-check`
```

### Step 3: Migrate Incrementally（第三步：增量迁移）

一次迁移一个 consumer，不要一次迁完。对每个 consumer：

```
1. Identify all touchpoints with the deprecated system
2. Update to use the replacement
3. Verify behavior matches (tests, integration checks)
4. Remove references to the old system
5. Confirm no regressions
```

**The Churn Rule：** 如果你拥有正在弃用的基础设施，你就负责迁移用户，或者提供无需迁移的向后兼容更新。不要宣布弃用后把问题丢给用户自己解决。

### Step 4: Remove the Old System（第四步：移除旧系统）

只有在所有 consumers 都完成迁移后：

```
1. Verify zero active usage (metrics, logs, dependency analysis)
2. Remove the code
3. Remove associated tests, documentation, and configuration
4. Remove the deprecation notices
5. Celebrate — removing code is an achievement
```

## Migration Patterns（迁移模式）

### Strangler Pattern（绞杀者模式）

让旧系统和新系统并行运行。把流量从旧系统逐步路由到新系统。当旧系统承担 0% 流量时，移除它。

```
Phase 1: New system handles 0%, old handles 100%
Phase 2: New system handles 10% (canary)
Phase 3: New system handles 50%
Phase 4: New system handles 100%, old system idle
Phase 5: Remove old system
```

### Adapter Pattern（适配器模式）

创建一个 adapter，把旧接口调用翻译到新实现。消费者继续使用旧接口，同时你迁移后端。

```typescript
// Adapter: old interface, new implementation
class LegacyTaskService implements OldTaskAPI {
  constructor(private newService: NewTaskService) {}

  // Old method signature, delegates to new implementation
  getTask(id: number): OldTask {
    const task = this.newService.findById(String(id));
    return this.toOldFormat(task);
  }
}
```

### Feature Flag Migration（Feature Flag 迁移）

使用 feature flags，一次把一个 consumer 从旧系统切到新系统：

```typescript
function getTaskService(userId: string): TaskService {
  if (featureFlags.isEnabled('new-task-service', { userId })) {
    return new NewTaskService();
  }
  return new LegacyTaskService();
}
```

## Zombie Code（僵尸代码）

Zombie code 是没人拥有但人人依赖的代码。它没有被主动维护，没有明确 owner，并会积累安全漏洞和兼容性问题。迹象包括：

- 6 个月以上没有提交，但仍有活跃 consumers
- 没有指定 maintainer 或团队
- 测试失败但没人修
- 依赖存在已知漏洞但没人更新
- 文档引用已经不存在的系统

**应对：** 要么分配 owner 并正确维护，要么用具体迁移计划弃用它。Zombie code 不能停在中间状态；它要么得到投入，要么被移除。

## Common Rationalizations（常见合理化）

| Rationalization | Reality |
|---|---|
| "It still works, why remove it?" | 没人维护的可工作代码会积累安全债和复杂度。维护成本会悄悄增长。 |
| "Someone might need it later" | 如果以后需要，可以重建。保留未使用代码以防万一，成本通常高于重建。 |
| "The migration is too expensive" | 把迁移成本和未来 2-3 年的持续维护成本比较。长期看，迁移通常更便宜。 |
| "We'll deprecate it after we finish the new system" | 弃用规划从设计时开始。等新系统完成时，你会有新的优先级。现在就规划。 |
| "Users will migrate on their own" | 他们不会。提供工具、文档和激励，或者自己执行迁移（The Churn Rule）。 |
| "We can maintain both systems indefinitely" | 两套做同一件事的系统意味着双倍维护、测试、文档和 onboarding 成本。 |

## Red Flags（危险信号）

- 被弃用系统没有可用替代方案
- 弃用公告没有迁移工具或文档
- “软”弃用已经建议多年却没有进展
- Zombie code 没有 owner 但仍有活跃 consumers
- 给已弃用系统添加新功能（应该投资替代方案）
- 未测量当前使用情况就弃用
- 未验证零活跃 consumers 就移除代码

## Verification（验证）

完成弃用后：

- [ ] 替代方案已在生产中证明可用，并覆盖所有关键用例
- [ ] 迁移指南包含具体步骤和示例
- [ ] 所有活跃 consumers 都已迁移（通过 metrics/logs 验证）
- [ ] 旧代码、测试、文档和配置已完全移除
- [ ] 代码库中不再引用被弃用系统
- [ ] 弃用通知已移除（它们已经完成使命）
