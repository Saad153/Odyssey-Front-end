const fs = require('fs');
const path = require('path');
const root = process.cwd();
function walk(dir) {
  for (const dirent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, dirent.name);
    if (dirent.isDirectory()) {
      if (dirent.name === 'node_modules' || dirent.name === '.next') continue;
      walk(full);
    } else if (/\.(js|jsx|ts|tsx)$/.test(dirent.name)) {
      const text = fs.readFileSync(full, 'utf8');
      const newText = text
        .replaceAll("from '", "from '")
        .replaceAll("import '", "import '")
        .replaceAll('from "', 'from "')
        .replaceAll('import "', 'import "')
        .replaceAll("require('", "require('")
        .replaceAll('require("', 'require("');
      if (newText !== text) fs.writeFileSync(full, newText, 'utf8');
    }
  }
}
walk(root);
const remaining = [];
function find(dir) {
  for (const dirent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, dirent.name);
    if (dirent.isDirectory()) {
      if (dirent.name === 'node_modules' || dirent.name === '.next') continue;
      find(full);
    } else if (/\.(js|jsx|ts|tsx)$/.test(dirent.name)) {
      const text = fs.readFileSync(full, 'utf8');
      if (text.includes("from '") || text.includes("import '") || text.includes('from "') || text.includes('import "') || text.includes("require('") || text.includes('require("')) {
        remaining.push(full);
      }
    }
  }
}
find(root);
console.log('remaining', remaining.length);
if (remaining.length) console.log(remaining.join('\n'));
