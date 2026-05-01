// Parse the NHIA Professional FFS price list HTML into structured JSON.
// One-shot script: node scripts/parse-nhia.mjs <html-path> > output.json
import { readFileSync } from 'fs';

const html = readFileSync(process.argv[2], 'utf8');
const re = /<td>(NHIS-\d{3}-\d{3})<\/td><td>([^<]+)<\/td><td>([^<]+)<\/td>/g;

const decode = (s) =>
  s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();

const parsePrice = (raw) => {
  const m = raw.replace(/[, ]/g, '').match(/NGN(\d+)/i);
  return m ? Number(m[1]) : null;
};

const items = [];
let match;
while ((match = re.exec(html)) !== null) {
  const code = match[1];
  const description = decode(match[2]);
  const tariffNgn = parsePrice(decode(match[3]));
  items.push({ code, description, tariffNgn });
}

// Group by section (middle 3 digits of the code)
const sections = {};
for (const it of items) {
  const sec = it.code.split('-')[1];
  (sections[sec] ||= []).push(it);
}

console.log(JSON.stringify({ totalItems: items.length, sections }, null, 2));
