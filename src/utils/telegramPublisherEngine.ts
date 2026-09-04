export interface TelegramProxyItem {
  server: string;
  port: number | string;
  secret: string;
  name?: string;
  ping?: number;
}

export interface TelegramConfigItem {
  id?: string;
  name: string;
  protocol: string;
  configString: string;
  operator: 'mci' | 'irancell' | 'rightel' | 'wifi' | 'all';
  ping?: number;
  location?: string;
  flag?: string;
  quality?: string;
}

export type TelegramMediaType = 'text' | 'photo' | 'audio' | 'video';

export interface TelegramMediaQueueItem {
  id: string;
  mediaType: TelegramMediaType;
  fileId?: string;
  caption?: string;
  title?: string;
  status: 'pending' | 'published' | 'failed';
  attachedProxies: TelegramProxyItem[];
  publishedAt?: string;
  purgeAfter?: string;
  createdAt: string;
}

/**
 * ایجاد فوتر استاندارد پروکسی‌های خطی (بدون اسم کشور، تفکیک با نقطه)
 * نمونه خروجی:
 * ⚡️ [پروکسی](tg://proxy?...) • [پروکسی](tg://proxy?...) • [پروکسی](tg://proxy?...)
 */
export function generateInlineProxyFooter(proxies: TelegramProxyItem[], maxCount: number = 3): string {
  if (!proxies || proxies.length === 0) {
    return `\n\n🌐 وب‌سایت: etesal.aetherai.ir\n🆔 کانال تلگرام: @vpnbuying`;
  }

  const selected = proxies.slice(0, maxCount);
  const proxyLinks = selected.map(p => {
    const proxyUrl = `tg://proxy?server=${encodeURIComponent(p.server)}&port=${p.port}&secret=${encodeURIComponent(p.secret)}`;
    return `[پروکسی](${proxyUrl})`;
  });

  const inlineList = proxyLinks.join(' • ');

  return `\n\n⚡️ ${inlineList}\n\n🌐 وب‌سایت: etesal.aetherai.ir\n🆔 کانال تلگرام: @vpnbuying`;
}

/**
 * تولید متن کامل برای پست‌های وایرال، تصویر، موزیک یا ویدیو
 */
export function formatMediaPostCaption(
  mediaType: TelegramMediaType,
  caption: string = '',
  proxies: TelegramProxyItem[] = [],
  requireProxies: boolean = true
): { formattedCaption: string; canPublish: boolean; reason?: string } {
  const cleanCaption = caption.trim();

  // شرط وجود پروکسی برای عکس، فیلم و متن‌های وایرال
  if (requireProxies && proxies.length < 3 && mediaType !== 'audio') {
    return {
      formattedCaption: '',
      canPublish: false,
      reason: `برای انتشار ${mediaType === 'photo' ? 'تصویر' : mediaType === 'video' ? 'ویدیو' : 'متن'} حداقل به ۳ پروکسی فعال نیاز است.`
    };
  }

  const proxyFooter = generateInlineProxyFooter(proxies, 3);
  const formattedCaption = `${cleanCaption}${proxyFooter}`;

  return {
    formattedCaption,
    canPublish: true
  };
}

/**
 * تولید متن پست تک‌پیامی اختصاصی برای ۱ کانفیگ V2Ray (با قابلیت کپی ۱-لمسی)
 */
export function formatSingleConfigPost(config: TelegramConfigItem): string {
  const opLabel = config.operator === 'mci' ? 'همراه اول (MCI)' :
                  config.operator === 'irancell' ? 'ایرانسل (MTN)' :
                  config.operator === 'rightel' ? 'رایتل' :
                  config.operator === 'wifi' ? 'اینترنت خانگی / مخابرات / شاتل' : 'تمام اپراتورها';

  const flag = config.flag || '🇩🇪';
  const location = config.location || 'سرور بین‌المللی اختصاصی';
  const protocol = (config.protocol || 'VLESS').toUpperCase();

  return `🔒 کانفیگ اختصاصی و پرسرعت ${flag}

🌐 پروتکل: ${protocol} (پورت ۴۴۳)
🛡 امنیت: TLS 1.3 / TCP Reality
📶 بهینه برای: ${opLabel}
📍 موقعیت: ${location}

📋 کد اتصال (برای کپی لمس کنید):
\`\`\`
${config.configString.trim()}
\`\`\`

🌐 وب‌سایت: etesal.aetherai.ir
🆔 کانال تلگرام: @vpnbuying`;
}

/**
 * تولید آرایه ۳ تایی از پست‌های مجزا برای کانفیگ‌های برتر
 */
export function formatTopConfigsBatchPosts(configs: TelegramConfigItem[], maxCount: number = 3): string[] {
  const selected = configs.slice(0, maxCount);
  return selected.map(cfg => formatSingleConfigPost(cfg));
}
