# Curriculum Quality Checklist — Phase 5.5

评审日期：2026-11-13。内部评审由本次实施者完成，包含内容检查、确定性模型测试、桌面/Pixel 7 Chromium 实际操作与截图审阅；不等于独立专家认证、真实初学者研究或实体手机验收。评分仅覆盖入门模块，不能用来宣传十套完整学院课程已经完成。

## 评分与发布门槛

六项各 0–5 分，总分至少 25/30，且每项至少 4/5。0=缺失，1=占位或严重错误，2=关键环节欠缺，3=可试学但仍有明确缺口，4=满足声明范围且有证据，5=在范围内还具备充分边界/故障验证。

| 项目 | 4 分所需证据 | 5 分额外要求 |
| --- | --- | --- |
| Accuracy | 概念正确、术语解释、范围限制、可追溯来源；计算与规则可验证 | 独立专业审查或多来源差异审查 |
| Pedagogy | 目标、先修、生活例子、操作步骤、独立任务、后续方向 | 真实初学者学习成效与修订证据 |
| Meaningful Interactivity | 改变输入产生规则一致的结果，操作服务学习目标 | 多种探索策略与迁移任务的深入模型 |
| UI/UX | 桌面/手机布局实测、清晰层次、无溢出、键盘与标签、自动可访问性检查、截图审阅 | 真实辅助技术与可用性研究 |
| Assessment & Feedback | 正反用例、具体纠错、实践与检查题共同授予新课证据、可重练 | 多情境迁移与可靠误区诊断 |
| Reliability | 运行、保存/重载与故障反馈 | 声明范围模型边界、旧功能回归、迁移/存储失败、共享证据及桌面/手机、生产/静态流程均验证 |

`quality.state` 是正式课程质量发布状态；旧引擎 `status` 保留其“技术上可访问/可校验”的兼容语义，允许历史课程继续试学，不能据此宣称正式发布。所有课程展示页面读取质量状态；没有质量评审默认显示 In Development。`packages/curriculum/registry.ts` 拒绝分数不达门槛却声明 quality.state=published 的课程。评分与范围存于 `content/quality.ts`。

## 十学院逐项结果

分数顺序：Accuracy / Pedagogy / Meaningful Interactivity / UI/UX / Assessment & Feedback / Reliability。

| 学院 | 当前主入门模块（课程 ID）与操作证据 | 六项分数 | 总分 | 状态 |
| --- | --- | --- | --- | --- |
| Programming | `course.programming-starter`：真实 Pyodide 变量运行与输出验证、表达式预测；循环/函数实验继续可用 | 4 / 4 / 4 / 4 / 4 / 5 | 25 | Published，仅入门范围 |
| AI | `course.ai-starter`：观察/解释/预测分类、任务/读者/约束编辑和预览 | 4 / 4 / 3 / 4 / 3 / 5 | 23 | In Development，可试学 |
| Game Development | `course.games-quality`：2D 步进、速度、路径金币碰撞、墙边界、计分、重置及共享 Git 实验 | 4 / 4 / 4 / 4 / 4 / 5 | 25 | Published，仅入门范围 |
| Computer Engineering | `course.engineering-quality`：四位二进制 10→5 独立挑战、AND 四行真值表和输入演示 | 4 / 4 / 4 / 4 / 4 / 5 | 25 | Published，仅入门范围 |
| Web & Cloud | `course.web-quality`：受限 h1/p/button 结构编辑即时预览、HTTP 方法/路径报文；明确不联网、不执行脚本 | 4 / 4 / 4 / 4 / 4 / 5 | 25 | Published，仅入门范围 |
| Cybersecurity | `course.security-starter`：只读温度任务的最小权限配置，拒绝多授写入/管理员权限 | 4 / 4 / 4 / 4 / 4 / 5 | 25 | Published，仅入门范围 |
| Robotics & IoT | `course.robotics-starter`：滑块传感器、阈值判断/风扇状态预测、共享 API 报文；无实体硬件 | 4 / 4 / 4 / 4 / 4 / 5 | 25 | Published，仅入门范围 |
| Future Technology | `course.future-quality`：2 Hz 波形的 3/4/8 Hz 采样比较、临界相位信息损失、证据分类与模型预测 | 4 / 4 / 4 / 4 / 4 / 5 | 25 | Published，仅入门范围 |
| Workspace | `course.workspace-starter`：真实公式解释器、改变预算数据、多组输入验算与 API 报文 | 4 / 4 / 4 / 4 / 4 / 5 | 25 | Published，仅入门范围 |
| Open Source | `course.opensource-starter`：许可条款分类、真实可操作的 Git 分支/暂存/提交模拟；仓库角色示例保留 | 4 / 4 / 4 / 4 / 4 / 5 | 25 | Published，仅入门范围 |

AI 扣分依据：规则只能检查关键字与结构，不能判断提示语义充分性，也没有模型输出比较、事实核对实践。不能以结构检查通过冒充真实 AI 质量。先补可独立验证的语义/输出评价任务，再复审；不要求学生 API key，也不伪造模型回复。

保留课程：原 `course.opensource-literacy` M01 六课为 21/30（4/3/2/4/3/5），多数课时仍缺独立操作。原 games/engineering/web/future 的 `*-starter` 四个短模块为 22/30（4/3/3/4/3/5），学科实践深度不足，均保持 In Development；旧链接与证据继续可用。新增四个 `*-quality` 课程/模块/路径/项目使用新身份，不向旧 v1 模块悄悄追加必修要求，不撤销旧项目完成记录。

## 来源与许可证

中文解释、步骤、挑战、状态模型和 SVG 图形为本项目原创。各课 reference 列出所用概念资料：Python 官方教程、Git Book、OpenAI Prompt 文档、MDN HTML/HTTP/游戏文档、Nand2Tetris 布尔逻辑、OWASP 授权指南、Arduino 传感输入、Analog Devices 采样教材、Microsoft SUM 文档和 Open Source Definition。

没有复制上述网站的正文、图片或示例素材；链接不表示取得其商标或内容的再许可。既有软件资源的许可证保持不变，Pyodide/CPython 等仍随资产分发，见 THIRD_PARTY_NOTICES。课程引用原始资料不是“外部专家已审核”的证明。

## 测试、截图与限制

- `tests/quality.test.ts`：发布双门槛、原身份保留、新课先修/来源、运动重放、16 种二进制位型、危险/不支持标记拒绝、临界采样与比较记录。
- 原 Phase 5 图/证据/API 测试继续覆盖循环/悬空/版本、硬先修、旧 JSON/v1/损坏与未知记录的无损保留、SQLite 事务备份、租户隔离与服务端重验；新增内容复用相同证据契约。
- `tests/e2e/quality.spec.ts`：逐学院实际完成主入门模块各课，记录介绍/互动/反馈，检查正误反馈、实践门槛、重载与唯一课时证据；桌面/手机自动 WCAG A/AA 和无横向溢出检查。
- `tests/pages/quality.spec.ts`：复用同一旅程，实际运行于 `/nexus-lab/#/...`；不能用 Vite 开发模式测试替代静态验证。
- 原课程、工作表、Git/逻辑门、三个真实 Python 样例、公式、账号同步、Mentor 回退及 UI V2 回归继续运行。最终数量与执行状态见 CURRENT_STATUS。

截图：每个学院 × desktop/mobile × introduction/interaction/feedback，共 60 张最终开发模式 PNG；静态测试另有一组。最终 Playwright 原图与附件位于 `test-results/quality-final/quality-*`、`test-results/pages-quality-final/quality-*`，交付副本与索引位于 `/workspace/artifacts/phase-5.5/`。不把早期 main 探索版本截图计作最终证据；截图只有测试学习数据，无真实凭据。

未完成：十学院进阶/高阶完整课程、AI 真实结果比较、旧 M01 每课实践、自由代码编辑/导入、完整 HTML/CSS/JS 编辑器与云部署、实体硬件/真实网络安全操作、连续时间游戏物理、信号重建、完整 Excel、独立云作品编辑/同步、外部学科和真实初学者/设备评审。
