# Phase 5.5 当前课程清单说明

当前主模块见 [CURRICULUM_QUALITY.md](CURRICULUM_QUALITY.md)。新增 games-motion / engineering-binary / web-structure / future-sampling 四课，分别以新的 course/module/path/project 的 `*-quality` 身份编排；对应旧 `*-starter` v1 要求与成果保持不变。现有 18 个唯一入门课时、22 个主模块引用位置，另保留原 M01 六课。九个主入门模块通过内部质量门槛，AI 与旧版模块保持 In Development。

以下为 Phase 5 分支原始清单，保留作兼容对照；其“已发布”描述仅代表旧版本的可访问性，不表示通过 Phase 5.5 新质量门槛。

---

# Phase 5 — 已发布入门课程清单

每个学院同级展示一个新入门课程。以下均为 available，不表示学院的完整课程体系已完成；进阶、高阶仍为 planned。新课共 14 个唯一课时、18 个路径引用位置、10 个模块、10 个课程项目模板。另保留旧开源 M01 六课与分类工作表。

课程 URL 为 `/course/course.<academyId>-starter`；Pages 为 `/nexus-lab/#/course/course.<academyId>-starter`。每课均有华文目标、讲解、例子、可操作练习、自动量规、测验解释、完成记录及下一课建议。所有课堂工具无需学生 API key。

| 学院 ID     | 可用课程            | 权威课时 ID                                       | 实际互动与边界                                                                  |
| ----------- | ------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------- |
| programming | Python 变量与表达式 | shared-python-variables / programming-expressions | 打开现有真实 Pyodide 精选程序，验证输入 7 输出 14；另外做表达式预测，不冒充运行 |
| ai          | 提示结构与结果验证  | shared-evidence-basics / ai-prompt-structure      | 证据分类、目标/受众/约束结构检查；确定性练习，不生成 AI 回复                    |
| games       | 游戏规则与计分      | games-score / shared-git-basics                   | 实际点击收集和累计计分、现有 Git 分支/暂存/提交挑战                             |
| engineering | AND 与真值表        | engineering-and                                   | 用已有逻辑计算函数检查四行 AND 预测；链接完整逻辑门模拟                         |
| web         | HTTP 请求入门       | web-request / shared-api-basics                   | 构造并检查方法/路径；明确本机请求模型，不声称调用远端 API                       |
| security    | 最小权限入门        | security-permissions                              | 勾选只读温度权限并自动检查过度授权                                              |
| robotics    | 传感、阈值与控制    | robotics-threshold / shared-api-basics            | 可变温度/阈值模型计算控制状态，完成指定边界判断；无真实设备连接                 |
| future      | 预测、模型与实测    | shared-evidence-basics / future-models            | 分类观察/解释/预测，计算模型预测并与测量证据区分                                |
| workspace   | 预算公式与数据接口  | workspace-budget / shared-api-basics              | 真实公式解释器在三组数据上计算并校验预算公式，不伪造 Excel 执行                 |
| opensource  | 源码可见与许可判断  | opensource-permission / shared-git-basics         | 许可案例分类和现有 Git 完整模拟；不连接或执行外部仓库                           |

## 复用与完成语义

`shared-api-basics` 在 web、robotics、workspace 复用；`shared-git-basics` 在 games、opensource 复用；`shared-evidence-basics` 在 ai、future 复用。源内容只维护一份，证据身份不包含学院 ID。互动和测验都通过才能完成新课；先修要求有明确原因，未满足不会授予完成。共享完成会抵扣另一条路径，但每个课程项目仍要求其全部专属与共享课时。

已有六课保留历史 quiz-only 完成语义，旧记录不会被新互动规则撤销。旧工作表、Git、逻辑门、Python、公式证据兼容读取；新项目是可导出的本机课程成果卡片，不是完整独立项目编辑器。

## 内容审查与后续范围

内容为本轮作者编写并经自动功能验证，尚未完成独立学科专家评审。每院首模块不是完整学位/认证课程；下一课建议不保证一整条进阶路线已发布。后续应均衡补齐学习切片、人工审查难度/表述、真实 Android 与辅助技术验收。GitHub Explorer、任意 Python 编辑器、云项目编辑/同步、硬件连接及实时 AI provider 验证均不在此清单的已完成承诺中。
