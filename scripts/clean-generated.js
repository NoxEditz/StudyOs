const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const targets = ['web'];

for (const rel of targets) {
  const full = path.join(root, rel);
  if (fs.existsSync(full)) {
    fs.rmSync(full, { recursive: true, force: true });
    console.log(`Removed ${rel}`);
  }
}

console.log('Generated cleanup done.');
