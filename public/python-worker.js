/* global importScripts, loadPyodide, postMessage, self, URL, fetch */
let runtime;
let programs;
onmessage = async ({ data }) => {
  try {
    if (data.type === "init") {
      const indexURL = new URL("vendor/pyodide/", self.location.href).href;
      const response = await fetch(
        new URL("python-programs.json", self.location.href),
      );
      if (!response.ok) throw Error("Python program data unavailable");
      programs = await response.json();
      importScripts(new URL("pyodide.js", indexURL).href);
      runtime = await loadPyodide({ indexURL });
      postMessage({ type: "ready" });
      return;
    }
    if (!runtime) throw Error("运行时尚未加载");
    const value = Number(data.input);
    if (!Number.isInteger(value) || value < 0 || value > 1000)
      throw Error("输入必须是 0–1000 的整数");
    if (!Object.hasOwn(programs, data.sampleId)) throw Error("未知示例");
    let output = "";
    runtime.setStdout({
      batched: (line) => {
        output = (output + line + "\n").slice(0, 10000);
      },
    });
    runtime.setStderr({
      batched: (line) => {
        output = (output + line + "\n").slice(0, 10000);
      },
    });
    await runtime.runPythonAsync(
      programs[data.sampleId].replaceAll("INPUT", String(value)),
    );
    postMessage({ type: "result", output: output.trim() });
  } catch (error) {
    postMessage({
      type: "error",
      message: error instanceof Error ? error.message : "Python 运行失败",
    });
  }
};
