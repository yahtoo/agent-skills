# Agent Personas

专家 persona，只承担单一角色并采用单一视角。每个 persona 都是一个 Markdown 文件，由你的运行环境（Claude Code、Cursor、Copilot 等）作为 system prompt 使用。

| Persona | 角色 | 最适合 |
|---------|------|----------|
| [code-reviewer](code-reviewer.md) | Senior Staff Engineer | 合并前的五轴审查 |
| [security-auditor](security-auditor.md) | Security Engineer | 漏洞检测、OWASP 风格审计 |
| [test-engineer](test-engineer.md) | QA Engineer | 测试策略、覆盖率分析、Prove-It pattern |

## Personas、skills 与 commands 的关系

三层结构，各自职责明确：

| 层级 | 含义 | 示例 | 组合职责 |
|-------|-----------|---------|------------------|
| **Skill** | 带步骤和退出标准的工作流 | `code-review-and-quality` | *how*，从 persona 或 command 内部调用 |
| **Persona** | 带视角和输出格式的角色 | `code-reviewer` | *who*，采用某个视角并产出报告 |
| **Command** | 面向用户的入口 | `/review`, `/ship` | *when*，组合 personas 和 skills |

用户（或 slash command）是编排者。**Personas 不调用其他 personas。** Skills 是 persona 工作流中的强制步骤。

## 何时使用

### 直接调用 persona
当你只需要从一个视角审查当前变更，并且用户参与决策时，选择这种方式。

- "Review this PR" → 直接调用 `code-reviewer`
- "Are there security issues in `auth.ts`?" → 直接调用 `security-auditor`
- "What tests are missing for the checkout flow?" → 直接调用 `test-engineer`

### Slash command（背后是单个 persona）
当某个可重复工作流每次都要重新解释时，选择这种方式。

- `/review` → 用项目的 review skill 包装 `code-reviewer`
- `/test` → 用 TDD skill 包装 `test-engineer`

### Slash command（编排者，fan-out）
只有当多个**独立**调查可以并行运行，并生成由单个 agent 汇总的报告时，才选择这种方式。

- `/ship` → 并行 fan out 到 `code-reviewer` + `security-auditor` + `test-engineer`，然后把它们的报告综合为 go/no-go 决策

这是本仓库认可的唯一编排模式。完整模式目录与反模式见 [references/orchestration-patterns.md](../references/orchestration-patterns.md)。

## 决策矩阵

```
工作是否是对单个 artifact 的单一视角处理？
├── 是 → 直接调用 persona
└── 否 → 子任务是否独立（没有共享可变状态、没有顺序依赖）？
         ├── 是 → 使用带并行 fan-out 的 slash command（例如 /ship）
         └── 否 → 由用户顺序运行 slash commands（/spec → /plan → /build → /test → /review）
```

## 示例：有效编排

`/ship` 是本仓库中标准的 fan-out 编排者：

```
/ship
  ├── (parallel) code-reviewer    → review report
  ├── (parallel) security-auditor → audit report
  └── (parallel) test-engineer    → coverage report
                  ↓
        merge phase（main agent）
                  ↓
        go/no-go decision + rollback plan
```

为什么这可行：
- 每个 sub-agent 都处理同一个 diff，但产出**不同视角**
- 它们彼此没有依赖 → 真正并行，实际节省墙钟时间
- 每个 sub-agent 都在新的 context window 中运行 → main session 保持清爽
- merge step 很小，并且受益于完整上下文，因此保留在 main agent 中

## 示例：无效编排（不要构建这种模式）

一个 `meta-orchestrator` persona，其职责是“决定调用哪个其他 persona”：

```
/work-on-pr → meta-orchestrator
                  ↓（decides "this needs a review"）
              code-reviewer
                  ↓（returns）
              meta-orchestrator（paraphrases result）
                  ↓
              user
```

为什么这会失败：
- 纯路由层，没有领域价值
- 增加两次转述跳转 → 信息损失 + 2 倍 token 成本
- 用户已经知道自己要 review；让他们直接调用 `/review`
- 重复 slash commands 和 `AGENTS.md` 意图映射已经负责的工作

## Persona 规则

1. 一个 persona 是单一角色，并且只有一种输出格式。如果你发现自己在添加第二个角色，请创建第二个 persona。
2. **Personas 不调用其他 personas。** 组合是 slash commands 或用户的职责。在 Claude Code 上这也是硬性平台约束：*"subagents cannot spawn other subagents"*，因此平台会替你执行这条规则。
3. Persona 可以调用 skills（即 *how*）。
4. 每个 persona 文件都以 "Composition" block 结尾，说明它适合放在哪里。

## Claude Code 互操作

本仓库中的 personas 设计为无需修改即可作为 Claude Code subagents 和 Agent Teams teammates 工作：

- **作为 subagents：** 启用此 plugin 后会自动发现（不需要路径配置）。使用 Agent tool，并设置 `subagent_type: code-reviewer`（或 `security-auditor`、`test-engineer`）。`/ship` 是标准示例。
- **作为 Agent Teams teammates**（实验性，需要 `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`）：spawn teammate 时引用相同的 persona name。Persona 正文会作为附加指令**追加到** teammate 的 system prompt（不是替换），因此你的 persona 文本会叠加在 lead 安装的团队协作指令之上（SendMessage、task-list tools 等）。

Subagents 只把结果报告回 main agent。Agent Teams 允许 teammates 彼此直接发消息。当报告足够时使用 subagents；当 sub-agents 需要相互质疑发现时使用 Agent Teams（例如 competing-hypothesis debugging）。完整映射见 [references/orchestration-patterns.md](../references/orchestration-patterns.md)。

Plugin agents 不支持 `hooks`、`mcpServers` 或 `permissionMode` frontmatter，这些字段会被静默忽略。在这里编写新的 personas 时，不要依赖它们。

## 添加新 persona

1. 创建 `agents/<role>.md`，使用与现有 personas 相同的 frontmatter 格式。
2. 定义角色、范围、输出格式和规则。
3. 在底部添加 **Composition** block（Invoke directly when / Invoke via / Do not invoke from another persona）。
4. 将该 persona 添加到本文件顶部的表格中。
5. 如果该 persona 启用了新的编排模式，请在 `references/orchestration-patterns.md` 中记录，而不是在 persona 文件本身发明该模式。
