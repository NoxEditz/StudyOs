const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const archiveRoot = path.join(root, 'D', 'build-output', stamp);

const moveTargets = ['dist', 'web'];

function ensureDir(target) {
  fs.mkdirSync(target, { recursive: true });
}

function moveIfExists(relPath) {
  const from = path.join(root, relPath);
  if (!fs.existsSync(from)) return;
  const to = path.join(archiveRoot, relPath);
  ensureDir(path.dirname(to));
  fs.renameSync(from, to);
  console.log(`Moved ${relPath} -> ${path.relative(root, to)}`);
}

ensureDir(archiveRoot);
moveTargets.forEach(moveIfExists);

ensureDir(path.join(root, 'D', 'notes'));
const notePath = path.join(root, 'D', 'notes', 'README.txt');
if (!fs.existsSync(notePath)) {
  fs.writeFileSync(
    notePath,
    [
      'Project organization folder',
      '',
      'D/build-output: archived generated artifacts (dist/web)',
      'D/notes: project housekeeping notes',
      '',
      'You can safely delete old timestamp folders to free space.'
    ].join('\n'),
    'utf8'
  );
}

console.log('Organization complete.');
