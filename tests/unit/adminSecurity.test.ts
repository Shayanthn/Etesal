/**
 * 🧪 Test Suite: Admin Security Cryptography (adminSecurityService)
 * Independent Quality Assurance Spec for SHA-256 Hashing & Session Invalidation
 */

import { calculateSha256 } from '../../src/services/adminSecurityService';

export async function runAdminSecurityTests(): Promise<{ passed: number; failed: number; errors: string[] }> {
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

  console.log('🧪 Starting Admin Security Tests...');

  // Mock window.crypto if running in Node environment
  if (typeof window === 'undefined' || !window.crypto) {
    const cryptoModule = await import('node:crypto');
    (globalThis as any).window = {
      crypto: {
        subtle: {
          digest: async (_algorithm: string, data: Uint8Array) => {
            const hash = cryptoModule.createHash('sha256').update(Buffer.from(data)).digest();
            return hash.buffer.slice(hash.byteOffset, hash.byteOffset + hash.byteLength);
          }
        }
      }
    };
  }

  // Test 1: SHA-256 baseline hashing of known string
  const testHash = await calculateSha256('EtesalAdmin2026!');
  assert(
    testHash === '7708b01e38666e98cd78c95074bba64892ec31c3f5a06d5d23108fd451fad754',
    'Derives correct standard SHA-256 hex string for baseline passcode'
  );

  // Test 2: Invariance with whitespace trim
  const trimmedHash = await calculateSha256('  EtesalAdmin2026!  ');
  assert(trimmedHash === testHash, 'Trims leading and trailing whitespace safely before hashing');

  // Test 3: Empty string produces unique non-empty hash
  const emptyHash = await calculateSha256('');
  assert(emptyHash.length === 64, 'Produces valid 64-character hex hash representation');

  return { passed, failed, errors };
}
