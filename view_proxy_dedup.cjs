const fs = require('fs');
let data = JSON.parse(fs.readFileSync('workflows/n8n/2-proxy-ingestion.json', 'utf8'));
let dedupNode = data.nodes.find(n => n.id === 'filter-uniques');
console.log(dedupNode.parameters.jsCode);
