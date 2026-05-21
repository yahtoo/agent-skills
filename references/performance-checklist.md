# 性能检查清单

Web 应用性能的快速参考检查清单。配合 `performance-optimization` skill 使用。

## 目录

- [Core Web Vitals 目标](#core-web-vitals-目标)
- [TTFB 诊断](#ttfb-诊断)
- [前端检查清单](#前端检查清单)
- [后端检查清单](#后端检查清单)
- [测量命令](#测量命令)
- [常见反模式](#常见反模式)

## Core Web Vitals 目标

| Metric | Good | Needs Work | Poor |
|--------|------|------------|------|
| LCP (Largest Contentful Paint) | ≤ 2.5s | ≤ 4.0s | > 4.0s |
| INP (Interaction to Next Paint) | ≤ 200ms | ≤ 500ms | > 500ms |
| CLS (Cumulative Layout Shift) | ≤ 0.1 | ≤ 0.25 | > 0.25 |

## TTFB 诊断

当 TTFB 较慢（> 800ms）时，在 DevTools Network waterfall 中检查每个组成部分：

- [ ] **DNS resolution** 慢 → 为已知 origins 添加 `<link rel="dns-prefetch">` 或 `<link rel="preconnect">`
- [ ] **TCP/TLS handshake** 慢 → 启用 HTTP/2，考虑 edge deployment，验证 keep-alive
- [ ] **Server processing** 慢 → profile 后端，检查慢查询，添加缓存

## 前端检查清单

### Images
- [ ] Images 使用现代格式（WebP、AVIF）
- [ ] Images 具备响应式尺寸（`srcset` 和 `sizes`）
- [ ] Images 和 `<source>` 元素显式设置 `width` 和 `height`（防止 art direction 场景中的 CLS）
- [ ] Below-the-fold images 使用 `loading="lazy"` 和 `decoding="async"`
- [ ] Hero/LCP images 使用 `fetchpriority="high"`，且不使用 lazy loading

### JavaScript
- [ ] Bundle size 低于 200KB gzip 后大小（初始加载）
- [ ] 对 routes 和重型 features 使用动态 `import()` 做 code splitting
- [ ] 启用 tree shaking（验证依赖提供 ESM，并标记 `sideEffects: false`）
- [ ] `<head>` 中没有阻塞 JavaScript（使用 `defer` 或 `async`）
- [ ] Heavy computation 卸载到 Web Workers（如果适用）
- [ ] 对以相同 props 重新渲染的昂贵组件使用 `React.memo()`
- [ ] 只在 profiling 显示有收益时使用 `useMemo()` / `useCallback()`
- [ ] 将 long tasks（> 50ms）拆分，以保持 main thread 可用，这是改善 INP 的主要手段
- [ ] 在长时间运行的循环中使用 `yieldToMain` 模式，让 input events 可以在分块之间运行
- [ ] 在可用时使用现代 scheduling APIs：`scheduler.yield()`（首选）、带 priorities 的 `scheduler.postTask()`、按需 yield 的 `isInputPending()`
- [ ] 对可延后、非紧急工作使用 `requestIdleCallback`（analytics flush、prefetch、warmup）
- [ ] 将非关键工作从 event handlers 中延后（例如 analytics、logging），避免延迟 interaction 的响应
- [ ] 第三方 scripts 使用 `async` / `defer` 加载，审计体积，并在较重时用 facade 承接（chat widgets、embeds）

### CSS
- [ ] Critical CSS 被 inline 或 preload
- [ ] 非关键样式没有 render-blocking CSS
- [ ] 生产环境没有 CSS-in-JS runtime cost（使用 extraction）

### Fonts
- [ ] 限制为 2–3 个 font families，每个 2–3 种 weights（每增加一个 weight 都是额外请求）
- [ ] 仅使用 WOFF2 格式（最小且通用支持，跳过 WOFF/TTF/EOT）
- [ ] 尽可能 self-hosted（第三方 font CDNs 会增加 DNS + TCP + TLS round-trips）
- [ ] 预加载 LCP-critical fonts：`<link rel="preload" as="font" type="font/woff2" crossorigin>`
- [ ] 使用 `font-display: swap`（或对非关键字体使用 `optional`），避免 FOIT 阻塞渲染
- [ ] 通过 `unicode-range` 做 subset，只发送每个页面需要的 glyphs
- [ ] 需要多个 weights/styles 时考虑 variable fonts（一个文件替代多个文件）
- [ ] 用 `size-adjust`、`ascent-override`、`descent-override` 调整 fallback font metrics，减少字体替换时的 CLS
- [ ] 在使用任何 custom font 前先考虑 system font stack

### Network
- [ ] Static assets 使用长 `max-age` + content hashing 缓存
- [ ] 在适当位置缓存 API responses（`Cache-Control`）
- [ ] 启用 HTTP/2 或 HTTP/3
- [ ] 对已知 origins 预连接 resources（`<link rel="preconnect">`）
- [ ] 在关键非图片资源上使用 `fetchpriority`（例如关键 `<link rel="preload">`、above-the-fold `<script>`），不只用于 `<img>`
- [ ] 没有不必要的 redirects

### Rendering
- [ ] 没有 layout thrashing（强制同步 layouts）
- [ ] Animations 使用 `transform` 和 `opacity`（GPU 加速）
- [ ] Long lists 使用 virtualization（例如 `react-window`）
- [ ] 没有不必要的整页重新渲染
- [ ] Off-screen sections 使用 `content-visibility: auto` 和 `contain-intrinsic-size`，跳过不可见区域的 layout/paint
- [ ] 没有 `unload` event handlers，HTML responses 上没有 `Cache-Control: no-store`，以保留 back/forward cache（bfcache）资格

## 后端检查清单

### Database
- [ ] 没有 N+1 query patterns（使用 eager loading / joins）
- [ ] Queries 有合适的 indexes
- [ ] List endpoints 分页（绝不 `SELECT * FROM table`）
- [ ] 已配置 connection pooling
- [ ] 已启用 slow query logging

### API
- [ ] Response times < 200ms（p95）
- [ ] Request handlers 中没有同步 heavy computation
- [ ] 使用 bulk operations，而不是循环执行单个 calls
- [ ] Response compression（gzip/brotli）
- [ ] 合适的 caching（in-memory、Redis、CDN）

### Infrastructure
- [ ] Static assets 使用 CDN
- [ ] Server 靠近 users（或使用 edge deployment）
- [ ] 已配置 horizontal scaling（如需要）
- [ ] 为 load balancer 提供 health check endpoint

## 测量命令

### INP field data 和 DevTools 工作流

1. **Field data first** — 优化前，先检查 [CrUX Vis](https://developer.chrome.com/docs/crux/vis) 或你的 RUM tool 中的真实用户 INP
2. **Identify slow interactions** — 打开 DevTools → Performance panel → 交互时录制；查找由 clicks/keystrokes 触发的 long tasks
3. **Test on mid-range Android** — INP 问题通常只会在较慢硬件上暴露；使用真机或 DevTools CPU throttling（4×–6× slowdown）

```bash
# Lighthouse CLI
npx lighthouse https://localhost:3000 --output json --output-path ./report.json

# Bundle analysis
npx webpack-bundle-analyzer stats.json
# or for Vite:
npx vite-bundle-visualizer

# Check bundle size
npx bundlesize

# Web Vitals in code
import { onLCP, onINP, onCLS } from 'web-vitals';
onLCP(console.log);
onINP(console.log);
onCLS(console.log);

# INP with interaction-level detail (attribution build)
import { onINP } from 'web-vitals/attribution';
onINP(({ value, attribution }) => {
  const { interactionTarget, inputDelay, processingDuration, presentationDelay } = attribution;
  console.log({ value, interactionTarget, inputDelay, processingDuration, presentationDelay });
});
```

## 常见反模式

| 反模式 | 影响 | 修复 |
|---|---|---|
| N+1 queries | DB load 线性增长 | 使用 joins、includes 或 batch loading |
| Unbounded queries | 内存耗尽、超时 | 始终分页，添加 LIMIT |
| Missing indexes | 数据增长后读取变慢 | 为过滤/排序字段添加 indexes |
| Layout thrashing | Jank、掉帧 | 批量 DOM reads，然后批量 writes |
| Unoptimized images | LCP 变慢，浪费带宽 | 使用 WebP、responsive sizes、lazy load |
| Large bundles | Time to Interactive 变慢 | Code split、tree shake、审计 deps |
| Blocking main thread | INP 差，UI 无响应 | 用 `scheduler.yield()` / `yieldToMain` 分块 long tasks，卸载到 Web Workers |
| Memory leaks | 内存增长，最终崩溃 | 清理 listeners、intervals、refs |
