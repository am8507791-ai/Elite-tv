import fs from 'fs';
import path from 'path';

function replaceRecursively(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (!['node_modules', '.git', 'dist'].includes(file)) {
        replaceRecursively(fullPath);
      }
    } else if (/\.(html|tsx|ts|json|yml|md)$/.test(file)) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('https://i.ibb.co/S800S80/Remove-background-project.png')) {
        content = content.split('https://i.ibb.co/S800S80/Remove-background-project.png').join('https://i.ibb.co/S800S80/Remove-background-project.png');
        fs.writeFileSync(fullPath, content);
      }
    }
  }
}

replaceRecursively(process.cwd());
console.log("Replacement completed.");
