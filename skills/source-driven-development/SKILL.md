---
name: source-driven-development
description: 用官方文档支撑每个实现决策。Use when 需要权威、可引用、避免过时模式的代码；Use when 使用任何框架或库且正确性很重要。
---

# Source-Driven Development

## Overview（概览）

每个框架相关的代码决策都必须由官方文档支撑。不要凭记忆实现，要验证、引用，并让用户看到来源。训练数据会过时，API 会废弃，最佳实践会演进。这个 skill 确保用户得到可信代码，因为每个模式都能追溯到可核查的权威来源。

## When to Use（何时使用）

- 用户希望代码遵循某个框架的当前最佳实践
- 构建会在项目中反复复制的样板代码、starter code 或模式
- 用户明确要求有文档依据、已验证或“正确”的实现
- 实现框架推荐做法很重要的功能（表单、路由、数据获取、状态管理、认证）
- 审查或改进使用框架特定模式的代码
- 任何你准备凭记忆编写框架特定代码的时候

**何时不要使用：**

- 正确性不依赖具体版本（重命名变量、修正拼写、移动文件）
- 跨版本行为一致的纯逻辑（循环、条件、数据结构）
- 用户明确要求速度优先于验证（“just do it quickly”）

## The Process（流程）

```
DETECT ──→ FETCH ──→ IMPLEMENT ──→ CITE
  │          │           │            │
  ▼          ▼           ▼            ▼
 What       Get the    Follow the   Show your
 stack?     relevant   documented   sources
            docs       patterns
```

### Step 1: Detect Stack and Versions（识别技术栈和版本）

读取项目的依赖文件，确定精确版本：

```
package.json    → Node/React/Vue/Angular/Svelte
composer.json   → PHP/Symfony/Laravel
requirements.txt / pyproject.toml → Python/Django/Flask
go.mod          → Go
Cargo.toml      → Rust
Gemfile         → Ruby/Rails
```

明确说明你发现的内容：

```
STACK DETECTED:
- React 19.1.0 (from package.json)
- Vite 6.2.0
- Tailwind CSS 4.0.3
→ Fetching official docs for the relevant patterns.
```

如果版本缺失或含糊，**询问用户**。不要猜测，版本决定了哪些模式才是正确的。

### Step 2: Fetch Official Documentation（获取官方文档）

获取你要实现的功能对应的具体文档页面。不是首页，不是整站文档，而是相关页面。

**来源权威性层级（按顺序）：**

| 优先级 | 来源 | 示例 |
|----------|--------|---------|
| 1 | 官方文档 | react.dev, docs.djangoproject.com, symfony.com/doc |
| 2 | 官方博客 / changelog | react.dev/blog, nextjs.org/blog |
| 3 | Web 标准参考 | MDN, web.dev, html.spec.whatwg.org |
| 4 | 浏览器 / 运行时兼容性 | caniuse.com, node.green |

**不具备权威性，不要作为主要来源引用：**

- Stack Overflow answers
- 博客文章或教程（即使很流行）
- AI 生成的文档或摘要
- 你自己的训练数据（这正是需要验证的原因）

**精确获取需要的内容：**

```
BAD:  Fetch the React homepage
GOOD: Fetch react.dev/reference/react/useActionState

BAD:  Search "django authentication best practices"
GOOD: Fetch docs.djangoproject.com/en/6.0/topics/auth/
```

获取后，提取关键模式，并记录任何废弃警告或迁移指引。

当官方来源互相冲突时（例如迁移指南与 API reference 矛盾），向用户说明分歧，并针对检测到的版本验证哪个模式实际可用。

### Step 3: Implement Following Documented Patterns（按文档模式实现）

编写与文档示例一致的代码：

- 使用文档中的 API 签名，不要凭记忆
- 如果文档展示了新做法，使用新做法
- 如果文档废弃了某个模式，不要使用废弃版本
- 如果文档没有覆盖某个内容，将其标为未验证

**当文档与现有项目代码冲突时：**

```
CONFLICT DETECTED:
The existing codebase uses useState for form loading state,
but React 19 docs recommend useActionState for this pattern.
(Source: react.dev/reference/react/useActionState)

Options:
A) Use the modern pattern (useActionState) — consistent with current docs
B) Match existing code (useState) — consistent with codebase
→ Which approach do you prefer?
```

暴露冲突，不要静默选择。

### Step 4: Cite Your Sources（引用来源）

每个框架特定模式都要有引用。用户必须能验证每个决策。

**代码注释中：**

```typescript
// React 19 form handling with useActionState
// Source: https://react.dev/reference/react/useActionState#usage
const [state, formAction, isPending] = useActionState(submitOrder, initialState);
```

**对话中：**

```
I'm using useActionState instead of manual useState for the
form submission state. React 19 replaced the manual
isPending/setIsPending pattern with this hook.

Source: https://react.dev/blog/2024/12/05/react-19#actions
"useTransition now supports async functions [...] to handle
pending states automatically"
```

**引用规则：**

- 使用完整 URL，不用短链接
- 尽可能使用带锚点的深链接（例如 `/useActionState#usage` 优于 `/useActionState`），锚点比顶层页面更能承受文档重组
- 引用能支撑非显而易见决策的相关段落
- 推荐平台特性时包含浏览器 / 运行时支持数据
- 如果找不到某个模式的文档，明确说明：

```
UNVERIFIED: I could not find official documentation for this
pattern. This is based on training data and may be outdated.
Verify before using in production.
```

诚实说明无法验证的内容，比虚假的确定性更有价值。

## Common Rationalizations（常见合理化）

| 合理化 | 现实 |
|---|---|
| "I'm confident about this API" | 信心不是证据。训练数据包含看起来正确、但在当前版本会失败的过时模式。去验证。 |
| "Fetching docs wastes tokens" | 幻觉出一个 API 更浪费。用户调试一小时后才发现函数签名变了。一次获取文档能避免数小时返工。 |
| "The docs won't have what I need" | 如果文档没有覆盖，这本身就是有价值的信息，说明该模式可能不是官方推荐。 |
| "I'll just mention it might be outdated" | 免责声明没有帮助。要么验证并引用，要么清楚标为未验证。含糊其辞是最差选项。 |
| "This is a simple task, no need to check" | 简单任务中的错误模式会变成模板。用户可能先把你的废弃表单处理器复制到十个组件，之后才发现现代做法。 |

## Red Flags（危险信号）

- 没有检查对应版本文档就编写框架特定代码
- 对 API 使用 "I believe" 或 "I think"，而不是引用来源
- 不知道某个模式适用于哪个版本就实现它
- 引用 Stack Overflow 或博客文章，而不是官方文档
- 因为训练数据中出现过就使用废弃 API
- 实现前没有读取 `package.json` / 依赖文件
- 交付框架特定决策时没有来源引用
- 只需要一个相关页面，却获取整个文档站点

## Verification（验证）

使用 source-driven development 完成实现后：

- [ ] 已从依赖文件识别框架和库版本
- [ ] 已为框架特定模式获取官方文档
- [ ] 所有来源都是官方文档，而不是博客文章或训练数据
- [ ] 代码遵循当前版本文档展示的模式
- [ ] 非平凡决策包含带完整 URL 的来源引用
- [ ] 没有使用废弃 API（已对照迁移指南检查）
- [ ] 已向用户说明文档与现有代码之间的冲突
- [ ] 任何无法验证的内容都已明确标为未验证
