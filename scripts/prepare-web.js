const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'web');

const FILES = ['index.html', 'manifest.webmanifest', 'service-worker.js'];
const DIRS = ['css', 'js', 'assets'];

function rmDirRecursive(target) {
  fs.rmSync(target, { recursive: true, force: true });
}

function ensureDir(target) {
  fs.mkdirSync(target, { recursive: true });
}

function copyFile(src, dest) {
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
}

function copyDir(src, dest) {
  ensureDir(dest);
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(srcPath, destPath);
    else copyFile(srcPath, destPath);
  }
}

rmDirRecursive(outDir);
ensureDir(outDir);

for (const file of FILES) {
  const src = path.join(root, file);
  if (fs.existsSync(src)) copyFile(src, path.join(outDir, file));
}

for (const dir of DIRS) {
  const src = path.join(root, dir);
  if (fs.existsSync(src)) copyDir(src, path.join(outDir, dir));
}

console.log('Prepared web bundle in ./web');
