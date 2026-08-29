const fs = require('fs');

function fixP1() {
  const path = 'workflows/n8n/1-config-ingestion.json';
  let d = JSON.parse(fs.readFileSync(path, 'utf8'));

  // 1. Remove nodes 5 & 6
  d.nodes = d.nodes.filter(n => n.name !== '5. Fetch DB (For Uniqueness)' && n.name !== '6. Absolute Deduplication');
  
  // 2. Add continueOnFail and retry to "3. Fetch HTML"
  let fetchHtml = d.nodes.find(n => n.name === '3. Fetch HTML');
  if (fetchHtml) {
    fetchHtml.continueOnFail = true;
    fetchHtml.retryOnFail = true;
    fetchHtml.maxTries = 3;
    fetchHtml.waitBetweenTries = 2000;
  }

  // 3. Update "7. Insert New to DB" options
  let insertDb = d.nodes.find(n => n.name === '7. Insert New to DB');
  if (insertDb) {
    let headers = insertDb.parameters.headerParameters.parameters;
    let preferIndex = headers.findIndex(h => h.name === 'Prefer');
    if (preferIndex !== -1) {
      headers[preferIndex].value = 'return=representation, resolution=ignore-duplicates';
    } else {
      headers.push({ name: 'Prefer', value: 'return=representation, resolution=ignore-duplicates' });
    }
    // Add retry
    insertDb.retryOnFail = true;
    insertDb.maxTries = 3;
    insertDb.waitBetweenTries = 2000;
  }

  // 4. Update "9. Broadcast to Channel"
  let broadcast = d.nodes.find(n => n.name === '9. Broadcast to Channel');
  if (broadcast) {
    broadcast.retryOnFail = true;
    broadcast.maxTries = 3;
    broadcast.waitBetweenTries = 2000;
  }

  // 5. Update connections
  if (d.connections['4. Parse HTML & Dynamic Context']) {
    d.connections['4. Parse HTML & Dynamic Context'] = {
      "main": [ [ { "node": "7. Insert New to DB", "type": "main", "index": 0 } ] ]
    };
  }
  delete d.connections['5. Fetch DB (For Uniqueness)'];
  delete d.connections['6. Absolute Deduplication'];

  fs.writeFileSync(path, JSON.stringify(d, null, 2));
}

function fixP2() {
  const path = 'workflows/n8n/2-proxy-ingestion.json';
  let d = JSON.parse(fs.readFileSync(path, 'utf8'));

  // 1. Remove nodes 5 & 6
  d.nodes = d.nodes.filter(n => n.name !== '5. Fetch Existing from DB' && n.name !== '6. Absolute Deduplication');
  
  // 2. Add continueOnFail and retry to "3. Fetch HTML from Channels"
  let fetchHtml = d.nodes.find(n => n.name === '3. Fetch HTML from Channels');
  if (fetchHtml) {
    fetchHtml.continueOnFail = true;
    fetchHtml.retryOnFail = true;
    fetchHtml.maxTries = 3;
    fetchHtml.waitBetweenTries = 2000;
  }

  // 3. Update "7. Insert New to DB" options
  let insertDb = d.nodes.find(n => n.name === '7. Insert New to DB');
  if (insertDb) {
    let headers = insertDb.parameters.headerParameters.parameters;
    let preferIndex = headers.findIndex(h => h.name === 'Prefer');
    if (preferIndex !== -1) {
      headers[preferIndex].value = 'return=representation, resolution=ignore-duplicates';
    } else {
      headers.push({ name: 'Prefer', value: 'return=representation, resolution=ignore-duplicates' });
    }
    // Add retry
    insertDb.retryOnFail = true;
    insertDb.maxTries = 3;
    insertDb.waitBetweenTries = 2000;
  }

  // 4. Update connections
  if (d.connections['4. Parse & Normalize Proxies']) {
    d.connections['4. Parse & Normalize Proxies'] = {
      "main": [ [ { "node": "7. Insert New to DB", "type": "main", "index": 0 } ] ]
    };
  }
  delete d.connections['5. Fetch Existing from DB'];
  delete d.connections['6. Absolute Deduplication'];

  fs.writeFileSync(path, JSON.stringify(d, null, 2));
}

function fixNews(path) {
  let d = JSON.parse(fs.readFileSync(path, 'utf8'));

  // 1. Add continueOnFail to RSS nodes
  d.nodes.forEach(n => {
    if (n.name.includes('RSS')) {
      n.continueOnFail = true;
    }
    if (n.name.includes('OpenRouter') || n.name.includes('Insert')) {
      n.retryOnFail = true;
      n.maxTries = 3;
      n.waitBetweenTries = 2000;
    }
  });

  // 2. Update format node deterministic slug
  let formatNode = d.nodes.find(n => n.name.includes('Format Final Output'));
  if (formatNode) {
    let code = formatNode.parameters.jsCode;
    
    // Replace Date.now() in catch block and below
    code = code.replace(/slug:\s*'news-'\s*\+\s*Date\.now\(\)/g, "slug: ''");
    code = code.replace(/if\s*\(!aiRes\.slug\)\s*aiRes\.slug\s*=\s*'news-'\s*\+\s*Date\.now\(\);/g, `
let link = rawItem.rawLink || '';
let hash = 0; 
for(let i=0; i<link.length; i++) { hash = ((hash << 5) - hash) + link.charCodeAt(i); hash |= 0; }
let baseSlug = (aiRes.slug || 'news').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
if (!baseSlug) baseSlug = 'news';
aiRes.slug = link ? (baseSlug.substring(0, 40) + '-' + Math.abs(hash).toString(36)) : (baseSlug + '-' + Date.now());
`);
    formatNode.parameters.jsCode = code;
  }

  // 3. Ensure insert returns representation just in case
  let insertDb = d.nodes.find(n => n.name.includes('Insert'));
  if (insertDb) {
    let headers = insertDb.parameters.headerParameters.parameters;
    let preferIndex = headers.findIndex(h => h.name === 'Prefer');
    if (preferIndex !== -1) {
      headers[preferIndex].value = 'return=representation, resolution=ignore-duplicates';
    } else {
      headers.push({ name: 'Prefer', value: 'return=representation, resolution=ignore-duplicates' });
    }
  }

  fs.writeFileSync(path, JSON.stringify(d, null, 2));
}

function fixP3() {
  const path = 'workflows/n8n/3-telegram-viral-bot.json';
  let d = JSON.parse(fs.readFileSync(path, 'utf8'));
  let fwd = d.nodes.find(n => n.name === '5. Forward to Channel');
  if (fwd) {
    fwd.retryOnFail = true;
    fwd.maxTries = 3;
    fwd.waitBetweenTries = 2000;
  }
  fs.writeFileSync(path, JSON.stringify(d, null, 2));
}

try {
  fixP1();
  fixP2();
  fixNews('workflows/n8n/4-news-ingestion-iran.json');
  fixNews('workflows/n8n/5-news-ingestion-global.json');
  fixP3();
  console.log("SUCCESS");
} catch(e) {
  console.error("ERROR", e);
}
