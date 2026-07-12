import path from "path";
import fs from "fs";
import {
    isRemoteFileUrl,
    resolveS3Key,
    isS3Enabled,
    getS3ObjectStream,
} from "../utils/s3Service.js";

const contentTypeMap = {
    ".pdf": "application/pdf",
    ".doc": "application/msword",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".txt": "text/plain",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".mov": "video/quicktime",
    ".mp3": "audio/mpeg",
    ".wav": "audio/wav",
    ".m4a": "audio/mp4",
    ".aac": "audio/aac",
    ".ogg": "audio/ogg",
};

const decodeFileParam = (value) => {
    let decoded = value;
    try {
        decoded = decodeURIComponent(value);
    } catch {
        decoded = value;
    }
    return decoded;
};

const localFilenameFromRef = (ref) => {
    if (!ref) return null;
    if (isRemoteFileUrl(ref)) {
        const match = ref.match(/\/uploads\/([^/?#]+)/);
        if (match?.[1]) return match[1];
        try {
            const basename = path.basename(new URL(ref).pathname);
            return basename || null;
        } catch {
            return null;
        }
    }
    const normalized = ref.replace(/^\//, "").replace(/^uploads\//, "");
    const withoutPrefix = normalized.replace(/^bea_uploads\//, "");
    return withoutPrefix.split("/").pop() || withoutPrefix || null;
};

const streamFromS3 = async (res, ref, { attachment = false } = {}) => {
    const key = resolveS3Key(ref);
    if (!key) return false;

    const s3Object = await getS3ObjectStream(key);
    if (!s3Object?.stream) return false;

    const basename = localFilenameFromRef(ref) || "file";
    const ext = path.extname(basename).toLowerCase();
    res.setHeader(
        "Content-Type",
        s3Object.contentType || contentTypeMap[ext] || "application/octet-stream"
    );
    res.setHeader(
        "Content-Disposition",
        attachment ? `attachment; filename="${basename}"` : "inline"
    );
    res.setHeader("Accept-Ranges", "bytes");
    if (s3Object.contentLength) {
        res.setHeader("Content-Length", String(s3Object.contentLength));
    }
    s3Object.stream.pipe(res);
    return true;
};

const streamLocalFile = (res, filename, { attachment = false } = {}) => {
    const filePath = path.join(process.cwd(), "uploads", filename);
    if (!fs.existsSync(filePath)) return false;

    const normalizedPath = path.normalize(filePath);
    const uploadsDir = path.normalize(path.join(process.cwd(), "uploads"));
    if (!normalizedPath.startsWith(uploadsDir)) return false;

    const ext = path.extname(filename).toLowerCase();
    res.setHeader("Content-Type", contentTypeMap[ext] || "application/octet-stream");
    res.setHeader(
        "Content-Disposition",
        attachment ? `attachment; filename="${filename}"` : "inline"
    );
    res.setHeader("Accept-Ranges", "bytes");

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    fileStream.on("error", () => {
        if (!res.headersSent) res.status(500).json({ error: "Error streaming file" });
    });
    return true;
};

/** Local disk first (reliable), then S3 mirror if local missing. */
const serveStoredFile = async (res, ref, { attachment = false } = {}) => {
    const localName = localFilenameFromRef(ref);
    if (localName && streamLocalFile(res, localName, { attachment })) {
        return true;
    }

    if (isS3Enabled()) {
        try {
            if (await streamFromS3(res, ref, { attachment })) return true;
        } catch (err) {
            console.error("S3 stream error:", err.message);
        }
    }

    return false;
};

/** Stream media inline (video/audio/images) — local disk first, S3 backup. */
export const streamFile = async (req, res) => {
    try {
        const ref = decodeFileParam(req.params.filename || "");
        if (!ref) return res.status(400).json({ error: "File reference required" });

        if (await serveStoredFile(res, ref, { attachment: false })) return;

        return res.status(404).json({ error: "File not found" });
    } catch (err) {
        if (!res.headersSent) res.status(500).json({ error: err.message });
    }
};

export const downloadFile = async (req, res) => {
    try {
        let { filename } = req.params;
        filename = decodeFileParam(filename);
        if (!filename) return res.status(400).json({ error: "File reference required" });

        if (isRemoteFileUrl(filename)) {
            if (await serveStoredFile(res, filename, { attachment: true })) return;
            return res.redirect(filename);
        }

        if (await serveStoredFile(res, filename, { attachment: true })) return;

        return res.status(404).json({ error: "File not found" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
