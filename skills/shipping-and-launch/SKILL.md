---
name: shipping-and-launch
description: 准备生产发布。Use when preparing to deploy to production. Use when you need a pre-launch checklist, when setting up monitoring, when planning a staged rollout, or when you need a rollback strategy.
---

# Shipping and Launch

## Overview（概览）

有信心地发布。目标不只是部署，而是安全部署：监控已经就位，回滚计划已经准备好，并且清楚知道什么算成功。每次发布都应该可回滚、可观测、可增量推进。

## When to Use（何时使用）

- 首次把某个功能部署到生产
- 向用户发布重要变更
- 迁移数据或基础设施
- 开放 beta 或 early access program
- 任何带风险的部署（也就是所有部署）

## The Pre-Launch Checklist（发布前检查清单）

### Code Quality（代码质量）

- [ ] 所有测试通过（unit、integration、e2e）
- [ ] Build 成功且无 warnings
- [ ] Lint 和类型检查通过
- [ ] 代码已审查并批准
- [ ] 没有发布前应该解决的 TODO 注释
- [ ] 生产代码中没有 `console.log` 调试语句
- [ ] 错误处理覆盖预期 failure modes

### Security（安全）

- [ ] 代码或版本控制中没有 secrets
- [ ] `npm audit` 没有 critical 或 high vulnerabilities
- [ ] 所有面向用户的 endpoints 都有输入校验
- [ ] Authentication 和 authorization checks 已就位
- [ ] 已配置安全 headers（CSP、HSTS 等）
- [ ] 认证 endpoints 有 rate limiting
- [ ] CORS 配置为特定 origins（不是 wildcard）

### Performance（性能）

- [ ] Core Web Vitals 在 "Good" 阈值内
- [ ] 关键路径中没有 N+1 queries
- [ ] 图片已优化（压缩、响应式尺寸、lazy loading）
- [ ] Bundle size 在预算内
- [ ] 数据库查询有合适索引
- [ ] 静态资源和重复查询已配置缓存

### Accessibility（可访问性）

- [ ] 所有交互元素都支持键盘导航
- [ ] Screen reader 能传达页面内容和结构
- [ ] 颜色对比度满足 WCAG 2.1 AA（文本 4.5:1）
- [ ] Modals 和动态内容的 focus management 正确
- [ ] 错误消息清晰，并与表单字段关联
- [ ] axe-core 或 Lighthouse 中没有 accessibility warnings

### Infrastructure（基础设施）

- [ ] 生产环境变量已设置
- [ ] 数据库 migrations 已应用（或已准备好应用）
- [ ] DNS 和 SSL 已配置
- [ ] CDN 已为静态资源配置
- [ ] Logging 和 error reporting 已配置
- [ ] Health check endpoint 存在且响应正常

### Documentation（文档）

- [ ] README 已更新任何新 setup requirements
- [ ] API 文档保持当前
- [ ] 任何架构决策都有 ADRs
- [ ] Changelog 已更新
- [ ] 面向用户的文档已更新（如适用）

## Feature Flag Strategy（功能开关策略）

通过 feature flags 发布，把部署和发布解耦：

```typescript
// Feature flag check
const flags = await getFeatureFlags(userId);

if (flags.taskSharing) {
  // New feature: task sharing
  return <TaskSharingPanel task={task} />;
}

// Default: existing behavior
return null;
```

**Feature flag lifecycle：**

```
1. DEPLOY with flag OFF     → Code is in production but inactive
2. ENABLE for team/beta     → Internal testing in production environment
3. GRADUAL ROLLOUT          → 5% → 25% → 50% → 100% of users
4. MONITOR at each stage    → Watch error rates, performance, user feedback
5. CLEAN UP                 → Remove flag and dead code path after full rollout
```

**规则：**
- 每个 feature flag 都有 owner 和 expiration date
- 完全 rollout 后 2 周内清理 flags
- 不要嵌套 feature flags（会产生指数级组合）
- 在 CI 中测试 flag 的两种状态（on 和 off）

## Staged Rollout（分阶段发布）

### The Rollout Sequence（发布顺序）

```
1. DEPLOY to staging
   └── Full test suite in staging environment
   └── Manual smoke test of critical flows

2. DEPLOY to production (feature flag OFF)
   └── Verify deployment succeeded (health check)
   └── Check error monitoring (no new errors)

3. ENABLE for team (flag ON for internal users)
   └── Team uses the feature in production
   └── 24-hour monitoring window

4. CANARY rollout (flag ON for 5% of users)
   └── Monitor error rates, latency, user behavior
   └── Compare metrics: canary vs. baseline
   └── 24-48 hour monitoring window
   └── Advance only if all thresholds pass (see table below)

5. GRADUAL increase (25% -> 50% -> 100%)
   └── Same monitoring at each step
   └── Ability to roll back to previous percentage at any point

6. FULL rollout (flag ON for all users)
   └── Monitor for 1 week
   └── Clean up feature flag
```

### Rollout Decision Thresholds（发布决策阈值）

用这些阈值决定每个阶段是推进、暂停调查，还是回滚：

| Metric | Advance (green) | Hold and investigate (yellow) | Roll back (red) |
|--------|-----------------|-------------------------------|-----------------|
| Error rate | 在 baseline 10% 以内 | 比 baseline 高 10-100% | >2x baseline |
| P95 latency | 在 baseline 20% 以内 | 比 baseline 高 20-50% | 比 baseline 高 >50% |
| Client JS errors | 没有新的错误类型 | 新错误影响 <0.1% sessions | 新错误影响 >0.1% sessions |
| Business metrics | 中性或正向 | 下降 <5%（可能是噪声） | 下降 >5% |

### When to Roll Back（何时回滚）

出现以下情况立即回滚：
- Error rate 增加超过 2x baseline
- P95 latency 增加超过 50%
- 用户报告的问题激增
- 检测到数据完整性问题
- 发现安全漏洞

## Monitoring and Observability（监控与可观测性）

### What to Monitor（监控什么）

```
Application metrics:
├── Error rate (total and by endpoint)
├── Response time (p50, p95, p99)
├── Request volume
├── Active users
└── Key business metrics (conversion, engagement)

Infrastructure metrics:
├── CPU and memory utilization
├── Database connection pool usage
├── Disk space
├── Network latency
└── Queue depth (if applicable)

Client metrics:
├── Core Web Vitals (LCP, INP, CLS)
├── JavaScript errors
├── API error rates from client perspective
└── Page load time
```

### Error Reporting（错误上报）

```typescript
// Set up error boundary with reporting
class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Report to error tracking service
    reportError(error, {
      componentStack: info.componentStack,
      userId: getCurrentUser()?.id,
      page: window.location.pathname,
    });
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback onRetry={() => this.setState({ hasError: false })} />;
    }
    return this.props.children;
  }
}

// Server-side error reporting
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  reportError(err, {
    method: req.method,
    url: req.url,
    userId: req.user?.id,
  });

  // Don't expose internals to users
  res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' },
  });
});
```

### Post-Launch Verification（发布后验证）

发布后第一小时：

```
1. Check health endpoint returns 200
2. Check error monitoring dashboard (no new error types)
3. Check latency dashboard (no regression)
4. Test the critical user flow manually
5. Verify logs are flowing and readable
6. Confirm rollback mechanism works (dry run if possible)
```

## Rollback Strategy（回滚策略）

每次部署发生前，都必须有回滚计划：

```markdown
## Rollback Plan for [Feature/Release]

### Trigger Conditions
- Error rate > 2x baseline
- P95 latency > [X]ms
- User reports of [specific issue]

### Rollback Steps
1. Disable feature flag (if applicable)
   OR
1. Deploy previous version: `git revert <commit> && git push`
2. Verify rollback: health check, error monitoring
3. Communicate: notify team of rollback

### Database Considerations
- Migration [X] has a rollback: `npx prisma migrate rollback`
- Data inserted by new feature: [preserved / cleaned up]

### Time to Rollback
- Feature flag: < 1 minute
- Redeploy previous version: < 5 minutes
- Database rollback: < 15 minutes
```
## See Also（另请参阅）

- 关于安全发布前检查，见 `references/security-checklist.md`
- 关于性能发布前检查，见 `references/performance-checklist.md`
- 关于发布前可访问性验证，见 `references/accessibility-checklist.md`

## Common Rationalizations（常见合理化）

| Rationalization | Reality |
|---|---|
| "It works in staging, it'll work in production" | 生产有不同的数据、流量模式和边界情况。部署后要监控。 |
| "We don't need feature flags for this" | 每个功能都应该有 kill switch。即使“简单”变更也可能破坏东西。 |
| "Monitoring is overhead" | 没有监控意味着你会从用户投诉中发现问题，而不是从 dashboards 中发现。 |
| "We'll add monitoring later" | 发布前就添加。看不见的东西无法调试。 |
| "Rolling back is admitting failure" | 回滚是负责任的工程行为。发布破损功能才是失败。 |

## Red Flags（危险信号）

- 没有 rollback plan 就部署
- 生产中没有 monitoring 或 error reporting
- Big-bang releases（一次性全量发布，没有 staging）
- Feature flags 没有 expiration 或 owner
- 发布后第一小时无人监控
- 生产环境配置靠记忆完成，而不是代码
- "It's Friday afternoon, let's ship it"

## Verification（验证）

部署前：

- [ ] Pre-launch checklist 已完成（所有 sections green）
- [ ] Feature flag 已配置（如适用）
- [ ] Rollback plan 已记录
- [ ] Monitoring dashboards 已设置
- [ ] 团队已收到部署通知

部署后：

- [ ] Health check 返回 200
- [ ] Error rate 正常
- [ ] Latency 正常
- [ ] Critical user flow 可用
- [ ] Logs 正常流入
- [ ] Rollback 已测试或确认 ready
