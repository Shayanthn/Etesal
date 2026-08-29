const fs = require('fs');
let data = JSON.parse(fs.readFileSync('workflows/n8n/6-system-error-logger.json', 'utf8'));

let sendNode = data.nodes.find(n => n.id === 'telegram-send');
if (sendNode && sendNode.parameters.jsonBody) {
  sendNode.parameters.jsonBody = `={
  "chat_id": "{{ $vars.TELEGRAM_ADMIN_ID }}",
  "text": {{ JSON.stringify($json.text || "") }},
  "parse_mode": "Markdown"
}`;
}
fs.writeFileSync('workflows/n8n/6-system-error-logger.json', JSON.stringify(data, null, 2));
