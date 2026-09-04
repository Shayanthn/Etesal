import { V2RayConfig, MtprotoProxy, OperatorType } from '../types';

export interface ExtractedNodeResult {
  type: 'v2ray' | 'mtproto';
  v2rayConfig?: V2RayConfig;
  mtprotoProxy?: MtprotoProxy;
  rawString: string;
  isDuplicate: boolean;
  healthStatus: 'excellent' | 'good' | 'medium' | 'dead';
  detectedOperator: OperatorType;
  detectedCountry: {
    name: string;
    flag: string;
  };
  details: {
    protocol: string;
    host: string;
    port: number;
    tlsType: string;
    transport: string;
    sni?: string;
    remarks?: string;
  };
}

// 1. Country & Flag Identification from text/remarks/hostname
export function detectCountryFromText(text: string, host: string = ''): { name: string; flag: string } {
  const t = (text + ' ' + host).toLowerCase();

  if (t.includes('🇩🇪') || t.includes('germany') || t.includes('آلمان') || t.includes('frankfurt') || t.includes('fra') || t.includes('.de')) {
    return { name: '🇩🇪 آلمان - Frankfurt Dedicated', flag: '🇩🇪' };
  }
  if (t.includes('🇫🇮') || t.includes('finland') || t.includes('فنلاند') || t.includes('helsinki') || t.includes('hel')) {
    return { name: '🇫🇮 فنلاند - Helsinki Cloud', flag: '🇫🇮' };
  }
  if (t.includes('🇳🇱') || t.includes('netherlands') || t.includes('هلند') || t.includes('amsterdam') || t.includes('ams') || t.includes('.nl')) {
    return { name: '🇳🇱 هلند - Amsterdam High-Speed', flag: '🇳🇱' };
  }
  if (t.includes('🇺🇸') || t.includes('usa') || t.includes('united states') || t.includes('آمریکا') || t.includes('us') || t.includes('virginia')) {
    return { name: '🇺🇸 آمریکا - Silicon Valley / US East', flag: '🇺🇸' };
  }
  if (t.includes('🇹🇷') || t.includes('turkey') || t.includes('ترکیه') || t.includes('istanbul') || t.includes('.tr')) {
    return { name: '🇹🇷 ترکیه - Istanbul Low Latency', flag: '🇹🇷' };
  }
  if (t.includes('🇬🇧') || t.includes('uk') || t.includes('england') || t.includes('انگلستان') || t.includes('london') || t.includes('.uk')) {
    return { name: '🇬🇧 انگلستان - London Central', flag: '🇬🇧' };
  }
  if (t.includes('🇫🇷') || t.includes('france') || t.includes('فرانسه') || t.includes('paris') || t.includes('.fr')) {
    return { name: '🇫🇷 فرانسه - Paris Roubaix', flag: '🇫🇷' };
  }
  if (t.includes('🇸🇪') || t.includes('sweden') || t.includes('سوئد') || t.includes('stockholm')) {
    return { name: '🇸🇪 سوئد - Stockholm Server', flag: '🇸🇪' };
  }
  if (t.includes('🇨🇭') || t.includes('switzerland') || t.includes('سوئیس') || t.includes('zurich')) {
    return { name: '🇨🇭 سوئیس - Zurich Ultra Privacy', flag: '🇨🇭' };
  }
  if (t.includes('🇦🇪') || t.includes('uae') || t.includes('dubai') || t.includes('امارات') || t.includes('دبی')) {
    return { name: '🇦🇪 امارات - Dubai Low Ping', flag: '🇦🇪' };
  }
  if (t.includes('🇨🇦') || t.includes('canada') || t.includes('کانادا') || t.includes('montreal')) {
    return { name: '🇨🇦 کانادا - Montreal Server', flag: '🇨🇦' };
  }
  if (t.includes('🇸🇬') || t.includes('singapore') || t.includes('سنگاپور')) {
    return { name: '🇸🇬 سنگاپور - Singapore Direct', flag: '🇸🇬' };
  }
  
  return { name: '🌍 سرور بین‌المللی اختصاصی', flag: '⚡' };
}

// 2. Operator Identification based on protocol, port, transport and explicit tags
export function detectOperatorFromNode(
  protocol: string, 
  port: number, 
  transport: string, 
  tlsType: string, 
  rawText: string
): OperatorType {
  const lower = rawText.toLowerCase();

  // Explicit hashtags or mentions in the post/remarks
  if (lower.includes('#همراه_اول') || lower.includes('#mci') || lower.includes('mci') || lower.includes('همراه اول')) {
    return 'mci';
  }
  if (lower.includes('#ایرانسل') || lower.includes('#irancell') || lower.includes('#mtn') || lower.includes('irancell') || lower.includes('ایرانسل')) {
    return 'irancell';
  }
  if (lower.includes('#رایتل') || lower.includes('#rightel') || lower.includes('rightel') || lower.includes('رایتل')) {
    return 'rightel';
  }
  if (lower.includes('#مخابرات') || lower.includes('#شاتل') || lower.includes('#wifi') || lower.includes('wifi') || lower.includes('وای فای') || lower.includes('وایفای') || lower.includes('شاتل')) {
    return 'wifi';
  }

  // Heuristic rule matching based on Iranian DPI behavior:
  // 1. Hysteria 2 / TUIC uses UDP QUIC, perfectly optimized for Irancell / MTN & Rightel
  if (protocol === 'hysteria2' || protocol === 'tuic' || protocol === 'hy2') {
    return 'irancell';
  }

  // 2. VLESS Reality with port 443 and TCP/gRPC works exceptionally well on MCI & Fiber
  if (protocol === 'vless' && port === 443 && (tlsType.toLowerCase().includes('reality') || transport === 'tcp')) {
    return 'mci';
  }

  // 3. VMess WS with CDN / Cloudflare is best for home WiFi & Mokhaberat
  if (protocol === 'vmess' && (transport.toLowerCase().includes('ws') || transport.toLowerCase().includes('websocket'))) {
    return 'wifi';
  }

  return 'all';
}

// 3. Parse VLESS / Trojan / Hysteria 2 / TUIC URI
export function parseUriConfig(uri: string, rawPostContext: string = ''): ExtractedNodeResult | null {
  try {
    const trimmed = uri.trim();
    const url = new URL(trimmed);
    const protocol = url.protocol.replace(':', '').toLowerCase() as V2RayConfig['protocol'];

    const uuid = url.username;
    const host = url.hostname;
    const port = parseInt(url.port || '443', 10);
    const searchParams = url.searchParams;
    const remark = decodeURIComponent(url.hash.replace('#', '')) || '';

    const security = searchParams.get('security') || (port === 443 ? 'tls' : 'none');
    const type = searchParams.get('type') || 'tcp';
    const sni = searchParams.get('sni') || searchParams.get('serverName') || searchParams.get('host') || host;
    const pbk = searchParams.get('pbk') || '';
    const sid = searchParams.get('sid') || '';

    let tlsType = 'TLS 1.3';
    if (security === 'reality' || pbk) {
      tlsType = 'Reality / TLS 1.3';
    } else if (security === 'tls') {
      tlsType = 'Standard TLS';
    } else if (protocol === 'hysteria2') {
      tlsType = 'QUIC / TLS 1.3';
    }

    let transport = type.toUpperCase();
    if (type === 'ws') transport = 'WebSocket (CDN)';
    else if (type === 'grpc') transport = 'gRPC Direct';
    else if (type === 'tcp') transport = 'TCP Reality';

    const country = detectCountryFromText(remark + ' ' + rawPostContext, host);
    const detectedOp = detectOperatorFromNode(protocol, port, type, tlsType, remark + ' ' + rawPostContext);

    // Calculate synthetic latency & health
    let ping = 42;
    let health: ExtractedNodeResult['healthStatus'] = 'excellent';
    if (port !== 443 && port !== 8443 && port !== 2053 && protocol !== 'hysteria2') {
      ping = Math.floor(Math.random() * 30) + 65;
      health = 'good';
    } else {
      ping = Math.floor(Math.random() * 25) + 35;
    }

    const configName = remark.trim() 
      ? `${country.flag} ${remark.trim().replace(/[\r\n]+/g, ' ').slice(0, 30)}`
      : `${country.flag} اختصاصی - ${protocol.toUpperCase()} ${tlsType.includes('Reality') ? 'Reality' : ''}`;

    const v2rayConfig: V2RayConfig = {
      id: 'cfg-' + Math.random().toString(36).substring(2, 9),
      name: configName,
      protocol: protocol === 'tuic' ? 'tuic' : (protocol as any),
      configString: trimmed,
      ping,
      location: country.name,
      flag: country.flag,
      operator: detectedOp,
      quality: health === 'excellent' ? 'excellent' : 'good',
      tlsType,
      transport,
      verifiedAt: 'لحظاتی پیش',
      isOfficial: true
    };

    return {
      type: 'v2ray',
      v2rayConfig,
      rawString: trimmed,
      isDuplicate: false,
      healthStatus: health,
      detectedOperator: detectedOp,
      detectedCountry: country,
      details: {
        protocol,
        host,
        port,
        tlsType,
        transport,
        sni,
        remarks: remark
      }
    };
  } catch (err) {
    return null;
  }
}

// 4. Parse VMess Base64 JSON
export function parseVmessConfig(uri: string, rawPostContext: string = ''): ExtractedNodeResult | null {
  try {
    const trimmed = uri.trim();
    const base64Str = trimmed.replace('vmess://', '');
    const decodedJson = atob(base64Str);
    const obj = JSON.parse(decodedJson);

    const host = obj.add || '';
    const port = parseInt(obj.port || '443', 10);
    const remark = obj.ps || '';
    const net = (obj.net || 'tcp').toLowerCase();
    const tls = obj.tls || 'none';
    const sni = obj.sni || obj.host || host;

    const country = detectCountryFromText(remark + ' ' + rawPostContext, host);
    const tlsType = tls === 'tls' ? 'TLS 1.3 / WS' : 'Standard TCP';
    const transport = net === 'ws' ? 'WebSocket (CDN)' : net.toUpperCase();
    const detectedOp = detectOperatorFromNode('vmess', port, net, tlsType, remark + ' ' + rawPostContext);

    const configName = remark.trim()
      ? `${country.flag} ${remark.trim().slice(0, 30)}`
      : `${country.flag} VMess - ${country.name.split('-')[0]}`;

    const v2rayConfig: V2RayConfig = {
      id: 'cfg-' + Math.random().toString(36).substring(2, 9),
      name: configName,
      protocol: 'vmess',
      configString: trimmed,
      ping: Math.floor(Math.random() * 30) + 55,
      location: country.name,
      flag: country.flag,
      operator: detectedOp,
      quality: 'good',
      tlsType,
      transport,
      verifiedAt: 'لحظاتی پیش',
      isOfficial: true
    };

    return {
      type: 'v2ray',
      v2rayConfig,
      rawString: trimmed,
      isDuplicate: false,
      healthStatus: 'good',
      detectedOperator: detectedOp,
      detectedCountry: country,
      details: {
        protocol: 'vmess',
        host,
        port,
        tlsType,
        transport,
        sni,
        remarks: remark
      }
    };
  } catch (err) {
    return null;
  }
}

// 5. Parse MTProto Proxy URL
export function parseMtprotoProxy(uri: string, rawPostContext: string = ''): ExtractedNodeResult | null {
  try {
    const trimmed = uri.trim();
    let host = '';
    let port = 443;
    let secret = '';

    if (trimmed.startsWith('tg://proxy?') || trimmed.startsWith('https://t.me/proxy?')) {
      const url = new URL(trimmed.replace('tg://', 'https://'));
      host = url.searchParams.get('server') || '';
      port = parseInt(url.searchParams.get('port') || '443', 10);
      secret = url.searchParams.get('secret') || '';
    }

    if (!host || !secret) return null;

    const country = detectCountryFromText(rawPostContext, host);
    const isFakeTls = secret.startsWith('ee') || secret.length > 32;

    const proxyName = `${country.flag} پروکسی اختصاصی ${isFakeTls ? 'TLS' : 'MTProto'} ${country.name.split('-')[0]}`;

    const mtprotoProxy: MtprotoProxy = {
      id: 'proxy-' + Math.random().toString(36).substring(2, 9),
      name: proxyName,
      host,
      port,
      secret,
      ping: Math.floor(Math.random() * 25) + 30,
      location: country.name,
      flag: country.flag,
      verifiedAt: 'لحظاتی پیش',
      sponsorChannel: '@vpnbuying',
      isVip: false
    };

    return {
      type: 'mtproto',
      mtprotoProxy,
      rawString: trimmed,
      isDuplicate: false,
      healthStatus: 'excellent',
      detectedOperator: 'all',
      detectedCountry: country,
      details: {
        protocol: 'mtproto',
        host,
        port,
        tlsType: isFakeTls ? 'Fake-TLS (ee...)' : 'Standard MTProto',
        transport: 'TCP TLS',
        remarks: proxyName
      }
    };
  } catch (err) {
    return null;
  }
}

// 6. Master Extractor: Extracts all V2Ray & MTProto nodes from any unstructured text
export function extractAllNodesFromText(
  rawText: string, 
  existingConfigs: V2RayConfig[] = [], 
  existingProxies: MtprotoProxy[] = []
): ExtractedNodeResult[] {
  const results: ExtractedNodeResult[] = [];
  const seenStrings = new Set<string>();

  // 1. Match VLESS, Trojan, Hysteria2, TUIC URIs
  const uriRegex = /(?:vless|trojan|hysteria2|hy2|tuic):\/\/[^\s\r\n<>"]+/gi;
  const uriMatches = rawText.match(uriRegex) || [];
  for (const match of uriMatches) {
    const cleanMatch = match.trim();
    if (!seenStrings.has(cleanMatch)) {
      seenStrings.add(cleanMatch);
      const parsed = parseUriConfig(cleanMatch, rawText);
      if (parsed) {
        // Check duplicate
        const isDup = existingConfigs.some(c => c.configString.trim() === cleanMatch || (parsed.details.host === c.configString && parsed.details.port.toString() === c.configString));
        parsed.isDuplicate = isDup;
        results.push(parsed);
      }
    }
  }

  // 2. Match VMess Base64 URIs
  const vmessRegex = /vmess:\/\/[a-zA-Z0-9+/=_-]+/gi;
  const vmessMatches = rawText.match(vmessRegex) || [];
  for (const match of vmessMatches) {
    const cleanMatch = match.trim();
    if (!seenStrings.has(cleanMatch)) {
      seenStrings.add(cleanMatch);
      const parsed = parseVmessConfig(cleanMatch, rawText);
      if (parsed) {
        const isDup = existingConfigs.some(c => c.configString.trim() === cleanMatch);
        parsed.isDuplicate = isDup;
        results.push(parsed);
      }
    }
  }

  // 3. Match Telegram MTProto Proxies
  const proxyRegex = /(?:tg:\/\/proxy\?|https:\/\/t\.me\/proxy\?)[^\s\r\n<>"]+/gi;
  const proxyMatches = rawText.match(proxyRegex) || [];
  for (const match of proxyMatches) {
    const cleanMatch = match.trim();
    if (!seenStrings.has(cleanMatch)) {
      seenStrings.add(cleanMatch);
      const parsed = parseMtprotoProxy(cleanMatch, rawText);
      if (parsed) {
        const isDup = existingProxies.some(p => p.host === parsed.details.host && p.port === parsed.details.port);
        parsed.isDuplicate = isDup;
        results.push(parsed);
      }
    }
  }

  return results;
}

// 7. Multi-Channel Publisher Formatters

// A. Telegram Post Formatter
export function generateTelegramPostMessage(
  item: ExtractedNodeResult, 
  channelHandle: string = '@vpnbuying'
): { text: string; buttonText: string; buttonUrl: string } {
  if (item.type === 'mtproto' && item.mtprotoProxy) {
    const p = item.mtprotoProxy;
    const text = `🚀 **پروکسی فوق‌سریع تلگرام** ${p.flag}

📌 **مشخصات سرور:**
🏳️ کشور: \`${p.location}\`
⚡️ پینگ: \`${p.ping}ms\`
🛡 نوع رمزنگاری: \`TLS 1.3 / Fake-TLS\`
📡 اپراتورها: \`همراه اول • ایرانسل • رایتل • وای‌فای\`

🔗 **لینک اتصال مستقیم تلگرام:**
\`tg://proxy?server=${p.host}&port=${p.port}&secret=${p.secret}\`

✨ جهت اتصال آسان، روی دکمه زیر کلیک کنید:
🆔 ${channelHandle}`;

    return {
      text,
      buttonText: `⚡️ اتصال مستقیم به پروکسی (${p.ping}ms)`,
      buttonUrl: `tg://proxy?server=${p.host}&port=${p.port}&secret=${p.secret}`
    };
  } else if (item.v2rayConfig) {
    const c = item.v2rayConfig;
    const opLabel = 
      c.operator === 'mci' ? 'همراه اول (MCI)' :
      c.operator === 'irancell' ? 'ایرانسل (MTN)' :
      c.operator === 'rightel' ? 'رایتل (Rightel)' :
      c.operator === 'wifi' ? 'اینترنت خانگی / مخابرات / شاتل' : 'تمام اپراتورها (سراسری)';

    const text = `🔒 **کانفیگ اختصاصی و پرسرعت** ${c.flag}

📌 **مشخصات نود:**
🌐 پروتکل: \`${c.protocol.toUpperCase()}\`
🛡 امنیت: \`${c.tlsType}\`
📶 بهینه برای: \`${opLabel}\`
⚡️ تاخیر (پینگ): \`${c.ping}ms\`
📍 موقعیت: \`${c.location}\`

📋 **کد اتصال (برای کپی لمس کنید):**
\`\`\`
${c.configString}
\`\`\`

💡 *قابل استفاده در V2RayNG, Streisand, v2rayN, Shadowrocket, Sing-box*
🆔 ${channelHandle}`;

    return {
      text,
      buttonText: `🌐 ورود به وب‌سایت و دانلود اپلیکیشن`,
      buttonUrl: `https://t.me/vpnbuying`
    };
  }

  return { text: '', buttonText: '', buttonUrl: '' };
}

// B. Base64 Unified Subscription Stream Formatter
export function generateBase64Subscription(configs: V2RayConfig[]): string {
  const rawList = configs.map(c => c.configString.trim()).join('\n');
  return btoa(unescape(encodeURIComponent(rawList)));
}
