---
name: frontend-ui-engineering
description: 构建生产质量 UI。Use when building or modifying user-facing interfaces. 用于创建组件、实现布局、管理状态，或输出需要达到生产级观感而不是 AI-generated 风格时。
---

# Frontend UI Engineering（前端 UI 工程）

## Overview（概览）

构建可访问、高性能、视觉精细的生产质量用户界面。目标是让 UI 看起来像由顶级公司的、有设计意识的工程师构建，而不是 AI 生成。这意味着真正遵循设计系统、具备正确可访问性、交互模式经过思考，并且没有通用的“AI aesthetic”。

## When to Use（何时使用）

- 构建新的 UI 组件或页面
- 修改既有面向用户的界面
- 实现响应式布局
- 添加交互或状态管理
- 修复视觉或 UX 问题

## Component Architecture（组件架构）

### File Structure（文件结构）

将组件相关的所有内容放在同一处：

```
src/components/
  TaskList/
    TaskList.tsx          # Component implementation
    TaskList.test.tsx     # Tests
    TaskList.stories.tsx  # Storybook stories (if using)
    use-task-list.ts      # Custom hook (if complex state)
    types.ts              # Component-specific types (if needed)
```

### Component Patterns（组件模式）

**优先 composition，而不是 configuration：**

```tsx
// Good: Composable
<Card>
  <CardHeader>
    <CardTitle>Tasks</CardTitle>
  </CardHeader>
  <CardBody>
    <TaskList tasks={tasks} />
  </CardBody>
</Card>

// Avoid: Over-configured
<Card
  title="Tasks"
  headerVariant="large"
  bodyPadding="md"
  content={<TaskList tasks={tasks} />}
/>
```

**保持组件聚焦：**

```tsx
// Good: Does one thing
export function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
  return (
    <li className="flex items-center gap-3 p-3">
      <Checkbox checked={task.done} onChange={() => onToggle(task.id)} />
      <span className={task.done ? 'line-through text-muted' : ''}>{task.title}</span>
      <Button variant="ghost" size="sm" onClick={() => onDelete(task.id)}>
        <TrashIcon />
      </Button>
    </li>
  );
}
```

**将数据获取与展示分离：**

```tsx
// Container: handles data
export function TaskListContainer() {
  const { tasks, isLoading, error } = useTasks();

  if (isLoading) return <TaskListSkeleton />;
  if (error) return <ErrorState message="Failed to load tasks" retry={refetch} />;
  if (tasks.length === 0) return <EmptyState message="No tasks yet" />;

  return <TaskList tasks={tasks} />;
}

// Presentation: handles rendering
export function TaskList({ tasks }: { tasks: Task[] }) {
  return (
    <ul role="list" className="divide-y">
      {tasks.map(task => <TaskItem key={task.id} task={task} />)}
    </ul>
  );
}
```

## State Management（状态管理）

**选择能工作的最简单方案：**

```
Local state (useState)           → Component-specific UI state
Lifted state                     → Shared between 2-3 sibling components
Context                          → Theme, auth, locale (read-heavy, write-rare)
URL state (searchParams)         → Filters, pagination, shareable UI state
Server state (React Query, SWR)  → Remote data with caching
Global store (Zustand, Redux)    → Complex client state shared app-wide
```

**避免超过 3 层的 prop drilling。** 如果 props 正穿过不使用它们的组件，引入 context 或重构组件树。

## Design System Adherence（遵循设计系统）

### Avoid the AI Aesthetic（避免 AI aesthetic）

AI 生成的 UI 有可识别模式。全部避免：

| AI 默认倾向 | 问题原因 | 生产质量做法 |
|---|---|---|
| 全部紫色/靛蓝色 | 模型默认选择视觉上“安全”的调色板，导致每个 app 看起来都一样 | 使用项目真实色板 |
| 过量渐变 | 渐变增加视觉噪音，并与多数设计系统冲突 | 使用与设计系统匹配的平面色或微妙渐变 |
| 所有东西都圆角（rounded-2xl） | 最大圆角传达“友好”，但忽略真实设计中圆角层级 | 使用设计系统中的一致 border-radius |
| 通用 hero sections | 模板化布局，与真实内容或用户需求无关 | 内容优先的布局 |
| Lorem ipsum 风格文案 | 占位文本会隐藏真实内容暴露的布局问题（长度、换行、溢出） | 使用真实感占位内容 |
| 到处都是超大 padding | 等量的大 padding 会破坏视觉层级并浪费屏幕空间 | 使用一致的 spacing scale |
| stock card grids | 统一网格是布局捷径，忽视信息优先级和扫描模式 | 目的驱动的布局 |
| 大量阴影 | 层叠阴影制造会与内容竞争的深度，并拖慢低端设备渲染 | 除非设计系统指定，否则使用微妙阴影或不用阴影 |

### Spacing and Layout（间距与布局）

使用一致 spacing scale。不要发明数值：

```css
/* Use the scale: 0.25rem increments (or whatever the project uses) */
/* Good */  padding: 1rem;      /* 16px */
/* Good */  gap: 0.75rem;       /* 12px */
/* Bad */   padding: 13px;      /* Not on any scale */
/* Bad */   margin-top: 2.3rem; /* Not on any scale */
```

### Typography（排版）

尊重文字层级：

```
h1 → Page title (one per page)
h2 → Section title
h3 → Subsection title
body → Default text
small → Secondary/helper text
```

不要跳过 heading levels。不要把 heading 样式用于非标题内容。

### Color（颜色）

- 使用语义化颜色 token：`text-primary`、`bg-surface`、`border-default`，不要直接写 raw hex values
- 确保足够对比度（普通文本 4.5:1，大文本 3:1）
- 不要只依赖颜色传达信息（同时使用图标、文本或图案）

## Accessibility (WCAG 2.1 AA)（可访问性）

每个组件都必须满足这些标准：

### Keyboard Navigation（键盘导航）

```tsx
// Every interactive element must be keyboard accessible
<button onClick={handleClick}>Click me</button>        // ✓ Focusable by default
<div onClick={handleClick}>Click me</div>               // ✗ Not focusable
<div role="button" tabIndex={0} onClick={handleClick}    // ✓ But prefer <button>
     onKeyDown={e => {
       if (e.key === 'Enter') handleClick();
       if (e.key === ' ') e.preventDefault();
     }}
     onKeyUp={e => {
       if (e.key === ' ') handleClick();
     }}>
  Click me
</div>
```

### ARIA Labels

```tsx
// Label interactive elements that lack visible text
<button aria-label="Close dialog"><XIcon /></button>

// Label form inputs
<label htmlFor="email">Email</label>
<input id="email" type="email" />

// Or use aria-label when no visible label exists
<input aria-label="Search tasks" type="search" />
```

### Focus Management（焦点管理）

```tsx
// Move focus when content changes
function Dialog({ isOpen, onClose }: DialogProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) closeRef.current?.focus();
  }, [isOpen]);

  // Trap focus inside dialog when open
  return (
    <dialog open={isOpen}>
      <button ref={closeRef} onClick={onClose}>Close</button>
      {/* dialog content */}
    </dialog>
  );
}
```

### Meaningful Empty and Error States（有意义的空状态与错误状态）

```tsx
// Don't show blank screens
function TaskList({ tasks }: { tasks: Task[] }) {
  if (tasks.length === 0) {
    return (
      <div role="status" className="text-center py-12">
        <TasksEmptyIcon className="mx-auto h-12 w-12 text-muted" />
        <h3 className="mt-2 text-sm font-medium">No tasks</h3>
        <p className="mt-1 text-sm text-muted">Get started by creating a new task.</p>
        <Button className="mt-4" onClick={onCreateTask}>Create Task</Button>
      </div>
    );
  }

  return <ul role="list">...</ul>;
}
```

## Responsive Design（响应式设计）

先为移动端设计，再扩展：

```tsx
// Tailwind: mobile-first responsive
<div className="
  grid grid-cols-1      /* Mobile: single column */
  sm:grid-cols-2        /* Small: 2 columns */
  lg:grid-cols-3        /* Large: 3 columns */
  gap-4
">
```

在这些断点测试：320px、768px、1024px、1440px。

## Loading and Transitions（加载与过渡）

```tsx
// Skeleton loading (not spinners for content)
function TaskListSkeleton() {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading tasks">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-12 bg-muted animate-pulse rounded" />
      ))}
    </div>
  );
}

// Optimistic updates for perceived speed
function useToggleTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleTask,
    onMutate: async (taskId) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      const previous = queryClient.getQueryData(['tasks']);

      queryClient.setQueryData(['tasks'], (old: Task[]) =>
        old.map(t => t.id === taskId ? { ...t, done: !t.done } : t)
      );

      return { previous };
    },
    onError: (_err, _taskId, context) => {
      queryClient.setQueryData(['tasks'], context?.previous);
    },
  });
}
```

## See Also（另请参阅）

详细可访问性要求和测试工具见 `references/accessibility-checklist.md`。

## Common Rationalizations（常见合理化）

| 常见合理化 | 现实 |
|---|---|
| “可访问性只是锦上添花” | 在许多司法辖区，这是法律要求，也是工程质量标准。 |
| “之后再做响应式” | 事后补响应式设计比从一开始构建难 3 倍。 |
| “设计还没定稿，所以先跳过样式” | 使用设计系统默认值。无样式 UI 会给评审者留下破损的第一印象。 |
| “这只是原型” | 原型会变成生产代码。把基础打好。 |
| “AI aesthetic 暂时也行” | 它会传达低质量信号。从一开始就使用项目真实设计系统。 |

## Red Flags（危险信号）

- 组件超过 200 行（拆分它）
- inline styles 或任意像素值
- 缺少错误状态、加载状态或空状态
- 没有键盘导航测试
- 仅用颜色表示状态（只有红/绿，没有文本或图标）
- 通用 “AI look”（紫色渐变、超大卡片、stock layouts）

## Verification（验证）

构建 UI 后：

- [ ] 组件渲染时没有 console errors
- [ ] 所有交互元素都可通过键盘访问（用 Tab 遍历页面）
- [ ] screen reader 能传达页面内容和结构
- [ ] 响应式：在 320px、768px、1024px、1440px 下可用
- [ ] 加载、错误和空状态都已处理
- [ ] 遵循项目设计系统（spacing、colors、typography）
- [ ] dev tools 或 axe-core 中没有可访问性 warning
