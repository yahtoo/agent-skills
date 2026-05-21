# agent-skills

这是 agent-skills 项目：一组面向 AI 编码代理的 production-grade engineering skills。

## Project Structure（项目结构）

```
skills/       -> Core skills (SKILL.md per directory)
agents/       -> Reusable agent personas (code-reviewer, test-engineer, security-auditor)
hooks/        -> Session lifecycle hooks
.claude/commands/ -> Slash commands (/spec, /plan, /build, /test, /review, /code-simplify, /ship)
references/   -> Supplementary checklists (testing, performance, security, accessibility)
docs/         -> Setup guides for different tools
```

## Skills by Phase（按阶段划分的 Skills）

**Define:** interview-me, idea-refine, spec-driven-development
**Plan:** planning-and-task-breakdown
**Build:** incremental-implementation, test-driven-development, context-engineering, source-driven-development, doubt-driven-development, frontend-ui-engineering, api-and-interface-design
**Verify:** browser-testing-with-devtools, debugging-and-error-recovery
**Review:** code-review-and-quality, code-simplification, security-and-hardening, performance-optimization
**Ship:** git-workflow-and-versioning, ci-cd-and-automation, deprecation-and-migration, documentation-and-adrs, shipping-and-launch

## Conventions（约定）

- 每个 skill 位于 `skills/<name>/SKILL.md`
- YAML frontmatter 必须包含 `name` 和 `description`
- Description 先说明 skill 做什么（第三人称），再包含触发条件（"Use when..."）
- 每个 skill 包含：Overview, When to Use, Process, Common Rationalizations, Red Flags, Verification
- References 放在 `references/`，不要放在 skill 目录中
- 只有当内容超过 100 行时才创建支持文件

## Commands（命令）

- `npm test` - 不适用（这是文档项目）
- Validate: 检查所有 SKILL.md 文件是否包含有效 YAML frontmatter，以及 `name` 和 `description`

## Boundaries（边界）

- Always: 新 skill 遵循 `skill-anatomy.md` 格式
- Never: 添加只有模糊建议、没有可执行流程的 skill
- Never: 在 skills 之间复制内容；应引用其他 skills
