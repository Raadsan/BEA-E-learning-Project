const fs = require('fs');
const path = require('path');

const targetDir = './src/redux/api';

const patterns = [
    { from: /`token"/g, to: '"token"' },
    { from: /`user"/g, to: '"user"' },
    { from: /`Bearer \$\{token\}"/g, to: '`Bearer ${token}`' },
    { from: /`Authorization"/g, to: '"Authorization"' },
    { from: /`authorization"/g, to: '"authorization"' },
    { from: /`Content-Type"/g, to: '"Content-Type"' },
    { from: /`Content-type"/g, to: '"Content-type"' },
    { from: /`application\/json"/g, to: '"application/json"' }
];

function repairFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    for (const pattern of patterns) {
        if (pattern.from.test(content)) {
            content = content.replace(pattern.from, pattern.to);
            changed = true;
        }
    }

    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Aggressively repaired: ${filePath}`);
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
