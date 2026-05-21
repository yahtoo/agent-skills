# Agent Personas

专家 persona，只承担单一角色并采用单一视角。每个 persona 都是一个 Markdown 文件，由运行环境（Claude Code、Codex、Cursor、Copilot 等）作为 system prompt 或 portable persona prompt 使用。

| Persona | 角色 | 最适合 |
|---------|------|----------|
| [requirements-analyst](requirements-analyst.md) | Requirements Analyst | 澄清目标、约束、非目标和验收标准 |
| [software-architect](software-architect.md) | Software Architect | 模块边界、API、数据流、兼容性和风险设计 |
| [implementation-engineer](implementation-engineer.md) | Implementation Engineer | 单写者薄切片实现与验证 |
| [code-reviewer](code-reviewer.md) | Senior Staff Engineer | 合并前的五轴审查 |
| [security-auditor](security-auditor.md) | Security Engineer | 漏洞检测、OWASP 风格审计 |
| [test-engineer](test-engineer.md) | QA Engineer | 测试策略、覆盖率分析、Prove-It pattern |
| [release-manager](release-manager.md) | Release Manager | go/no-go、rollback plan、release readiness |

## Personas、skills 与 commands 的关系

三层结构，各自职责明确：

| 层级 | 含义 | 示例 | 组合职责 |
|-------|-----------|---------|------------------|
| **Skill** | 带步骤和退出标准的工作流 | `incremental-implementation` | *how*，从 persona 或 command 内部调用 |
| **Persona** | 带视角和输出格式的角色 | `implementation-engineer` | *who*，采用某个视角并产出报告或变更 |
| **Command / AGENTS.md** | 面向用户或 Codex 的入口 | `/ship`, `source-command-feature` | *when*，组合 personas 和 skills |

用户、main agent、slash command 或 Codex command skill 是编排者。**Personas 不调用其他 personas。** Skills 是 persona 工作流中的强制步骤。

## 何时使用

### 直接调用 persona

当你只需要一个视角处理单个 artifact，并且不需要完整生命周期时，选择这种方式。

- "Clarify this feature request" -> `requirements-analyst`
- "Review this PR" -> `code-reviewer`
- "Are there security issues in `auth.ts`?" -> `security-auditor`
- "What tests are missing for checkout?" -> `test-engineer`

### 顺序交接 workflow

当任务存在真实依赖顺序时，由 main agent 或 command skill 顺序协调角色，并通过明确交接物传递上下文：

```text
requirements-analyst
  -> software-architect
  -> planning-and-task-breakdown
  -> implementation-engineer
  -> test-engineer / code-reviewer / security-auditor
  -> release-manager
```

核心规则是 **single writer, many reviewers**：`implementation-engineer` 是实现阶段的唯一写代码角色；review、test、security、release 默认只读并输出报告。

### Parallel fan-out

只有当多个独立调查可以并行运行，并生成由 main agent 汇总的报告时，才选择这种方式。

- `/ship` 或 `source-command-ship` -> 并行 fan out 到 `code-reviewer` + `security-auditor` + `test-engineer`，然后把报告综合为 go/no-go 决策

完整模式目录与反模式见 [references/orchestration-patterns.md](../references/orchestration-patterns.md)。

## 决策矩阵

```text
工作是否是对单个 artifact 的单一视角处理？
├── 是 -> 直接调用 persona
└── 否 -> 是否存在顺序依赖？
         ├── 是 -> main agent / command skill 做顺序交接，persona 只产出本角色结果
         └── 否 -> 子任务是否独立且输出互补？
                  ├── 是 -> 使用 parallel fan-out with merge（例如 /ship）
                  └── 否 -> 使用单 persona 或重新拆分任务
```

## 示例：有效顺序交接

```text
Feature request
  -> requirements-analyst      -> requirements brief
  -> software-architect        -> architecture brief
  -> planning skill            -> task plan
  -> implementation-engineer   -> code changes + verification
  -> code/security/test review -> reports
  -> main agent merge          -> next action
```

为什么这可行：

- 每一步消费上一阶段的明确输出
- 只有一个实现角色写代码，降低冲突
- 审查角色保持独立视角，不参与实现
- main agent 负责合并和返工路由

## 示例：有效并行编排

`/ship` 是本仓库中标准的 fan-out 编排者：

```text
/ship
  ├── (parallel) code-reviewer    -> review report
  ├── (parallel) security-auditor -> audit report
  └── (parallel) test-engineer    -> coverage report
                  ↓
        merge phase（main agent）
                  ↓
        go/no-go decision + rollback plan
```

## 示例：无效编排（不要构建这种模式）

一个 `meta-orchestrator` persona，其职责是“决定调用哪个其他 persona”：

```text
/work-on-pr -> meta-orchestrator
                  ↓ decides "this needs a review"
              code-reviewer
                  ↓ returns
              meta-orchestrator paraphrases result
                  ↓
              user
```

为什么这会失败：

- 纯 routing layer，没有领域价值
- 增加转述跳点，造成信息损失和 token 成本
- 重复 command skills 和 `AGENTS.md` intent mapping 已经负责的工作

## Persona 规则

1. 一个 persona 是单一角色，并且只有一种输出格式。如果你发现自己在添加第二个角色，请创建第二个 persona。
2. **Personas 不调用其他 personas。** 组合是用户、main agent、slash command 或 Codex command skill 的职责。
3. Persona 可以调用 skills（即 *how*）。
4. 每个 persona 文件都以 "Composition" block 结尾，说明它适合放在哪里。
5. 新增 persona 后运行 `node scripts/validate-agents.js`。

## Claude Code 互操作

本仓库中的 personas 设计为无需修改即可作为 Claude Code subagents 和 Agent Teams teammates 工作：

- **作为 subagents：** 启用此 plugin 后会自动发现（不需要路径配置）。使用 Agent tool，并设置匹配 persona `name` 的 agent type。`/ship` 是标准 fan-out 示例。
- **作为 Agent Teams teammates**（实验性，需要 `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`）：spawn teammate 时引用相同的 persona name。Persona 正文会作为附加指令追加到 teammate 的 system prompt。

Subagents 只把结果报告回 main agent。Agent Teams 允许 teammates 彼此直接发消息。当报告足够时使用 subagents；当 teammates 需要相互质疑发现时使用 Agent Teams（例如 competing-hypothesis debugging）。

Plugin agents 不支持 `hooks`、`mcpServers` 或 `permissionMode` frontmatter，这些字段会被静默忽略。在这里编写新的 personas 时，不要依赖它们。

## Codex 互操作

Codex 的稳定适配层是 `AGENTS.md` + skills：

- 全局指令放 `~/.codex/AGENTS.md`
- 用户级 skills 放 `$HOME/.agents/skills`
- 仓库级 command skills 放 `.agents/skills`
- `agents/*.md` 作为 portable persona prompts 被 command skills 或 main agent 引用

不要假设所有 Codex runtime 都有相同的自定义 subagent 文件格式。需要可移植性时，让 command skill 指向本目录中的 persona Markdown。

## 添加新 persona

1. 创建 `agents/<role>.md`，使用与现有 personas 相同的 frontmatter 格式。
2. 定义角色、范围、可调用 skills、输出格式和规则。
3. 在底部添加 **Composition** block（Invoke directly when / Invoke via / Do not invoke from another persona）。
4. 将该 persona 添加到本文件顶部的表格中。
5. 如果该 persona 启用了新的编排模式，请在 `references/orchestration-patterns.md` 中记录，而不是在 persona 文件本身发明该模式。
