# AGENTS.md

本文件为 AI 编码代理（Claude Code、Cursor、Copilot、Antigravity 等）在本仓库中工作时提供规则。

## Repository Overview（仓库概览）

本仓库是一组面向高级软件工程师的 Claude.ai、Claude Code、Codex 与其他 coding agents 的 skills。Skill 是打包好的说明与脚本，用来扩展编码代理的能力。

## Codex Integration（Codex 集成）

Codex 使用 `AGENTS.md` 作为指令层，使用 `.agents/skills` 或用户级 skills 目录作为 workflow 发现层。本仓库对 Codex 的默认策略是：

- `AGENTS.md` / command skill 负责 orchestration，不创建 `agents/orchestrator.md`
- `skills/<name>/SKILL.md` 负责 workflow 方法
- `agents/<role>.md` 负责 portable persona prompt
- `.agents/skills/source-command-*` 提供 Codex 可发现的命令入口 skills

### Codex Intent Mapping（Codex 意图映射）

- Feature / new functionality -> `multi-agent-orchestration` + `spec-driven-development` + `planning-and-task-breakdown`
- Bug / failure / unexpected behavior -> `source-command-bugfix` 或 `debugging-and-error-recovery`
- Build / implementation -> `source-command-build` 或 `incremental-implementation` + `test-driven-development`
- Release / ship -> `source-command-ship`，对独立审查使用 parallel fan-out

### Multi-Role Rule（多角色规则）

多角色开发遵循 **single writer, many reviewers**：实现阶段只允许一个 implementation role 写代码；requirements、architecture、test、security、review、release roles 默认只读并输出结构化交接物。并行只用于无共享可变状态、无顺序依赖的独立审查。

## OpenCode Integration（OpenCode 集成）

OpenCode 使用由 `skill` 工具和本仓库 `/skills` 目录驱动的 **skill-driven execution model**。

### Core Rules（核心规则）

- 如果任务匹配某个 skill，你 MUST 调用它
- Skills 位于 `skills/<skill-name>/SKILL.md`
- 如果有适用 skill，绝不要直接实现
- 必须完整遵循 skill 指令，不要只应用其中一部分

### Intent -> Skill Mapping（意图到 Skill 的映射）

代理应自动把用户意图映射到对应 skills：

- Feature / new functionality -> `spec-driven-development`，然后 `incremental-implementation`、`test-driven-development`
- Planning / breakdown -> `planning-and-task-breakdown`
- Bug / failure / unexpected behavior -> `debugging-and-error-recovery`
- Code review -> `code-review-and-quality`
- Refactoring / simplification -> `code-simplification`
- API or interface design -> `api-and-interface-design`
- UI work -> `frontend-ui-engineering`

### Lifecycle Mapping (Implicit Commands)（生命周期映射：隐式命令）

OpenCode 不支持 `/spec` 或 `/plan` 这类 slash commands。

因此，代理必须在内部遵循这个生命周期：

- DEFINE -> `spec-driven-development`
- PLAN -> `planning-and-task-breakdown`
- BUILD -> `incremental-implementation` + `test-driven-development`
- VERIFY -> `debugging-and-error-recovery`
- REVIEW -> `code-review-and-quality`
- SHIP -> `shipping-and-launch`

### Execution Model（执行模型）

对每个请求：

1. 判断是否有任何 skill 适用（即使只有 1% 的可能）
2. 使用 `skill` 工具调用适当的 skill
3. 严格遵循该 skill 的工作流
4. 只有在完成所需步骤（spec、plan 等）后才能进入实现

### Anti-Rationalization（反合理化）

以下想法是错误的，必须忽略：

- "This is too small for a skill"
- "I can just quickly implement this"
- "I’ll gather context first"

正确行为：

- 始终先检查并使用 skills

这样可以确保 OpenCode 的行为尽量接近 Claude Code 的完整 workflow enforcement。

## Orchestration: Personas, Skills, and Commands（编排：Personas、Skills 与 Commands）

本仓库有三个可组合层次。它们职责不同，不应混淆：

- **Skills** (`skills/<name>/SKILL.md`) - 带步骤和退出标准的工作流。表示 *how*。当意图匹配时是强制步骤。
- **Personas** (`agents/<role>.md`) - 带视角和输出格式的角色。表示 *who*。
- **Slash commands** (`.claude/commands/*.md`) - 面向用户的入口。表示 *when*。它们是编排层。

组合规则：**用户（或 slash command）是编排者。Personas 不调用其他 personas。** Persona 可以调用 skills。

本仓库认可两类多 persona 编排：主 agent / command skill 驱动的顺序交接（requirements → architecture → plan → implementation → review），以及 `/ship` 使用的 **parallel fan-out with a merge step**（并行运行 `code-reviewer`、`security-auditor` 和 `test-engineer`，再综合报告）。不要构建一个由 persona 决定调用哪个 persona 的 “router” persona；这是 main agent、slash commands、Codex command skills 和 intent mapping 的职责。

参见 [agents/README.md](agents/README.md) 的决策矩阵，以及 [references/orchestration-patterns.md](references/orchestration-patterns.md) 的完整模式目录。

**Claude Code interop:** `agents/` 中的 personas 既可作为 Claude Code subagents（由插件的 `agents/` 目录自动发现），也可作为 Agent Teams 队友（按名称引用）。两个平台限制与本仓库规则一致：subagents 不能再 spawn subagents，teams 不能嵌套。插件 agents 会静默忽略 frontmatter 中的 `hooks`、`mcpServers` 和 `permissionMode` 字段。

## Creating a New Skill（创建新 Skill）

### Directory Structure（目录结构）

```
skills/
  {skill-name}/           # kebab-case directory name
    SKILL.md              # Required: skill definition
    scripts/              # Required: executable scripts
      {script-name}.sh    # Bash scripts (preferred)
  {skill-name}.zip        # Required: packaged for distribution
```

### Naming Conventions（命名约定）

- **Skill directory**: `kebab-case`，例如 `web-quality`
- **SKILL.md**: 始终大写，文件名必须完全一致
- **Scripts**: `kebab-case.sh`，例如 `deploy.sh`、`fetch-logs.sh`
- **Zip file**: 必须与目录名完全一致：`{skill-name}.zip`

### SKILL.md Format（SKILL.md 格式）

```markdown
---
name: {skill-name}
description: {One sentence describing what the skill does, followed by one or more "Use when" trigger conditions. Include trigger phrases like "Deploy my app" or "Check logs" when helpful.}
---

# {Skill Title}

{Brief overview of what the skill does and why it matters.}

## How It Works

{Numbered list explaining the skill's workflow}

Equivalent headings like `Workflow`, `Core Process`, or `When to Use` are fine when they communicate the same structure clearly.

## Usage (Optional)

Include this section only if the skill ships runnable helpers under `scripts/`. Markdown-only skills can omit both the section and the directory entirely.

```bash
bash /mnt/skills/user/{skill-name}/scripts/{script}.sh [args]
```

**Arguments:**
- `arg1` - Description (defaults to X)

**Examples:**
{Show 2-3 common usage patterns}

## Output

{Show example output users will see}

## Present Results to User

{Template for how Claude should format results when presenting to users}

## Troubleshooting

{Common issues and solutions, especially network/permissions errors}
```

### Best Practices for Context Efficiency（上下文效率最佳实践）

Skills 按需加载：启动时只加载 skill 名称和 description。只有当代理判断 skill 相关时，完整 `SKILL.md` 才会进入上下文。为减少上下文占用：

- **保持 SKILL.md 少于 500 行** - 详细参考材料放到独立文件
- **写具体的 descriptions** - 帮助代理准确判断何时激活 skill
- **使用 progressive disclosure** - 只在需要时读取支持文件
- **优先使用 scripts 而不是内联代码** - 脚本执行不消耗上下文，只有输出会进入上下文
- **文件引用只支持一层深度** - 从 `SKILL.md` 直接链接支持文件

### Script Requirements（脚本要求）

- 使用 `#!/bin/bash` shebang
- 使用 `set -e` 失败即退出
- 状态消息写到 stderr：`echo "Message" >&2`
- 机器可读输出（JSON）写到 stdout
- 对临时文件使用 cleanup trap
- 脚本路径按 `/mnt/skills/user/{skill-name}/scripts/{script}.sh` 引用

### Creating the Zip Package（创建 Zip 包）

创建或更新 skill 后：

```bash
cd skills
zip -r {skill-name}.zip {skill-name}/
```

### End-User Installation（终端用户安装）

为用户记录两种安装方式：

**Claude Code:**
```bash
cp -r skills/{skill-name} ~/.claude/skills/
```

**claude.ai:**
把 skill 加到 project knowledge，或将 SKILL.md 内容粘贴到会话中。

如果 skill 需要网络访问，指示用户在 `claude.ai/settings/capabilities` 添加所需域名。
