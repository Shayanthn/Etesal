const fs = require('fs');

let authCode = fs.readFileSync('src/services/authService.ts', 'utf8');

authCode = authCode.replace(
  /export function updateRecoveryEmail.*?return false;\n  }\n}/s,
  `export function updateRecoveryEmail(user: User, email: string): User {
  try {
    const updatedUser = { ...user, recoveryEmail: email };
    saveLocalSession(updatedUser);
    return updatedUser;
  } catch {
    return user;
  }
}`
);

fs.writeFileSync('src/services/authService.ts', authCode);
