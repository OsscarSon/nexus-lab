import { z } from "zod";
export const repositoryDemo = z
  .record(z.string(), z.string())
  .parse({
    "README.md": "# Hello Project\n使用说明：运行 hello.py，显示欢迎信息。",
    "hello.py": 'print("你好，开源世界")',
    LICENSE: "示例许可说明：真实项目需要检查完整授权条款。",
  });
