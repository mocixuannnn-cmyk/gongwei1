import { mkdir, rm, copyFile, cp } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, join } from 'node:path';
const root = fileURLToPath(new URL('../', import.meta.url));
const output = resolve(root, 'dist');
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const name of ['index.html', 'style.css', 'extra.css', 'game.js', '.nojekyll', 'version.json']) {
  await copyFile(join(root, name), join(output, name));
}
await cp(join(root, 'assets'), join(output, 'assets'), { recursive: true });
console.log('构建完成：dist/，上传其中全部内容即可部署。');
