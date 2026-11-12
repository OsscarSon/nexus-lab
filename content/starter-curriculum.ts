import {
  ref,
  type Catalog,
  type Interaction,
} from "../packages/curriculum/schema";
type Seed = {
  id: string;
  title: string;
  summary: string;
  objective: string;
  heading: string;
  body: string;
  example: string;
  block: Interaction;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  hint: string;
  topics: string[];
  next: string;
};
const seeds: Seed[] = [
  {
    id: "shared-python-variables",
    title: "真正运行：Python 变量与输出",
    summary: "变量保存数值，让 Python 计算两倍。",
    objective: "用真实运行结果验证变量与表达式。",
    heading: "变量是可以命名的值",
    body: "变量像贴上标签的盒子：number = 7 把数值 7 绑定到名字 number。number * 2 是表达式，print 把计算结果写到输出。预测不是执行证据，本课要求在真实浏览器 Python 运行时完成变量示例，再检查保存的输出。精选程序只接收有限整数，不安装任意包。",
    example:
      "在 Python 微课程选择「变量与表达式」，输入 7 并运行。真实 CPython 应输出 14；换成 8 时输出 16，但本课挑战要求保存输入 7 的结果。",
    block: {
      kind: "lab-evidence",
      id: "exercise.python-variables",
      labRef: ref("lab", "lab.python-variables"),
    },
    question: "看到正确预测后，怎样确认程序真的运行过？",
    options: ["把预测写成运行成功", "运行程序并检查实际输出", "只看按钮的颜色"],
    correct: 1,
    explanation: "预测与运行是两种证据。需要实际运行时返回的输出。",
    hint: "打开真实 Python 实验，完成指定输入，然后返回验证记录。",
    topics: ["topic.python"],
    next: "programming-expressions",
  },
  {
    id: "shared-git-basics",
    title: "共享基础：工作区、暂存与提交",
    summary: "用安全的 Git 模拟理解三个不同快照。",
    objective: "在独立分支完成一次修改、暂存和提交。",
    heading: "修改不会自动成为提交",
    body: "工作区是正在编辑的文件；暂存区是准备提交的快照；提交是历史中的一次保存。暂存之后继续编辑，新的改动不会自动进入先前快照。在独立分支练习可以把一项工作与 main 区分。这里的 Git 是教学模拟，不会操作真实仓库或 GitHub 账户。",
    example:
      "创建 feature 分支，把 Hello open source 写入 README，执行 git add，再写说明并 git commit。查看提交历史中的内容是否是暂存时的快照。",
    block: {
      kind: "lab-evidence",
      id: "exercise.git-staging",
      labRef: ref("lab", "lab.git"),
    },
    question: "暂存后又修改 README，直接提交会保存什么？",
    options: ["最后一次暂存的快照", "所有之后的改动", "整个互联网的文件"],
    correct: 0,
    explanation: "提交保存暂存区的内容，新的工作区改动需要再次暂存。",
    hint: "在完整 Git 模拟里完成非 main 分支挑战，返回本课验证。",
    topics: ["topic.git", "topic.github"],
    next: "shared-api-basics",
  },
  {
    id: "shared-api-basics",
    title: "共享基础：API 请求的三个部分",
    summary: "读懂方法、路径和响应约定。",
    objective: "为读取状态构造正确的 GET 请求。",
    heading: "像一张写清楚需求的便条",
    body: "API 是程序之间的约定。请求方法说明想做什么，路径说明访问哪个资源，响应报告结果。GET 通常用于读取，POST 常用于提交数据。返回码也属于约定：200 一般表示成功，404 表示资源未找到。本练习只构造本地报文，不会向外部 API 发送请求，也不会假造响应。",
    example:
      "读取状态可以写 GET /status HTTP/1.1。它表达「读取状态资源」，不是「删除设备」。真实服务是否支持这个路径，需要查其文档。",
    block: {
      kind: "request",
      id: "exercise.shared-api",
      method: "GET",
      path: "/status",
    },
    question: "只想读取资源，应该优先选哪种方法？",
    options: ["DELETE", "GET", "把密码放进路径"],
    correct: 1,
    explanation: "GET 表达读取意图；实际权限与行为还需由服务端校验。",
    hint: "方法选 GET，资源路径写 /status。",
    topics: ["topic.apis"],
    next: "shared-evidence-basics",
  },
  {
    id: "shared-evidence-basics",
    title: "共享基础：观察、解释与预测",
    summary: "把看到的事实和推断分开。",
    objective: "区分直接观察、可能解释与未来预测。",
    heading: "先问：这句话的证据是什么？",
    body: "观察描述测量或实际发生的事；解释尝试说明原因；预测描述尚未验证的未来结果。解释和预测可以很有用，但不能改名为已经测到的事实。评估 AI、机器人和新技术时，先记录测试条件与原始结果，再讨论原因和下一次实验。",
    example:
      "教学数据：温度计显示 32°C 是观察；「可能因为通风不足」是解释；「明天会降温」是预测。分类依据是证据类型，不是说话者的自信程度。",
    block: {
      kind: "classification",
      id: "exercise.evidence",
      instructions: "把教学情景中的三句话按证据类型分类。",
      categories: ["观察", "解释", "预测"],
      claims: [
        { text: "温度计显示 32°C。", category: "观察" },
        { text: "可能是通风不足导致升温。", category: "解释" },
        { text: "明天同一时间会降温。", category: "预测" },
      ],
    },
    question: "模型给出的一个未来结果，未经实验应称为什么？",
    options: ["已经测得的事实", "必然成立的证明", "待验证的预测"],
    correct: 2,
    explanation: "模型输出可以构成预测，需要后续实验验证。",
    hint: "测量是观察，可能原因是解释，尚未发生的是预测。",
    topics: ["topic.evidence"],
    next: "future-models",
  },
  {
    id: "programming-expressions",
    title: "变量、表达式与可预测的输出",
    summary: "拆开一个简单计算，区分输入与结果。",
    objective: "预测由变量组成的乘法表达式结果。",
    heading: "先追踪值，再计算",
    body: "程序按明确规则处理输入。把 number 设为 7，再计算 number * 2，结果是 14；名字本身不会改变运算。初学时可以先用纸笔预测，再到真实运行时核对。下面是算术预测检查，不声称执行 Python；上一节的 Pyodide 才提供实际 Python 输出。",
    example:
      "教学表达式：number = 7；result = number * 2。先把 number 替换为它保存的值，得到 7 * 2，再算结果。",
    block: {
      kind: "numeric",
      id: "exercise.expression",
      label: "number = 7，result = number * 2。你预测 result 是多少？",
      left: 7,
      right: 2,
      operator: "*",
    },
    question: "变量 number 从 7 改成 8，number * 2 的值是什么？",
    options: ["14", "16", "number2"],
    correct: 1,
    explanation: "变量的新值参与表达式计算，8 × 2 = 16。",
    hint: "先用数值替换变量名，再做乘法。",
    topics: ["topic.python"],
    next: "shared-api-basics",
  },
  {
    id: "ai-prompt-structure",
    title: "给 AI 一条可以验证的任务",
    summary: "明确目标、读者与输出约束，不盲信生成结果。",
    objective: "组合可检查的提示结构并说明验证方法。",
    heading: "把模糊愿望变成明确约束",
    body: "「帮我写一下」缺少目标与读者。更清楚的请求会说明要做什么、给谁看、输出怎样的形式。结构明确不保证 AI 事实正确，仍要核对来源或实际结果。本课只检查你填写的提示结构，不调用模型，也不会提供伪装成 AI 的生成回答。",
    example:
      "请总结这段活动通知，面向小学生，用三句话说明时间、地点和准备事项。之后把总结与原通知逐项核对。",
    block: {
      kind: "prompt",
      id: "exercise.prompt",
      task: "总结",
      audience: "小学生",
      constraint: "三句话",
    },
    question: "提示写得清楚，是否就能不检查 AI 的事实？",
    options: [
      "不能，仍需核对来源与结果",
      "可以，格式正确代表事实正确",
      "只要回答很长就可信",
    ],
    correct: 0,
    explanation: "结构约束帮助表达任务，事实准确性仍需独立验证。",
    hint: "任务包含「总结」，读者写「小学生」，输出约束包含「三句话」。",
    topics: ["topic.evidence"],
    next: "shared-python-variables",
  },
  {
    id: "games-score",
    title: "游戏规则：输入、分数与胜利",
    summary: "亲手改变游戏状态，检查胜利条件。",
    objective: "用明确状态和阈值描述一个最小游戏规则。",
    heading: "游戏也需要可验证的规则",
    body: "最小互动循环包含输入、状态变化和反馈。点击收集使分数加一，显示分数让玩家知道发生了什么。当分数至少为 3 时满足胜利条件。用「至少」而非「恰好」可以避免越过阈值后意外失去胜利。本地规则模型没有引入大型游戏引擎。",
    example:
      "初始 score = 0。三次收集后依次为 1、2、3；score >= 3 成立。重置应回到 0，而不是只改变屏幕文字。",
    block: { kind: "game", id: "exercise.game", target: 3 },
    question: "胜利条件是 score >= 3，分数为 4 时呢？",
    options: ["仍然满足胜利条件", "必须判负", "分数自动变成零"],
    correct: 0,
    explanation: "4 大于等于 3，仍满足「至少三分」的条件。",
    hint: "收集到至少三分后，检查当前规则是否满足。",
    topics: ["topic.state"],
    next: "shared-git-basics",
  },
  {
    id: "engineering-and",
    title: "从 AND 门看懂数字逻辑",
    summary: "从两个输入，推导四行真值表。",
    objective: "准确预测 AND 在所有二进制输入下的结果。",
    heading: "两个条件都成立",
    body: "数字逻辑使用 0 和 1 表示两种状态。AND 要求两个输入都为 1，输出才为 1。真值表枚举全部输入组合，因此比只看一个例子更完整。这里调用与已有逻辑门实验相同的布尔函数，不连接真实电路板。",
    example:
      "把 A 看成「门已关好」，B 看成「安全开关已开」。只有 A=1 且 B=1 时，AND 输出 1；这是逻辑教学类比，不是实际安全设备设计。",
    block: { kind: "logic", id: "exercise.and", gate: "AND" },
    question: "A=1、B=0，AND 输出是什么？",
    options: ["1", "0", "无法用真值表判断"],
    correct: 1,
    explanation: "AND 要求两者都是 1，因此输出为 0。",
    hint: "00、01、10 的输出都是 0，只有 11 输出 1。",
    topics: ["topic.logic"],
    next: "shared-python-variables",
  },
  {
    id: "web-request",
    title: "网页如何表达一次读取请求",
    summary: "把网址资源与 HTTP 方法联系起来。",
    objective: "为读取天气资源构造不带秘密的请求报文。",
    heading: "先分清读取与修改",
    body: "浏览器和服务端通过请求协作。GET /weather 表达读取天气资源的意图，POST 则可能用于提交内容。URL 路径不是放密码的位置；真实鉴权通常通过专门机制完成。下面生成的是本地教学报文，不联网，不提供伪造的天气数据。",
    example:
      "GET /weather HTTP/1.1 描述方法、路径和协议版本。它本身不证明服务器存在，也不证明返回一定成功；还需要检查真实响应。",
    block: {
      kind: "request",
      id: "exercise.web-request",
      method: "GET",
      path: "/weather",
    },
    question: "看到本地构造的 GET 报文，可以声称真实 API 已成功吗？",
    options: [
      "可以，报文有 HTTP 字样",
      "不能，需要实际服务响应",
      "可以把任意文字当响应",
    ],
    correct: 1,
    explanation: "构造请求与真正发出并收到响应是不同的步骤。",
    hint: "选 GET 并填写 /weather；本练习不会发出网络请求。",
    topics: ["topic.apis", "topic.cloud-deployment"],
    next: "shared-api-basics",
  },
  {
    id: "security-permissions",
    title: "最小权限：只给任务需要的能力",
    summary: "在安全的权限模型中避免过度授权。",
    objective: "为只读温度任务选择最小必需权限。",
    heading: "能少给，就不要多给",
    body: "权限决定账户或程序能做哪些事。只读取温度数据不需要修改设备，也不需要管理员权限。最小权限可以减少误操作或泄露后的影响；它不等于系统已经绝对安全。所有练习限定在本地模型，不扫描网络、不修改真实账户，不要求提交密码。",
    example:
      "仪表盘只显示温度，给 read:temperature 即可。write:device 可以改变设备，admin:all 则过于宽泛，都超出这个任务。",
    block: {
      kind: "permissions",
      id: "exercise.permissions",
      options: ["read:temperature", "write:device", "admin:all"],
      expected: ["read:temperature"],
    },
    question: "只读任务遇到要求管理员密码的陌生脚本，应该怎样？",
    options: [
      "直接粘贴密码",
      "先核实用途和授权，避免授予多余权限",
      "关闭所有验证继续",
    ],
    correct: 1,
    explanation: "先核实来源、用途和必要权限，不把秘密交给未知程序。",
    hint: "只选择 read:temperature，不选择写入或管理员权限。",
    topics: ["topic.permissions"],
    next: "shared-evidence-basics",
  },
  {
    id: "robotics-threshold",
    title: "从传感到控制：温度与风扇",
    summary: "把测量、条件与动作连成一个小系统。",
    objective: "根据阈值预测执行器动作并区分教学模型与硬件。",
    heading: "感知、判断、行动",
    body: "传感器测量环境，控制规则作出判断，执行器改变世界。本例用温度阈值决定风扇开关：温度达到 30°C 时开启。拖动下面的温度可以观察逻辑结果，但没有真实温度传感器或风扇接入，不能把屏幕状态称为硬件执行。",
    example:
      "教学输入 32°C，阈值 30°C。32 >= 30 为真，所以模型开启风扇。实际硬件还需要考虑校准、故障与抖动等条件。",
    block: {
      kind: "sensor",
      id: "exercise.sensor",
      temperature: 32,
      threshold: 30,
    },
    question: "在这个系统里，哪个部件负责测量温度？",
    options: ["风扇执行器", "温度传感器", "课程进度条"],
    correct: 1,
    explanation: "温度传感器负责感知；风扇是执行器。",
    hint: "挑战温度高于阈值，模型应开启风扇。",
    topics: ["topic.control"],
    next: "shared-api-basics",
  },
  {
    id: "future-models",
    title: "技术预测：模型不是实测",
    summary: "用简单计算检验一个关于未来的假设。",
    objective: "计算模型预测并说明它与实际证据的区别。",
    heading: "可计算，不代表已发生",
    body: "新技术讨论经常包含增长假设。例如假设下一代处理能力是现在的两倍，就能计算一个预测。但假设可能不成立；真实设备需要在相同条件下测量。数字看起来精确，也不能把预测包装为已经验证的性能或保证。",
    example:
      "虚构教学数据：当前每秒处理 8 个任务，按「乘二」假设预测为 16。即使算术正确，仍不能声称一台尚未测试的设备实际达到 16。",
    block: {
      kind: "numeric",
      id: "exercise.forecast",
      label:
        "在乘二模型下，8 个任务/秒对应的预测是多少？这是模型计算，不是硬件实测。",
      left: 8,
      right: 2,
      operator: "*",
    },
    question: "得到预测 16 后，下一步最合理的做法？",
    options: [
      "直接宣传为实测纪录",
      "设计同条件测试，记录真实结果",
      "把所有不同结果删掉",
    ],
    correct: 1,
    explanation: "预测需要可重复的实际测试来验证，不能删除不符合预期的证据。",
    hint: "8 × 2 = 16；算术结果仍然只是这个假设下的预测。",
    topics: ["topic.evidence", "topic.models"],
    next: "shared-python-variables",
  },
  {
    id: "workspace-budget",
    title: "活动预算：让公式随输入变化",
    summary: "用引用和求和计算预算，而不是写死答案。",
    objective: "编写适用于不同金额的预算公式。",
    heading: "公式描述关系，不只是结果",
    body: "单元格引用让公式跟随输入变化。B2 是材料费，B3 是场地费，=SUM(B2:B3) 或 =B2+B3 都表达两项费用求和。直接写 =30 只匹配一组数值，换预算就失效。这里使用已有的本地公式解释器，不是 Excel，也不连接 Google 账户。",
    example:
      "B2=12，B3=18 时合计 30；改为 3 和 8 时合计 11。一个合格的公式需要在这些不同输入下仍然成立。",
    block: {
      kind: "formula",
      id: "exercise.budget",
      description:
        "输入一条把 B2 与 B3 相加的公式。检查器会使用三组金额验证，不接受把 30 写死。",
    },
    question: "为什么 =B2+B3 比 =30 更适合这个任务？",
    options: [
      "因为公式更长",
      "它表达输入之间的关系，能随金额变化",
      "因为永远不会有错误输入",
    ],
    correct: 1,
    explanation:
      "引用和运算描述关系，输入改变时结果可以重新计算；仍需检查输入与错误。",
    hint: "试试 =SUM(B2:B3) 或 =B2+B3。",
    topics: ["topic.spreadsheets", "topic.apis"],
    next: "shared-api-basics",
  },
  {
    id: "opensource-permission",
    title: "看见源码，还要看见授权",
    summary: "把公开可见、用途限制与开源许可分清。",
    objective: "按权限条款分类并保留正确来源。",
    heading: "能打开，不等于能随便复制",
    body: "免费描述价格，源码可见描述访问，开源许可描述具体权利。公开仓库没有许可证时，不能假设获得复制和分发权。复用 MIT 代码也应保留要求的版权与许可声明。下面是教学分类，不是针对具体项目的法律意见；实际项目需阅读完整条款。",
    example:
      "MIT 授权通常允许使用、修改和再分发并要求保留声明；「禁止商业使用」有用途限制；没有许可时授权不明确。三者不能都叫开源。",
    block: {
      kind: "classification",
      id: "exercise.license",
      instructions:
        "按已提供的教学条款分类，不根据价格或仓库是否公开推断授权。",
      categories: ["开源许可", "源码可见，有用途限制", "授权不明确"],
      claims: [
        { text: "MIT：允许使用、修改、分发，保留声明。", category: "开源许可" },
        {
          text: "公开源码，但禁止商业使用。",
          category: "源码可见，有用途限制",
        },
        { text: "公开仓库，没有许可证。", category: "授权不明确" },
      ],
    },
    question: "复用 MIT 代码时更合适的做法是？",
    options: [
      "删除原版权和许可",
      "保留所需声明，并核对其他资产的许可",
      "认为所有网上图片都自动适用 MIT",
    ],
    correct: 1,
    explanation: "应遵守实际许可证要求，代码、图片等资产需分别核实。",
    hint: "允许使用/修改/分发的许可、用途限制和没有授权是三种不同情况。",
    topics: ["topic.licenses", "topic.github"],
    next: "shared-git-basics",
  },
];
const starters = [
  [
    "programming",
    "Python 变量与表达式",
    ["shared-python-variables", "programming-expressions"],
  ],
  [
    "ai",
    "提示结构与结果验证",
    ["shared-evidence-basics", "ai-prompt-structure"],
  ],
  ["games", "游戏规则与计分", ["games-score", "shared-git-basics"]],
  ["engineering", "AND 与真值表", ["engineering-and"]],
  ["web", "HTTP 请求入门", ["web-request", "shared-api-basics"]],
  ["security", "最小权限入门", ["security-permissions"]],
  ["robotics", "传感、阈值与控制", ["robotics-threshold", "shared-api-basics"]],
  ["future", "预测、模型与实测", ["shared-evidence-basics", "future-models"]],
  [
    "workspace",
    "预算公式与数据接口",
    ["workspace-budget", "shared-api-basics"],
  ],
  [
    "opensource",
    "源码可见与许可判断",
    ["opensource-permission", "shared-git-basics"],
  ],
] as const;
export const starterInventory = starters.map(
  ([academyId, title, lessonIds]) => ({
    academyId,
    title,
    courseId: "course." + academyId + "-starter",
    moduleId: "module." + academyId + "-starter",
    pathId: "path." + academyId,
    lessonIds: [...lessonIds],
  }),
);
export function addStarterCurriculum(base: Catalog): Catalog {
  const catalog = structuredClone(base);
  const add = (kind: string, id: string, title: string, extra: object) =>
    catalog.entities.push({
      kind,
      id,
      title,
      version: 1,
      status: "available",
      ...extra,
    } as Catalog["entities"][number]);
  for (const [id, title] of [
    ["topic.state", "状态与规则"],
    ["topic.logic", "数字逻辑"],
    ["topic.permissions", "最小权限"],
    ["topic.control", "感知与控制"],
    ["topic.models", "预测模型"],
    ["topic.spreadsheets", "表格与公式"],
  ])
    add("topic", id, title, {
      outcomes: ["用可验证练习理解" + title],
      resourceRefs: [],
    });
  for (const seed of seeds) {
    add("assessment", "assessment." + seed.id, seed.title + "检查题", {
      question: seed.question,
      options: seed.options,
      correct: seed.correct,
      explanation: seed.explanation,
    });
    add("lesson", seed.id, seed.title, {
      objectives: [seed.objective],
      summary: seed.summary,
      segments: [{ heading: seed.heading, body: seed.body }],
      example: seed.example,
      estimatedMinutes: seed.block.kind === "lab-evidence" ? 10 : 5,
      topicRefs: seed.topics.map((id) => ref("topic", id)),
      assessmentRefs: [ref("assessment", "assessment." + seed.id)],
      blocks: [seed.block],
      requiresExercise: true,
      legacyCompatible: false,
      hints: [seed.hint],
      references: seed.topics.includes("topic.licenses")
        ? [
            {
              title: "Open Source Definition",
              url: "https://opensource.org/osd",
            },
          ]
        : seed.topics.includes("topic.python")
          ? [
              {
                title: "Python Tutorial",
                url: "https://docs.python.org/3/tutorial/",
              },
            ]
          : seed.topics.includes("topic.apis")
            ? [
                {
                  title: "MDN HTTP overview",
                  url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview",
                },
              ]
            : [],
      nextRefs: [ref("lesson", seed.next)],
    });
  }
  for (const item of starterInventory) {
    const lessons = item.lessonIds.map((id) => ref("lesson", id));
    const projectId = "project." + item.academyId + "-starter";
    add("module", item.moduleId, item.title, {
      outcomes: item.lessonIds.map(
        (id) => seeds.find((s) => s.id === id)!.objective,
      ),
      lessonRefs: lessons,
      assessmentRefs: [],
    });
    const course = catalog.entities.find(
      (e) => e.kind === "course" && e.id === item.courseId,
    )!;
    if (course.kind !== "course") throw Error("Missing starter course");
    course.status = "available";
    course.title = item.title;
    course.description =
      "零基础入门 · " + lessons.length + " 节真实课时、互动练习与检查题";
    course.moduleRefs = [ref("module", item.moduleId)];
    course.projectRefs = [ref("project", projectId)];
    course.outcomes = item.lessonIds.map(
      (id) => seeds.find((s) => s.id === id)!.objective,
    );
    const path = catalog.entities.find(
      (e) => e.kind === "path" && e.id === item.pathId,
    )!;
    if (path.kind !== "path") throw Error("Missing starter path");
    path.status = "available";
    path.projectRefs = [ref("project", projectId)];
    add("project", projectId, item.title + " · 入门学习证据", {
      description:
        "汇总本模块实际通过的练习和测验，不是外部认证或完整学院结业。",
      rubric: [
        "完成本模块所有必需课时",
        "每课互动检查与测验均通过",
        "共享课时只保存一份兼容证据",
      ],
      completionRefs: lessons,
    });
  }
  catalog.dependencies.push(
    {
      from: ref("lesson", "ai-prompt-structure"),
      to: ref("lesson", "shared-evidence-basics"),
      kind: "required",
      rationale: "先区分观察与预测，再设计需要验证的 AI 任务。",
    },
    {
      from: ref("lesson", "programming-expressions"),
      to: ref("lesson", "shared-python-variables"),
      kind: "recommended",
      rationale: "先看真实运行输出，有助于理解表达式预测。",
    },
    {
      from: ref("lesson", "future-models"),
      to: ref("lesson", "shared-evidence-basics"),
      kind: "required",
      rationale: "先理解证据类型，再解释模型预测。",
    },
  );
  for (const topic of catalog.entities.filter((e) => e.kind === "topic"))
    if (topic.kind === "topic")
      topic.resourceRefs = catalog.entities
        .filter(
          (e) =>
            e.kind === "lesson" && e.topicRefs.some((r) => r.id === topic.id),
        )
        .map((l) => ref("lesson", l.id));
  return catalog;
}
