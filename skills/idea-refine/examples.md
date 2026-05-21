# Ideation Session Examples（构想会话示例）

这些示例展示了不同类型想法中的优秀构想会话应该是什么样子。学习节奏、语气和结构，而不只是内容。这个 skill 应该同样适用于模糊的创业概念、现有产品中的功能，或流程改进。

---

## Example 1: Vague Early-Stage Concept（示例 1：模糊的早期概念，完整三阶段会话）

**用户触发：** `/ideate I want to help small local restaurants compete with the big delivery platforms`

### Phase 1: Understand & Expand（阶段 1：理解并扩展）

**Skill 回复：**

> **How might we** 让独立餐厅获得顾客对外卖平台所期待的覆盖和便利，同时不被迫进入侵蚀利润和品牌的模式？

这是一个很大的空间。让我把它磨尖：

1. **“compete” 的哪一部分？** 获客？配送物流？在线点单 UX？忠诚度/留存？平台费用带来的利润压力？
2. **你是在为谁构建？** 餐厅老板？食客？两者都是？
3. **约束是什么？** 你想的是软件？合作社模式？还是某种实体方案？

**用户回应：** “Restaurant owners. The core pain is that they're paying 25-30% commission to delivery apps but feel they can't opt out because that's where the customers are. I'm thinking software but I'm open.”

**Skill 继续：**

所以问题不是配送物流，而是 **客户依赖**。平台拥有客户关系，餐厅却要用 30% 的收入租回对自己客户的访问权。这就是可以打破的杠杆。

这里有 6 个变体：

1. **Direct Channel Toolkit：** 给餐厅自己的品牌点单渠道，包括 web、SMS，也许还有轻量 app，让他们能把已有客户迁离平台。核心押注：那些 *已经认识* 某家餐厅的顾客，只要足够容易，就会直接下单。你不需要在发现层面和 DoorDash 竞争，只需要在复购层面竞争。

2. **Inversion — Charge the Customer, Not the Restaurant：** 如果配送费模型反过来呢？顾客为直接点单支付小额溢价，餐厅零佣金。把它定位成 “support your local spot”。押注是：有足够多顾客在意支持本地商家，愿意每单多付 1-2 美元。

3. **Constraint Removal — What If Delivery Weren't Required?：** 平台把发现、点单和配送捆绑在一起，但大部分成本（以及餐厅佣金）来自配送。如果只解决点单和自取呢？Pickup-first 模型。餐厅保留 100% 收入，顾客省下配送费。最适合高密度街区。

4. **Combination — Restaurant Collective：** 合作社模型：一个区域内 20-50 家本地餐厅共享一个平台，分摊成本，并相互交叉推广。单个餐厅承担不起营销，但一个社区 collective 可以。可以理解为数字版 “local food hall”。

5. **Audience Shift — For Regular Customers：** 不要尝试获取新客户。只为餐厅已有常客构建，也就是每周都会来的那些人。一个极简忠诚度/复购工具：“Your usual?” 一键复购。80/20 押注：20% 的顾客贡献 80% 的收入，而这些人不需要 DoorDash 来发现这家餐厅。

6. **Expert Lens — What Restaurant Owners Actually Do：** 多数小餐厅老板不会盯 dashboard。他们在厨房里。任何需要他们 “manage” 的工具都会失败。赢家也许是能自己运行的东西：常客两周没下单就自动发短信、自动发布今日特餐、自动处理复购。餐厅侧零努力。

变体 5 和 6 放在一起很有意思。不要试图 out-platform 平台，而是做一个极窄的东西：服务餐厅最佳现有客户的复购和留存工具。没有发现、没有配送、没有 marketplace。只是 “keep your regulars ordering direct”。

哪些方向让你感兴趣？

---

### Phase 2: Evaluate & Converge（阶段 2：评估并收敛）

**用户回应：** “I love the regulars angle (5 and 6). The direct channel toolkit (1) feels necessary but boring. The co-op idea (4) is interesting but complex. Let me focus on 1 + 5 + 6 combined.”

**Skill 回复：**

直觉不错。这个组合有一个清晰论点：**拥有与最佳客户的关系，让复购毫不费力，并且不要求餐厅老板投入精力。** 让我压力测试一下。

**Direction A: The "Regulars Engine"（融合变体 5 + 6）**
一个完全聚焦于餐厅现有复购客户的工具。自动复购、自动触达、零管理。

- **Core bet：** 餐厅前 20% 的顾客会在体验无摩擦且个性化时转向直接点单。餐厅不需要 *新* 顾客，而是需要停止为已有顾客支付 30% 佣金。
- **User value：** 高且即时。每次直接复购都为餐厅节省 25-30% 佣金。如果一个常客每周下 30 美元订单，每年就是约 400 美元节省。50 个常客 = 每年 2 万美元。这对小餐厅是真钱。
- **Feasibility：** 中等。点单/支付技术是 commodity。难点是：(a) 如何在餐厅不做手工工作的情况下识别并引导 “regulars”？(b) 如何处理冷启动：第一次复购需要订单历史，而历史在外卖平台，不在你这里。
- **Differentiation：** 对这个 niche 来说很高。平台优化的是 marketplace 动态（新客发现、骑手物流）。没人专门优化 “keep your regulars ordering direct”。这对 DoorDash 来说太小，小到他们不在意，而这正是一个好 wedge 的原因。
- **Hidden assumptions：**
  - 常客愿意安装/使用又一种点单方式（最可能错的假设）
  - 餐厅老板愿意共享客户联系方式或允许你访问它
  - 直接点单不会蚕食堂食收入
- **What could kill it：** 如果顾客就是不愿切换渠道。习惯很强，即使 DoorDash 更贵，它已经在他们手机上。

**Direction B: Direct Channel + Retention Hybrid（变体 1 + 5）**
餐厅品牌点单渠道 *加上* 留存自动化。更完整，但也更复杂。

- **Core bet：** 餐厅既需要渠道（接单方式），也需要引擎（让顾客通过该渠道回来）。
- **User value：** 上限更高，但前提是两部分协同有效。点单渠道本身是 commodity（Square、Toast 已经做了）。留存层本身没有可以留存客户的 *渠道*。
- **Feasibility：** 更低。你在构建两个产品，并希望它们组合后更好。
- **Differentiation：** 中等。组合很有意思，但每个部分单独都有竞争者。
- **Hidden assumption：** 把这些捆绑起来比合作更好（例如在 Square Online 之上做留存层）。
- **What could kill it：** 范围。把两个东西都做好，难度呈指数上升。

**诚实判断：** Direction A 是更锋利的押注。Direction B 更安全但差异化更低。A 最大风险是渠道切换问题，也就是让顾客通过新方式下单。如果你能破解这一点（而变体 6 的 “零努力” 方式可能有帮助，比如基于 SMS 的复购不需要安装 app），其余就顺理成章。

我想反对一点：你说变体 1 感觉 “necessary but boring”。这种把 “necessary” 东西纳入范围的本能，正是产品失焦的方式。如果 regulars engine 有效，可以稍后再加品牌点单渠道。但如果先构建渠道，你就只是另一个 Square Online 竞争者。

---

### Phase 3: Sharpen & Ship（阶段 3：锐化并交付）

**Skill 产出：**

# ReOrder: Keep Your Regulars Ordering Direct

## Problem Statement（问题陈述）
How might we 帮助独立餐厅通过直接点单留住最佳现有客户，从而消除最重要收入上的 25-30% 平台佣金？

## Recommended Direction（推荐方向）
构建一个 **regulars-only retention engine**，不是 marketplace，不是完整点单平台。极度聚焦一件事：让餐厅的复购客户能够轻松直接复购。

关键洞察是：餐厅不需要帮助来 *找到* 自己最好的客户，他们知道谁每周二都会进店。他们需要帮助把这些关系从平台迁出。而且工具需要自己运行，因为老板在厨房里，不在 dashboard 前。

SMS-first（不是 app-first）很可能是正确渠道。一条短信说 “Hey, want your usual Thursday order from Marco's?” 并提供一键确认，比任何 app 安装都低摩擦。

## Key Assumptions to Validate（待验证关键假设）
- [ ] 复购客户愿意通过 SMS/直接链接，而不是他们惯用的外卖 app 复购；用 5 家餐厅、每家 20 个常客测试，4 周内衡量转化
- [ ] 餐厅老板能识别前 20-30 个常客并共享联系信息；询问 10 位餐厅老板是否愿意这样做
- [ ] 佣金节省（每单 8-10 美元）足以激励老板投入初始设置；访谈 10 位老板了解平台费用痛点

## MVP Scope（MVP 范围）
- 面向餐厅自定义常客的 SMS 复购
- 餐厅老板手工添加常客（姓名 + 电话 + 常点订单），15 分钟设置
- 顾客收到带有常点订单的短信，回复确认，通过链接付款
- 餐厅通过短信/简单 dashboard 收到订单
- 不做配送，v1 只做自取
- 不做发现、不做 marketplace、不做 app

## Not Doing (and Why)（不做什么及原因）
- **Delivery logistics**：配送是昂贵且复杂的部分，不是核心问题。Pickup-first 可以在没有运营负担的情况下验证需求。
- **Customer acquisition/discovery**：那是平台的游戏。竞争发现意味着和 DoorDash 的预算竞争。我们改在留存上竞争。
- **Branded restaurant apps/websites**：commodity。Square 和 Toast 已经做了。另一个品牌渠道解决不了行为问题。
- **Menu management, POS integration**：范围蔓延。“Your usual” 不需要动态菜单。从静态订单开始。
- **Analytics dashboards**：老板在厨房里。做被动 reporting（每周短信摘要），不要做主动 reporting（登录看图表）。

## Open Questions（开放问题）
- SMS marketing 给餐厅客户时，法律/合规环境是什么？
- 如何处理 “usual” 订单的菜单/价格变更？
- 有没有办法从现有 POS 数据引导出常客列表，而不是手工录入？
- 定价模型是什么？按单收费？月订阅？

---

## Example 2: Feature Idea Within an Existing Product (Codebase-Aware)（示例 2：现有产品中的功能想法，代码库感知）

**用户触发：** `/ideate adding real-time collaboration to our document editor`

### Phase 1: Understand & Expand（阶段 1：理解并扩展）

**Skill 回复：**

> **How might we** 让多人同时编辑同一篇文档，并且体验自然、不混乱？

我扫描了你的代码库，看到你使用的是 block-based editor architecture，并通过 REST API 持久化。当前没有 WebSocket infrastructure。这是重要上下文。几个问题：

1. **协作模式是什么？** 多人同时编辑同一段（Google Docs 风格）？还是在不同 section 工作（Notion 风格）？还是一个人编辑、其他人 review/comment？
2. **同时用户数是多少？** 2-3 人（pair editing）？10+ 人（team workspace）？
3. **为什么现在做？** 客户要求？竞争压力？内部需求？

**用户回应：** “2-5 people, usually working in different sections. Customers keep asking. We're losing deals to Notion because they assume any modern editor has this.”

**Skill 继续：**

竞争压力这个框架很重要：这可能是一个 checkbox feature（进入候选集的 must-have），而不是 differentiator。这会改变你应该投入多少。

我看到你的 document model 使用独立 blocks 和 flat ordering system（`src/models/document.ts:45`）。这其实有利：block-level granularity 意味着冲突比 character-level editing 少得多。

这里有 5 个变体：

1. **Block-Level Locking（最简单路径）：** 当某人开始编辑一个 block 时，为其他人锁定它。他们看到 presence indicator（“Alex is editing...”），但可以自由编辑任何其他 block。不需要 conflict resolution。你现有 block model 支持这一点，改动最小：增加 `locked_by` 字段和用于 presence 的 WebSocket layer。

2. **Inversion — Async-First Collaboration：** 不做实时共同编辑，转向 async。Inline suggestions、comments，以及文档 owner 合并的 proposed edits。像 suggestion mode，但作为 *主要* 协作模型。押注是：对于 2-5 人在不同 section 工作，async 可能实际上 *比* real-time 更好。

3. **Simplification — Presence Without Co-Editing：** 显示谁正在查看文档、他们在看哪个 section（cursors、margin 中的 avatars），但不启用同时编辑。人们用口头协调。听起来原始，但可能用 10% 工程成本实现 80% 价值。

4. **Combination — Collaboration + Version Branches：** 允许人们创建文档 “branches”，独立编辑，然后 merge。每个人都有自己的空间，编辑期间没有冲突，并且你构建 merge UI。这利用了你现有 versioning system。

5. **10x Version — AI-Mediated Collaboration：** 多人描述他们希望某个 section 成为什么样，AI 把输入综合成草稿，然后大家迭代。没人直接编辑同一段文本，但都能影响它。激进，可能太早，但值得命名。

基于你的架构和竞争语境，我会把你推向变体 1 或 3。你需要拿下交易，也就是需要把这个发出去，也就是需要最简单的、能勾选 checkbox 的版本。变体 1 给你真正的共同编辑。变体 3 更便宜，但可能无法满足 “we need real-time” 这个 checkbox。

---

*Phase 2 会聚类为 “minimum viable co-editing（1 或 3）” vs. “differentiated collaboration model（2 或 4）”，评估是快速勾选竞争 checkbox，还是投入一个能成为卖点的东西。*

*Phase 3 会产出一个 one-pager，推荐 block-level locking 作为 MVP，并在 “Not Doing” list 中包含 character-level CRDT（太复杂）、offline sync（2-5 人不需要）、AI features（过早）。*

---

## Example 3: Process/Workflow Idea (Non-Product)（示例 3：流程/工作流想法，非产品）

**用户触发：** `/ideate a better way to run our weekly team retrospectives — they've gotten stale and people dread them`

### Phase 1: Understand & Expand（阶段 1：理解并扩展）

**Skill 回复：**

> **How might we** 让 retrospectives 真正有用，成为团队期待的东西，而不是人们忍受的例会？

扩展前先问：

1. **它们 stale 在哪里？** 每次同样格式？总是同样的人发言？行动项永远不完成？话题感觉重复？
2. **团队规模和动态？** 5 个人都愿意发言，还是 15 人里 3 人主导？
3. **你眼里的 *good* retro 是什么样？** 以前有过有效的吗？它为什么不同？

**用户回应：** “8 people, maybe 3-4 actually talk. Same 'what went well / what didn't / action items' format for a year. The action items pile up and nothing changes. People think it's theater.”

**Skill 继续：**

行动项问题才是真信号。如果 retro 后没有任何改变，人们理性上就会 disengage。会议不是 stale，而是 **输出层坏了**。如果 follow-through 有效，格式也许没问题。

这里有 6 个变体：

1. **Fix the Output, Not the Meeting：** 保持 retro 格式，但彻底改变会后发生的事。每次 retro 最多一个行动项。在会上指定 owner 和 deadline。下次 retro 以 5 分钟 demo 这个完成的行动项开场。如果没完成，它就 *变成* retro 主题。一个行动项的约束迫使优先级排序。

2. **Inversion — Kill the Meeting：** 用 async retro 取代同步会议。每个人在一周内提交书面反思。轮值 facilitator 综合主题并提出一个改变。“会议” 只是 15 分钟 standup，用来同意或不同意。押注：书写比群体发言产生更诚实的反馈。

3. **Audience Shift — Retro for the Quiet Ones：** 为 4-5 个不说话的人设计格式。匿名提交主题。Dot-voting 排序。全组讨论前先小组（两人）breakouts。声音大的人仍然参与，但结构防止他们主导。

4. **Simplification — The One Question Retro：** 每次 retro 只有一个问题，并且每周变化。“What's one thing that slowed you down?” “What did you learn that the team should know?” “If you could change one thing about how we work, what?” 约束迫使深度胜过广度。

5. **Combination — Retro + Experimentation：** 把每个 retro 输出当成假设。“We believe that [change] will improve [outcome].” 把它作为 2 周实验运行。下次 retro：它有效吗？保留、修改、还是杀掉。把 retro 变成内置 accountability 的持续改进引擎。

6. **Expert Lens — What Facilitators Know：** 有经验的 facilitators 会说，retro 的头号杀手不是格式，而是缺乏安全感。如果人们害怕后果，就不会说真正的问题。修复也许不是结构性的，而是每周从匿名 “team health check” 分数（1-5）开始。当安全感高时，retro 自然会改善。

有意思的张力是：变体 1 和 5 修复 *输出* 问题（什么都没改变）。变体 2、3、4 修复 *输入* 问题（同样的声音、同样的话题）。变体 6 说二者都是更深问题的症状。你觉得真正 bottleneck 在哪里？

---

*Phase 2 会从这些角度评估：尝试成本（大多数免费，只需改变下次会议方式）、风险（变体 2 偏离最大），以及团队真实问题是输出（行动项死亡）还是输入（诚实度不足）。*

*Phase 3 会产出一个 one-pager，推荐先从变体 1（一个行动项、下周 demo）开始，作为零成本实验，并结合变体 3 的匿名提交。“Not Doing” list：新工具、复杂 facilitation techniques，或任何需要预算的东西。第一个修复应该需要 0 分钟准备和 0 美元。*

---

## What to Notice in These Examples（这些示例中要注意什么）

1. **重述会改变框架。** “Help restaurants compete” 变成 “retain existing customers”。“Add real-time collaboration” 变成 “let people work simultaneously without chaos”。“Fix stale retros” 变成 “fix the output layer”。

2. **问题先诊断，再开方。** 每个问题都判断这实际是哪 *类* 问题。retro 示例揭示问题是行动项 follow-through，而不是会议格式，这会改变每个变体。

3. **变体都有理由。** 每个变体都解释它 *为什么* 存在（生成它的视角），而不只是说明它 *是什么*。标签（Inversion、Simplification 等）会教用户自己也这样思考。

4. **这个 skill 有观点。** “I'd push you toward 1 or 3.” “Variation 6 is worth sitting with.” 它会告诉你它认为重要的是什么以及为什么，而不只是中立选项。

5. **Phase 2 是诚实的。** 想法会因为低差异化或高复杂度被点名。这个 skill 会反对：“That instinct to include the 'necessary' thing is how products lose focus.”

6. **输出是可行动的。** one-pager 以你可以 *做* 的事情结尾（验证假设、构建 MVP、尝试实验），而不是让你继续 *思考* 的东西。

7. **“Not Doing” list 做了真正的工作。** 它具体且有理由。每一项都是你可能 *想* 做但现在不该做的东西。

8. **这个 skill 会适应上下文。** 代码库感知示例引用实际架构。流程想法生成零成本实验，而不是产品。框架保持不变，但输出匹配领域。
