import fs from 'fs';
let content = fs.readFileSync('src/modules/auth/RecoveryEmailPromptModal.tsx', 'utf8');
content = content.replace('z-50', 'z-[70]');
fs.writeFileSync('src/modules/auth/RecoveryEmailPromptModal.tsx', content);
