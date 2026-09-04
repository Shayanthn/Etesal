/**
 * 🧪 Test Suite: Cloudflare Worker SSRF & IP Validation
 */

import fs from 'node:fs';
import ts from 'typescript';

export function runWorkerSSRFTests(): { passed: number; failed: number; errors: string[] } {
  console.log('\n🧪 Starting Cloudflare Worker SSRF Tests...');
  const workerCode = fs.readFileSync('workflows/cloudflare-worker/validator-worker.ts', 'utf-8');
  const funcStart = workerCode.indexOf('function isPrivateIP(');
  const funcEnd = workerCode.indexOf('\nasync function resolveAndValidateTarget');
  const isPrivateIPStr = workerCode.substring(funcStart, funcEnd).trim();
  
  const transpiled = ts.transpileModule(isPrivateIPStr, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;

  const fn = new Function(transpiled + '\nreturn isPrivateIP;');
  const isPrivateIP = fn();

  const tests = [
    { ip: "::127.0.0.1", expected: true, name: "Loopback IPv4-mapped IPv6 ::127.0.0.1" },
    { ip: "198.18.0.1", expected: true, name: "Benchmarking private 198.18.0.1" },
    { ip: "::ffff:7f00:1", expected: true, name: "Hex-encoded loopback ::ffff:7f00:1" },
    { ip: "::ffff:c612:0001", expected: true, name: "Hex-encoded 198.18 ::ffff:c612:0001" },
    { ip: "0:0:0:0:0:ffff:127.0.0.1", expected: true, name: "Full IPv4-mapped loopback" },
    { ip: "127.0.0.1", expected: true, name: "Standard loopback 127.0.0.1" },
    { ip: "10.0.0.1", expected: true, name: "RFC1918 Class A 10.0.0.1" },
    { ip: "172.16.0.1", expected: true, name: "RFC1918 Class B 172.16.0.1" },
    { ip: "192.168.1.1", expected: true, name: "RFC1918 Class C 192.168.1.1" },
    { ip: "8.8.8.8", expected: false, name: "Public DNS 8.8.8.8 allowed" },
    { ip: "1.1.1.1", expected: false, name: "Public DNS 1.1.1.1 allowed" },
    { ip: "2001:4860:4860::8888", expected: false, name: "Public IPv6 Google DNS allowed" }
  ];

  let passed = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const t of tests) {
    const res = isPrivateIP(t.ip);
    if (res === t.expected) {
      passed++;
      console.log(`  ✅ PASS: ${t.name}`);
    } else {
      failed++;
      errors.push(`SSRF check failed for ${t.ip} expected ${t.expected} got ${res}`);
      console.error(`  ❌ FAIL: ${t.name}`);
    }
  }

  return { passed, failed, errors };
}
