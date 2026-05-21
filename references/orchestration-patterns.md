# Orchestration Patterns（编排模式）

本参考目录列出本仓库认可的 agent 编排模式，以及应避免的反模式。在新增一个协调多个 personas 的 slash command，或引入一个“包装”现有 personas 的新 persona 之前，请先阅读本文。

治理规则是：**用户、main agent、slash command 或 Codex command skill 是编排者。Personas 不调用其他 personas。** Skills 是 persona 工作流中的强制步骤。

---

## Endorsed patterns（认可模式）

### 1. Direct invocation（直接调用，无编排）

单个 persona、单一视角、单个产物。这是默认选项，也是成本最低的选项。

```
user → code-reviewer → report → user
```

**Use when:** 工作是对一个产物的一种视角，并且可以用一句话描述清楚。

**Examples:**
- "Review this PR" → `code-reviewer`
- "Find security issues in `auth.ts`" → `security-auditor`
- "What tests are missing for the checkout flow?" → `test-engineer`

**Cost:** 一次往返。这是评估任何编排模式时都应对照的基线。

---

### 2. Single-persona slash command（单 persona slash command）

一个 slash command 用项目 skills 包装一个 persona。这样用户不必每次都重新解释工作流。

```
/review → code-reviewer (with code-review-and-quality skill) → report
```

**Use when:** 同一个单 persona 调用会以相同设置反复发生。

**Examples in this repo:** `/review`, `/test`, `/code-simplify`.

**Cost:** 与直接调用相同。slash command 只是一个保存下来的 prompt。

**Anti-signal:** 如果 slash command 的主体主要是在“决定调用哪个 persona”，就删除它，让用户直接调用对应 persona。

---

### 3. Parallel fan-out with merge（并行扇出并合并）

多个 personas 并发处理同一输入，各自产出独立报告。合并步骤（在 main agent 的上下文中）把它们综合成一个决策。

```
                    ┌─→ code-reviewer    ─┐
/ship → fan out  ───┼─→ security-auditor ─┤→ merge → go/no-go + rollback
                    └─→ test-engineer    ─┘
```

**Use when:**
- 子任务真正独立（没有共享可变状态，也没有顺序依赖）
- 每个 sub-agent 都能从自己的 context window 中获益
- 合并步骤足够小，可以留在 main context 中完成
- wall-clock latency 很重要

**Examples in this repo:** `/ship`.

**Cost:** N 个并行 sub-agent contexts + 一个合并回合。成本高于直接调用，但 wall-clock 更快，报告质量也更好，因为每个 sub-agent 都能专注于自己的单一视角。

**Validation checklist before adopting this pattern:**
- [ ] 我能否同时运行所有 sub-agents，且不会产生顺序问题？
- [ ] 每个 persona 是否产出不同*类型*的发现，而不是从不同角度重复同一种发现？
- [ ] 合并步骤是否能放进 main agent 剩余的 context 中？
- [ ] 用户等待时间是否长到足以让并行带来的收益明显？

如果任一答案是“否”，回退到直接调用或单 persona command。

---

### 4. Sequential main-agent handoff with artifacts（主 agent 驱动的顺序交接）

main agent 或 command skill 按生命周期顺序调用多个 personas/skills，每一步消费上一阶段的明确输出。这里仍然没有 orchestrator persona；编排发生在 main context 中。

```
feature → requirements-analyst → software-architect → plan
        → implementation-engineer → review gates → release-manager
```

**Use when:**
- 工作存在真实顺序依赖
- 每个阶段有清晰交接物（spec、architecture brief、plan、implementation report）
- 需要多角色视角，但不需要 personas 彼此对话
- Codex 这类环境通过 `AGENTS.md` 和 `.agents/skills/source-command-*` 触发工作流

**Examples in this repo:** `multi-agent-orchestration`, `source-command-feature`, `source-command-bugfix`.

**Cost:** 每个角色可能占用一次额外 context，但比 router persona 更低，因为 main agent 不把路由职责外包给另一个 persona。

**Rules:**
- 使用 **single writer, many reviewers**：实现阶段只允许 `implementation-engineer` 写代码
- requirements、architecture、test、security、review、release roles 默认只读并输出结构化报告
- 如果任一阶段发现 blocker，回到最小必要阶段，而不是让 reviewer 直接修

---

### 5. Sequential pipeline as user-driven slash commands（用户驱动的顺序 slash command 流水线）

用户按定义好的顺序运行 slash commands，并在步骤之间携带上下文（或 commit history）。这里没有 orchestrator agent，用户就是 orchestrator。

```
user runs:  /spec  →  /plan  →  /build  →  /test  →  /review  →  /ship
```

**Use when:** 工作流存在依赖关系（每一步都需要上一步的输出），并且步骤之间的人类判断有价值。

**Examples in this repo:** 完整的 DEFINE → PLAN → BUILD → VERIFY → REVIEW → SHIP 生命周期。

**Cost:** 每个步骤一个 sub-agent context。对编排层来说是免费的，因为没有 orchestrator agent。

**Why not automate it:** 一个 LLM “lifecycle orchestrator”会因为必须为 hand-off 做总结而 (a) 在步骤之间丢失细微差别，(b) 跳过能及早捕捉错误方向的人类检查点，(c) 通过复述回合使 token 成本翻倍。

---

### 6. Research isolation（研究隔离，保留上下文）

当任务需要阅读大量材料，而这些材料不应污染 main context 时，启动一个 research sub-agent，只返回摘要。

```
main agent → research sub-agent (reads 50 files) → digest → main agent continues
```

**Use when:**
- main session 需要专注于后续任务
- 调查结果远小于它消耗的输入
- main agent 在之后保留足够思考空间，会提升决策质量

**Examples:** "Find every call site of this deprecated API across the monorepo," "Summarize what these 30 ADRs say about caching."

**Cost:** 一个隔离的 sub-agent context。只要替代方案是把数百个文件加载进 main context，这个成本就是值得的。

**On Claude Code, use the built-in `Explore` subagent**，而不是定义自定义 research persona。`Explore` 运行在 Haiku 上，被拒绝写入/编辑工具，并且专门为这种模式设计。只有当 `Explore` 不适用时（例如你需要模型无法自行推断出的 domain-specific system prompt），才定义自定义 research subagent。

---

## Claude Code compatibility（Claude Code 兼容性）

本目录与 harness 无关，但大多数读者会在 Claude Code 上运行它。下面说明每种模式如何映射到 Claude Code primitives，以及平台在哪些地方会替我们强制执行规则。

### Where personas live（Personas 的位置）

Plugin subagents 放在 plugin root 的 `agents/` 中。本仓库是一个 plugin（`.claude-plugin/plugin.json`），因此启用 plugin 后，`agents/code-reviewer.md`、`agents/security-auditor.md` 和 `agents/test-engineer.md` 会被自动发现。不需要配置路径。

### Subagents vs. Agent Teams

Claude Code 有两种并行 primitives。模式 3（parallel fan-out with merge）映射到 **subagents**。如果你需要会彼此对话的 teammates，请改用 **Agent Teams**。

| | Subagents | Agent Teams |
|--|-----------|-------------|
| Coordination | Main agent 扇出，sub-agents 只回报结果 | Teammates 互相发消息，共享 task list |
| Context | 每个 subagent 有自己的 context window | 每个 teammate 有自己的 context window |
| When to use | 产出报告的独立任务 | 需要讨论的协作工作 |
| Status | Stable | Experimental — requires `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` |
| Cost | 更低 | 更高 — 每个 teammate 都是单独的 Claude instance |

**本仓库中的 personas 在两种模式下都可用。** 当它们作为 subagents 启动时（例如由 `/ship` 启动），它们向 main session 报告发现。当它们作为 teammates 启动时（`Spawn a teammate using the security-auditor agent type…`），它们可以直接质疑彼此的发现。Persona 定义相同；只有启动上下文不同。

一个细节：persona frontmatter 中的 `skills` 和 `mcpServers` 字段在它作为 subagent 运行时会被遵守，但**作为 teammate 运行时会被忽略**。Teammates 会像普通 session 一样，从你的项目和用户设置加载 skills 与 MCP servers。如果某个 persona 依赖特定 skill 或 MCP server 已加载，请在 session 层配置它，确保两种模式都可用。

### Platform-enforced rules（平台强制规则）

本目录中的两条规则不只是约定，Claude Code 会强制执行：

- **"Subagents cannot spawn other subagents"**（文档原文）。Anti-pattern B（persona-calls-persona）和 Anti-pattern D（deep persona trees）在 Claude Code 上从结构上就无法存在。
- **"No nested teams"** — teammates 不能再启动自己的 teams。同样的反模式也会在 team 层被阻止。

这意味着你可以采用本目录中的模式，而不用担心贡献者意外构建出这些反模式。它们只会加载失败。

### Built-in subagents to know about（需要知道的内置 subagents）

在定义自定义 subagent 之前，先检查下面这些是否已经覆盖对应角色：

| Built-in | Purpose |
|----------|---------|
| `Explore` | 只读代码库搜索和分析。用于模式 6（research isolation）。 |
| `Plan` | plan mode 中的只读研究。 |
| `general-purpose` | 同时需要探索和修改的多步骤任务。 |

不要重新定义这些。把你的 specialist personas（code-reviewer、security-auditor、test-engineer）叠加在它们之上。

### Frontmatter restrictions for plugin agents（Plugin agents 的 frontmatter 限制）

Plugin subagents **不**支持 `hooks`、`mcpServers` 或 `permissionMode` frontmatter 字段；这些字段会被静默忽略。如果未来某个 persona 需要其中任何字段，用户必须改为把文件复制到 `.claude/agents/` 或 `~/.claude/agents/`。

Plugin agents 中可用的字段包括：`name`, `description`, `tools`, `disallowedTools`, `model`, `maxTurns`, `skills`, `memory`, `background`, `effort`, `isolation`, `color`, `initialPrompt`。如果你想优化成本，可以按 persona 使用 `model`（例如用 Haiku 做 `test-engineer` 覆盖率扫描，用 Sonnet 做 `code-reviewer`，用 Opus 做 `security-auditor`）。

### Spawning multiple subagents in parallel（并行启动多个 subagents）

在 Claude Code 中，parallel fan-out（模式 3）要求在**同一个 assistant turn 中发出多个 Agent tool calls**。顺序回合会把执行串行化。`/ship` 已明确说明这一点。任何新的 orchestrator command 也应这样说明。

---

## Worked example: Agent Teams for competing-hypothesis debugging（示例：用 Agent Teams 做竞争性假设调试）

这个示例展示何时应该使用 **Agent Teams**，而不是 `/ship` 的 subagent fan-out。从远处看，这两种模式相似，都会启动相同的三个 personas，但价值来源不同。

### The scenario（场景）

> *Checkout occasionally hangs for ~30 seconds before completing. It happens roughly once every 50 sessions. No errors in logs. Started after last week's release.*

可能的根因（相互排斥，并且都符合症状）：

1. 新 payment-confirmation flow 中存在 race condition
2. 某个 auth check 偶尔落入缓慢的同步 network call
3. 某个查询缺少 index，且耗时随 cart size 扩大
4. 某个不稳定的 third-party API，其 SDK 在 timeout 前静默 retry

单个 agent 会选择第一个看似合理的理论，然后停止调查。`/ship` 风格的 subagent fan-out 会让每个 persona 独立报告，但它们的报告不会相互碰撞，因此无法排除错误理论。

这正是 Agent Teams 文档描述的场景：*"With multiple independent investigators actively trying to disprove each other, the theory that survives is much more likely to be the actual root cause."*

### Why this is *not* a `/ship` job（为什么这不是 `/ship` 任务）

| | `/ship` (subagents) | Agent Teams |
|--|--------------------|-------------|
| Sub-agents see | 同一个 diff，不同 lens | 共享 task list，以及彼此的消息 |
| Output | 三份独立报告 → 一次合并 | 对抗式讨论 → 共识根因 |
| Right when | 你想对已知 artifact 得到裁决 | 你想在多个 hypotheses 中*找出* artifact |

`/ship` 是裁决；Agent Teams 是调查。

### Setup (one-time, per-environment)（一次性环境设置）

Agent Teams 是 experimental。在 `~/.claude/settings.json` 中：

```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

需要 Claude Code v2.1.32 或更高版本。本仓库中的 personas 会被自动加载，不需要手写 team-config 文件。

### The trigger prompt（触发 prompt）

在 lead session 中用自然语言输入：

```
Users report checkout hangs for ~30 seconds intermittently after last
week's release. No errors in logs.

Create an agent team to debug this with competing hypotheses. Spawn
three teammates using the existing agent types:

  - code-reviewer  — investigate race conditions and blocking calls
                     in the checkout code path
  - security-auditor — investigate auth checks, session handling,
                       and any synchronous network calls added recently
  - test-engineer  — propose tests that would distinguish between the
                     hypotheses and check coverage gaps in checkout

Have them message each other directly to challenge each other's
theories. Update findings as consensus emerges. Only converge when
two teammates agree they can disprove the others'.
```

Lead 会启动三个 teammates，并引用现有 persona 名称。Persona body 会作为附加说明被**追加**到每个 teammate 的 system prompt 中（位于 lead 安装的 team-coordination instructions 之上）；上面的 trigger prompt 会成为它们的任务。

### What happens（会发生什么）

1. 每个 teammate 都在自己的 context window 中运行，并从自己的 lens 探索代码库。
2. Teammates 使用 `message` 直接向彼此发送发现。Lead 不需要转述。
3. 共享 task list 显示谁正在调查什么，任何时候都可以用 `Ctrl+T`（in-process mode）或在 tmux pane（split mode）中查看。
4. 当 `code-reviewer` 发现一个本应顺序执行的 `Promise.all` 时，它会给 `security-auditor` 发消息，请对方确认 auth call 不是 race 的一部分。`security-auditor` 检查后回复，要么确认 race 是真正问题，要么提出反证。
5. `test-engineer` 为当前胜出的理论提出一个聚焦的 integration test，团队在宣布共识前用它进行验证。
6. Lead 综合已经收敛的发现并呈现给你。

你可以通过 `Shift+Down` 在 teammates 之间切换并输入内容，从而中断任一 teammate；这适合重定向走错方向的调查者。

### When to clean up（何时清理）

当调查落到某个根因上时，告诉 lead：

```
Clean up the team
```

始终通过 lead 清理，而不是通过 teammate（根据文档，teammates 缺少清理所需的完整 team context）。

### Cost expectation（成本预期）

三个 Sonnet teammates 运行约 10-15 分钟的调查，会明显比 `/ship` 以 subagents 启动同样三个 personas 更贵。理由是*结论质量*：对于生产调试而言，错误修复的成本很高，额外 token 很划算。对于常规 PR review，请继续使用 `/ship`。

### Anti-pattern in this scenario（此场景中的反模式）

**不要**把它重建为一个会扇出 subagents 的 `/debug` slash command。Subagents 不能彼此发消息，因此你会失去让该模式有效的对抗式讨论。如果某个工作流不断出现，把上面的 trigger prompt 记录为 snippet，而不是把它包装进一个误用 subagents 的 slash command。

### When *not* to use Agent Teams（什么时候不使用 Agent Teams）

- 对已知 diff 做 production-bound verdict → 使用 `/ship`（subagents）。
- 对一个 artifact 使用一个 specialist perspective → 直接调用 persona。
- 顺序生命周期（spec → plan → build）→ main-agent handoff（模式 4）或用户驱动的 slash commands（模式 5）。
- 大量阅读但只需小摘要的 research → 内置 `Explore` subagent。

只有当 teammates **需要**相互质疑才能产出正确答案时，才使用 Agent Teams。

---

## Anti-patterns（反模式）

### A. Router persona ("meta-orchestrator")

职责是决定调用哪个其他 persona 的 persona。

```
/work → router-persona → "this needs a review" → code-reviewer → router (paraphrases) → user
```

**Why it fails:**
- 纯 routing layer，没有领域价值
- 增加两个复述跳点 → 信息损失 + 约 2× token 成本
- 用户已经知道自己想要 review；本可以直接调用 `/review`
- 重复了 slash commands 和 `AGENTS.md` 中 intent mapping 已经负责的工作

**What to do instead:** 添加或改进 slash commands。在 `AGENTS.md` 中记录 intent → command mapping。

---

### B. Persona that calls another persona（调用另一个 persona 的 persona）

一个 `code-reviewer` 在看到 auth code 时内部调用 `security-auditor`。

**Why it fails:**
- Personas 被设计为产出单一视角；把它们串起来会破坏这个目标
- 调用方 persona 传递的摘要会丢失被调用 persona 所需的上下文
- Failure modes 成倍增加（哪个 persona 的输出格式优先？谁的规则适用？）
- 向用户隐藏成本

**What to do instead:** 让调用方 persona 在报告中*建议*后续 audit。由用户或 slash command 运行第二轮。

---

### C. Hidden sequential orchestrator persona that paraphrases（会复述的隐藏顺序 orchestrator persona）

一个 `workflow-manager` persona 代表用户依次调用其他 personas，自己不做领域判断，只在每一步之间复述和转交。

**Why it fails:**
- 把 main agent 可以直接完成的 routing 外包给了一个无领域价值的 persona
- 每次 hand-off 都会二次总结上下文，在长流水线中累积漂移
- token 成本翻倍：每一步都需要 orchestrator turn + sub-agent turn
- 隐藏了 persona-to-persona routing，违反本仓库的 composition rules

**What to do instead:** 使用 Pattern 4，让 main agent 或 command skill 顺序交接并保留明确 artifacts；或者使用 Pattern 5，让用户显式运行 slash commands。

---

### D. Deep persona trees（深层 persona 树）

`/ship` 调用 `pre-ship-coordinator`，后者调用 `quality-coordinator`，后者再调用 `code-reviewer`。

**Why it fails:**
- 每一层都会增加 latency 和 tokens，却没有决策价值
- 调试会变成多层级调查
- 叶子 personas 会因为多次总结步骤而丢失上下文

**What to do instead:** 将编排深度保持在最多 1 层（slash command → personas）。合并发生在 main agent 中。

---

## Decision flow（决策流程）

考虑新的编排工作流时，按这个流程走：

```
Is the work one perspective on one artifact?
├── Yes → Direct invocation. Stop.
└── No  → Will the same composition repeat?
         ├── No  → Direct invocation, ad hoc. Stop.
         └── Yes → Are sub-tasks independent?
                  ├── No  → Sequential main-agent handoff (Pattern 4) or user-driven slash commands (Pattern 5).
                  └── Yes → Parallel fan-out with merge (Pattern 3).
                           Validate against the checklist above.
                           If any check fails → fall back to single-persona command (Pattern 2).
```

---

## When to add a new pattern to this catalog（何时向本目录添加新模式）

仅在满足以下条件后，才添加新条目：

1. 你已经在真实工作中至少使用过该模式两次
2. 你能指出本仓库中一个具体 artifact 来展示它
3. 你能解释为什么现有模式无法胜任
4. 你能描述它的 anti-pattern shadow（人们会误建成什么）

过早加入目录的条目会变成没人遵循的愿景式文档。
