# 无障碍检查清单

WCAG 2.1 AA 合规的快速参考。请配合 `frontend-ui-engineering` skill 使用。

## 目录

- [核心检查](#核心检查)
- [常见 HTML 模式](#常见-html-模式)
- [测试工具](#测试工具)
- [快速参考：ARIA Live Regions](#快速参考aria-live-regions)
- [常见反模式](#常见反模式)

## 核心检查

### 键盘导航
- [ ] 所有交互元素都可通过 Tab 键聚焦
- [ ] Focus 顺序遵循视觉/逻辑顺序
- [ ] Focus 可见（聚焦元素有 outline/ring）
- [ ] 自定义 widgets 支持键盘操作（Enter 激活，Escape 关闭）
- [ ] 没有 keyboard traps（用户始终可以通过 Tab 离开组件）
- [ ] 页面顶部有 skip-to-content link，并且（至少）在键盘 focus 时可见
- [ ] Modals 打开时 trap focus，关闭时恢复 focus

### 屏幕阅读器
- [ ] 所有图片都有 `alt` 文本（装饰性图片使用 `alt=""`）
- [ ] 所有表单输入都有关联标签（`<label>` 或 `aria-label`）
- [ ] 按钮和链接有描述性文本（不是“Click here”）
- [ ] 仅图标按钮有 `aria-label`
- [ ] 页面有一个 `<h1>`，并且 headings 不跳级
- [ ] 动态内容变化会被播报（`aria-live` regions）
- [ ] 表格有带 scope 的 `<th>` headers

### 视觉
- [ ] 文本对比度 ≥ 4.5:1（普通文本）或 ≥ 3:1（大文本，18px+）
- [ ] UI components 与背景的对比度 ≥ 3:1
- [ ] 颜色不是传达信息的唯一方式
- [ ] 文本可放大到 200%，且不会破坏布局
- [ ] 没有每秒闪烁超过 3 次的内容

### 表单
- [ ] 每个输入都有可见 label
- [ ] 必填字段有标识（不只依赖颜色）
- [ ] 错误消息具体，并与对应字段关联
- [ ] 错误状态通过颜色以外的方式可见（图标、文本、边框）
- [ ] 表单提交错误有汇总，并且可聚焦
- [ ] 已知字段使用 autocomplete（例如 `type="email" autocomplete="email"`）

### 内容
- [ ] 已声明语言（`<html lang="en">`）
- [ ] 页面有描述性 `<title>`
- [ ] 链接与周围文本可区分（不只依赖颜色）
- [ ] 移动端 touch targets ≥ 44x44px
- [ ] 空状态有意义（不是空白屏幕）

## 常见 HTML 模式

### Buttons vs. Links

```html
<!-- Use <button> for actions -->
<button onClick={handleDelete}>Delete Task</button>

<!-- Use <a> for navigation -->
<a href="/tasks/123">View Task</a>

<!-- NEVER use div/span as buttons -->
<div onClick={handleDelete}>Delete</div>  <!-- BAD -->
```

### Form Labels

```html
<!-- Explicit label association -->
<label htmlFor="email">Email address</label>
<input id="email" type="email" required />

<!-- Implicit wrapping -->
<label>
  Email address
  <input type="email" required />
</label>

<!-- Hidden label (visible label preferred) -->
<input type="search" aria-label="Search tasks" />
```

### ARIA Roles

```html
<!-- Navigation -->
<nav aria-label="Main navigation">...</nav>
<nav aria-label="Footer links">...</nav>

<!-- Status messages -->
<div role="status" aria-live="polite">Task saved</div>

<!-- Alert messages -->
<div role="alert">Error: Title is required</div>

<!-- Modal dialogs -->
<dialog aria-modal="true" aria-labelledby="dialog-title">
  <h2 id="dialog-title">Confirm Delete</h2>
  ...
</dialog>

<!-- Loading states -->
<div aria-busy="true" aria-label="Loading tasks">
  <Spinner />
</div>
```

### Accessible Lists

```html
<ul role="list" aria-label="Tasks">
  <li>
    <input type="checkbox" id="task-1" aria-label="Complete: Buy groceries" />
    <label htmlFor="task-1">Buy groceries</label>
  </li>
</ul>
```

## 测试工具

```bash
# Automated audit
npx axe-core          # Programmatic accessibility testing
npx pa11y             # CLI accessibility checker

# In browser
# Chrome DevTools → Lighthouse → Accessibility
# Chrome DevTools → Elements → Accessibility tree

# Screen reader testing
# macOS: VoiceOver (Cmd + F5)
# Windows: NVDA (free) or JAWS
# Linux: Orca
```

## 快速参考：ARIA Live Regions

| 值 | 行为 | 适用场景 |
|-------|----------|---------|
| `aria-live="polite"` | 在下一次停顿时播报 | 状态更新、保存确认 |
| `aria-live="assertive"` | 立即播报 | 错误、时间敏感提醒 |
| `role="status"` | 与 `polite` 相同 | 状态消息 |
| `role="alert"` | 与 `assertive` 相同 | 错误消息 |

## 常见反模式

| 反模式 | 问题 | 修复方式 |
|---|---|---|
| `div` as button | 不可聚焦，没有键盘支持 | 使用 `<button>` |
| 缺少 `alt` 文本 | 图片对屏幕阅读器不可见 | 添加描述性 `alt` |
| 仅用颜色表示状态 | 色盲用户不可见 | 添加图标、文本或图案 |
| 自动播放媒体 | 令人迷失方向，且无法停止 | 添加 controls，不要 autoplay |
| 无 ARIA 的自定义 dropdown | 无法通过键盘/屏幕阅读器使用 | 使用原生 `<select>` 或正确的 ARIA listbox |
| 移除 focus outlines | 用户看不到当前位置 | 设置 outlines 样式，不要移除 |
| 空链接/按钮 | 只播报“Link”，没有描述 | 添加文本或 `aria-label` |
| `tabindex > 0` | 破坏自然 Tab 顺序 | 仅使用 `tabindex="0"` 或 `-1` |
