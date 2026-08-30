function isPrivateIP(ip: string): boolean {
  // ── IPv4 ──
  const parts = ip.split('.');
  if (parts.length === 4 && !ip.includes(':')) {
    const octets = parts.map(p => {
      if (/^0x[0-9a-f]+$/i.test(p)) return parseInt(p, 16);     // hex
      if (/^0[0-7]+$/.test(p) && p.length > 1) return parseInt(p, 8); // octal
      return parseInt(p, 10);                                   // decimal
    });
    if (octets.some(o => isNaN(o) || o < 0 || o > 255)) return false;
    const [a, b] = octets;
    if (a === 0) return true;                                    // 0.0.0.0/8
    if (a === 10) return true;                                   // 10.0.0.0/8
    if (a === 127) return true;                                  // 127.0.0.0/8 (loopback)
    if (a === 169 && b === 254) return true;                     // 169.254.0.0/16 (link-local)
    if (a === 172 && b >= 16 && b <= 31) return true;           // 172.16.0.0/12
    if (a === 192 && b === 168) return true;                     // 192.168.0.0/16
    if (a === 198 && (b === 18 || b === 19)) return true;        // 198.18.0.0/15 (benchmarking)
    if (a === 100 && b >= 64 && b <= 127) return true;          // 100.64.0.0/10 (CGNAT)
    if (a === 224) return true;                                  // 224.0.0.0/4 (multicast)
    if (a === 240) return true;                                  // 240.0.0.0/4 (reserved)
    return false;
  }

  // ── IPv6 ──
  const lower = ip.toLowerCase();
  
  // Basic format validation - fail closed if not a valid IPv6 chars/structure
  if (!/^[0-9a-f:\.]+$/i.test(ip)) return true; 
  
  // Normalize full zeroes (e.g. 0:0:0:0:0:0:0:1 -> ::1 equivalent check)
  if (lower === '::1' || lower === '::' || lower === '0:0:0:0:0:0:0:1' || lower === '0:0:0:0:0:0:0:0') return true;
  if (lower.startsWith('fe80:')) return true;                   // link-local
  if (lower.startsWith('fc') || lower.startsWith('fd')) return true; // ULA fc00::/7
  
  // Catch any embedded IPv4 address (like IPv4-mapped, IPv4-compatible, NAT64)
  const ipv4Match = lower.match(/(?:\d{1,3}\.){3}\d{1,3}$/);
  if (ipv4Match) {
    if (isPrivateIP(ipv4Match[0])) return true;
  }

  if (lower.startsWith('64:ff9b:')) return true;                 // NAT64 well-known prefix
  return false;
}

const tests = [
  { ip: '0:0:0:0:0:0:0:1', expected: true, name: 'F-01: full-form IPv6 loopback' },
  { ip: '::127.0.0.1', expected: true, name: 'F-02: IPv4-compatible IPv6 loopback' },
  { ip: '::ffff:0:127.0.0.1', expected: true, name: 'F-03: IPv4-mapped IPv6 with extra zero' },
  { ip: 'not-a-valid-ip-format', expected: true, name: 'F-04: unknown/unparseable format' },
  { ip: '198.18.0.1', expected: true, name: 'F-06: benchmarking range 198.18.0.1' },
  { ip: '198.19.255.254', expected: true, name: 'F-06: benchmarking range 198.19.255.254' },
  { ip: '8.8.8.8', expected: false, name: 'Public DNS' }
];

let failed = 0;
for (const t of tests) {
  const result = isPrivateIP(t.ip);
  if (result === t.expected) {
    console.log(`PASS: ${t.name}`);
  } else {
    console.error(`FAIL: ${t.name} (Expected ${t.expected}, got ${result})`);
    failed++;
  }
}
process.exit(failed);
