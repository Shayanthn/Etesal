const fs = require('fs');
let data = JSON.parse(fs.readFileSync('workflows/n8n/1-config-ingestion.json', 'utf8'));

// Find Node 8
const node8Index = data.nodes.findIndex(n => n.id === 'throttle');
if (node8Index > -1) {
  data.nodes[node8Index] = {
    "parameters": {
      "jsCode": "return $input.all().slice(0, 3);"
    },
    "id": "throttle",
    "name": "8. Limit to 3 for Telegram",
    "type": "n8n-nodes-base.code",
    "typeVersion": 2,
    "position": [1560, 300]
  };
}

fs.writeFileSync('workflows/n8n/1-config-ingestion.json', JSON.stringify(data, null, 2));
