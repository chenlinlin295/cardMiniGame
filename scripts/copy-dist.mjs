import { cpSync, rmSync, existsSync } from 'fs';

const src = 'dist';
const dest = 'web/dist';

if (existsSync(dest)) {
  rmSync(dest, { recursive: true });
}

cpSync(src, dest, { recursive: true });
console.log(`Copied ${src} -> ${dest}`);
