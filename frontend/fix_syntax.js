const fs = require('fs');
const path = require('path');

const targetDir = './src';

function repairFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Fix baseUrl: `${API_URL}/... " -> baseUrl: `${API_URL}/... `
    // This regex looks for baseUrl: followed by a backtick and ${API_URL}, then some characters, then a literal double quote.
    const baseUrlRegex = /baseUrl:\s*`\$\{API_URL\}([^"]*)"/g;

    if (baseUrlRegex.test(content)) {
        const repairedContent = content.replace(baseUrlRegex, 'baseUrl: `${API_URL}$1`');
        fs.writeFileSync(filePath, repairedContent, 'utf8');
        console.log(`Repaired baseUrl quotes in: ${filePath}`);
    }
}

function walkDir(currentDir) {
    const files = fs.readdirSync(currentDir);
    for (const file of files) {
        const filePath = path.join(currentDir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            walkDir(filePath);
        } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
            repairFile(filePath);
        }
    }
}

walkDir(targetDir);
