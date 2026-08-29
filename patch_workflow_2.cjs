const fs = require('fs');
let data = JSON.parse(fs.readFileSync('workflows/n8n/2-proxy-ingestion.json', 'utf8'));

// Fix fetch URL
let fetchNode = data.nodes.find(n => n.id === 'fetch-db-existing');
if (fetchNode && fetchNode.parameters.url) {
  fetchNode.parameters.url = fetchNode.parameters.url.replace('/rest/v1/configs?protocol=eq.mtproto', '/rest/v1/proxies?');
}

// Fix insert URL
let insertNode = data.nodes.find(n => n.id === 'supabase-insert-proxies');
if (insertNode && insertNode.parameters.url) {
  insertNode.parameters.url = insertNode.parameters.url.replace('/rest/v1/configs', '/rest/v1/proxies');
}

fs.writeFileSync('workflows/n8n/2-proxy-ingestion.json', JSON.stringify(data, null, 2));
