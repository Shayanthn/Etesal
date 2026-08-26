/**
 * 🚀 Etesal Hub Comprehensive QA Test Runner
 * Executes all modular unit and security test suites independently.
 */

import { runConfigEngineTests } from './unit/configProxyEngine.test';
import { runTelegramPublisherTests } from './unit/telegramPublisher.test';
import { runAdminSecurityTests } from './unit/adminSecurity.test';

async function main() {
  console.log('======================================================');
  console.log('🛡️ ETESAL HUB QUALITY ASSURANCE & TEST SUITE (PHASE 4)');
  console.log('======================================================\n');

  const configResults = runConfigEngineTests();
  console.log('');
  const tgResults = runTelegramPublisherTests();
  console.log('');
  const secResults = await runAdminSecurityTests();
  console.log('');

  const totalPassed = configResults.passed + tgResults.passed + secResults.passed;
  const totalFailed = configResults.failed + tgResults.failed + secResults.failed;

  console.log('======================================================');
  console.log(`📊 FINAL QA SUMMARY:`);
  console.log(`   🟢 PASSED: ${totalPassed}`);
  console.log(`   🔴 FAILED: ${totalFailed}`);
  console.log('======================================================');

  if (totalFailed > 0) {
    console.error('❌ QA Test Runner encountered failures.');
    process.exit(1);
  } else {
    console.log('✅ ALL QA AND SECURITY TEST SUITES PASSED 100%!');
    process.exit(0);
  }
}

main().catch(err => {
  console.error('Fatal Test Runner Error:', err);
  process.exit(1);
});
