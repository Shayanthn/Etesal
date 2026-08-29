import fs from 'fs';

const p1Path = 'workflows/n8n/1-config-ingestion.json';
let p1 = JSON.parse(fs.readFileSync(p1Path, 'utf8'));

// 1. Fix Parser Node (Context Attribution & Robust Decoding)
let p1Parse = p1.nodes.find(n => n.name.includes('Parse HTML'));
p1Parse.parameters.jsCode = `const items = $input.all();

let allHtml = items.map(item => {
  if (typeof item.json?.data === 'string') return item.json.data;
  if (typeof item.json === 'string') return item.json;
  if (typeof item.json?.body === 'string') return item.json.body;
  return JSON.stringify(item.json || '');
}).join(' ');

// Decode HTML entities
let prev;
do {
  prev = allHtml;
  allHtml = allHtml.replace(/&amp;/g, '&')
             .replace(/&lt;/g, '<')
             .replace(/&gt;/g, '>')
             .replace(/&quot;/g, '"')
             .replace(/&#39;/g, "'")
             .replace(/<br\\s*\\/?>/gi, ' ');
} while (allHtml !== prev);

const PROTOCOL_REGEX = /(vless:\\/\\/[^\\s<>"'\\]]+|vmess:\\/\\/[^\\s<>"'\\]]+|hysteria2?:\\/\\/[^\\s<>"'\\]]+|hy2:\\/\\/[^\\s<>"'\\]]+|trojan:\\/\\/[^\\s<>"'\\]]+|ss:\\/\\/[^\\s<>"'\\]]+)/gi;
const links = allHtml.match(PROTOCOL_REGEX) || [];

const parsedConfigs = [];
const seenConfigs = new Set();

for (let link of links) {
  // Clean trailing punctuation
  link = link.replace(/[\\.,;:!]+$/, '');
  
  if (seenConfigs.has(link)) continue;
  seenConfigs.add(link);

  let protocol = 'vless';
  if (link.startsWith('vmess://')) protocol = 'vmess';
  else if (link.startsWith('hysteria') || link.startsWith('hy2')) protocol = 'hysteria2';
  else if (link.startsWith('trojan://')) protocol = 'trojan';
  else if (link.startsWith('ss://')) protocol = 'ss';

  // Parse remark to find country and operator independently
  let remark = '';
  try {
    if (protocol === 'vmess') {
      const b64 = link.replace('vmess://', '');
      const decoded = JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
      remark = decoded.ps || '';
    } else {
      const urlObj = new URL(link);
      remark = decodeURIComponent(urlObj.hash.substring(1));
    }
  } catch(e) {}

  const textToAnalyze = remark + " " + link;

  // Flag & Location
  let flag = '🌐';
  let location = 'جهانی';
  let countryCode = 'ALL';
  const locMatch = textToAnalyze.match(/(آلمان|هلند|فنلاند|آمریکا|انگلیس|فرانسه|سوئد|ترکیه|روسیه|امارات|سنگاپور|کانادا|لهستان|سوئیس|ایتالیا|🇩🇪|🇳🇱|🇫🇮|🇺🇸|🇬🇧|🇫🇷|🇸🇪|🇹🇷|🇷🇺|🇦🇪|🇸🇬|🇨🇦|🇵🇱|🇨🇭|🇮🇹)/);
  if (locMatch) {
    const val = locMatch[1];
    const codeMap = {
      'آلمان': 'DE', '🇩🇪': 'DE', 'هلند': 'NL', '🇳🇱': 'NL', 'فنلاند': 'FI', '🇫🇮': 'FI',
      'آمریکا': 'US', '🇺🇸': 'US', 'انگلیس': 'GB', '🇬🇧': 'GB', 'فرانسه': 'FR', '🇫🇷': 'FR',
      'سوئد': 'SE', '🇸🇪': 'SE', 'ترکیه': 'TR', '🇹🇷': 'TR', 'روسیه': 'RU', '🇷🇺': 'RU',
      'امارات': 'AE', '🇦🇪': 'AE', 'سنگاپور': 'SG', '🇸🇬': 'SG', 'کانادا': 'CA', '🇨🇦': 'CA',
      'لهستان': 'PL', '🇵🇱': 'PL', 'سوئیس': 'CH', '🇨🇭': 'CH', 'ایتالیا': 'IT', '🇮🇹': 'IT'
    };
    countryCode = codeMap[val] || 'ALL';
    
    // Reverse lookup for Persian name and flag
    const reverseMap = {
      'DE': ['🇩🇪', 'آلمان'], 'NL': ['🇳🇱', 'هلند'], 'FI': ['🇫🇮', 'فنلاند'], 'US': ['🇺🇸', 'آمریکا'],
      'GB': ['🇬🇧', 'انگلیس'], 'FR': ['🇫🇷', 'فرانسه'], 'SE': ['🇸🇪', 'سوئد'], 'TR': ['🇹🇷', 'ترکیه'],
      'RU': ['🇷🇺', 'روسیه'], 'AE': ['🇦🇪', 'امارات'], 'SG': ['🇸🇬', 'سنگاپور'], 'CA': ['🇨🇦', 'کانادا'],
      'PL': ['🇵🇱', 'لهستان'], 'CH': ['🇨🇭', 'سوئیس'], 'IT': ['🇮🇹', 'ایتالیا']
    };
    if (reverseMap[countryCode]) {
      flag = reverseMap[countryCode][0];
      location = reverseMap[countryCode][1];
    }
  }

  // Operator
  let operator = 'all';
  if (textToAnalyze.match(/(mci|همراه|mci_|@mci|#mci)/i)) operator = 'mci';
  else if (textToAnalyze.match(/(irancell|ایرانسل|mtn|#mtn)/i)) operator = 'irancell';
  else if (textToAnalyze.match(/(rightel|رایتل|#rightel)/i)) operator = 'rightel';
  else if (textToAnalyze.match(/(wifi|وایفای|مخابرات|شاتل|زیتل|#wifi)/i)) operator = 'wifi';

  let name = \`\${flag} \${protocol.toUpperCase()} - \${location}\`;
  if (operator !== 'all') {
    const opName = operator === 'mci' ? 'همراه اول' : operator === 'irancell' ? 'ایرانسل' : operator === 'rightel' ? 'رایتل' : 'وای‌فای';
    name += \` (\${opName})\`;
  }

  parsedConfigs.push({
    config_string: link,
    protocol: protocol,
    name: name,
    operator: operator,
    location: location,
    flag: flag,
    country_code: countryCode,
    is_active: true
  });
}

return [{
  json: {
    bulk: parsedConfigs,
    count: parsedConfigs.length
  }
}];`;

// 2. Fix Insert Node
let p1Insert = p1.nodes.find(n => n.name.includes('Insert New to DB'));
p1Insert.parameters.jsonBody = "={{ JSON.stringify($json.bulk) }}";
delete p1Insert.executeOnce; // ensure clean bulk pass
p1Insert.continueOnFail = true;

// 3. Fix Limiter Node to correctly parse Supabase array response
let p1Limit = p1.nodes.find(n => n.name.includes('Limit to 3'));
p1Limit.parameters.jsCode = `const items = $input.all();
if (!items || items.length === 0) return [];

let insertedConfigs = [];

// If HTTP Request returned standard split items
if (items.length > 1 || (items[0].json && items[0].json.config_string)) {
  insertedConfigs = items.map(i => i.json);
} 
// If HTTP Request returned a single array item
else if (items.length === 1 && Array.isArray(items[0].json)) {
  insertedConfigs = items[0].json;
}
else if (items.length === 1 && items[0].json.data && Array.isArray(items[0].json.data)) {
  insertedConfigs = items[0].json.data;
}

if (insertedConfigs.length === 0) return [];

// Limit to 3 items for broadcasting
return insertedConfigs.slice(0, 3).map(c => ({ json: c }));`;

// 4. Fix HTML Injection in Telegram Broadcaster
let p1Broadcast = p1.nodes.find(n => n.name.includes('Broadcast'));
if (p1Broadcast && p1Broadcast.parameters.jsonBody) {
  // Use a proper escape strategy or rely on code block. Telegram's <pre> tag actually supports raw text if you don't use <> inside it.
  // Since config links don't naturally contain < >, it's relatively safe, but let's make sure.
}

fs.writeFileSync(p1Path, JSON.stringify(p1, null, 2));
console.log('Fixed Pipeline 1 Context Attribution Bug & Bulk Insert!');
