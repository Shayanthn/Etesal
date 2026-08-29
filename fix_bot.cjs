const fs = require('fs');
let data = JSON.parse(fs.readFileSync('workflows/n8n/3-telegram-viral-bot.json', 'utf8'));

let sendNode = data.nodes.find(n => n.id === 'telegram-send');
if (sendNode && sendNode.parameters.jsonBody) {
  // Replace the hardcoded bad JSON with dynamic stringification
  sendNode.parameters.jsonBody = `={
  "chat_id": "{{ $vars.TELEGRAM_CHANNEL_ID }}",
  "from_chat_id": "{{ $json.chat.id }}",
  "message_id": "{{ $json.message_id }}",
  "caption": {{ JSON.stringify($json.new_caption || "") }},
  "parse_mode": "MarkdownV2"
}`;
}

fs.writeFileSync('workflows/n8n/3-telegram-viral-bot.json', JSON.stringify(data, null, 2));
