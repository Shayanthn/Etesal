/**
 * 🧪 Test Suite: Config & MTProto Parsing Engine (configProxyEngine)
 * Independent Quality Assurance Spec for Node Parsing & Protocol Validation
 */

import { detectCountryFromText, detectOperatorFromNode } from '../../src/utils/configProxyEngine';

export function runConfigEngineTests(): { passed: number; failed: number; errors: string[] } {
  let passed = 0;
  let failed = 0;
  const errors: string[] = [];

  function assert(condition: boolean, testName: string) {
    if (condition) {
      passed++;
      console.log(`  ✅ PASS: ${testName}`);
    } else {
      failed++;
      errors.push(`Assertion failed: ${testName}`);
      console.error(`  ❌ FAIL: ${testName}`);
    }
  }

  console.log('🧪 Starting Config Engine Tests...');

  // Test 1: Country detection from German keywords
  const deResult = detectCountryFromText('vless://uuid@fra-node.de:443', 'fra-node.de');
  assert(deResult.flag === '🇩🇪' && deResult.name.includes('آلمان'), 'Country parser correctly identifies Germany (DE)');

  // Test 2: Country detection from Finland keywords
  const fiResult = detectCountryFromText('vless-helsinki-cloud', 'hel1.server.fi');
  assert(fiResult.flag === '🇫🇮' && fiResult.name.includes('فنلاند'), 'Country parser correctly identifies Finland (FI)');

  // Test 3: Operator detection for Hysteria 2 (Irancell optimization)
  const hy2Op = detectOperatorFromNode('hysteria2', 443, 'udp', 'quic', 'hy2://auth@host:443');
  assert(hy2Op === 'irancell', 'Operator detection selects Irancell for Hysteria 2 UDP');

  // Test 4: Operator detection for MCI hashtag
  const mciOp = detectOperatorFromNode('vless', 443, 'tcp', 'reality', 'vless://uuid@host:443#همراه_اول_مخصوص');
  assert(mciOp === 'mci', 'Operator detection honors explicit #همراه_اول hashtag');

  // Test 5: Fallback country for unknown international node
  const unknownResult = detectCountryFromText('random-node-unmapped', '1.1.1.1');
  assert(unknownResult.flag === '⚡', 'Country parser returns fallback for unknown node');

  return { passed, failed, errors };
}
