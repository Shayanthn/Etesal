/**
 * 🧪 Security & Quality Assurance Comprehensive Test Runner
 * Executes all real unit, security, and integration test suites.
 */

import { runAdminSecurityTests } from './unit/adminSecurity.test';
import { runConfigEngineTests } from './unit/configProxyEngine.test';
import { runTelegramPublisherTests } from './unit/telegramPublisher.test';
import { runWorkerSSRFTests } from './unit/workerSSRF.test';
import { runRateLimiterTests } from './unit/rateLimiter.test';

async function main() {
  console.log('====================================================');
  console.log('🛡️  ETESAL MASTER SECURITY & QUALITY TEST RUNNER');
  console.log('====================================================\n');

  let totalPassed = 0;
  let totalFailed = 0;
  const allErrors: string[] = [];

  // Suite 1: Admin Security Suite
  try {
    const res = await runAdminSecurityTests();
    totalPassed += res.passed;
    totalFailed += res.failed;
    allErrors.push(...res.errors);
  } catch (err: any) {
    totalFailed++;
    allErrors.push(`Admin Security Suite crashed: ${err.message}`);
    console.error('❌ Admin Security Suite crashed:', err);
  }

  // Suite 2: Config Engine Suite
  try {
    const res = runConfigEngineTests();
    totalPassed += res.passed;
    totalFailed += res.failed;
    allErrors.push(...res.errors);
  } catch (err: any) {
    totalFailed++;
    allErrors.push(`Config Engine Suite crashed: ${err.message}`);
    console.error('❌ Config Engine Suite crashed:', err);
  }

  // Suite 3: Telegram Publisher Suite
  try {
    const res = runTelegramPublisherTests();
    totalPassed += res.passed;
    totalFailed += res.failed;
    allErrors.push(...res.errors);
  } catch (err: any) {
    totalFailed++;
    allErrors.push(`Telegram Publisher Suite crashed: ${err.message}`);
    console.error('❌ Telegram Publisher Suite crashed:', err);
  }

  // Suite 4: SSRF Validator Worker IP Security Suite
  try {
    const res = runWorkerSSRFTests();
    totalPassed += res.passed;
    totalFailed += res.failed;
    allErrors.push(...res.errors);
  } catch (err: any) {
    totalFailed++;
    allErrors.push(`SSRF Validator Worker Suite crashed: ${err.message}`);
    console.error('❌ SSRF Validator Worker Suite crashed:', err);
  }

  // Suite 5: Cloudflare Worker Rate Limiter Suite
  try {
    const res = runRateLimiterTests();
    totalPassed += res.passed;
    totalFailed += res.failed;
    allErrors.push(...res.errors);
  } catch (err: any) {
    totalFailed++;
    allErrors.push(`Rate Limiter Suite crashed: ${err.message}`);
    console.error('❌ Rate Limiter Suite crashed:', err);
  }

  console.log('\n====================================================');
  console.log(`📊 TEST SUMMARY: ${totalPassed} Passed | ${totalFailed} Failed`);
  console.log('====================================================');

  if (totalFailed > 0) {
    console.error('\n❌ FAILURES DETECTED:');
    allErrors.forEach(e => console.error(`  - ${e}`));
    process.exit(1);
  } else {
    console.log('\n✨ ALL REAL QUALITY ASSURANCE & SECURITY TESTS PASSED WITH 100% SUCCESS!\n');
    process.exit(0);
  }
}

main().catch(err => {
  console.error('Fatal test runner failure:', err);
  process.exit(1);
});
