---
name: code-review-and-quality
description: 执行多维度代码评审。Use before merging any change. Use when reviewing code written by yourself, another agent, or a human. 用于代码进入主分支前，从正确性、可读性、架构、安全与性能等维度评估质量。
---

# Code Review and Quality（代码评审与质量）

## Overview（概览）

使用质量门禁进行多维度代码评审。每个变更在合并前都必须经过评审，没有例外。评审覆盖五个轴：正确性、可读性、架构、安全性和性能。

**批准标准：** 当一个变更明确改善整体代码健康度时，就可以批准，即使它并不完美。完美代码不存在，目标是持续改进。不要因为它不是你自己的写法就阻塞变更。如果它改善了代码库并遵循项目约定，就批准它。

## When to Use（何时使用）

- 合并任何 PR 或变更之前
- 完成一个功能实现之后
- 需要评估另一个 agent、模型或人类产出的代码时
- 重构既有代码时
- 修复任何 bug 之后（同时评审修复和回归测试）

## The Five-Axis Review（五轴评审）

每次评审都从以下维度评估代码：

### 1. Correctness（正确性）

代码是否完成了它声称要完成的事？

- 是否匹配 spec 或任务要求？
- 是否处理了边界情况（null、空值、边界值）？
- 是否处理了错误路径，而不仅是 happy path？
- 是否通过所有测试？测试是否真的覆盖了正确内容？
- 是否存在 off-by-one 错误、竞态条件或状态不一致？

### 2. Readability & Simplicity（可读性与简洁性）

另一位工程师（或 agent）能否在没有作者解释的情况下理解这段代码？

- 命名是否具备描述性，并与项目约定一致？（没有缺少上下文的 `temp`、`data`、`result`）
- 控制流是否直接清晰（避免嵌套三元表达式、深层回调）？
- 代码组织是否符合逻辑（相关代码聚合，模块边界清晰）？
- 是否存在应该简化的“聪明”技巧？
- **这件事能否用更少代码完成？**（100 行能完成却写 1000 行是失败）
- **抽象是否配得上它带来的复杂度？**（不要在第三个用例出现前泛化）
- 注释是否能帮助说明非显然意图？（但不要注释显而易见的代码。）
- 是否存在死代码痕迹：no-op 变量（`_unused`）、向后兼容 shim，或 `// removed` 注释？

### 3. Architecture（架构）

这个变更是否适配系统设计？

- 是否遵循既有模式，或引入了新模式？如果是新模式，理由是否充分？
- 是否保持清晰的模块边界？
- 是否存在应该共享的重复代码？
- 依赖方向是否正确（没有循环依赖）？
- 抽象层级是否合适（不过度工程化，也不过度耦合）？

### 4. Security（安全性）

详细安全指导见 `security-and-hardening`。这个变更是否引入漏洞？

- 是否验证并清洗用户输入？
- secret 是否远离代码、日志和版本控制？
- 需要认证/授权的地方是否完成检查？
- SQL 查询是否参数化（没有字符串拼接）？
- 输出是否编码以防止 XSS？
- 依赖是否来自可信来源，且没有已知漏洞？
- 来自外部来源的数据（API、日志、用户内容、配置文件）是否被视为不可信？
- 外部数据流是否在系统边界被验证后，才用于逻辑或渲染？

### 5. Performance（性能）

详细 profiling 和优化指导见 `performance-optimization`。这个变更是否引入性能问题？

- 是否存在 N+1 查询模式？
- 是否存在无界循环或不受约束的数据获取？
- 是否存在本应异步的同步操作？
- UI 组件是否存在不必要的重新渲染？
- 列表端点是否缺少分页？
- 热路径中是否创建了大型对象？

## Change Sizing（变更规模）

小而聚焦的变更更容易评审、合并更快、部署更安全。目标规模如下：

```
~100 lines changed   → 好。可在一次评审中完成。
~300 lines changed   → 如果是单一逻辑变更，可以接受。
~1000 lines changed  → 太大。拆分它。
```

**什么算“一个变更”：** 一个自包含的单一修改，只解决一件事，包含相关测试，并在提交后保持系统可用。它应是功能的一部分，而不是整个功能。

**变更太大时的拆分策略：**

| 策略 | 做法 | 适用场景 |
|----------|-----|------|
| **Stack（堆叠）** | 先提交一个小变更，再基于它开始下一个 | 顺序依赖 |
| **By file group（按文件组）** | 按需要不同评审者的文件组拆分变更 | 横切关注点 |
| **Horizontal（水平拆分）** | 先创建共享代码/stub，再接入消费者 | 分层架构 |
| **Vertical（垂直拆分）** | 将功能拆成更小的全栈切片 | 功能开发 |

**什么时候大变更可以接受：** 完整删除文件，或自动化重构且评审者只需验证意图、不需要逐行检查。

**将重构与功能开发分离。** 同时重构既有代码并新增行为的变更，是两个变更，应该分开提交。小清理（变量重命名）可由评审者酌情允许合入同一变更。

## Change Descriptions（变更描述）

每个变更都需要一个能在版本控制历史中独立理解的描述。

**第一行：** 简短、祈使句、可独立理解。写 "Delete the FizzBuzz RPC"，不要写 "Deleting the FizzBuzz RPC."。它必须足够有信息量，让搜索历史的人无需阅读 diff 就能理解变更。

**正文：** 说明改了什么以及为什么。包含代码本身看不出来的上下文、决策和推理。相关时链接 bug 编号、benchmark 结果或设计文档。存在方案缺点时要明确承认。

**反模式：** "Fix bug," "Fix build," "Add patch," "Moving code from A to B," "Phase 1," "Add convenience functions."

## Review Process（评审流程）

### Step 1: Understand the Context（理解上下文）

看代码之前，先理解意图：

```
- 这个变更想完成什么？
- 它实现了哪个 spec 或任务？
- 预期行为变化是什么？
```

### Step 2: Review the Tests First（先评审测试）

测试会揭示意图和覆盖范围：

```
- 这个变更是否有测试？
- 测试的是行为，而不是实现细节吗？
- 是否覆盖边界情况？
- 测试名称是否具备描述性？
- 如果代码改坏了，这些测试能否捕获回归？
```

### Step 3: Review the Implementation（评审实现）

带着五个评审轴走读代码：

```
对每个变更文件：
1. Correctness: 这段代码是否完成测试期望它完成的事？
2. Readability: 我能否在没有帮助的情况下理解它？
3. Architecture: 它是否适配系统？
4. Security: 是否存在漏洞？
5. Performance: 是否存在瓶颈？
```

### Step 4: Categorize Findings（分类问题）

为每条评论标注严重程度，让作者知道哪些必须处理、哪些可选：

| 前缀 | 含义 | 作者动作 |
|--------|---------|---------------|
| *(no prefix)* | 必需变更 | 合并前必须处理 |
| **Critical:** | 阻塞合并 | 安全漏洞、数据丢失、功能损坏 |
| **Nit:** | 轻微、可选 | 作者可以忽略，通常是格式或风格偏好 |
| **Optional:** / **Consider:** | 建议 | 值得考虑，但不是必需 |
| **FYI** | 仅供参考 | 无需操作，是未来上下文 |

这能避免作者把所有反馈都当成强制要求，从而在可选建议上浪费时间。

### Step 5: Verify the Verification（验证其验证过程）

检查作者的验证说明：

```
- 跑了哪些测试？
- build 是否通过？
- 是否手动测试了这个变更？
- UI 变更是否有截图？
- 是否有 before/after 对比？
```

## Multi-Model Review Pattern（多模型评审模式）

用不同模型承担不同评审视角：

```
Model A writes the code
    │
    ▼
Model B reviews for correctness and architecture
    │
    ▼
Model A addresses the feedback
    │
    ▼
Human makes the final call
```

这能捕获单一模型可能漏掉的问题，因为不同模型有不同盲区。

**评审 agent 的示例 prompt：**
```
Review this code change for correctness, security, and adherence to
our project conventions. The spec says [X]. The change should [Y].
Flag any issues as Critical, Important, or Suggestion.
```

## Dead Code Hygiene（死代码卫生）

任何重构或实现变更之后，都要检查孤立代码：

1. 识别现在不可达或未使用的代码
2. 明确列出来
3. **删除前先询问：** “是否现在移除这些未使用元素：[list]？”

不要留下死代码，它会误导未来读者和 agent。但也不要静默删除你不确定的内容。有疑问就问。

```
DEAD CODE IDENTIFIED:
- formatLegacyDate() in src/utils/date.ts — replaced by formatDate()
- OldTaskCard component in src/components/ — replaced by TaskCard
- LEGACY_API_URL constant in src/config.ts — no remaining references
→ Safe to remove these?
```

## Review Speed（评审速度）

缓慢评审会阻塞整个团队。切换上下文去评审的成本，低于让别人等待的成本。

- **一个工作日内响应**，这是上限，不是目标
- **理想节奏：** 除非正在深度专注编码，否则收到评审请求后尽快响应。典型变更应在一天内完成多轮评审
- **优先快速给出单轮反馈**，而不是追求快速最终批准。及时反馈能减少挫败感，即使需要多轮
- **大变更：** 要求作者拆分，而不是评审一个巨大的 changeset

## Handling Disagreements（处理分歧）

解决评审争议时，按以下层级判断：

1. **技术事实和数据** 优先于观点和偏好
2. **风格指南** 是风格问题的最高权威
3. **软件设计** 必须基于工程原则评估，而不是个人偏好
4. **代码库一致性** 在不降低整体健康度时可以接受

**不要接受“我之后会清理”。** 经验表明，延期清理很少发生。除非是真正紧急情况，否则要求提交前完成清理。如果周边问题无法在本次变更中处理，要求创建 bug 并自我分配。

## Honesty in Review（评审中的诚实）

无论评审的是你自己、另一个 agent 还是人类写的代码：

- **不要橡皮图章式批准。** 没有评审证据的 "LGTM" 对任何人都没帮助。
- **不要弱化真实问题。** 明明是会进生产的 bug，却说 "This might be a minor concern"，这是不诚实的。
- **尽可能量化问题。** "This N+1 query will add ~50ms per item in the list" 比 "this could be slow" 更好。
- **对明显有问题的方案提出反对。** 迎合是评审中的失败模式。如果实现有问题，就直接说明并提出替代方案。
- **优雅接受 override。** 如果作者拥有完整上下文并不同意，尊重其判断。评论代码，不评论人，把个人化批评改写成聚焦代码本身。

## Dependency Discipline（依赖纪律）

代码评审也包括依赖评审：

**添加任何依赖之前：**
1. 既有技术栈是否已经能解决这个问题？（通常可以。）
2. 这个依赖有多大？（检查 bundle 影响。）
3. 是否仍在积极维护？（检查最近提交和 open issue。）
4. 是否有已知漏洞？（`npm audit`）
5. 许可证是什么？（必须与项目兼容。）

**规则：** 优先使用标准库和既有工具，而不是新增依赖。每个依赖都是负担。

## The Review Checklist（评审清单）

```markdown
## Review: [PR/Change title]

### Context
- [ ] I understand what this change does and why

### Correctness
- [ ] Change matches spec/task requirements
- [ ] Edge cases handled
- [ ] Error paths handled
- [ ] Tests cover the change adequately

### Readability
- [ ] Names are clear and consistent
- [ ] Logic is straightforward
- [ ] No unnecessary complexity

### Architecture
- [ ] Follows existing patterns
- [ ] No unnecessary coupling or dependencies
- [ ] Appropriate abstraction level

### Security
- [ ] No secrets in code
- [ ] Input validated at boundaries
- [ ] No injection vulnerabilities
- [ ] Auth checks in place
- [ ] External data sources treated as untrusted

### Performance
- [ ] No N+1 patterns
- [ ] No unbounded operations
- [ ] Pagination on list endpoints

### Verification
- [ ] Tests pass
- [ ] Build succeeds
- [ ] Manual verification done (if applicable)

### Verdict
- [ ] **Approve** — Ready to merge
- [ ] **Request changes** — Issues must be addressed
```
## See Also（另请参阅）

- 详细安全评审指导见 `references/security-checklist.md`
- 性能评审检查见 `references/performance-checklist.md`

## Common Rationalizations（常见合理化）

| 常见合理化 | 现实 |
|---|---|
| “它能工作，这就够了” | 能工作的代码如果不可读、不安全或架构错误，会制造持续累积的债务。 |
| “这是我写的，所以我知道它是对的” | 作者会看不见自己的假设。每个变更都受益于另一双眼睛。 |
| “我们之后会清理” | “之后”通常不会来。评审就是质量门禁，用好它。要求合并前清理，而不是合并后。 |
| “AI 生成的代码大概没问题” | AI 代码需要更多审查，而不是更少。即使错误，它也会显得自信且合理。 |
| “测试通过了，所以没问题” | 测试是必要但不充分的。它们不能捕获架构问题、安全问题或可读性问题。 |

## Red Flags（危险信号）

- PR 未经任何评审就合并
- 评审只检查测试是否通过，忽略其他维度
- 没有实际评审证据的 "LGTM"
- 安全敏感变更没有安全专项评审
- 大到“无法适当评审”的 PR（拆分它们）
- bug 修复 PR 没有回归测试
- 评审评论没有严重程度标签，导致必需项和可选项不清晰
- 接受“我之后会修”，它通常不会发生

## Verification（验证）

评审完成后：

- [ ] 所有 Critical 问题已解决
- [ ] 所有 Important 问题已解决，或已明确延期并说明理由
- [ ] 测试通过
- [ ] build 成功
- [ ] 验证说明已记录（改了什么、如何验证）
