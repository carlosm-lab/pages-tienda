/* global require, __dirname */
const fs = require('fs');
const path = require('path');

const dirs = [
  path.join(__dirname, 'src/pages/admin'),
  path.join(__dirname, 'src/components/admin')
];

const replacements = [
  { from: /dark:bg-slate-900/g, to: 'dark:bg-transparent' },
  { from: /dark:bg-slate-800/g, to: 'dark:bg-white/5' },
  { from: /dark:bg-slate-700\/50/g, to: 'dark:bg-white/5' },
  { from: /dark:bg-slate-700/g, to: 'dark:bg-white/10' },
  { from: /dark:border-slate-700\/50/g, to: 'dark:border-white/5' },
  { from: /dark:border-slate-700/g, to: 'dark:border-white/10' },
  { from: /dark:border-slate-800/g, to: 'dark:border-white/5' },
  { from: /dark:divide-slate-700\/50/g, to: 'dark:divide-white/5' },
  { from: /dark:divide-slate-700/g, to: 'dark:divide-white/10' },
  { from: /dark:divide-slate-800/g, to: 'dark:divide-white/5' }
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;
      
      for (const rule of replacements) {
        if (rule.from.test(content)) {
          content = content.replace(rule.from, rule.to);
          modified = true;
        }
      }
      
      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

dirs.forEach(processDirectory);
console.log('Admin dark mode theme homologation complete.');
