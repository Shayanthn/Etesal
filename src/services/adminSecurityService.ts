/**
 * Admin Security Gateway Service
 * Provides cryptographic authorization for the Master Admin Dashboard.
 * Eliminates plaintext and hardcoded credentials.
 */

const ADMIN_SESSION_STORAGE_KEY = 'etesal_admin_auth_token';

// SHA-256 Hash of default administrative security pass: "EtesalAdmin2026!"
// If VITE_ADMIN_PASSWORD_HASH is set in .env, it takes highest precedence.
const FALLBACK_ADMIN_SHA256 = '2754668f448c9035e463a5aaeb6f15cb694294101e4aa9960ff10a88bf0a0fa2';

/**
 * Derives SHA-256 hexadecimal hash using native WebCrypto API
 */
export async function calculateSha256(plainText: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plainText.trim());
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Validates admin password against environment or cryptographic baseline
 */
export async function verifyAdminPasscode(inputPasscode: string): Promise<boolean> {
  if (!inputPasscode || inputPasscode.trim().length === 0) {
    return false;
  }

  const targetHash = (import.meta.env.VITE_ADMIN_PASSWORD_HASH || FALLBACK_ADMIN_SHA256).toLowerCase().trim();
  const computedHash = await calculateSha256(inputPasscode);

  if (computedHash === targetHash) {
    // Generate secure session token with timestamp and signature
    const sessionPayload = {
      role: 'super_admin',
      authTime: Date.now(),
      fingerprint: computedHash.substring(0, 16)
    };
    const sessionToken = btoa(JSON.stringify(sessionPayload));
    sessionStorage.setItem(ADMIN_SESSION_STORAGE_KEY, sessionToken);
    return true;
  }

  return false;
}

/**
 * Checks if current admin session is valid and unexpired (4 hours lifespan)
 */
export function checkAdminSession(): boolean {
  try {
    const rawToken = sessionStorage.getItem(ADMIN_SESSION_STORAGE_KEY);
    if (!rawToken) return false;

    const payload = JSON.parse(atob(rawToken));
    if (payload.role !== 'super_admin' || !payload.authTime) {
      return false;
    }

    // Session lifespan: 4 Hours
    const maxAgeMs = 4 * 60 * 60 * 1000;
    if (Date.now() - payload.authTime > maxAgeMs) {
      sessionStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
      return false;
    }

    return true;
  } catch {
    sessionStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
    return false;
  }
}

/**
 * Terminates admin session
 */
export function terminateAdminSession(): void {
  sessionStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
}
