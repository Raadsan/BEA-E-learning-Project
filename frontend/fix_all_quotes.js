const fs = require('fs');
const path = require('path');

const targetDir = './src/redux/api';

function repairFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // Fix `token" -> "token"
    if (content.includes('`token"')) {
        content = content.replace(/`token"/g, '"token"');
        changed = true;
    }

    // Fix `user" -> "user"
    if (content.includes('`user"')) {
        content = content.replace(/`user"/g, '"user"');
    }

    // Fix Bearer ${token}" -> `Bearer ${token}`
    if (content.includes('`Bearer ${token}"')) {
        content = content.replace(/`Bearer \$\{token\}"/g, '`Bearer ${token}`');
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Repaired quotes in: ${filePath}`);
    }
}

function walkDir(currentDir) {
    const files = fs.readdirSync(currentDir);
    for (const file of files) {
        const filePath = path.join(currentDir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            walkDir(filePath);
        } else if (file.endsWith('.js')) {
            repairFile(filePath);
        }
    }
}

if (fs.existsSync(targetDir)) {
    walkDir(targetDir);
}
