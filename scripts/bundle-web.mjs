import { readdirSync, readFileSync, writeFileSync, statSync } from 'fs';
import { join, relative } from 'path';

const srcDir = 'dist';
const outFile = 'web/game.js';

function collectFiles(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      files.push(...collectFiles(full));
    } else if (entry.endsWith('.js')) {
      files.push(full);
    }
  }
  return files.sort();
}

const files = collectFiles(srcDir);
let bundle = `// Animal Card Match - bundled\n(function(){\n'use strict';\nconst modules = {};\nconst cache = {};\nfunction require(id) {\n  if (cache[id]) return cache[id].exports;\n  if (!modules[id]) throw new Error('Module not found: ' + id);\n  const module = { exports: {} };\n  cache[id] = module;\n  modules[id](module, module.exports, require);\n  return module.exports;\n}\n`;

for (const file of files) {
  const rel = relative(srcDir, file).replace(/\.js$/, '');
  let code = readFileSync(file, 'utf-8');
  // Strip imports/exports for simple bundle - use IIFE wrapper per file
  const modId = './' + rel + '.js';
  code = code
    .replace(/^import\s+.*?from\s+['"].*?['"];?\s*$/gm, '')
    .replace(/^export\s+\{[^}]*\}\s*;?\s*$/gm, '')
    .replace(/^export\s+(default\s+)?/gm, '');
  bundle += `modules['${modId}'] = function(module, exports, require) {\n${code}\n};\n`;
}

bundle += `\nwindow.AnimalCardMatch = require('./index.js');\n})();\n`;

writeFileSync(outFile, bundle);
console.log(`Bundled ${files.length} files -> ${outFile}`);
