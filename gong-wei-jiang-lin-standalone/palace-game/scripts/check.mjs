import { readFile, access } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
const root = fileURLToPath(new URL('../', import.meta.url));
const files = ['index.html','game.js','style.css','extra.css'];
for (const file of ['game.js','scripts/build.mjs','scripts/serve.mjs','scripts/check.mjs']) execFileSync(process.execPath, ['--check', join(root,file)]);
const references = new Set();
for (const name of files) {
  const text = await readFile(join(root,name),'utf8');
  if (/fetch\s*\(|XMLHttpRequest|fonts\.googleapis|fonts\.gstatic|terminal\.local|chatgpt\.com|chatgpt\.site|sites-project:/.test(text)) throw new Error('发现外部运行依赖：'+name);
  for (const match of text.matchAll(/(?:src|href)=["']([^"']+)["']/g)) {
    const url=match[1]; if (/^(?:#|data:|\$\{)/.test(url)) continue;
    if (/^https?:/.test(url)) throw new Error('外部资源：'+url);
    if (!url.includes('${')) references.add(url);
  }
  for (const match of text.matchAll(/assets\/[a-zA-Z0-9_.-]+/g)) references.add(match[0]);
}
for (const reference of references) await access(join(root,reference));
console.log(`检查通过：JavaScript语法正常，${references.size}项本地资源齐全，无ChatGPT或网络运行依赖。`);
