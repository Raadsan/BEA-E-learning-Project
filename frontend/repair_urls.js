const fs = require('fs');
const path = require('path');

const targetDir = './src/redux/api';

function repairFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let lines = content.split('\n');
    let changed = false;

    for (let i = 0; i < lines.length; i++) {
        // Fix baseUrl mismatch: baseUrl: `${API_URL}/something",
        if (lines[i].includes('baseUrl: `${API_URL}') && lines[i].includes('",')) {
            lines[i] = lines[i].replace('",', '`,');
            changed = true;
        }
        // Fix baseUrl mismatch without comma: baseUrl: `${API_URL}/something"
        else if (lines[i].includes('baseUrl: `${API_URL}') && lines[i].endsWith('"')) {
            lines[i] = lines[i].slice(0, -1) + '`';
            changed = true;
        }
    }

    if (changed) {
        fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
        console.log(`Repaired: ${filePath}`);
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
} else {
    console.log("Directory not found:", targetDir);
}
