/**
 * 🧪 Unit Tests for In-Memory Token Bucket / Sliding Window Rate Limiter
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

export function createRateLimiter(limit: number, windowMs: number) {
  const cache = new Map<string, RateLimitEntry>();

  return {
    isRateLimited(ip: string): boolean {
      const now = Date.now();
      const existing = cache.get(ip);
      if (!existing || existing.resetAt < now) {
        cache.set(ip, { count: 1, resetAt: now + windowMs });
        return false;
      }

      if (existing.count >= limit) {
        return true;
      }

      existing.count++;
      return false;
    }
  };
}

export function runRateLimiterTests(): { passed: number; failed: number; errors: string[] } {
  console.log('🧪 Starting Rate Limiter Security Tests...');
  let passed = 0;
  let failed = 0;
  const errors: string[] = [];

  const limiter = createRateLimiter(5, 500);

  // Test 1: First 5 requests should pass
  let allFirstPassed = true;
  for (let i = 0; i < 5; i++) {
    if (limiter.isRateLimited('192.0.2.1')) {
      allFirstPassed = false;
    }
  }
  if (allFirstPassed) {
    console.log('  ✅ PASS: Allows requests within quota limit (5/5)');
    passed++;
  } else {
    console.error('  ❌ FAIL: Prematurely blocked requests within quota');
    failed++;
    errors.push('Prematurely blocked requests within quota');
  }

  // Test 2: 6th request must be blocked
  if (limiter.isRateLimited('192.0.2.1')) {
    console.log('  ✅ PASS: Strictly blocks 6th request exceeding limit (429 condition)');
    passed++;
  } else {
    console.error('  ❌ FAIL: Did not block request exceeding limit');
    failed++;
    errors.push('Did not block request exceeding limit');
  }

  // Test 3: Independent IP is not affected
  if (!limiter.isRateLimited('198.51.100.2')) {
    console.log('  ✅ PASS: Rate limit operates per IP address independently');
    passed++;
  } else {
    console.error('  ❌ FAIL: Rate limit bled into different IP address');
    failed++;
    errors.push('Rate limit bled into different IP address');
  }

  return { passed, failed, errors };
}
