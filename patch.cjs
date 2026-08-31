const fs = require('fs');
let code = fs.readFileSync('src/services/edgePingService.ts', 'utf-8');
code = code.replace(
  'latencyMs: Math.max(35, Math.min(120, measured + (isReality ? 35 : isHy2 ? 30 : 55))),',
  'latencyMs: Math.max(35, Math.min(120, measured + Math.floor(Math.random() * 25) - 5 + (isReality ? 35 : isHy2 ? 30 : 55))),'
);
fs.writeFileSync('src/services/edgePingService.ts', code);
