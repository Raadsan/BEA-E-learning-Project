import fs from "fs";
import path from "path";
import {
    isS3Enabled,
    uploadBufferToS3,
    isRemoteFileUrl,
} from "./s3Service.js";

export function getStoredFileUrl(file) {
    if (!file) return null;
    // Prefer compact storage refs for DB columns (VARCHAR limits)
    if (file.storageKey) return `/${file.storageKey}`;
    return file.storageUrl || (file.filename ? `/uploads/${file.filename}` : null);
}

export async function persistMulterFile(file) {
    if (!file?.buffer) return null;

    if (isS3Enabled()) {
        const result = await uploadBufferToS3({
            buffer: file.buffer,
            originalname: file.originalname,
            mimetype: file.mimetype,
        });
        file.filename = result.filename;
        file.storageKey = result.key;
        file.storageUrl = result.url;
        return result.url;
    }

    const uploadDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const filename = `${uniqueSuffix}${path.extname(file.originalname || "")}`;
    const localPath = path.join(uploadDir, filename);
    fs.writeFileSync(localPath, file.buffer);

    file.filename = filename;
    file.storageUrl = `/uploads/${filename}`;
    return file.storageUrl;
}

export async function persistRequestUploads(req) {
    if (req.file) {
        await persistMulterFile(req.file);
    }

    if (Array.isArray(req.files) && req.files.length > 0) {
        for (const file of req.files) {
            await persistMulterFile(file);
        }
    }
}

export async function readStoredFileBuffer(storedValue) {
    if (!storedValue) return null;

    if (isS3Enabled()) {
        try {
            const { getS3ObjectStream } = await import("./s3Service.js");
            const s3Object = await getS3ObjectStream(storedValue);
            if (s3Object?.stream) {
                const chunks = [];
                for await (const chunk of s3Object.stream) {
                    chunks.push(chunk);
                }
                return Buffer.concat(chunks);
            }
        } catch {
            // fall through to local
        }
    }

    let localName = storedValue;
    if (isRemoteFileUrl(storedValue)) {
        const match = storedValue.match(/\/uploads\/([^/?#]+)/);
        localName = match?.[1] || path.basename(new URL(storedValue).pathname);
    } else {
        localName = storedValue.replace(/^\/uploads\//, "").replace(/^uploads\//, "").split("/").pop();
    }

    const filePath = path.join(process.cwd(), "uploads", localName);
    if (fs.existsSync(filePath)) {
        return fs.readFileSync(filePath);
    }

    return null;
}
