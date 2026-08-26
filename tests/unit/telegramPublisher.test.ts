/**
 * 🧪 Test Suite: Telegram Publisher & Anti-Spam Engine (telegramPublisherEngine)
 * Independent Quality Assurance Spec for Telegram Caption Formatting & Security
 */

import { generateInlineProxyFooter, formatMediaPostCaption } from '../../src/utils/telegramPublisherEngine';

export function runTelegramPublisherTests(): { passed: number; failed: number; errors: string[] } {
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

  console.log('🧪 Starting Telegram Publisher Tests...');

  // Test 1: Fallback footer when no proxies attached
  const emptyFooter = generateInlineProxyFooter([]);
  assert(emptyFooter.includes('etesal.aetherai.ir') && emptyFooter.includes('@vpnbuying'), 'Generates default channel footer when proxy list is empty');

  // Test 2: Standard inline proxy links formatting
  const mockProxies = [
    { server: '1.2.3.4', port: 443, secret: 'ee00000000000000000000000000000000' },
    { server: '5.6.7.8', port: 8443, secret: 'ee11111111111111111111111111111111' },
    { server: '9.10.11.12', port: 443, secret: 'ee22222222222222222222222222222222' }
  ];
  const formattedFooter = generateInlineProxyFooter(mockProxies, 3);
  assert(formattedFooter.includes('tg://proxy?server=1.2.3.4') && formattedFooter.includes('•'), 'Generates dot-separated inline proxy links');

  // Test 3: Validation gate prevents publishing photo with fewer than 3 proxies
  const underLimitResult = formatMediaPostCaption('photo', 'تست تصویر', [mockProxies[0]], true);
  assert(!underLimitResult.canPublish && (underLimitResult.reason?.includes('حداقل به ۳ پروکسی') ?? false), 'Enforces 3-proxy minimum requirement for photo posts');

  // Test 4: Audio posts are allowed without strict 3-proxy requirement
  const audioResult = formatMediaPostCaption('audio', 'موزیک روز', [mockProxies[0]], true);
  assert(audioResult.canPublish, 'Allows audio posts even with less than 3 proxies');

  return { passed, failed, errors };
}
