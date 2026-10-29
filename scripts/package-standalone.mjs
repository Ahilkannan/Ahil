import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

// Embed the production assets so the planner opens without a web server.
let html = await readFile('dist/index.html', 'utf8');
const script = html.match(/<script\b[^>]*src="([^"]+)"[^>]*><\/script>/);
const stylesheet = html.match(/<link\b[^>]*href="([^"]+\.css)"[^>]*>/);
if (!script || !stylesheet) throw new Error('Expected one Vite JavaScript and CSS entry');
const assetPath = url => resolve('dist', url.replace(/^\//, ''));
const js = await readFile(assetPath(script[1]), 'utf8');
const css = await readFile(assetPath(stylesheet[1]), 'utf8');
html = html.replace(script[0], () => `<script type="module">${js.replace(/<\/script/gi, '<\\/script')}</script>`);
html = html.replace(stylesheet[0], () => `<style>${css.replace(/<\/style/gi, '<\\/style')}</style>`);
await mkdir('release', { recursive: true });
await writeFile('release/ahil-planner.html', html);
console.log('Created release/ahil-planner.html — open directly in a browser.');
