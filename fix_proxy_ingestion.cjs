const fs = require('fs');
let data = JSON.parse(fs.readFileSync('workflows/n8n/2-proxy-ingestion.json', 'utf8'));

// 1. Fix parser node to extract host, port, secret
let parseNode = data.nodes.find(n => n.id === 'parse-proxies');
parseNode.parameters.jsCode = `
const items = $input.all();
const allHtml = items.map(item => item.json?.data || '').join(' ');

// Matches both tg://proxy? and https://t.me/proxy?
const PROXY_REGEX = /(?:https?:\\/\\/t\\.me\\/proxy\\?|tg:\\/\\/proxy\\?)[^\\s<>"'\\\\]+/gi;
const matches = allHtml.match(PROXY_REGEX) || [];

// Normalize everything to https://t.me/proxy? format
const normalizedProxies = matches.map(p => p.replace('tg://proxy?', 'https://t.me/proxy?'));
const uniqueProxiesSet = Array.from(new Set(normalizedProxies));

const parsedProxies = [];
for (const proxy of uniqueProxiesSet) {
  try {
    const urlObj = new URL(proxy);
    const host = urlObj.searchParams.get('server');
    const port = parseInt(urlObj.searchParams.get('port'), 10);
    const secret = urlObj.searchParams.get('secret');

    if (host && port && secret) {
      parsedProxies.push({
        name: 'MTProto Proxy ' + host,
        host: host,
        port: port,
        secret: secret,
        location: 'درحال بررسی',
        flag: '🌐'
      });
    }
  } catch (e) {
    // ignore malformed URLs
  }
}

return [{ json: { proxies: parsedProxies } }];
`;

// 2. Fix Fetch DB Existing node (to check by host and port or secret)
let fetchNode = data.nodes.find(n => n.id === 'fetch-db-existing');
fetchNode.parameters.url = '={{ $vars.SUPABASE_URL }}/rest/v1/proxies?select=secret';

// 3. Fix Dedup Node
let dedupNode = data.nodes.find(n => n.id === 'filter-uniques');
dedupNode.parameters.jsCode = `
const parsedProxies = $items("4. Parse & Normalize Proxies")[0].json.proxies || [];
const dbItems = $input.all();

const existingSet = new Set();
dbItems.forEach(item => {
  if (item.json && item.json.secret) {
    existingSet.add(item.json.secret);
  }
});

const newUniqueProxies = [];
const seenInBatch = new Set();

for (const p of parsedProxies) {
  if (!existingSet.has(p.secret) && !seenInBatch.has(p.secret)) {
    seenInBatch.add(p.secret);
    newUniqueProxies.push({
      json: {
        name: p.name,
        host: p.host,
        port: p.port,
        secret: p.secret,
        ping: null,
        location: p.location,
        flag: p.flag,
        is_active: true,
        created_at: new Date().toISOString()
      }
    });
  }
  if (newUniqueProxies.length >= 30) break;
}

if (newUniqueProxies.length === 0) return [];
return newUniqueProxies;
`;

fs.writeFileSync('workflows/n8n/2-proxy-ingestion.json', JSON.stringify(data, null, 2));
