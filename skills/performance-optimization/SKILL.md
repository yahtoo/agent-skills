---
name: performance-optimization
description: 优化应用性能。Use when performance requirements exist, when you suspect performance regressions, or when Core Web Vitals or load times need improvement. 用于 profiling 发现瓶颈并需要修复时。
---

# Performance Optimization（性能优化）

## Overview（概览）

先测量，再优化。没有测量的性能工作就是猜测，而猜测会导致过早优化：增加复杂度，却没有改善真正重要的指标。先 profiling，识别真实瓶颈，修复它，再次测量。只优化测量证明重要的地方。

## When to Use（何时使用）

- spec 中存在性能要求（加载时间预算、响应时间 SLA）
- 用户或监控报告行为缓慢
- Core Web Vitals 分数低于阈值
- 你怀疑某个变更引入了回归
- 构建处理大数据集或高流量的功能

**When NOT to use（何时不要使用）：** 没有问题证据前不要优化。过早优化带来的复杂度，往往比它换来的性能更贵。

## Core Web Vitals Targets（Core Web Vitals 目标）

| 指标 | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| **LCP** (Largest Contentful Paint) | ≤ 2.5s | ≤ 4.0s | > 4.0s |
| **INP** (Interaction to Next Paint) | ≤ 200ms | ≤ 500ms | > 500ms |
| **CLS** (Cumulative Layout Shift) | ≤ 0.1 | ≤ 0.25 | > 0.25 |

## The Optimization Workflow（优化工作流）

```
1. MEASURE  → Establish baseline with real data
2. IDENTIFY → Find the actual bottleneck (not assumed)
3. FIX      → Address the specific bottleneck
4. VERIFY   → Measure again, confirm improvement
5. GUARD    → Add monitoring or tests to prevent regression
```

### Step 1: Measure（测量）

两种互补方式，都要使用：

- **Synthetic（Lighthouse、DevTools Performance tab）：** 条件可控、可复现。最适合 CI 回归检测和隔离具体问题。
- **RUM（web-vitals library、CrUX）：** 真实条件下的真实用户数据。用于验证修复是否真正改善用户体验。

**Frontend：**
```bash
# Synthetic: Lighthouse in Chrome DevTools (or CI)
# Chrome DevTools → Performance tab → Record
# Chrome DevTools MCP → Performance trace

# RUM: Web Vitals library in code
import { onLCP, onINP, onCLS } from 'web-vitals';

onLCP(console.log);
onINP(console.log);
onCLS(console.log);
```

**Backend：**
```bash
# Response time logging
# Application Performance Monitoring (APM)
# Database query logging with timing

# Simple timing
console.time('db-query');
const result = await db.query(...);
console.timeEnd('db-query');
```

### Where to Start Measuring（从哪里开始测量）

根据症状决定先测什么：

```
What is slow?
├── First page load
│   ├── Large bundle? --> Measure bundle size, check code splitting
│   ├── Slow server response? --> Measure TTFB in DevTools Network waterfall
│   │   ├── DNS long? --> Add dns-prefetch / preconnect for known origins
│   │   ├── TCP/TLS long? --> Enable HTTP/2, check edge deployment, keep-alive
│   │   └── Waiting (server) long? --> Profile backend, check queries and caching
│   └── Render-blocking resources? --> Check network waterfall for CSS/JS blocking
├── Interaction feels sluggish
│   ├── UI freezes on click? --> Profile main thread, look for long tasks (>50ms)
│   ├── Form input lag? --> Check re-renders, controlled component overhead
│   └── Animation jank? --> Check layout thrashing, forced reflows
├── Page after navigation
│   ├── Data loading? --> Measure API response times, check for waterfalls
│   └── Client rendering? --> Profile component render time, check for N+1 fetches
└── Backend / API
    ├── Single endpoint slow? --> Profile database queries, check indexes
    ├── All endpoints slow? --> Check connection pool, memory, CPU
    └── Intermittent slowness? --> Check for lock contention, GC pauses, external deps
```

### Step 2: Identify the Bottleneck（识别瓶颈）

按类别划分的常见瓶颈：

**Frontend：**

| 症状 | 可能原因 | 调查方式 |
|---------|-------------|---------------|
| LCP 慢 | 大图、阻塞渲染资源、服务器慢 | 检查 network waterfall 和图片大小 |
| CLS 高 | 图片没有尺寸、内容延迟加载、字体 shift | 检查 layout shift attribution |
| INP 差 | 主线程上有重 JavaScript、大型 DOM 更新 | 检查 Performance trace 中的 long tasks |
| 初始加载慢 | bundle 大、网络请求多 | 检查 bundle size 和 code splitting |

**Backend：**

| 症状 | 可能原因 | 调查方式 |
|---------|-------------|---------------|
| API 响应慢 | N+1 查询、缺少索引、未优化查询 | 检查数据库 query log |
| 内存增长 | 引用泄漏、无界缓存、大 payload | Heap snapshot analysis |
| CPU 峰值 | 同步重计算、regex backtracking | CPU profiling |
| 高延迟 | 缺少缓存、重复计算、网络跳转 | 追踪请求经过的整条链路 |

### Step 3: Fix Common Anti-Patterns（修复常见反模式）

#### N+1 Queries (Backend)

```typescript
// BAD: N+1 — one query per task for the owner
const tasks = await db.tasks.findMany();
for (const task of tasks) {
  task.owner = await db.users.findUnique({ where: { id: task.ownerId } });
}

// GOOD: Single query with join/include
const tasks = await db.tasks.findMany({
  include: { owner: true },
});
```

#### Unbounded Data Fetching（无界数据获取）

```typescript
// BAD: Fetching all records
const allTasks = await db.tasks.findMany();

// GOOD: Paginated with limits
const tasks = await db.tasks.findMany({
  take: 20,
  skip: (page - 1) * 20,
  orderBy: { createdAt: 'desc' },
});
```

#### Missing Image Optimization (Frontend)（缺少图片优化）

```html
<!-- BAD: No dimensions, no format optimization -->
<img src="/hero.jpg" />

<!-- GOOD: Hero / LCP image — art direction + resolution switching, high priority -->
<!--
  Two techniques combined:
  - Art direction (media): different crop/composition per breakpoint
  - Resolution switching (srcset + sizes): right file size per screen density
-->
<picture>
  <!-- Mobile: portrait crop (8:10) -->
  <source
    media="(max-width: 767px)"
    srcset="/hero-mobile-400.avif 400w, /hero-mobile-800.avif 800w"
    sizes="100vw"
    width="800"
    height="1000"
    type="image/avif"
  />
  <source
    media="(max-width: 767px)"
    srcset="/hero-mobile-400.webp 400w, /hero-mobile-800.webp 800w"
    sizes="100vw"
    width="800"
    height="1000"
    type="image/webp"
  />
  <!-- Desktop: landscape crop (2:1) -->
  <source
    srcset="/hero-800.avif 800w, /hero-1200.avif 1200w, /hero-1600.avif 1600w"
    sizes="(max-width: 1200px) 100vw, 1200px"
    width="1200"
    height="600"
    type="image/avif"
  />
  <source
    srcset="/hero-800.webp 800w, /hero-1200.webp 1200w, /hero-1600.webp 1600w"
    sizes="(max-width: 1200px) 100vw, 1200px"
    width="1200"
    height="600"
    type="image/webp"
  />
  <img
    src="/hero-desktop.jpg"
    width="1200"
    height="600"
    fetchpriority="high"
    alt="Hero image description"
  />
</picture>

<!-- GOOD: Below-the-fold image — lazy loaded + async decoding -->
<img
  src="/content.webp"
  width="800"
  height="400"
  loading="lazy"
  decoding="async"
  alt="Content image description"
/>
```

#### Unnecessary Re-renders (React)（不必要的重新渲染）

```tsx
// BAD: Creates new object on every render, causing children to re-render
function TaskList() {
  return <TaskFilters options={{ sortBy: 'date', order: 'desc' }} />;
}

// GOOD: Stable reference
const DEFAULT_OPTIONS = { sortBy: 'date', order: 'desc' } as const;
function TaskList() {
  return <TaskFilters options={DEFAULT_OPTIONS} />;
}

// Use React.memo for expensive components
const TaskItem = React.memo(function TaskItem({ task }: Props) {
  return <div>{/* expensive render */}</div>;
});

// Use useMemo for expensive computations
function TaskStats({ tasks }: Props) {
  const stats = useMemo(() => calculateStats(tasks), [tasks]);
  return <div>{stats.completed} / {stats.total}</div>;
}
```

#### Large Bundle Size（Bundle 过大）

```typescript
// Modern bundlers (Vite, webpack 5+) handle named imports with tree-shaking automatically,
// provided the dependency ships ESM and is marked `sideEffects: false` in package.json.
// Profile before changing import styles — the real gains come from splitting and lazy loading.

// GOOD: Dynamic import for heavy, rarely-used features
const ChartLibrary = lazy(() => import('./ChartLibrary'));

// GOOD: Route-level code splitting wrapped in Suspense
const SettingsPage = lazy(() => import('./pages/Settings'));

function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <SettingsPage />
    </Suspense>
  );
}
```

#### Missing Caching (Backend)（缺少缓存）

```typescript
// Cache frequently-read, rarely-changed data
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
let cachedConfig: AppConfig | null = null;
let cacheExpiry = 0;

async function getAppConfig(): Promise<AppConfig> {
  if (cachedConfig && Date.now() < cacheExpiry) {
    return cachedConfig;
  }
  cachedConfig = await db.config.findFirst();
  cacheExpiry = Date.now() + CACHE_TTL;
  return cachedConfig;
}

// HTTP caching headers for static assets
app.use('/static', express.static('public', {
  maxAge: '1y',           // Cache for 1 year
  immutable: true,        // Never revalidate (use content hashing in filenames)
}));

// Cache-Control for API responses
res.set('Cache-Control', 'public, max-age=300'); // 5 minutes
```

## Performance Budget（性能预算）

设置预算并强制执行：

```
JavaScript bundle: < 200KB gzipped (initial load)
CSS: < 50KB gzipped
Images: < 200KB per image (above the fold)
Fonts: < 100KB total
API response time: < 200ms (p95)
Time to Interactive: < 3.5s on 4G
Lighthouse Performance score: ≥ 90
```

**在 CI 中强制执行：**
```bash
# Bundle size check
npx bundlesize --config bundlesize.config.json

# Lighthouse CI
npx lhci autorun
```

## See Also（另请参阅）

详细性能清单、优化命令和反模式参考见 `references/performance-checklist.md`。


## Common Rationalizations（常见合理化）

| 常见合理化 | 现实 |
|---|---|
| “我们之后再优化” | 性能债会累积。现在修复明显反模式，把微优化延后。 |
| “在我机器上很快” | 你的机器不是用户的机器。要在有代表性的硬件和网络上 profiling。 |
| “这个优化显而易见” | 如果没有测量，你就不知道。先 profiling。 |
| “用户不会注意到 100ms” | 研究表明 100ms 延迟会影响转化率。用户比你以为的更能感知。 |
| “框架会处理性能” | 框架能防住一些问题，但不能修复 N+1 查询或超大 bundle。 |

## Red Flags（危险信号）

- 没有 profiling 数据支撑的优化
- 数据获取中存在 N+1 查询模式
- 列表端点没有分页
- 图片没有尺寸、lazy loading 或响应式尺寸
- bundle size 增长但没有评审
- 生产环境没有性能监控
- 到处使用 `React.memo` 和 `useMemo`（过度使用和使用不足一样糟）

## Verification（验证）

任何性能相关变更之后：

- [ ] 存在 before/after 测量结果（具体数字）
- [ ] 已识别并处理具体瓶颈
- [ ] Core Web Vitals 位于 "Good" 阈值内
- [ ] bundle size 没有显著增加
- [ ] 新的数据获取代码中没有 N+1 查询
- [ ] 性能预算在 CI 中通过（如已配置）
- [ ] 既有测试仍然通过（优化没有破坏行为）
