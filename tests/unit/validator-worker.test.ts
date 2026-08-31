import fs from 'fs';
import ts from 'typescript';

const code = fs.readFileSync('workflows/cloudflare-worker/validator-worker.ts', 'utf-8');
const isPrivateIPStr = code.substring(code.indexOf('function isPrivateIP'), code.indexOf('function resolveAndValidateTarget'));
const transpiled = ts.transpileModule(isPrivateIPStr, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;

const runTests = () => {
  let failed = 0;
  eval(transpiled + `
    const tests = [
      { ip: "::127.0.0.1", expected: true },
      { ip: "198.18.0.1", expected: true },
      { ip: "::ffff:7f00:1", expected: true },
      { ip: "::ffff:c612:0001", expected: true },
      { ip: "0:0:0:0:0:ffff:127.0.0.1", expected: true },
      { ip: "8.8.8.8", expected: false },
      { ip: "2001:4860:4860::8888", expected: false }
    ];
    for (const t of tests) {
      const res = isPrivateIP(t.ip);
      if (res !== t.expected) {
        console.error("FAIL: " + t.ip + " expected " + t.expected + " got " + res);
        failed++;
      } else {
        console.log("PASS: " + t.ip);
      }
    }
  `);
  return failed;
}

if (runTests() > 0) process.exit(1);
