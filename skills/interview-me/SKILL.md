---
name: interview-me
description: 通过一次一个问题的访谈，提炼用户真正想要的东西，而不是他们以为自己应该想要的东西，直到对底层意图达到约 95% 置信度。用于需求不完整（如 "build me X" 但没有说明 "for whom" 或 "why now"）、用户明确触发（"interview me"、"grill me"、"are we sure?"、"stress-test my thinking"），或在计划、规格或代码出现前，你发现自己正在默默补全含糊需求时。
---

# Interview Me

## Overview（概览）

人们提出的请求和他们真正想要的东西往往不是一回事。他们会说想要 “一个 dashboard”，因为这是常见说法，而不是因为 dashboard 真的能解决问题。他们会说 “make it faster”，却没有给出要达到的数字。

发现这种偏差的最低成本时刻，是任何计划、规格或代码出现之前。一旦开始构建，切换成本就会变得真实，用户也会把错误的东西合理化成 “够好了”。不匹配会被锁死。

这个 skill 在成本出现前关闭这条偏差。其他 Define 阶段的 skill 假设你已经大致知道自己想要什么：`idea-refine` 从一个想法生成变体，`spec-driven-development` 把需求写下来，`doubt-driven-development` 在计划草拟后压力测试它。Interview-me 位于所有这些之前：一次问一个问题，并附上你的最佳猜测，直到你能在用户说出口之前预测他们会说什么。

## When to Use（何时使用）

在以下情况应用此 skill：

- 请求缺少至少一个要素：用户是 **谁**、他们 **为什么** 想要、**成功** 长什么样、绑定 **约束** 是什么
- 请求是惯例化而非具体化的（“build me X”、“make it faster”），并且不靠猜测就无法拆开这个惯例
- 你想从尚未暴露的假设开始
- 当两个合理价值发生冲突时，用户没有说明他们在优化哪一个（简单性 vs. 灵活性，成本 vs. 速度）
- 用户明确触发：“interview me”、“grill me”、“before we start, are we sure?”、“stress-test my thinking”

**不要使用的情况：**

- 请求明确且自包含（“rename this variable”、“fix this typo”）
- 用户已明确要求速度优先于验证
- 纯信息请求（“how does X work?”、“what does this code do?”）
- 机械操作（重命名、格式化、移动文件）
- 你已经有 ≥95% 置信度；在假设自己没有必要使用前，先重读下面的停止条件

## Loading Constraints（加载约束）

此 skill 需要一个实时、可响应的用户。**不要在非交互上下文中调用**，例如 CI pipeline、scheduled run、`/loop` 或 autonomous-loop。如果你处在这些场景中且请求不完整，把它作为 blocker 告知用户，而不是猜测。

## The Process（流程）

### Step 1: Hypothesize, with a confidence number（提出假设并给出置信度）

在提出任何问题之前，用 **一句话** 写下你当前对用户想要什么的最佳判断，并附上诚实的置信度数字（0–100%）：

```
HYPOTHESIS: You want a way to answer "how are we doing?" in standup, and "dashboard" was the convention that came to mind.
CONFIDENCE: ~30%
```

数字会迫使诚实。如果你写下了高数字，但实际上无法预测接下来三个问题的用户反应，这个数字就是错的。从你能辩护的置信度开始。

### Step 2: Ask one question at a time, each with a guess attached（一次问一个问题，并附上猜测）

格式：

```
Q: <one focused question>
GUESS: <your hypothesis for the answer, with the reasoning that produced it>
```

等待用户反应后再问下一个问题。

**为什么一次一个，而不是一批：**

- 如果你把假设埋在列表里，用户就无法对它们作出反应
- 批量问题鼓励略读和表层回答
- 第三个问题往往取决于第一个问题的答案；一次全问会锁定错误框架
- 用户认真思考的精力有限；一次只花在一个问题上

**为什么要附上猜测：**

- 用户对错误猜测的反应，比从零生成答案更快
- 它迫使你承诺一个可以被明显证明错误的假设，从而保持诚实
- 它暴露的是 *你的* 假设，而这正是访谈要揭示的东西

这里的风险是礼貌的用户为了配合而同意你的猜测。缓解方式是明显表现出愿意被纠正，并偶尔朝你预期用户会反驳的方向猜。

### Step 3: Listen for "want vs. should want"（辨别“想要”与“应该想要”）

最危险的回答，是用户说出一个听起来像深思熟虑答案的东西，而不是他们实际想要的东西。注意：

- 套用最佳实践话术但没有具体内容的回答（“I want it to be scalable”、“clean architecture”）
- 诉诸惯例的回答（“the way most apps do it”、“the standard approach”）
- 类似 “I should probably…”、“I think I'm supposed to…”、“good engineering practice says…” 的表达
- 把 buzzword 当目标，例如用 “modern”、“scalable”、“robust” 代替具体结果

听到这些时，要问的问题是：

> *"If you didn't have to justify this to anyone, what would you actually want?"*

这个单一问题通常比前五个问题更有用。

### Step 4: Restate intent in the user's own words（用用户自己的话重述意图）

当置信度足够高时，把你现在认为用户想要的内容写回给他们。保持紧凑（5–8 行），尽可能使用他们的语言，并让用户能逐行确认或纠正：

```
Here's what I now think you want:

- Outcome:      <one line>
- User:         <one line — who benefits>
- Why now:      <one line — what changed>
- Success:      <one line — how we know it worked>
- Constraint:   <one line — the binding limit>
- Out of scope: <one line — what we're explicitly not doing>

Yes / no / refine?
```

包含 “Out of scope” 是不可协商的。错位的一半来自对 *不构建什么* 的沉默分歧。

### Step 5: Confirm — explicit yes, not "whatever you think"（确认：明确的 yes，而不是“你觉得就行”）

闸门是一个明确的 “yes”。以下都 **不是** yes：

- “Whatever you think is best.” → 用户在委托判断，这意味着他们自己也没有 95% 置信度。用两个具体选项重问，让他们做选择。
- “Sounds good.” → 含糊。问：“Anything you'd refine?” 沉默不是确认。
- “Sure, let's go.” → 常常是礼貌退出，不是认可。使用同样的追问。
- 沉默后说 “okay let's start.” → 用户是放弃了访谈，而不是达成一致。停下来问你是否漏掉了什么。

如果用户纠正你，把纠正折入重述，再次确认。循环直到得到明确的 yes。

### The 95% Confidence Stop（95% 置信度停止条件）

当你能对这个问题回答 yes 时，就结束：

> *Can I predict the user's reaction to the next three questions I would ask?*

如果可以，你们已有共同理解。停止访谈并产出重述。如果不可以，还没结束；问下一个问题。

这是可检查的测试，不是感觉。它也有下限：如果你已经问了几轮但仍然无法预测，这说明请求本身有信息缺口，而不是继续硬问的理由。停下来告诉用户：“I've asked X questions and I still can't predict your reactions. Something foundational is missing. Want to step back?”

## Output（输出）

此 skill 的输出是一个 **已确认的意图陈述**：Step 4 的重述，加上 Step 5 中用户明确的 yes。这就是交付物。规格、计划和任务列表都在下游；它们消费的是此 skill 产出的意图。

如果用户希望持久化该意图（多会话项目、交接给其他协作者），可以提议保存到 `docs/intent/[topic].md`。只有在他们确认后才保存。

## Example（示例）

一个简短的前后对比。

**不使用 `interview-me`：**

```
User:  build me a dashboard for our metrics
Agent: <starts proposing chart libraries and layouts>
```

Agent 已经假设了：服务对象是谁、哪些指标、“for our team” 意味着什么、成功长什么样。这些都没有被说明。每个假设都是用户以后可能说 “that's not what I meant” 的地方。

**使用 `interview-me`：**

```
User: build me a dashboard for our metrics

Agent:
HYPOTHESIS: You want a way to answer "how are we doing?" in standup, and "dashboard" came to mind because that's the conventional answer.
CONFIDENCE: ~30%

Q:     When you say "how are we doing?", who's asking — you alone, the engineering team in standup, or up the chain (e.g., your manager, an exec, a board)?
GUESS: engineering team in standup, because "we" usually scopes that way and standups are where this question gets asked. If it's for execs the metrics and the framing change a lot.

User: It's actually for me. I keep losing track of which experiments are running and what their early signal looks like.

Agent:
Updated read: not a team dashboard at all. It's a personal experiment tracker. Confidence: ~60%.

Q:     Is the gap that you don't know which experiments exist, or that you can't see their results in one place?
GUESS: the second one. You have a list of experiments somewhere, but their results live in five different tools, and reconciling them by hand is what you're tired of.

User: First one actually. I literally don't have a list. They're spread across different docs.

Agent: <continues>
```

两个问题内，agent 就发现真实请求不是 “a dashboard”，而是 “a list”。产物不同，范围不同，工作也不同。dashboard 本来会是错的。

## Interaction with Other Skills（与其他 Skills 的关系）

- **`idea-refine`**：下游。如果确认意图是 “我想要 X，但不知道如何定范围”，交给 `idea-refine`，基于已经明确的意图生成变体。
- **`spec-driven-development`**：下游。如果确认意图已经具体（“我想为 Y 用户做 X，并以 Z 为成功标准”），交给 `spec-driven-development` 把它写下来。
- **`planning-and-task-breakdown`**：此 skill 的两跳下游（在 spec 之后）。
- **`doubt-driven-development`**：时间线的另一端。Interview-me 是决策前的意图提取；doubt-driven 是决策后的产物审查。二者都捕捉偏差，但发生在不同时间点。
- **`source-driven-development`**：正交。Interview-me 澄清用户想要什么；SDD 验证框架事实。它们不竞争。

## Common Rationalizations（常见合理化）

| Rationalization | Reality |
|---|---|
| “The ask is clear enough” | 如果你现在不能用一句话写出用户期望的结果，请求就不清楚。先运行 Step 1 再判断。 |
| “Asking too many questions wastes their time” | 4–6 个有针对性问题浪费的时间很少。构建错误东西浪费的时间巨大，而且成本由用户承担。 |
| “I'll figure it out as I build” | 代码存在后的切换成本是现在的 10 倍。实现中的发现就是返工。 |
| “They said 'whatever you think,' so I should just decide” | “Whatever you think” 是委托，不是决策。用两个具体选项重问，让用户选择。 |
| “I should give them several options to pick from” | 当用户知道自己想要什么，并在 trade-off 间选择时，选项才有用。他们还不知道自己想要什么。列选项会扩大搜索；提问会收窄搜索。 |
| “If I attach my guess, I'm leading them” | 引导就是目的。反应比从零生成更快。风险是 sycophancy，不是引导；通过明显愿意被纠正来缓解。 |
| “We've talked enough, I get it” | 测试它：你能预测他们对接下来三个问题的反应吗？如果不能，你还没懂。 |
| “The user said yes, we're done” | 如果 yes 跟在含糊重述或开放式 “sounds good” 后面，这个 yes 是空的。具体重述并重新确认。 |

## Red Flags（危险信号）

- 一条消息里有三个或更多问题：这是批量提问，不是访谈
- 问题没有附带你的假设：这是调查，不是承诺
- 把 “whatever you think is best” 当作终止答案
- 在用户明确确认你的重述之前，产出 spec、plan 或 task list
- 问题被表述成 “what would be best practice?”，而不是 “what do you actually want?”
- 用户给出彰显专业感的回答（“scalable”、“clean”、“modern”），而你没有追问这是否是他们真正想要的
- 三轮或更多之后，你的置信度没有明显上升：你问错了问题，后退并重构框架
- 在用户确认前保存 intent doc（文档本身暗示了用户没有给出的 yes）
- 在重述中跳过 “Out of scope” 行（关于非目标的沉默分歧，是错位的一半）

## Verification（验证）

应用 interview-me 后：

- [ ] 第一轮陈述了明确假设和置信度数字
- [ ] 问题一次一个，并且每个问题都附带 agent 的猜测
- [ ] 当用户给出彰显专业感或惯例感的回答时，至少进行过一次 “what would you actually want if you didn't have to justify it?” 探测
- [ ] 向用户写回了具体重述（Outcome / User / Why now / Success / Constraint / Out of scope）
- [ ] 用户用明确 yes 确认了重述（不是 “whatever you think”，不是 “sounds good”，也不是沉默）
- [ ] 在停止点，agent 能预测接下来三个问题的用户反应
- [ ] 任何交接给下游 skill（`idea-refine`、`spec-driven-development`）的动作，都是基于已确认意图，而不是原始的不完整请求
