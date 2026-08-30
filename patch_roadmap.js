import fs from 'fs';
let content = fs.readFileSync('docs/SECURITY-MASTER-REMEDIATION-ROADMAP.md', 'utf8');

const replacements = [
  {
    target: '* **[منبع: ACTIVE_REMEDIATION_AND_TASKS.md - فاز ۲.۱]** ست کردن وب‌هوک تلگرام',
    replacement: '* **[DONE]** **[منبع: ACTIVE_REMEDIATION_AND_TASKS.md - فاز ۲.۱]** ست کردن وب‌هوک تلگرام'
  },
  {
    target: '* **[منبع: ACTIVE_REMEDIATION_AND_TASKS.md - فاز ۲.۱]** تنظیم دقیق متغیرهای `SUPABASE_URL` و `SUPABASE_ANON_KEY`',
    replacement: '* **[DONE]** **[منبع: ACTIVE_REMEDIATION_AND_TASKS.md - فاز ۲.۱]** تنظیم دقیق متغیرهای `SUPABASE_URL` و `SUPABASE_ANON_KEY`'
  },
  {
    target: '* **[منبع: ACTIVE_REMEDIATION_AND_TASKS.md - فاز ۲.۲]** فعال‌سازی Triggerهای زمان‌بندی',
    replacement: '* **[DONE]** **[منبع: ACTIVE_REMEDIATION_AND_TASKS.md - فاز ۲.۲]** فعال‌سازی Triggerهای زمان‌بندی'
  },
  {
    target: '* **[منبع: PRODUCTION_TESTING_RUNBOOK.md - تست ۳.۱]** اجرای دستی پایپ‌لاین',
    replacement: '* **[DONE]** **[منبع: PRODUCTION_TESTING_RUNBOOK.md - تست ۳.۱]** اجرای دستی پایپ‌لاین'
  },
  {
    target: '* **[منبع: PRODUCTION_TESTING_RUNBOOK.md - تست ۳.۲]** اجرای دستی پایپ‌لاین',
    replacement: '* **[DONE]** **[منبع: PRODUCTION_TESTING_RUNBOOK.md - تست ۳.۲]** اجرای دستی پایپ‌لاین'
  },
  {
    target: '* **[منبع: PRODUCTION_TESTING_RUNBOOK.md - تست ۳.۳]** اجرای دستی پایپ‌لاین‌های',
    replacement: '* **[DONE]** **[منبع: PRODUCTION_TESTING_RUNBOOK.md - تست ۳.۳]** اجرای دستی پایپ‌لاین‌های'
  },
  {
    target: '* **[منبع: PRODUCTION_TESTING_RUNBOOK.md - تست ۳.۴]** اجرای دستی',
    replacement: '* **[DONE]** **[منبع: PRODUCTION_TESTING_RUNBOOK.md - تست ۳.۴]** اجرای دستی'
  },
  {
    target: '* **[منبع: cloudflarelastreport.md - تست ۲.۴]** تست رفرش سخت فرانت‌اند',
    replacement: '* **[DONE]** **[منبع: cloudflarelastreport.md - تست ۲.۴]** تست رفرش سخت فرانت‌اند'
  },
  {
    target: '* **[منبع: ACTIVE_REMEDIATION_AND_TASKS.md - فاز ۲.۳]** تست عملکرد ابزار پینگ',
    replacement: '* **[DONE]** **[منبع: ACTIVE_REMEDIATION_AND_TASKS.md - فاز ۲.۳]** تست عملکرد ابزار پینگ'
  },
  {
    target: '* **[منبع: ACTIVE_REMEDIATION_AND_TASKS.md - فاز ۲.۳]** کپی کردن کانفیگ از محیط',
    replacement: '* **[DONE]** **[منبع: ACTIVE_REMEDIATION_AND_TASKS.md - فاز ۲.۳]** کپی کردن کانفیگ از محیط'
  }
];

replacements.forEach(({target, replacement}) => {
  content = content.replace(target, replacement);
});

fs.writeFileSync('docs/SECURITY-MASTER-REMEDIATION-ROADMAP.md', content);
