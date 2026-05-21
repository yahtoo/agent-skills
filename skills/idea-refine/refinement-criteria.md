# Refinement & Evaluation Criteria（打磨与评估标准）

在 Phase 2（Evaluate & Converge）中使用此 rubric 对想法方向进行压力测试。不是每个标准都适用于每个想法；根据具体上下文判断哪些维度最重要。

## Core Evaluation Dimensions（核心评估维度）

### 1. User Value（用户价值）

最重要的维度。如果价值不清楚，其他都不重要。

**Painkiller vs. Vitamin（止痛药 vs. 维生素）：**
- **Painkiller：** 解决急迫且频繁的问题。用户会主动寻找它。他们会从当前方案切换过来。信号：人们带着情绪描述问题、已经构建 workaround、愿意为解决方案付费。
- **Vitamin：** 可有可无。让某事略微变好。用户不会特意去使用。信号：人们礼貌点头、说 “that's cool”，然后行为没有改变。

**Questions to ask（要问的问题）：**
- 你能说出 3 个现在就有这个问题的具体人吗？
- 他们今天用什么替代方案？（真正的竞争者永远是当前 workaround。）
- 他们会从当前方式切换过来吗？什么会让他们切换？
- 他们多频繁遇到这个问题？（每日问题 > 每月问题）
- 这是一个 “pull” 问题（用户在要求它），还是 “push” 问题（你认为他们应该想要它）？

**Red flags（危险信号）：**
- “Everyone could use this”：如果你无法命名具体用户，价值就不清楚
- “It's like X but better”：边际改进很少驱动采用
- 问题真实但罕见：高强度但低频率，很少足以支撑产品

### 2. Feasibility（可行性）

你真的能构建它吗？不仅是技术上，而是实践上。

**Technical feasibility（技术可行性）：**
- 核心技术是否存在且可靠？
- 最难的技术问题是什么？它是已知难题还是新问题？
- 是否依赖你无法控制的第三方、API 或数据源？
- 所需的最小技术栈是什么？（如果答案是 “很多”，这就是信号。）

**Resource feasibility（资源可行性）：**
- 构建 MVP 所需的最小团队/工作量是什么？
- 是否需要你没有的专业能力？
- 是否存在监管、法律或合规要求？

**Time-to-value（价值实现时间）：**
- 多快能把东西放到用户面前？
- 是否存在一个能在数天/数周，而不是数月内交付价值的版本？
- critical path 是什么？必须先发生什么？

**Red flags（危险信号）：**
- “We just need to solve [very hard research problem] first”
- 多个依赖必须同时工作
- MVP 仍需要数月工作，说明它很可能还不够 minimal

### 3. Differentiation（差异化）

它真正不同在哪里？不是更好，而是 *不同*。

**Questions to ask（要问的问题）：**
- 如果用户向朋友描述它，他们会怎么说？这个描述有吸引力吗？
- 这个东西做了什么其他东西都没做的事？（如果说不出来，就是问题。）
- 这种差异化是否持久？竞争者能在一周内复制吗？
- 这个差异是用户真正关心的，还是只是构建者觉得有趣？

**Types of differentiation (strongest to weakest)（差异化类型，从强到弱）：**
1. **New capability：** 做到以前不可能的事
2. **10x improvement：** 在关键维度上好到足以改变行为
3. **New audience：** 把现有能力带给过去被排除的人
4. **New context：** 在现有方案失效的场景中工作
5. **Better UX：** 同样能力，但体验极大简化
6. **Cheaper：** 同样东西，成本更低（最弱，容易被竞争掉）

**Red flags（危险信号）：**
- 差异化完全关于技术，而不是用户体验
- “We're faster/cheaper/prettier”，却没有结构性原因说明为什么
- 用来差异化的功能，并不是用户最关心的功能

## Assumption Audit（假设审计）

对每个想法方向，都要把假设明确列入三类：

### Must Be True (Dealbreakers)（必须为真，否决项）

如果错误就会完全杀死想法的假设。这些需要在构建前验证。

示例：“Users will share their data with us”——如果他们不愿意，整个产品就无法工作。

### Should Be True (Important)（应该为真，重要项）

显著影响成功但不会杀死想法的假设。如果这些错了，可以调整方法。

示例：“Users prefer self-serve over talking to a person”——如果错了，你需要不同的 go-to-market，但核心产品仍然可以工作。

### Might Be True (Nice to Have)（可能为真，加分项）

关于次要功能或优化的假设。在核心被证明之前，不要验证这些。

示例：“Users will want to share their results with teammates”——这是增长功能，不是核心价值主张。

## Decision Framework（决策框架）

在方向之间选择时，用这个矩阵排序：

|                    | High Feasibility | Low Feasibility |
|--------------------|-------------------|-----------------|
| **High Value**     | Do this first     | Worth the risk   |
| **Low Value**      | Only if trivial   | Don't do this    |

然后使用 differentiation 作为同一象限内选项的 tiebreaker。

## MVP Scoping Principles（MVP 定范围原则）

为选定方向定义 MVP 范围时：

1. **One job, done well（一个任务，做好它）。** MVP 应该精准完成一个用户任务，而不是三个任务各做一部分。
2. **The riskiest assumption first（最有风险的假设优先）。** MVP 的主要目的，是测试最可能错误的假设。
3. **Time-box, not feature-list（按时间盒，而不是功能清单）。** “What can we build and test in [timeframe]?” 比 “What features do we need?” 更好。
4. **The 'Not Doing' list is mandatory（`Not Doing` list 是强制项）。** 明确说出你砍掉什么以及为什么。这能防止范围蔓延，并迫使诚实排序。
5. **If it's not embarrassing, you waited too long（如果不尴尬，说明你等太久了）。** 第一个版本应该让构建者觉得不完整。如果没有这种感觉，你就过度构建了。
