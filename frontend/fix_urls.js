const fs = require('fs');
const path = require('path');

const targetDir = './src';
const oldApiUrl = 'http://localhost:5000/api';
const oldUploadsUrl = 'http://localhost:5000/uploads';

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    const hasConstants = content.includes('import { API_URL }') || content.includes('import { API_BASE_URL }') || content.includes('import { UPLOADS_URL }');

    // 1. Update baseUrl in API slices
    if (content.includes('baseUrl: "http://localhost:5000/api')) {
        content = content.replace(/baseUrl: "http:\/\/localhost:5000\/api/g, 'baseUrl: `${API_URL}');
        changed = true;
    }

    // 2. Add imports if needed
    if (changed && !hasConstants) {
        if (content.includes('import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";')) {
            content = content.replace(
                'import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";',
                'import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";\nimport { API_URL } from "@/constants";'
            );
        } else {
            content = 'import { API_URL, UPLOADS_URL } from "@/constants";\n' + content;
        }
    }

    // 3. Replace direct string instances
    if (content.includes(oldApiUrl)) {
        content = content.replace(new RegExp(oldApiUrl, 'g'), '${API_URL}');
        changed = true;
    }
    if (content.includes(oldUploadsUrl)) {
        content = content.replace(new RegExp(oldUploadsUrl, 'g'), '${UPLOADS_URL}');
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${filePath}`);
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
            processFile(filePath);
        }
    }
}

walkDir(targetDir);
