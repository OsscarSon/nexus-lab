import { pythonSamples } from "../content/python.ts";
/* global console */
import { mkdir, copyFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
const require = createRequire(import.meta.url);
const source = dirname(require.resolve("pyodide/package.json"));
await mkdir("public/vendor/pyodide", { recursive: true });
for (const file of [
  "pyodide.js",
  "pyodide.asm.js",
  "pyodide.asm.wasm",
  "python_stdlib.zip",
  "pyodide-lock.json",
])
  await copyFile(join(source, file), join("public/vendor/pyodide", file));
await writeFile(
  "public/python-programs.json",
  JSON.stringify(
    Object.fromEntries(
      pythonSamples.map((sample) => [sample.id, sample.source]),
    ),
  ),
);
console.log(
  "Prepared pinned, local Pyodide 0.29.3 runtime assets and canonical programs.",
);
