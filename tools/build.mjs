// Office Wahala: Netlify build step. Copies the public site into dist/ so that
// node_modules, tools, the function source and other repo files are never published.
import { cpSync, rmSync, mkdirSync, readdirSync } from 'node:fs';

const EXCLUDE = new Set(['dist', 'node_modules', 'netlify', 'tools', 'supabase', '.git', '.github', '.netlify',
  'package.json', 'package-lock.json', 'netlify.toml', 'README.md', 'LICENSE', '.gitignore']);

rmSync('dist', { recursive: true, force: true });
mkdirSync('dist');
for (const name of readdirSync('.')) {
  if (EXCLUDE.has(name) || name.startsWith('.')) continue;
  cpSync(name, 'dist/' + name, { recursive: true });
}
console.log('Copied site to dist/:', readdirSync('dist').join(', '));
