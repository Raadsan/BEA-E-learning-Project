import path from "path";
import fs from "fs";
import { Readable } from "stream";
import {
    isRemoteFileUrl,
    resolveS3Key,
    isS3Enabled,
    getS3ObjectStream,
    buildPublicUrl,
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
    ".webm": "audio/webm",
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

const pipeHttpBodyToRes = (body, res) => {
    if (!body) return false;
    if (typeof body.pipe === "function") {
        body.pipe(res);
        return true;
    }
    // fetch() ReadableStream (Node 18+)
    Readable.fromWeb(body).pipe(res);
    return true;
};

/** When IAM GetObject is denied, public bucket objects can still be fetched over HTTPS. */
const streamFromPublicS3Url = async (req, res, ref, { attachment = false } = {}) => {
    const key = resolveS3Key(ref);
    if (!key || !process.env.AWS_BUCKET_NAME || !process.env.AWS_REGION) return false;

    const publicUrl = buildPublicUrl(key);
    const headers = {};
    const requestedRange = attachment ? null : req.headers.range;
    if (requestedRange) headers.Range = requestedRange;

    const upstream = await fetch(publicUrl, { headers });
    if (!(upstream.ok || upstream.status === 206)) return false;

    const basename = localFilenameFromRef(ref) || "file";
    const ext = path.extname(basename).toLowerCase();
    const contentType =
        upstream.headers.get("content-type") || contentTypeMap[ext] || "application/octet-stream";

    res.status(upstream.status);
    res.setHeader("Content-Type", contentType);
    res.setHeader(
        "Content-Disposition",
        attachment ? `attachment; filename="${basename}"` : "inline"
    );
    res.setHeader("Accept-Ranges", upstream.headers.get("accept-ranges") || "bytes");
    const contentLength = upstream.headers.get("content-length");
    if (contentLength) res.setHeader("Content-Length", contentLength);
    const contentRange = upstream.headers.get("content-range");
    if (contentRange) res.setHeader("Content-Range", contentRange);
    res.setHeader("Cache-Control", "private, max-age=3600");

    return pipeHttpBodyToRes(upstream.body, res);
};

const streamFromS3 = async (req, res, ref, { attachment = false } = {}) => {
    const key = resolveS3Key(ref);
    if (!key) return false;

    const requestedRange = attachment ? null : req.headers.range;

    try {
        const s3Object = await getS3ObjectStream(key, requestedRange);
        if (s3Object?.stream) {
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
            if (s3Object.contentLength) res.setHeader("Content-Length", String(s3Object.contentLength));
            if (s3Object.contentRange) {
                res.status(206);
                res.setHeader("Content-Range", s3Object.contentRange);
            }
            res.setHeader("Cache-Control", "private, max-age=3600");
            s3Object.stream.pipe(res);
            return true;
        }
    } catch (err) {
        console.warn("S3 GetObject failed, trying public URL:", err.message);
    }

    return streamFromPublicS3Url(req, res, ref, { attachment });
};

const streamLocalFile = (req, res, filename, { attachment = false } = {}) => {
    const filePath = path.join(process.cwd(), "uploads", filename);
    if (!fs.existsSync(filePath)) return false;
    const normalizedPath = path.normalize(filePath);
    const uploadsDir = path.normalize(path.join(process.cwd(), "uploads"));
    if (!normalizedPath.startsWith(uploadsDir)) return false;
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const ext = path.extname(filename).toLowerCase();
    const contentType = contentTypeMap[ext] || "application/octet-stream";
    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", attachment ? `attachment; filename="${filename}"` : "inline");
    res.setHeader("Accept-Ranges", "bytes");
    res.setHeader("Cache-Control", "private, max-age=3600");
    const range = !attachment ? req.headers.range : null;
    let start = 0;
    let end = fileSize - 1;
    if (range) {
        const match = /^bytes=(\d*)-(\d*)$/.exec(range);
        if (!match) { res.status(416).setHeader("Content-Range", `bytes */${fileSize}`); res.end(); return true; }
        if (match[1]) start = Number(match[1]);
        if (match[2]) end = Math.min(Number(match[2]), fileSize - 1);
        if (!match[1] && match[2]) { const suffix = Number(match[2]); start = Math.max(0, fileSize - suffix); end = fileSize - 1; }
        if (start > end || start >= fileSize) { res.status(416).setHeader("Content-Range", `bytes */${fileSize}`); res.end(); return true; }
        res.status(206);
        res.setHeader("Content-Range", `bytes ${start}-${end}/${fileSize}`);
    }
    res.setHeader("Content-Length", String(end - start + 1));
    const stream = fs.createReadStream(filePath, { start, end });
    stream.on("error", () => { if (!res.headersSent) res.status(500).json({ error: "Error streaming file" }); });
    stream.pipe(res);
    return true;
};

/** Local disk first (reliable), then S3 mirror if local missing. */
const serveStoredFile = async (req, res, ref, { attachment = false } = {}) => {
    const localName = localFilenameFromRef(ref);
    if (localName && streamLocalFile(req, res, localName, { attachment })) {
        return true;
    }

    if (isS3Enabled()) {
        try {
            if (await streamFromS3(req, res, ref, { attachment })) return true;
        } catch (err) {
            console.error("S3 stream error:", err.message, "ref=", ref, "key=", resolveS3Key(ref));
        }
    }

    return false;
};

/** Stream media inline (video/audio/images) — local disk first, S3 backup. */
export const streamFile = async (req, res) => {
    try {
        const raw = req.query.ref || req.params.filename || "";
        const ref = decodeFileParam(Array.isArray(raw) ? raw[0] : raw);
        if (!ref) return res.status(400).json({ error: "File reference required" });

        if (await serveStoredFile(req, res, ref, { attachment: false })) return;

        return res.status(404).json({ error: "File not found" });
    } catch (err) {
        console.error("streamFile error:", err.message);
        if (!res.headersSent) res.status(500).json({ error: err.message });
    }
};

export const downloadFile = async (req, res) => {
    try {
        const raw = req.query.ref || req.params.filename || "";
        let filename = decodeFileParam(Array.isArray(raw) ? raw[0] : raw);
        if (!filename) return res.status(400).json({ error: "File reference required" });

        if (isRemoteFileUrl(filename)) {
            if (await serveStoredFile(req, res, filename, { attachment: true })) return;
            return res.redirect(filename);
        }

        if (await serveStoredFile(req, res, filename, { attachment: true })) return;

        return res.status(404).json({ error: "File not found" });
    } catch (err) {
        console.error("downloadFile error:", err.message);
        res.status(500).json({ error: err.message });
    }
};
