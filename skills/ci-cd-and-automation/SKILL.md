---
name: ci-cd-and-automation
description: 自动化 CI/CD 流水线设置。Use when setting up or modifying build and deployment pipelines. Use when you need to automate quality gates, configure test runners in CI, or establish deployment strategies.
---

# CI/CD and Automation

## Overview（概览）

自动化质量门，确保任何变更在到达生产前都通过测试、lint、类型检查和构建。CI/CD 是其他所有 skill 的执行机制：它能捕获人和代理遗漏的问题，并在每一次变更上保持一致。

**Shift Left：** 尽可能早地在流水线中发现问题。lint 阶段发现的 bug 成本是几分钟；同一个 bug 到生产中才发现，成本就是几小时。把检查前移：静态分析先于测试，测试先于 staging，staging 先于生产。

**Faster is Safer：** 更小批次和更频繁发布会降低风险，而不是增加风险。包含 3 个变更的部署比包含 30 个变更的部署更容易调试。频繁发布也会增强团队对发布流程本身的信心。

## When to Use（何时使用）

- 设置新项目的 CI pipeline
- 添加或修改自动化检查
- 配置部署流水线
- 当某个变更应该触发自动验证
- 调试 CI failures

## The Quality Gate Pipeline（质量门流水线）

每个变更在合并前都经过这些 gates：

```
Pull Request Opened
    │
    ▼
┌─────────────────┐
│   LINT CHECK     │  eslint, prettier
│   ↓ pass         │
│   TYPE CHECK     │  tsc --noEmit
│   ↓ pass         │
│   UNIT TESTS     │  jest/vitest
│   ↓ pass         │
│   BUILD          │  npm run build
│   ↓ pass         │
│   INTEGRATION    │  API/DB tests
│   ↓ pass         │
│   E2E (optional) │  Playwright/Cypress
│   ↓ pass         │
│   SECURITY AUDIT │  npm audit
│   ↓ pass         │
│   BUNDLE SIZE    │  bundlesize check
└─────────────────┘
    │
    ▼
  Ready for review
```

**任何 gate 都不能跳过。** 如果 lint 失败，就修 lint，不要禁用规则。如果测试失败，就修代码，不要跳过测试。

## GitHub Actions Configuration（GitHub Actions 配置）

### Basic CI Pipeline（基础 CI 流水线）

```yaml
# .github/workflows/ci.yml
name: CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Type check
        run: npx tsc --noEmit

      - name: Test
        run: npm test -- --coverage

      - name: Build
        run: npm run build

      - name: Security audit
        run: npm audit --audit-level=high
```

### With Database Integration Tests（带数据库集成测试）

```yaml
  integration:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_DB: testdb
          POSTGRES_USER: ci_user
          POSTGRES_PASSWORD: ${{ secrets.CI_DB_PASSWORD }}
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
      - run: npm ci
      - name: Run migrations
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://ci_user:${{ secrets.CI_DB_PASSWORD }}@localhost:5432/testdb
      - name: Integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgresql://ci_user:${{ secrets.CI_DB_PASSWORD }}@localhost:5432/testdb
```

> **注意：** 即使是仅用于 CI 的测试数据库，也要用 GitHub Secrets 存储凭据，而不是硬编码。这会建立好习惯，并防止测试凭据被意外复用到其他场景。

### E2E Tests（E2E 测试）

```yaml
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
      - run: npm ci
      - name: Install Playwright
        run: npx playwright install --with-deps chromium
      - name: Build
        run: npm run build
      - name: Run E2E tests
        run: npx playwright test
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

## Feeding CI Failures Back to Agents（把 CI 失败反馈给代理）

CI 与 AI 代理结合的力量来自反馈循环。当 CI 失败：

```
CI fails
    │
    ▼
Copy the failure output
    │
    ▼
Feed it to the agent:
"The CI pipeline failed with this error:
[paste specific error]
Fix the issue and verify locally before pushing again."
    │
    ▼
Agent fixes → pushes → CI runs again
```

**关键模式：**

```
Lint failure → Agent runs `npm run lint --fix` and commits
Type error  → Agent reads the error location and fixes the type
Test failure → Agent follows debugging-and-error-recovery skill
Build error → Agent checks config and dependencies
```

## Deployment Strategies（部署策略）

### Preview Deployments（预览部署）

每个 PR 都获得一个 preview deployment，用于人工测试：

```yaml
# Deploy preview on PR (Vercel/Netlify/etc.)
deploy-preview:
  runs-on: ubuntu-latest
  if: github.event_name == 'pull_request'
  steps:
    - uses: actions/checkout@v4
    - name: Deploy preview
      run: npx vercel --token=${{ secrets.VERCEL_TOKEN }}
```

### Feature Flags（功能开关）

Feature flags 将部署和发布解耦。把未完成或高风险功能放在 flags 后部署，这样你可以：

- **Ship code without enabling it.** 提前合并到 main，但等准备好后再启用。
- **Roll back without redeploying.** 通过关闭 flag 回滚，而不是 revert 代码。
- **Canary new features.** 先对 1% 用户启用，再到 10%，最后 100%。
- **Run A/B tests.** 对比启用和未启用功能时的行为。

```typescript
// Simple feature flag pattern
if (featureFlags.isEnabled('new-checkout-flow', { userId })) {
  return renderNewCheckout();
}
return renderLegacyCheckout();
```

**Flag lifecycle：** Create → Enable for testing → Canary → Full rollout → Remove the flag and dead code。永久存在的 flags 会变成技术债；创建时就设定清理日期。

### Staged Rollouts（分阶段发布）

```
PR merged to main
    │
    ▼
  Staging deployment (auto)
    │ Manual verification
    ▼
  Production deployment (manual trigger or auto after staging)
    │
    ▼
  Monitor for errors (15-minute window)
    │
    ├── Errors detected → Rollback
    └── Clean → Done
```

### Rollback Plan（回滚计划）

每次部署都应该可逆：

```yaml
# Manual rollback workflow
name: Rollback
on:
  workflow_dispatch:
    inputs:
      version:
        description: 'Version to rollback to'
        required: true

jobs:
  rollback:
    runs-on: ubuntu-latest
    steps:
      - name: Rollback deployment
        run: |
          # Deploy the specified previous version
          npx vercel rollback ${{ inputs.version }}
```

## Environment Management（环境管理）

```
.env.example       → Committed (template for developers)
.env                → NOT committed (local development)
.env.test           → Committed (test environment, no real secrets)
CI secrets          → Stored in GitHub Secrets / vault
Production secrets  → Stored in deployment platform / vault
```

CI 永远不应该拥有生产 secrets。为 CI 测试使用独立 secrets。

## Automation Beyond CI（CI 之外的自动化）

### Dependabot / Renovate

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: npm
    directory: /
    schedule:
      interval: weekly
    open-pull-requests-limit: 5
```

### Build Cop Role（Build Cop 角色）

指定一个人负责保持 CI 绿色。当 build 失败时，Build Cop 的职责是修复或回滚，而不是由导致失败的那个人负责。这可以防止 broken builds 积累，因为每个人都以为别人会修。

### PR Checks（PR 检查）

- **Required reviews：** 合并前至少 1 个 approval
- **Required status checks：** 合并前 CI 必须通过
- **Branch protection：** 禁止向 main force-push
- **Auto-merge：** 所有检查通过且已 approval 后自动合并

## CI Optimization（CI 优化）

当流水线超过 10 分钟时，按影响从高到低应用这些策略：

```
Slow CI pipeline?
├── Cache dependencies
│   └── Use actions/cache or setup-node cache option for node_modules
├── Run jobs in parallel
│   └── Split lint, typecheck, test, build into separate parallel jobs
├── Only run what changed
│   └── Use path filters to skip unrelated jobs (e.g., skip e2e for docs-only PRs)
├── Use matrix builds
│   └── Shard test suites across multiple runners
├── Optimize the test suite
│   └── Remove slow tests from the critical path, run them on a schedule instead
└── Use larger runners
    └── GitHub-hosted larger runners or self-hosted for CPU-heavy builds
```

**示例：缓存与并行**
```yaml
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22', cache: 'npm' }
      - run: npm ci
      - run: npm run lint

  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22', cache: 'npm' }
      - run: npm ci
      - run: npx tsc --noEmit

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22', cache: 'npm' }
      - run: npm ci
      - run: npm test -- --coverage
```

## Common Rationalizations（常见合理化）

| Rationalization | Reality |
|---|---|
| "CI is too slow" | 优化流水线（见 CI Optimization），不要跳过它。5 分钟流水线可以避免数小时调试。 |
| "This change is trivial, skip CI" | 小变更也会破坏 build。CI 对小变更本来也很快。 |
| "The test is flaky, just re-run" | Flaky tests 会掩盖真实 bug，并浪费所有人的时间。修复不稳定性。 |
| "We'll add CI later" | 没有 CI 的项目会积累 broken states。第一天就设置。 |
| "Manual testing is enough" | 手工测试不可扩展，也不可重复。能自动化的都自动化。 |

## Red Flags（危险信号）

- 项目没有 CI pipeline
- CI failures 被忽略或静默处理
- 为了让 pipeline 通过而在 CI 中禁用测试
- 生产部署没有 staging 验证
- 没有 rollback mechanism
- Secrets 存在代码或 CI 配置文件中，而不是 secrets manager
- CI 时间很长却没有优化努力

## Verification（验证）

设置或修改 CI 后：

- [ ] 所有 quality gates 都存在（lint、types、tests、build、audit）
- [ ] Pipeline 在每个 PR 和 push to main 上运行
- [ ] Failures 会阻止合并（已配置 branch protection）
- [ ] CI 结果反馈回开发循环
- [ ] Secrets 存储在 secrets manager 中，而不是代码里
- [ ] 部署有 rollback mechanism
- [ ] 测试套件的 pipeline 在 10 分钟内完成
