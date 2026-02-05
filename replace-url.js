const fs = require('fs');
const path = require('path');

const oldUrl = 'https://safe-school-ride.duckdns.org';
const newUrl = 'https://safe-school-ride.duckdns.org';

function replaceInFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  if (content.includes(oldUrl)) {
    const newContent = content.replace(new RegExp(oldUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newUrl);
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log('✅ Updated:', filePath);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory() && !['node_modules', '.git', 'dist', '.next'].includes(file)) {
      walkDir(filePath);
    } else if (stat.isFile()) {
      replaceInFile(filePath);
    }
  });
}

walkDir('.');
console.log('✨ Done!');
