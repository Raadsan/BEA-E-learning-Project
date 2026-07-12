import fs from "fs";
import path from "path";
import {
    isS3Enabled,
    uploadBufferToS3,
    isRemoteFileUrl,
} from "./s3Service.js";

export function getStoredFileUrl(file) {
    if (!file) return null;
    // If S3 is enabled and the upload produced a public S3 URL, store that.
    // This ensures files survive in cloud/ephemeral environments.
    if (isS3Enabled() && file.storageUrl) return file.storageUrl;
    // Fallback: local path (development / non-S3 deployments)
    if (file.filename) return `/uploads/${file.filename}`;
    if (file.storageKey) {
        const base = file.storageKey.split("/").pop();
        return base ? `/uploads/${base}` : `/${file.storageKey}`;
    }
    return file.storageUrl || null;
}

function writeLocalUpload(file, filename) {
    const uploadDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }
    const localPath = path.join(uploadDir, filename);
    fs.writeFileSync(localPath, file.buffer);
    return localPath;
}

export async function persistMulterFile(file) {
    if (!file?.buffer) return null;

    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const fallbackFilename = `${uniqueSuffix}${path.extname(file.originalname || "")}`;

    if (isS3Enabled()) {
        try {
            const result = await uploadBufferToS3({
                buffer: file.buffer,
                originalname: file.originalname,
                mimetype: file.mimetype,
            });
            file.filename = result.filename;
            file.storageKey = result.key;
            file.storageUrl = result.url;
            writeLocalUpload(file, result.filename);
            console.log(`📦 File saved: local uploads/${result.filename} + S3 ${result.key}`);
            return file.storageUrl;
        } catch (err) {
            console.error("S3 upload failed, falling back to local storage:", err.message);
        }
    }

    writeLocalUpload(file, fallbackFilename);
    file.filename = fallbackFilename;
    file.storageUrl = `/uploads/${fallbackFilename}`;
    console.log(`📁 File saved locally: uploads/${fallbackFilename}`);
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

    let localName = storedValue;
    if (isRemoteFileUrl(storedValue)) {
        const match = storedValue.match(/\/uploads\/([^/?#]+)/);
        localName = match?.[1] || path.basename(new URL(storedValue).pathname);
    } else {
        localName = storedValue
            .replace(/^\//, "")
            .replace(/^uploads\//, "")
            .replace(/^bea_uploads\//, "")
            .split("/")
            .pop();
    }

    const filePath = path.join(process.cwd(), "uploads", localName);
    if (fs.existsSync(filePath)) {
        return fs.readFileSync(filePath);
    }

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
            // no local or S3 copy
        }
    }

    return null;
}
