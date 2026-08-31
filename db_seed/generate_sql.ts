import { SAMPLE_CONFIGS } from '../src/data/configs.data';
import { SAMPLE_PROXIES } from '../src/data/proxies.data';
import { KNOWLEDGE_ARTICLES } from '../src/data/articles.data';
import { SAMPLE_NEWS_ARTICLES } from '../src/data/newsData';
import * as fs from 'fs';

let sql = `-- DATA SEED SQL\n`;

for(const c of SAMPLE_CONFIGS) {
  sql += `INSERT INTO public.configs (name, protocol, config_string, operator, ping, location, flag, quality, is_official, is_active) VALUES ('${c.name}', '${c.protocol}', '${c.configString}', '${c.operator}', ${c.ping}, '${c.location}', '${c.flag}', '${c.quality}', ${c.isOfficial ? 'true' : 'false'}, true) ON CONFLICT DO NOTHING;\n`;
}

for(const p of SAMPLE_PROXIES) {
  sql += `INSERT INTO public.proxies (name, host, port, secret, ping, location, flag, is_vip, is_active) VALUES ('${p.name}', '${p.host}', ${p.port}, '${p.secret}', ${p.ping}, '${p.location}', '${p.flag}', ${p.isVip ? 'true' : 'false'}, true) ON CONFLICT DO NOTHING;\n`;
}

for(const a of KNOWLEDGE_ARTICLES) {
  const content = (a as any).fullContent.map((p:string) => `<p>${p}</p>`).join('');
  sql += `INSERT INTO public.articles (slug, title, excerpt, content, meta_title, meta_description, is_published, author, category) VALUES ('${a.id}', '${a.title}', '${a.description}', '${content}', '${a.title}', '${a.description}', true, 'تیم اتصال', '${a.category}') ON CONFLICT DO NOTHING;\n`;
}

for(const n of SAMPLE_NEWS_ARTICLES) {
  const content = (n as any).content.map((p:string) => `<p>${p}</p>`).join('');
  sql += `INSERT INTO public.news (slug, title, summary, content, meta_title, meta_description, image_url, is_published) VALUES ('${n.slug}', '${n.title}', '${n.summary}', '${content}', '${n.title}', '${n.summary}', '${n.imageUrl}', true) ON CONFLICT DO NOTHING;\n`;
}

fs.writeFileSync('seed_script.sql', sql);
