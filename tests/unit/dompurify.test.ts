import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const window = new JSDOM('').window;
const purify = DOMPurify(window);

const dirty = '<h1>Hello</h1><img src=x onerror=alert(1)>';
const clean = purify.sanitize(dirty);
console.log("Dirty:", dirty);
console.log("Clean:", clean);

if (clean.includes('onerror')) {
  console.error("FAIL: XSS payload still present");
  process.exit(1);
} else {
  console.log("PASS: XSS payload stripped");
  process.exit(0);
}
