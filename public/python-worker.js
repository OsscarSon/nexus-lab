/* global importScripts, loadPyodide, postMessage */
let runtime;
onmessage=async({data})=>{try{if(data.type==='init'){importScripts('/vendor/pyodide/pyodide.js');runtime=await loadPyodide({indexURL:'/vendor/pyodide/'});postMessage({type:'ready'});return;}
if(!runtime)throw Error('运行时尚未加载');
const value=Number(data.input);if(!Number.isInteger(value)||value<0||value>1000)throw Error('输入必须是 0–1000 的整数');
const programs={variables:`number = ${value}\nprint(number * 2)`,loops:`total = 0\nfor number in range(1, ${value} + 1):\n    total += number\nprint(total)`,functions:`def is_even(number):\n    return number % 2 == 0\nprint(is_even(${value}))`};
if(!Object.hasOwn(programs,data.sampleId))throw Error('未知示例');
let output='';runtime.setStdout({batched:(line)=>{output=(output+line+'\n').slice(0,10000);}});runtime.setStderr({batched:(line)=>{output=(output+line+'\n').slice(0,10000);}});await runtime.runPythonAsync(programs[data.sampleId]);postMessage({type:'result',output:output.trim()});
}catch(error){postMessage({type:'error',message:error instanceof Error?error.message:'Python 运行失败'});}};
