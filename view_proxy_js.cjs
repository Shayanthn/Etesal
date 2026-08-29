const fs = require('fs');
let data = JSON.parse(fs.readFileSync('workflows/n8n/2-proxy-ingestion.json', 'utf8'));
let parseNode = data.nodes.find(n => n.id === 'parse-proxies');
console.log(parseNode.parameters.jsCode);
