import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Download file with authentication
export const downloadFile = async (req, res) => {
    try {
        const { filename } = req.params;
        const userId = req.user.userId;
        const userRole = req.user.role;

        // Construct file path
        const filePath = path.join(__dirname, '..', 'uploads', filename);

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'File not found' });
        }

        // Security: Prevent directory traversal attacks
        const normalizedPath = path.normalize(filePath);
        const uploadsDir = path.join(__dirname, '..', 'uploads');
        if (!normalizedPath.startsWith(uploadsDir)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Set appropriate headers for file download
        const ext = path.extname(filename).toLowerCase();
        let contentType = 'application/octet-stream';

        if (ext === '.pdf') contentType = 'application/pdf';
        else if (ext === '.doc') contentType = 'application/msword';
        else if (ext === '.docx') contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        else if (ext === '.txt') contentType = 'text/plain';

        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        // Stream the file
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);

        fileStream.on('error', (error) => {
            console.error('File stream error:', error);
            if (!res.headersSent) {
                res.status(500).json({ error: 'Error streaming file' });
            }
        });
    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ error: 'Failed to download file' });
    }
};
