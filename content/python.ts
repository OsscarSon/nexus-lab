import { z } from "zod";
export const pythonSamples = z
  .array(
    z.object({
      id: z.string(),
      title: z.string(),
      objective: z.string(),
      explanation: z.string(),
      source: z.string(),
      expected: z.string(),
      input: z.number(),
    }),
  )
  .parse([
    {
      id: "variables",
      title: "变量与表达式",
      objective: "改变输入，让 Python 计算两倍的数值。",
      explanation:
        "变量保存值。* 表示乘法；print 把结果写到输出。试试输入 7，结果应为 14。",
      source: "number = INPUT\nprint(number * 2)",
      input: 7,
      expected: "14",
    },
    {
      id: "loops",
      title: "循环与累加",
      objective: "计算从 1 到输入数字的总和。",
      explanation:
        "range(1, n + 1) 包含 1 到 n；for 对每个数执行累加。输入 5，结果应为 15。",
      source:
        "total = 0\nfor number in range(1, INPUT + 1):\n    total += number\nprint(total)",
      input: 5,
      expected: "15",
    },
    {
      id: "functions",
      title: "函数与条件",
      objective: "用函数判断一个数是否为偶数。",
      explanation:
        "def 定义函数；% 返回余数。除以 2 余数为 0，就是偶数。输入 8，结果应为 True。",
      source:
        "def is_even(number):\n    return number % 2 == 0\n\nprint(is_even(INPUT))",
      input: 8,
      expected: "True",
    },
  ]);
