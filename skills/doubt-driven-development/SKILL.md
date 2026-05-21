---
name: doubt-driven-development
description: 在非平凡决策成立前，用 fresh-context adversarial review 进行反证。Use when 正确性比速度重要、在不熟悉代码中工作、风险高（production、security-sensitive logic、irreversible operations），或 confident output 现在验证比以后调试更便宜。
---

# Doubt-Driven Development

## Overview（概览）

自信的答案不等于正确答案。长会话会累积上下文，悄悄把假设变成“事实”，而没人注意到。Doubt-driven development 是一种纪律：在任何非平凡输出成立前，具象化一个 fresh-context reviewer，让它偏向于**反证**，而不是批准。

这不是 `/review`。`/review` 是对已完成 artifact 的裁决。这是一种进行中的姿态：在纠偏仍然便宜时，对非平凡决策进行交叉质询。

## When to Use（何时使用）

当至少满足以下一项时，决策就是**非平凡**的：

- 引入或修改分支逻辑
- 跨越模块或服务边界
- 断言类型系统或编译器无法验证的属性（thread safety、idempotence、ordering、invariants）
- 正确性依赖未来读者看不到的上下文
- 影响面不可逆（production deploy、data migration、public API change）

在以下情况应用本 skill：

- 即将在不确定性下做架构决策
- 即将提交非平凡代码
- 即将声明一个非显而易见的事实（"this is safe"、"this scales"、"this matches the spec"）
- 在你没有完全理解的代码中工作

**何时不要使用：**

- 机械性操作（renaming、formatting、file moves）
- 遵循清晰、无歧义的用户指令
- 阅读或总结现有代码
- 正确性显而易见的一行变更
- 纯工具操作（运行测试、列文件）
- 用户明确要求速度优先于验证

如果你怀疑每一次敲键，就什么也发布不了。此 skill 只适用于上面定义的非平凡决策。

## Loading Constraints（加载约束）

此 skill 面向 **main-session orchestrator** 设计，因为第 3 步（DOUBT，见下文）需要 spawn 一个 fresh-context reviewer。

- **不要把此 skill 加到 persona 的 `skills:` frontmatter 中。** 遵循第 3 步的 persona 会再 spawn 另一个 persona，这是 `references/orchestration-patterns.md` 明确禁止的编排反模式（"personas do not invoke other personas"）。
- **如果你发现自己在 subagent context 中应用此 skill**（Claude Code 会阻止嵌套 subagent spawn）：首选路径是向用户说明 doubt-driven 不能嵌套运行，并让 main session 处理。仅在万不得已时，使用降级的自我质询 fallback：把 ARTIFACT + CONTRACT 改写成一个新的自我提示，与先前推理硬性隔离，然后走第 1-5 步。这**不是 fresh-context review**（你仍带着自己的上下文），因此要将结果标记为 degraded，并在能联系用户时优先升级。

## The Process（流程）

应用此 skill 时复制这个清单：

```
Doubt cycle:
- [ ] Step 1: CLAIM — wrote the claim + why-it-matters
- [ ] Step 2: EXTRACT — isolated artifact + contract, stripped reasoning
- [ ] Step 3: DOUBT — invoked fresh-context reviewer with adversarial prompt
- [ ] Step 4: RECONCILE — classified every finding against the artifact text
- [ ] Step 5: STOP — met stop condition (trivial findings, 3 cycles, or user override)
```

### Step 1: CLAIM — Surface what stands（暴露将要成立的内容）

用两三行说清这个决策：

```
CLAIM: "The new caching layer is thread-safe under the
        read-heavy workload described in the spec."
WHY THIS MATTERS: a race here corrupts user data and is
                  hard to detect in QA.
```

如果你无法如此简洁地写出 claim，那你拥有的只是感觉，不是决策。在审视它之前先暴露它。

### Step 2: EXTRACT — Smallest reviewable unit（最小可审查单元）

fresh-context reviewer 需要的是 **artifact** 和 **contract**，不是你的思考过程。

- 代码：diff 或函数，而不是整个文件
- 决策：3-5 句提案，加上它必须满足的约束
- 断言：claim 加上据称支撑它的证据（与第 1 步的 CLAIM block 保持区分，后者是 orchestrator 待审视的假设）

剥离你的推理。如果你把结论交出去，得到的会是对结论的确认。单元必须足够小，让 reviewer 能一次读完并装进脑子里；如果是 500 行 PR，先拆分。

### Step 3: DOUBT — Invoke the fresh-context reviewer（调用 fresh-context reviewer）

reviewer 的 prompt **必须是对抗性的**。框定方式决定答案。

```
Adversarial review. Find what is wrong with this artifact.
Assume the author is overconfident. Look for:
- Unstated assumptions
- Edge cases not handled
- Hidden coupling or shared state
- Ways the contract could be violated
- Existing conventions this might break
- Failure modes under unexpected input

Do NOT validate. Do NOT summarize. Find issues, or state
explicitly that you cannot find any after thorough examination.

ARTIFACT: <paste artifact>
CONTRACT: <paste contract>
```

**只传 ARTIFACT + CONTRACT。不要传 CLAIM。** 把你的结论交给 reviewer 会让它偏向赞同。reviewer 必须独立判断 artifact 是否满足 contract。

在 Claude Code 中，`agents/` 里的 role-based reviewers 默认以隔离上下文启动，可以用于这里；见 `agents/` 中的 roster 和各领域匹配。

**上面的 adversarial prompt 优先于 persona 默认响应形状。** 像 `code-reviewer` 这样的 persona 会生成包含优缺点的平衡裁决；doubt-driven 需要 issues-only 输出。将上面的 adversarial prompt 原样粘贴进调用，让它覆盖 persona 默认值。如果 persona 的响应形状不能干净覆盖，退回到使用带 adversarial prompt 的 generic subagent。

#### Cross-model escalation（跨模型升级）

单模型 reviewer 与原作者共享盲点；一个更冷、更不同架构的模型能抓住这些盲点。Doubt-driven 本来就是对非平凡决策的 opt-in，因此在这个范围内提供 cross-model 是此 skill 价值的一部分，不是可选摩擦。

**交互式会话：始终提供。不要静默跳过。**

**Step 1: Ask the user**

在第 3 步的单模型 review 之后、RECONCILE 之前，暂停并询问：

> *"Single-model review complete. Want a cross-model second opinion? Options: Gemini CLI, Codex CLI, manual external review (you paste it elsewhere), or skip."*

每个交互式 doubt cycle 中，这个问题都是强制的，即使 artifact 看起来风险较低。是否值得付出成本由用户决定，而不是 agent。agent 的职责是显式提供选择。

**Step 2: If the user picks a CLI — verify, then invoke**

1. 检查工具是否在 PATH 中（`which gemini`、`which codex`）。
2. 在传入完整 prompt 前测试它能工作（`gemini --version` 或等价命令）；陈旧或损坏的二进制可能通过 `which`，但真实输入会失败。
3. 向用户确认准确调用方式，包括所需 flags、auth 和 env vars（例如 API keys）。实现各不相同，永远不要假设。
4. 只传 ARTIFACT + CONTRACT + adversarial prompt。不要传会话上下文，不要传 CLAIM。
5. 注意 shell escaping。如果 artifact 包含引号、`$(...)` 或反引号，优先使用 stdin（`echo … | gemini`）或 heredoc，而不是 inline `-p "..."`。不确定时，运行前请用户确认调用。
6. 将输出带入第 4 步（RECONCILE）。

**永远不要把 artifact 插入 shell-quoted argument。** 代码、Markdown 和 review prompts 经常包含反引号、`$(...)` 和引号字符，它们可能截断 prompt 或执行嵌入 shell。将完整 prompt 写入文件并通过 stdin pipe。

示例形状（根据已安装工具验证 flags；不同实现和版本语法不同）：

```bash
# Write the adversarial prompt + ARTIFACT + CONTRACT to a temp file first.
# Then pipe via stdin so shell metacharacters in the artifact stay inert.

# Codex (read-only sandbox keeps the CLI from writing to your workspace):
codex exec --sandbox read-only -C <repo-path> - < /tmp/doubt-prompt.md

# Gemini ('--approval-mode plan' is read-only; '-p ""' triggers non-interactive
# mode and the prompt is read from stdin):
gemini --approval-mode plan -p "" < /tmp/doubt-prompt.md
```

read-only sandbox 是关键细节：doubt artifact 本身可能包含指令（有意或无意的 prompt injection），否则 cross-model CLI 可能会对你的 workspace 执行这些指令。

**Step 3: If the CLI is unavailable or fails**

明确说明失败。提供选项：手动运行、尝试不同工具，或跳过。不要静默退回单模型；用户应该知道 cross-model 没有发生。

**Step 4: If the user skips**

在输出中确认跳过（*"Proceeding with single-model findings only"*），然后继续 RECONCILE。跳过可以，静默跳过不可以。

**非交互上下文**（CI、`/loop`、autonomous-loop、scheduled runs）：

- Cross-model 会**跳过**，并且必须在输出中**声明跳过**：*"Cross-model skipped: non-interactive context."*
- **没有用户明确授权，永远不要调用外部 CLI**，这是关键安全属性。

Cross-model 会增加成本、延迟和工具脆弱性。agent 每个 cycle 都显式提供选择；用户决定这个 artifact 是否值得。

### Step 4: RECONCILE — Fold findings back（合并发现）

reviewer 的输出是数据，不是裁决。**你仍然是 orchestrator。** 在分类每个 finding 前，重新对照 artifact 文本阅读；橡皮图章式接受 reviewer 与忽略 reviewer 是同一种失败模式。

对每个 finding，按以下**优先顺序**分类（第一个匹配的类别生效）：

1. **Contract misread** — reviewer 标记问题的具体原因是你提供的 CONTRACT 不清楚或不完整。先修 contract，下一个 cycle 再重新分类。
2. **Valid + actionable** — 真实问题，需要修改 artifact。修改后重新循环。
3. **Valid trade-off** — 问题真实存在，但修复成本高于接受成本。明确记录 trade-off，让用户看见。
4. **Noise** — reviewer 因缺少上下文而标记了实际正确的内容。记录它，继续，并追问：如果把该上下文加入 contract，是否能避免这个误报？

fresh reviewer 可能因为缺少上下文而出错。不要因为它“fresh”就服从。

### Step 5: STOP — Bounded loop, not recursion（有界循环，而不是递归）

在以下情况停止：

- 下一轮只返回琐碎或已考虑过的 findings，**或**
- 已完成 3 个 cycles（升级给用户，不要独自磨第四轮），**或**
- 用户明确说 "ship it"

如果 3 个 cycles 后 reviewer 仍提出实质问题，artifact 可能还没准备好。把这个情况告诉用户；三个未解决 cycle 是关于 artifact 的信息，不是继续循环的理由。

如果因为 artifact 很大而“显然 3 个 cycles 不够”：说明 artifact 太大，回到第 2 步拆分。不要放宽上限。

## Common Rationalizations（常见合理化）

| 合理化 | 现实 |
|---|---|
| "I'm confident, skip the doubt step" | 在新问题上，自信与正确性的相关性很弱。越确定的时候，盲点越容易藏起来。 |
| "Spawning a reviewer is expensive" | 在生产中调试错误 commit 更贵。检查是有界的，bug 不是。 |
| "The reviewer will just nitpick" | 只有范围不清时才会这样。把 prompt 限定为“会让它在 contract 下失败的问题”。 |
| "I'll do doubt at the end with `/review`" | `/review` 是最终关口。Doubt-driven 在纠偏便宜时捕获错误方向。到 PR 阶段已经太晚。 |
| "If I doubt every step I'll never ship" | 此 skill 适用于非平凡决策，不是每个击键。重读“When NOT to Use”。 |
| "Two opinions are always better than one" | 当第二个意见上下文更少且产生噪音时，不是。要 reconcile，不要服从。 |
| "The reviewer disagreed so I was wrong" | reviewer 缺少你的上下文；分歧是信息，不是裁决。重读 artifact，分类，然后决定。 |
| "Cross-model is always better" | Cross-model 能捕获单模型与自己共享的盲点，但会增加成本和工具脆弱性。每个交互式 doubt cycle 都提供它，用户决定 artifact 是否值得。agent 的职责是展示选择，不是把它变成关卡。 |
| "User said yes once, so I can keep invoking the CLI" | 每次调用都需要单独授权。artifact、prompt 和 flags 会在调用之间变化；每次运行前都要向用户重新确认准确命令。 |

## Red Flags（危险信号）

- 为一行 rename 或格式化变更 spawn fresh-context reviewer
- 没有重读 artifact 文本就把 reviewer 输出当权威
- 超过 3 个 cycles 仍不升级给用户
- 用 "is this good?" 而不是 "find issues" 提示 reviewer
- 在高风险决策上因时间压力跳过 doubt
- 在 artifact 未变化时重复 spawn fresh-context（你会得到相同 findings；这是在拖延）
- **Doubt theater（可检查信号）**：连续 2 个或更多 cycles 中 reviewer 提出了实质 findings，但零 findings 被分类为 actionable。你是在验证，不是在怀疑。停止并升级。
- 提交后才 doubt，那是 `/review`，不是 doubt-driven development
- 没有和用户确认工具存在、已配置且接受准确语法，就 hardcode 外部 CLI 调用
- **在交互式 doubt cycle 中静默跳过 cross-model。** 即使不推荐它，也必须可见地提供。跳过可以，静默跳过不可以。
- 外部 CLI 报错或缺失时静默 fallback；要暴露失败并让用户决定
- 从 reviewer 输入中剥离 contract
- 把 CLAIM 传给 reviewer（会偏向赞同）

## Interaction with Other Skills（与其他 Skills 的交互）

- **`code-review-and-quality` / `/review`**：互补。`/review` 是事后 PR 裁决；doubt-driven 是进行中的逐决策审视。两者都使用。
- **`source-driven-development`**：SDD 根据官方文档验证*框架事实*。Doubt-driven 验证*你对 artifact 的推理*。SDD 检查 API 存在；doubt-driven 检查你是否在 contract 下正确使用它。
- **`test-driven-development`**：TDD 的 RED 步骤就是具体化的 doubt，失败测试是一次反证尝试。当 TDD 适用时，那个失败测试对行为声明而言就是 doubt step。
- **`debugging-and-error-recovery`**：当 reviewer 提出真实 failure mode 时，进入 debugging skill 定位并修复。
- **Repo orchestration rules**（`references/orchestration-patterns.md`）：此 skill 从 main session 编排。persona 调用另一个 persona 是 anti-pattern B；见上面的 Loading Constraints。

## Verification（验证）

应用 doubt-driven development 后：

- [ ] 每个非平凡决策（按上述定义）在成立前都被明确命名为 CLAIM
- [ ] 每个非平凡 artifact 至少有一次 fresh-context review（按 Interaction with Other Skills，TDD RED 步骤产生的失败测试可满足行为声明的这一项）
- [ ] reviewer 收到的是 ARTIFACT + CONTRACT，不是 CLAIM，不是你的推理
- [ ] reviewer 的 prompt 是对抗性的（"find issues"），不是验证性的（"is it good"）
- [ ] findings 已对照 artifact 文本分类（没有橡皮图章），优先级为：contract misread / actionable / trade-off / noise
- [ ] 已满足停止条件（琐碎 findings、3 个 cycles，或用户 override）
- [ ] 在交互模式中，已向用户**明确提供** cross-model 选项（无论 artifact 风险如何），并在输出中确认用户回应
- [ ] 在非交互模式中，已跳过 cross-model 并声明跳过
- [ ] 任何外部 CLI 调用前，都已检查 PATH、测试二进制可用、向用户确认语法，并获得明确运行授权
