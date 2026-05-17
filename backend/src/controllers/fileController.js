import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const downloadFile = async (req, res) => {
    try {
        const { filename } = req.params;
        const filePath = path.join(__dirname, '..', 'uploads', filename);

        if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found' });

        const normalizedPath = path.normalize(filePath);
        const uploadsDir = path.join(__dirname, '..', 'uploads');
        if (!normalizedPath.startsWith(uploadsDir)) return res.status(403).json({ error: 'Access denied' });

        const ext = path.extname(filename).toLowerCase();
        const contentTypeMap = {
            '.pdf': 'application/pdf',
            '.doc': 'application/msword',
            '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            '.txt': 'text/plain'
        };
        res.setHeader('Content-Type', contentTypeMap[ext] || 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
        fileStream.on('error', (err) => {
            if (!res.headersSent) res.status(500).json({ error: 'Error streaming file' });
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
