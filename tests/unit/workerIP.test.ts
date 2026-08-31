import fs from 'fs';
import ts from 'typescript';

const code = fs.readFileSync('workflows/cloudflare-worker/validator-worker.ts', 'utf-8');
const isPrivateIPStr = code.substring(code.indexOf('function isPrivateIP'), code.indexOf('function resolveAndValidateTarget'));
const transpiled = ts.transpileModule(isPrivateIPStr, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
eval(transpiled + '\n\nconsole.log("::127.0.0.1 ->", isPrivateIP("::127.0.0.1"));\nconsole.log("198.18.0.1 ->", isPrivateIP("198.18.0.1"));\n');
